import { NextRequest, NextResponse } from 'next/server';

// Donation checkout — accepts a custom donor-entered amount.
// Supports one-time and recurring (monthly) via Stripe price_data (ad-hoc, no preset price needed).
export async function POST(req: NextRequest) {
  try {
    const { amount, recurring } = await req.json();

    // Validate amount (dollars). Min $1, max $10,000 sanity cap.
    const dollars = Number(amount);
    if (!dollars || isNaN(dollars) || dollars < 1 || dollars > 10000) {
      return NextResponse.json({ error: 'Please enter an amount between $1 and $10,000.' }, { status: 400 });
    }
    const cents = Math.round(dollars * 100);

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment system not configured.' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ryvynn.live';
    const isRecurring = recurring === true;

    const formBody = new URLSearchParams();
    formBody.append('mode', isRecurring ? 'subscription' : 'payment');
    formBody.append('success_url', `${baseUrl}/wall?donated=1`);
    formBody.append('cancel_url', `${baseUrl}/wall`);
    formBody.append('payment_method_types[]', 'card');

    // Ad-hoc line item via price_data — no preset Stripe price required
    formBody.append('line_items[0][quantity]', '1');
    formBody.append('line_items[0][price_data][currency]', 'usd');
    formBody.append('line_items[0][price_data][unit_amount]', String(cents));
    formBody.append('line_items[0][price_data][product_data][name]',
      isRecurring ? 'RYVYNN Monthly Support' : 'RYVYNN Donation');
    formBody.append('line_items[0][price_data][product_data][description]',
      'Keeps RYVYNN free and anonymous for everyone who needs it.');
    if (isRecurring) {
      formBody.append('line_items[0][price_data][recurring][interval]', 'month');
    }

    formBody.append('metadata[type]', isRecurring ? 'donation_recurring' : 'donation_onetime');
    formBody.append('metadata[amount_usd]', String(dollars));
    formBody.append('submit_type', isRecurring ? 'auto' : 'donate');

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stripe donation error:', errorText);
      return NextResponse.json({ error: 'Could not start donation. Please try again.' }, { status: 500 });
    }

    const session = await response.json();
    return NextResponse.json({ url: session.url });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Donation checkout error:', msg);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
