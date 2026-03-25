import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('t');
  if (token !== 'RYVYNN_ARCHITECT_VERIFY_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 });
  }

  const WEBHOOK_ID = 'we_1TDwY4FXY1nWj7h7b84cF93i';
  const CORRECT_URL = 'https://ryvynn.live/api/webhooks/stripe';

  // Fetch current webhook config
  const res = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${WEBHOOK_ID}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_KEY}` }
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: 'Stripe fetch failed', detail: err, status: res.status });
  }

  const webhook = await res.json();
  const currentUrl = webhook.url;
  const isCorrect = currentUrl === CORRECT_URL;
  const isLive = !STRIPE_KEY.startsWith('sk_test_');

  let updateResult = null;
  if (!isCorrect) {
    // Update the webhook URL
    const updateRes = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${WEBHOOK_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url: CORRECT_URL }).toString()
    });
    const updateData = await updateRes.json();
    updateResult = {
      updated: updateRes.ok,
      newUrl: updateData.url,
      error: updateRes.ok ? null : updateData.error
    };
  }

  return NextResponse.json({
    webhookId: WEBHOOK_ID,
    currentUrl,
    correctUrl: CORRECT_URL,
    wasCorrect: isCorrect,
    stripeMode: isLive ? 'LIVE' : 'TEST',
    status: webhook.status,
    enabledEvents: webhook.enabled_events,
    updateResult,
    verdict: (!isCorrect && updateResult?.updated) ? 'UPDATED' : isCorrect ? 'ALREADY_CORRECT' : 'UPDATE_FAILED'
  });
}
