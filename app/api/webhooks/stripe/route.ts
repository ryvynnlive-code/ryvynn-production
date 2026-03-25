import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ─── Init ──────────────────────────────────────────────────────────────────────

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

// ─── Idempotency ──────────────────────────────────────────────────────────────

const processedEvents = new Set<string>();

function alreadyProcessed(eventId: string): boolean {
  if (processedEvents.has(eventId)) return true;
  processedEvents.add(eventId);
  if (processedEvents.size > 10_000) {
    const first = processedEvents.values().next().value;
    if (first !== undefined) processedEvents.delete(first);
  }
  return false;
}

// ─── Price → Tier mapping (safe builder) ─────────────────────────────────────

function buildPriceMap(): Record<string, string> {
  const entries: Array<[string | undefined, string]> = [
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO,       'solo'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY,     'family'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST,  'therapist'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE, 'enterprise'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,   'lifetime'],
  ];
  return Object.fromEntries(
    entries.filter((e): e is [string, string] => typeof e[0] === 'string' && e[0].length > 0)
  );
}
const PRICE_TO_TIER = buildPriceMap();

const TIER_TOKEN_BONUS: Record<string, number> = {
  solo: 30,
  family: 100,
  therapist: 250,
  enterprise: 500,
  lifetime: 3693,
};

// ─── Helper: find profile by customer ID, fall back to email ─────────────────

async function findProfile(
  supabase: ReturnType<typeof getServiceClient>,
  customerId: string,
  email?: string | null
): Promise<{ id: string; soul_tokens: number } | null> {
  // Try stripe_customer_id first
  const { data: byCustomer } = await supabase
    .from('profiles')
    .select('id, soul_tokens')
    .eq('stripe_customer_id', customerId)
    .single();

  if (byCustomer) return byCustomer;

  // Fall back to email
  if (email) {
    const { data: byEmail } = await supabase
      .from('profiles')
      .select('id, soul_tokens')
      .eq('email', email)
      .single();
    return byEmail ?? null;
  }

  return null;
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = session.customer as string;
  const priceId = session.line_items?.data[0]?.price?.id;
  const tier = (priceId ? PRICE_TO_TIER[priceId] : null) ?? 'solo';
  const tokenBonus = TIER_TOKEN_BONUS[tier] ?? 30;
  const email = session.customer_details?.email;

  const profile = await findProfile(supabase, customerId, email);
  if (!profile) {
    console.error(`[webhook] No profile for customer ${customerId} / email ${email}`);
    return; // Don't throw — log and move on so Stripe doesn't retry forever
  }

  // Update profile with Stripe binding + tier + tokens
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      subscription_tier: tier,
      subscription_status: 'active',
      soul_tokens: (profile.soul_tokens ?? 0) + tokenBonus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (profileErr) throw profileErr;

  // Also upsert into subscriptions table (source of truth for billing)
  const { error: subErr } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: session.subscription as string ?? null,
      tier,
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_customer_id' });

  if (subErr) console.warn('[webhook] subscriptions upsert warning:', subErr.message);

  // Log payment event
  await supabase.from('payment_events').insert({
    stripe_customer_id: customerId,
    user_id: profile.id,
    event_type: 'checkout_completed',
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
    stripe_event_id: session.id,
    created_at: new Date().toISOString(),
  }).select();
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;
  const tier = priceId ? PRICE_TO_TIER[priceId] : null;
  const status = subscription.status;
  const isActive = status === 'active';

  // Update profiles
  await supabase
    .from('profiles')
    .update({
      subscription_tier: isActive ? (tier ?? 'solo') : 'free',
      subscription_status: isActive ? 'active' : status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  // Update subscriptions table
  await supabase
    .from('subscriptions')
    .update({
      tier: isActive ? (tier ?? 'solo') : 'free',
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
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
    stripe_event_id: invoice.id,
    created_at: new Date().toISOString(),
  }).select();
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

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
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, supabase);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true, event_id: event.id });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] ${event.type} failed:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
