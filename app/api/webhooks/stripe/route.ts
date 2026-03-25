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

// ─── Price → Tier mapping ────────────────────────────────────────────────────

function buildPriceMap(): Record<string, string> {
  const entries: Array<[string | undefined, string]> = [
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO,       'solo'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_FAMILY,     'family'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_THERAPIST,  'therapist'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE, 'enterprise'],
    [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,   'lifetime'],
    // Hardcoded live price IDs as fallback
    ['price_1TCvSUFXY1nWj7h7PAn2aUcb', 'solo'],
    ['price_1TCvSdFXY1nWj7h7UlL16h0R', 'family'],
    ['price_1TCvSnFXY1nWj7h7zOhi50a7', 'therapist'],
    ['price_1TCvSyFXY1nWj7h7aBMnrWOv', 'enterprise'],
    ['price_1T83YxFXY1nWj7h7KLhYLVU3', 'lifetime'],
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

// ─── Profile lookup — DEFENSIVE: works with or without stripe_customer_id col ─

async function findProfile(
  supabase: ReturnType<typeof getServiceClient>,
  customerId: string,
  email?: string | null,
  knownUserId?: string | null
): Promise<{ id: string; soul_tokens: number } | null> {
  // 1. Direct user ID from checkout session metadata (most reliable)
  if (knownUserId) {
    const { data } = await supabase
      .from('profiles')
      .select('id, soul_tokens')
      .eq('id', knownUserId)
      .single();
    if (data) {
      console.log('[webhook] Found profile by known user ID:', data.id);
      return data;
    }
  }

  // 2. Try stripe_customer_id column (may not exist yet — catch error)
  try {
    const { data: byCustomer, error } = await supabase
      .from('profiles')
      .select('id, soul_tokens')
      .eq('stripe_customer_id', customerId)
      .single();
    if (!error && byCustomer) {
      console.log('[webhook] Found profile by stripe_customer_id:', byCustomer.id);
      return byCustomer;
    }
  } catch {
    // Column doesn't exist yet — fall through
  }

  // 3. Fall back to auth.admin lookup by email (always works, no column deps)
  if (email) {
    try {
      const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const user = authData?.users?.find(u => u.email === email);
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, soul_tokens')
          .eq('id', user.id)
          .single();
        if (profileData) {
          console.log('[webhook] Found profile by email lookup:', profileData.id);
          return profileData;
        }
      }
    } catch (e) {
      console.warn('[webhook] Auth admin lookup failed:', e);
    }
  }

  console.error('[webhook] No profile found for customer:', customerId, '/ email:', email);
  return null;
}

// ─── Safe profile update — works before AND after migration ──────────────────

async function safeProfileUpdate(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  payload: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId);

  if (!error) return;

  // If missing-column error, strip optional new columns and retry
  const msg = error.message ?? '';
  if (msg.includes('column') || msg.includes('does not exist') || msg.includes('42703')) {
    const safePayload: Record<string, unknown> = {};
    const baseKeys = ['soul_tokens', 'streak_days', 'last_checkin', 'updated_at',
                      'persona', 'age_tier', 'r_rated_mode'];
    for (const k of baseKeys) {
      if (k in payload) safePayload[k] = payload[k];
    }
    if (Object.keys(safePayload).length > 0) {
      const { error: e2 } = await supabase.from('profiles').update(safePayload).eq('id', userId);
      if (e2) throw e2;
    }
    console.warn('[webhook] Profile updated with safe-only columns (migration pending)');
  } else {
    throw error;
  }
}

// ─── Safe payment_events insert — graceful if table doesn't exist yet ─────────

async function safeLogPaymentEvent(
  supabase: ReturnType<typeof getServiceClient>,
  event: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('payment_events').insert(event).select();
  } catch {
    // Table may not exist yet — non-blocking
    console.warn('[webhook] payment_events table not yet created — skipping audit log');
  }
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getServiceClient>
) {
  const customerId = session.customer as string;
  const priceId = session.line_items?.data[0]?.price?.id;
  const tier = (priceId ? PRICE_TO_TIER[priceId] : null) ?? 'solo';
  const tokenBonus = TIER_TOKEN_BONUS[tier] ?? 30;
  const email = session.customer_details?.email ?? session.customer_email;
  const knownUserId = (session.metadata?.supabase_user_id as string) ?? null;

  console.log(`[webhook] checkout.session.completed | tier=${tier} | customer=${customerId}`);

  const profile = await findProfile(supabase, customerId, email, knownUserId);
  if (!profile) {
    // Payment received but can't link user — log and return 200 so Stripe doesn't retry
    console.error(`[webhook] UNLINKED PAYMENT — customer ${customerId} / email ${email} / tier ${tier}`);
    await safeLogPaymentEvent(supabase, {
      stripe_customer_id: customerId,
      event_type: 'checkout_completed_unlinked',
      amount: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
    });
    return;
  }

  // Update profile — safe against missing columns
  await safeProfileUpdate(supabase, profile.id, {
    stripe_customer_id: customerId,
    subscription_tier: tier,
    subscription_status: 'active',
    soul_tokens: (profile.soul_tokens ?? 0) + tokenBonus,
    updated_at: new Date().toISOString(),
  });

  // Upsert subscriptions table (stripe_customer_id IS unique — this works)
  const { error: subErr } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: profile.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: (session.subscription as string) ?? null,
      tier,
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_customer_id' });

  if (subErr) console.warn('[webhook] subscriptions upsert warning:', subErr.message);

  // Audit log
  await safeLogPaymentEvent(supabase, {
    stripe_customer_id: customerId,
    event_type: 'checkout_completed',
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'usd',
  });

  console.log(`[webhook] ✅ User ${profile.id} upgraded to ${tier} | +${tokenBonus} tokens`);
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

  // Update profiles (defensive — stripe_customer_id might not be column yet)
  try {
    await supabase
      .from('profiles')
      .update({
        subscription_tier: isActive ? (tier ?? 'solo') : 'free',
        subscription_status: isActive ? 'active' : status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  } catch {
    console.warn('[webhook] handleSubscriptionChange: profile update skipped — migration pending');
  }

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

  try {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'past_due', updated_at: new Date().toISOString() })
      .eq('stripe_customer_id', customerId);
  } catch {
    console.warn('[webhook] handlePaymentFailed: profile update skipped — migration pending');
  }

  await supabase.from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('stripe_customer_id', customerId);

  await safeLogPaymentEvent(supabase, {
    stripe_customer_id: customerId,
    event_type: 'payment_failed',
    amount: invoice.amount_due,
    currency: invoice.currency,
  });
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
    console.error(`[webhook] ${event.type} fatal:`, message);
    // Return 500 only for truly unexpected errors
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' }, { status: 200 });
}
