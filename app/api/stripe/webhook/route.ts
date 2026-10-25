import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

// Free access has no payment-driven entitlements. Keep both registered webhook
// URLs signature-verified without reviving paid tiers or attaching donors to chats.
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return NextResponse.json({ error: 'Webhook unavailable' }, { status: 503 });
  const stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' });
  try {
    stripe.webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  // No database writes, emails, token awards, or access changes. Delivery retries
  // and duplicate event IDs therefore have no entitlement side effects.
  return NextResponse.json({ received: true });
}
