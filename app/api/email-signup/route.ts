import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'promo' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('email_signups')
      .insert({ email: email.toLowerCase().trim(), source });

    const alreadySignedUp = dbError?.code === '23505';

    if (dbError && !alreadySignedUp) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 });
    }

    if (!alreadySignedUp) {
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#07080f;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:48px 24px;">
  <div style="text-align:center;margin-bottom:36px;">
    <div style="font-size:42px;margin-bottom:12px;">🔥</div>
    <h1 style="color:#00D9FF;font-size:22px;font-weight:700;letter-spacing:3px;margin:0;">RYVYNN</h1>
    <p style="color:#636e84;font-size:11px;letter-spacing:2px;margin:8px 0 0;">FROM OUR DARKEST HOURS TO OUR BRIGHTEST DAYS</p>
  </div>
  <div style="background:rgba(0,201,232,.04);border:1px solid rgba(0,201,232,.15);border-radius:16px;padding:32px;margin-bottom:24px;">
    <p style="color:#d8e0ee;font-size:15px;line-height:1.8;margin:0 0 16px;">You are on the founding member list.</p>
    <p style="color:#8b9ab5;font-size:14px;line-height:1.7;margin:0 0 16px;">
      Founding rate locked: <strong style="color:#eef2fa;">$3.69 your first month</strong>, then $12.12/mo.
      Built by one person. No VC. No surveillance. No ads. Ever.
    </p>
    <p style="color:#8b9ab5;font-size:14px;line-height:1.7;margin:0;">Try the Guardian right now — no account needed.</p>
  </div>
  <div style="text-align:center;margin-bottom:32px;">
    <a href="https://ryvynn.live/guardian"
       style="display:inline-block;border:1.5px solid #00C9E8;color:#00C9E8;font-weight:600;font-size:14px;padding:14px 32px;border-radius:99px;text-decoration:none;">
      Talk to Guardian Free →
    </a><br>
    <a href="https://ryvynn.live/promo"
       style="display:inline-block;color:#636e84;font-size:13px;text-decoration:none;margin-top:12px;">
      Claim founding member rate →
    </a>
  </div>
  <div style="text-align:center;border-top:1px solid rgba(255,255,255,.06);padding-top:24px;">
    <p style="color:#2a3040;font-size:11px;margin:0;">
      AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC · Tucson, AZ
    </p>
  </div>
</div>
</body></html>`;

      await resend.emails.send({
        from: 'RYVYNN <noreply@ryvynn.live>',
        to: email,
        subject: "You're on the founding member list — RYVYNN",
        html,
      });
    }

    const { count } = await supabase
      .from('email_signups')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ success: true, alreadySignedUp, count: count || 0 });

  } catch (err) {
    console.error('Email signup error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
