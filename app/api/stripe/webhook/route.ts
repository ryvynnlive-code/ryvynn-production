import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Get customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!customerId) {
          console.error('No customer ID in checkout session');
          break;
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;

        // Map price ID to tier
        const tierMap: Record<string, string> = {
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || '']: 'solo',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY || '']: 'family',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST || '']: 'therapist',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || '']: 'lifetime',
        };

        const tier = tierMap[priceId] || 'solo';

        // Find user by customer ID
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (existingSub) {
          // Update existing subscription
          await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: subscriptionId,
              tier,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_customer_id', customerId);
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        // Map price ID to tier
        const tierMap: Record<string, string> = {
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO || '']: 'solo',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY || '']: 'family',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST || '']: 'therapist',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '']: 'enterprise',
          [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME || '']: 'lifetime',
        };

        const tier = tierMap[priceId] || 'solo';

        // Upsert subscription
        await supabase
          .from('subscriptions')
          .upsert({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            tier,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Update subscription status to canceled
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_customer_id', customerId);

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Update subscription status to past_due
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', subscriptionId);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
