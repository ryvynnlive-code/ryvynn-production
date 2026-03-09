import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendPurchaseReceiptEmail, TIER_TOKENS, TIER_NAMES } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Hardcoded price → tier (env vars not always available in webhook context)
const PRICE_TIER_MAP: Record<string, string> = {
  'price_1T3LjdFQvVkmN1b80afextYF': 'solo',
  'price_1T3LjnFQvVkmN1b8lUiEJyDs': 'family',
  'price_1T3LjuFQvVkmN1b81Vg49Wpq': 'therapist',
  'price_1T3Lk1FQvVkmN1b8b7BjRZxS': 'enterprise',
  'price_1T3Lk7FQvVkmN1b8TxqsKbd4': 'lifetime',
};

function getTier(priceId: string): string {
  if (PRICE_TIER_MAP[priceId]) return PRICE_TIER_MAP[priceId];
  const envMap: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || 'x']: 'solo',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY || 'x']: 'family',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST || 'x']: 'therapist',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || 'x']: 'enterprise',
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || 'x']: 'lifetime',
  };
  return envMap[priceId] || 'solo';
}

async function findUserId(supabase: any, customerEmail: string, metaUserId?: string | null): Promise<string | null> {
  if (metaUserId) return metaUserId;
  if (!customerEmail) return null;
  const { data } = await supabase.auth.admin.listUsers();
  const match = data?.users?.find((u: any) => u.email === customerEmail);
  return match?.id || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    if (!signature) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook sig failed:', err.message);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const customerEmail = session.customer_details?.email || session.customer_email || '';
        const metaUserId = session.metadata?.supabase_user_id || null;

        let tier = 'solo';
        let receiptUrl: string | undefined;
        let amountPaid: string | undefined;

        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          tier = getTier(sub.items.data[0]?.price.id || '');
          if (sub.latest_invoice) {
            const inv = await stripe.invoices.retrieve(sub.latest_invoice as string);
            receiptUrl = inv.hosted_invoice_url || undefined;
            amountPaid = inv.amount_paid ? `$${(inv.amount_paid / 100).toFixed(2)}/mo` : undefined;
          }
        } else if (session.mode === 'payment') {
          tier = 'lifetime';
          if (session.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
            if (pi.latest_charge) {
              const charge = await stripe.charges.retrieve(pi.latest_charge as string);
              receiptUrl = charge.receipt_url || undefined;
            }
            amountPaid = pi.amount ? `$${(pi.amount / 100).toFixed(2)} one-time` : undefined;
          }
        }

        const tokens = TIER_TOKENS[tier] || 120;
        const userId = await findUserId(supabase, customerEmail, metaUserId);

        if (userId) {
          // Award tokens via RPC
          const { error: rpcErr } = await supabase.rpc('award_tokens', {
            user_uuid: userId,
            amount: tokens,
            transaction_type: 'purchase',
            description: `${TIER_NAMES[tier] || tier} — activated`,
          });
          if (rpcErr) {
            console.error('award_tokens RPC failed, direct update:', rpcErr.message);
            // Direct fallback
            await supabase.from('profiles').update({ soul_tokens: tokens }).eq('id', userId);
          }

          // Save subscription
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: session.subscription as string || null,
            tier,
            status: 'active',
          }, { onConflict: 'user_id' });
        } else {
          console.warn('No user found for email:', customerEmail, '| meta:', metaUserId);
        }

        // Send receipt email regardless
        if (customerEmail) {
          const result = await sendPurchaseReceiptEmail({ to: customerEmail, tier, tokensAwarded: tokens, amountPaid, receiptUrl });
          console.log('Receipt email:', result.success ? 'sent' : 'failed');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const tier = getTier(sub.items.data[0]?.price.id || '');
        await supabase.from('subscriptions').upsert({
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          tier,
          status: sub.status,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        }, { onConflict: 'stripe_subscription_id' });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({ status: 'canceled', cancel_at_period_end: false }).eq('stripe_subscription_id', sub.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const inv = event.data.object as Stripe.Invoice;
        const subId = inv.subscription as string;
        const customerEmail = inv.customer_email || '';

        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const tier = getTier(sub.items.data[0]?.price.id || '');
          const tokens = TIER_TOKENS[tier] || 120;

          await supabase.from('subscriptions').update({
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq('stripe_subscription_id', subId);

          // Monthly renewal: re-award tokens
          if (inv.billing_reason === 'subscription_cycle' && customerEmail) {
            const userId = await findUserId(supabase, customerEmail);
            if (userId) {
              await supabase.rpc('award_tokens', {
                user_uuid: userId,
                amount: tokens,
                transaction_type: 'renewal',
                description: `Monthly refresh — ${TIER_NAMES[tier] || tier}`,
              });
            }
            await sendPurchaseReceiptEmail({
              to: customerEmail,
              tier,
              tokensAwarded: tokens,
              amountPaid: `$${((inv.amount_paid || 0) / 100).toFixed(2)}/mo`,
              receiptUrl: inv.hosted_invoice_url || undefined,
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object as Stripe.Invoice;
        if (inv.subscription) {
          await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_subscription_id', inv.subscription as string);
        }
        break;
      }

      default:
        console.log(`Unhandled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook fatal:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
