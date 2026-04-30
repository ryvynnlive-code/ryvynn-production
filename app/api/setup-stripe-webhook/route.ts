import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'RYVYNN_FLAME_IGNITE_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: 'No STRIPE_SECRET_KEY' }, { status: 500 });

  const webhookUrl = 'https://ryvynn.live/api/stripe/webhook';
  const events = [
    'customer.subscription.created',
    'customer.subscription.updated', 
    'customer.subscription.deleted',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'checkout.session.completed',
  ];

  // List existing webhooks
  const listRes = await fetch('https://api.stripe.com/v1/webhook_endpoints?limit=20', {
    headers: { 'Authorization': `Bearer ${stripeKey}` },
  });
  const listData = await listRes.json();

  const existing = listData.data?.find((w: any) => w.url === webhookUrl);

  if (existing) {
    // Roll the signing secret by deleting and recreating
    await fetch(`https://api.stripe.com/v1/webhook_endpoints/${existing.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${stripeKey}` },
    });
  }

  // Create fresh webhook to get new signing secret
  const body = new URLSearchParams();
  body.append('url', webhookUrl);
  events.forEach(e => body.append('enabled_events[]', e));

  const createRes = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const webhook = await createRes.json();

  if (!createRes.ok) {
    return NextResponse.json({ error: webhook }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    webhook_id: webhook.id,
    webhook_url: webhook.url,
    signing_secret: webhook.secret,
    status: webhook.status,
    events: webhook.enabled_events,
  });
}
