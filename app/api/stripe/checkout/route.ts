import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { priceId, coupon, userId, userEmail, mode: requestedMode } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Payment system not configured. Please contact support.' }, { status: 500 });
    }

    const isTestMode = STRIPE_SECRET_KEY.startsWith('sk_test_');
    console.log(`🔑 Stripe ${isTestMode ? 'TEST' : 'LIVE'} mode`);
    console.log(`💳 Price: ${priceId}`);
    if (coupon) console.log(`🎟️ Coupon: ${coupon}`);

    // Auto-detect checkout mode by querying Stripe price object
    let checkoutMode = requestedMode;
    if (!checkoutMode) {
      try {
        const priceRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
          headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` }
        });
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          checkoutMode = priceData.type === 'recurring' ? 'subscription' : 'payment';
          console.log(`📋 Auto-detected mode: ${checkoutMode} (price type: ${priceData.type})`);
        } else {
          checkoutMode = 'subscription';
          console.log('⚠️ Could not fetch price, defaulting to subscription');
        }
      } catch {
        checkoutMode = 'subscription';
        console.log('⚠️ Price lookup failed, defaulting to subscription');
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ryvynn.live';

    const formBody = new URLSearchParams();
    formBody.append('mode', checkoutMode);
    formBody.append('success_url', `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`);
    formBody.append('cancel_url', `${baseUrl}/pricing`);

    // ✅ Accept card + ACH electronic check (us_bank_account)
    // Card listed first = Stripe shows it as default; ACH appears as alternate option
    formBody.append('payment_method_types[]', 'card');
    formBody.append('payment_method_types[]', 'us_bank_account');

    // ✅ ACH: enable Plaid instant verification + manual fallback
    // Removes need for micro-deposits in most cases (Plaid covers ~12,000 US banks)
    formBody.append('payment_method_options[us_bank_account][financial_connections][permissions][]', 'payment_method');
    formBody.append('payment_method_options[us_bank_account][financial_connections][permissions][]', 'balances');
    formBody.append('payment_method_options[us_bank_account][verification_method]', 'automatic');

    formBody.append('line_items[0][price]', priceId);
    formBody.append('line_items[0][quantity]', '1');

    // allow_promotion_codes and discounts[] are mutually exclusive in Stripe
    if (!coupon) {
      formBody.append('allow_promotion_codes', 'true');
    }
    if (coupon) {
      formBody.append('discounts[0][coupon]', coupon);
    }
    if (userId) {
      formBody.append('metadata[supabase_user_id]', userId);
    }
    if (userEmail) {
      formBody.append('customer_email', userEmail);
    }

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
      console.error('❌ Stripe API error:', errorText);

      let userMessage = 'Payment setup failed. ';
      if (errorText.includes('No such price')) {
        userMessage += 'Invalid pricing plan. Please contact support.';
      } else if (errorText.includes('No such coupon')) {
        userMessage += 'Invalid coupon code.';
      } else if (errorText.includes('test mode') || errorText.includes('live mode')) {
        userMessage += 'Configuration mismatch. Please contact support.';
      } else if (errorText.includes('us_bank_account')) {
        userMessage += 'ACH payments not yet enabled. Please pay by card or contact support.';
      } else {
        userMessage += 'Please try again or contact support.';
      }

      return NextResponse.json({ error: userMessage, details: errorText }, { status: 500 });
    }

    const session = await response.json();
    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      testMode: isTestMode,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('❌ Checkout error:', msg);
    return NextResponse.json({ error: 'Internal server error: ' + msg }, { status: 500 });
  }
}
