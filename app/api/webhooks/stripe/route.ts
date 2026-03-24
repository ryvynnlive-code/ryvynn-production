import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Idempotency store — prevents double-processing on Stripe retries
const processedEvents = new Set<string>();

function alreadyProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return true;
  processedEvents.add(eventId);
  if (processedEvents.size > 10_000) {
    const first = processedEvents.values().next().value;
    processedEvents.delete(first);
  }
  return false;
}

// Uses NEXT_PUBLIC_ prefix — these are already in Vercel env
const PRICE_TO_TIER: Record<string, string> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO!]:       'solo',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY!]:     'family',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST!]:  'therapist',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE!]: 'enterprise',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!]:   'lifetime',
};

const TIER_TOKEN_BONUS: Record<string, number> = {
  solo: 30,
  family: 100,
  therapist: 250,
  enterprise: 500,
  lifetime: 3693,
};

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = session.customer as string;
  const priceId = session.line_items?.data[0]?.price?.id;
  const tier = (priceId ? PRICE_TO_TIER[priceId] : null) ?? 'solo';
  const tokenBonus = TIER_TOKEN_BONUS[tier] ?? 30;

  // Try lookup by stripe_customer_id first
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, soul_tokens')
    .eq('stripe_customer_id', customerId)
    .single();

  // Fallback to email lookup
  if (!profile) {
    const email = session.customer_details?.email;
    if (!email) throw new Error(`No profile found for customer ${customerId}`);

    const { data: profileByEmail } = await supabase
      .from('profiles')
      .select('id, soul_tokens')
      .eq('email', email)
      .single();

    profile = profileByEmail;
  }

  if (!profile) throw new Error(`No profile found for customer ${customerId}`);

  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      subscription_tier: tier,
      subscription_status: 'active',
      soul_tokens: (profile.soul_tokens ?? 0) + tokenBonus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (error) throw error;
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? PRICE_TO_TIER[priceId] : null;
  const status = subscription.status;
  const tierToSet = status === 'active' ? (tier ?? 'solo') : 'free';

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tierToSet,
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) throw error;
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = invoice.customer as string;

  await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  await supabase.from('payment_events').insert({
    stripe_customer_id: customerId,
    event_type: 'payment_failed',
    amount: invoice.amount_due,
    currency: invoice.currency,
    created_at: new Date().toISOString(),
  }).select();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const supabase = getServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = await stripe.checkout.sessions.retrieve(
          (event.data.object as Stripe.Checkout.Session).id,
          { expand: ['line_items'] }
        );
        await handleCheckoutComplete(session, supabase);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
          supabase
        );
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true, event_id: event.id });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[webhook] ${event.type} failed:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
