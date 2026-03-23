import { NextRequest, NextResponse } from 'next/server';

// ONE-SHOT: Registers RYVYNN Stripe webhook endpoint
// Hit this once at: GET /api/admin/setup-webhook?secret=<ADMIN_API_KEY>
// Then delete this file

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  const ADMIN_KEY = process.env.ADMIN_API_KEY || '';
  if (!secret || secret !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not set' }, { status: 500 });
  }

  try {
    // List existing webhooks first
    const listRes = await fetch('https://api.stripe.com/v1/webhook_endpoints?limit=10', {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });
    const listData = await listRes.json();
    const existing = listData.data || [];
    
    // Check if our endpoint already exists
    const alreadyExists = existing.find((wh: any) => 
      wh.url.includes('ryvynn.live/api/stripe/webhook')
    );
    
    if (alreadyExists) {
      return NextResponse.json({
        status: 'already_exists',
        webhook_id: alreadyExists.id,
        url: alreadyExists.url,
        status_webhook: alreadyExists.status,
        existing_webhooks: existing.map((w: any) => ({ id: w.id, url: w.url, status: w.status })),
      });
    }

    // Create the webhook endpoint
    const body = new URLSearchParams();
    body.append('url', 'https://ryvynn.live/api/stripe/webhook');
    body.append('enabled_events[]', 'checkout.session.completed');
    body.append('enabled_events[]', 'customer.subscription.deleted');
    body.append('enabled_events[]', 'customer.subscription.updated');
    body.append('enabled_events[]', 'invoice.paid');
    body.append('enabled_events[]', 'invoice.payment_failed');
    body.append('description', 'RYVYNN Production Webhook');

    const createRes = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const createData = await createRes.json();

    if (createData.error) {
      return NextResponse.json({ error: createData.error }, { status: 400 });
    }

    return NextResponse.json({
      status: 'created',
      webhook_id: createData.id,
      url: createData.url,
      webhook_secret: createData.secret, // whsec_... — SAVE THIS TO VERCEL!
      events: createData.enabled_events,
      message: '⚡ SAVE webhook_secret to STRIPE_WEBHOOK_SECRET in Vercel env vars NOW',
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
