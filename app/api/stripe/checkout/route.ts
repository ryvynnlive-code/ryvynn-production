import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { priceId, coupon } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    if (!STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured in environment variables');
      return NextResponse.json(
        { error: 'Payment system not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Detect if we're in test mode based on the key
    const isTestMode = STRIPE_SECRET_KEY.startsWith('sk_test_');
    const keyType = isTestMode ? 'TEST' : 'LIVE';
    
    console.log(`🔑 Using Stripe ${keyType} mode`);
    console.log(`💳 Creating checkout for price: ${priceId}`);
    if (coupon) console.log(`🎟️ Applying coupon: ${coupon}`);

    // Build checkout session params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ryvynn.live';
    const isLifetime = priceId.includes('Lifetime') || priceId.includes('price_1T3Lk7');
    
    const sessionData: any = {
      mode: isLifetime ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      allow_promotion_codes: true, // Let users enter promo codes
    };

    // Add coupon if provided
    if (coupon) {
      sessionData.discounts = [{ coupon }];
    }

    // Convert to URL-encoded format for Stripe API
    const formBody = new URLSearchParams();
    formBody.append('mode', sessionData.mode);
    formBody.append('success_url', sessionData.success_url);
    formBody.append('cancel_url', sessionData.cancel_url);
    formBody.append('allow_promotion_codes', 'true');
    sessionData.payment_method_types.forEach((type: string) => {
      formBody.append('payment_method_types[]', type);
    });
    formBody.append('line_items[0][price]', priceId);
    formBody.append('line_items[0][quantity]', '1');
    
    if (coupon) {
      formBody.append('discounts[0][coupon]', coupon);
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
      
      // Parse Stripe error for better user message
      let userMessage = 'Payment setup failed. ';
      if (errorText.includes('No such price')) {
        userMessage += 'Invalid pricing plan. Please contact support.';
      } else if (errorText.includes('No such coupon')) {
        userMessage += 'Invalid coupon code.';
      } else if (errorText.includes('test mode') || errorText.includes('live mode')) {
        userMessage += 'Configuration mismatch. Please contact support.';
      } else {
        userMessage += 'Please try again or contact support.';
      }
      
      return NextResponse.json(
        { error: userMessage, details: errorText },
        { status: 500 }
      );
    }

    const session = await response.json();
    console.log('✅ Checkout session created:', session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      testMode: isTestMode,
    });

  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
