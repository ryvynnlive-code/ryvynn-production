import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      // If not configured, allow signup (graceful degradation)
      return NextResponse.json({ success: true });
    }

    // Verify with Cloudflare Turnstile
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    // Get client IP from request headers
    const clientIp = 
      request.headers.get('cf-connecting-ip') || 
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '0.0.0.0';
    
    formData.append('remoteip', clientIp);

    const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      console.error('Turnstile verification failed:', verifyData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bot verification failed',
          'error-codes': verifyData['error-codes'] || []
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      success: true,
      challenge_ts: verifyData.challenge_ts,
      hostname: verifyData.hostname
    });

  } catch (error) {
    console.error('Turnstile verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
