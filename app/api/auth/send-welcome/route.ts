import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const result = await sendWelcomeEmail({ to: email });

    if (!result.success) {
      console.error('Welcome email failed:', result.error);
      // Don't fail the response — signup succeeded, email is best-effort
      return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 200 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err: any) {
    console.error('send-welcome route error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
