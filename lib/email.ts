import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = 'RYVYNN <noreply@ryvynn.live>';

// Tier → token amounts
export const TIER_TOKENS: Record<string, number> = {
  solo: 120,
  family: 369,
  therapist: 693,
  enterprise: 1500,
  lifetime: 99999, // Effectively unlimited
};

// Tier → display names
export const TIER_NAMES: Record<string, string> = {
  solo: 'Solo Flame',
  family: 'Family Flame',
  therapist: 'Therapist Flame',
  enterprise: 'Enterprise Flame',
  lifetime: 'Eternal Flame',
};

// Tier → prices
export const TIER_PRICES: Record<string, string> = {
  solo: '$12.12/mo',
  family: '$36.93/mo',
  therapist: '$69.36/mo',
  enterprise: '$96.36/mo',
  lifetime: '$369.36 one-time',
};

// ─── Purchase Receipt Email ────────────────────────────────────────────────────
export async function sendPurchaseReceiptEmail({
  to,
  tier,
  tokensAwarded,
  amountPaid,
  receiptUrl,
}: {
  to: string;
  tier: string;
  tokensAwarded: number;
  amountPaid?: string;
  receiptUrl?: string;
}) {
  const tierName = TIER_NAMES[tier] || tier;
  const tierPrice = amountPaid || TIER_PRICES[tier] || '';
  const isLifetime = tier === 'lifetime';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RYVYNN Purchase Receipt</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Courier New',monospace;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:12px;">🔥</div>
      <h1 style="color:#00D9FF;font-size:28px;font-weight:900;letter-spacing:4px;margin:0;">
        RYVYNN
      </h1>
      <p style="color:#475569;font-size:11px;letter-spacing:3px;margin:8px 0 0;">
        FROM OUR DARKEST HOURS TO OUR BRIGHTEST DAYS
      </p>
    </div>

    <!-- Receipt Card -->
    <div style="background:#0A0F1E;border:1px solid #1E3A5F;border-radius:12px;padding:32px;margin-bottom:24px;">
      <h2 style="color:#00D9FF;font-size:14px;letter-spacing:3px;margin:0 0 24px;text-transform:uppercase;">
        ✅ Payment Confirmed
      </h2>
      
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#64748B;font-size:12px;padding:8px 0;letter-spacing:1px;">PLAN</td>
          <td style="color:#E2E8F0;font-size:14px;font-weight:700;text-align:right;">${tierName}</td>
        </tr>
        <tr>
          <td style="color:#64748B;font-size:12px;padding:8px 0;letter-spacing:1px;border-top:1px solid #1E293B;">AMOUNT</td>
          <td style="color:#00D9FF;font-size:18px;font-weight:900;text-align:right;border-top:1px solid #1E293B;">${tierPrice}</td>
        </tr>
        <tr>
          <td style="color:#64748B;font-size:12px;padding:8px 0;letter-spacing:1px;border-top:1px solid #1E293B;">BILLING</td>
          <td style="color:#E2E8F0;font-size:12px;text-align:right;border-top:1px solid #1E293B;">${isLifetime ? 'One-time · No renewals' : 'Monthly · Cancel anytime'}</td>
        </tr>
        <tr>
          <td style="color:#64748B;font-size:12px;padding:8px 0;letter-spacing:1px;border-top:1px solid #1E293B;">🔥 SOUL TOKENS AWARDED</td>
          <td style="color:#8B5CF6;font-size:18px;font-weight:900;text-align:right;border-top:1px solid #1E293B;">
            ${isLifetime ? 'UNLIMITED' : `+${tokensAwarded.toLocaleString()}`}
          </td>
        </tr>
      </table>
    </div>

    <!-- Soul Token Info -->
    <div style="background:#0A0F1E;border:1px solid #8B5CF620;border-left:3px solid #8B5CF6;border-radius:8px;padding:20px;margin-bottom:24px;">
      <p style="color:#A78BFA;font-size:12px;letter-spacing:2px;margin:0 0 8px;text-transform:uppercase;">What are Soul Tokens?</p>
      <p style="color:#94A3B8;font-size:13px;line-height:1.6;margin:0;">
        Soul Tokens unlock deeper AI Guardian sessions, priority crisis support, and Shadow Transformation features. 
        ${isLifetime ? 'As an Eternal Flame member, you have unlimited tokens — forever.' : `Your ${tokensAwarded} tokens refresh every month.`}
      </p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://ryvynn.live/dashboard" 
         style="display:inline-block;background:linear-gradient(135deg,#00D9FF,#8B5CF6);color:#000;font-weight:900;font-size:14px;letter-spacing:2px;padding:16px 32px;border-radius:8px;text-decoration:none;">
        🔥 GO TO YOUR DASHBOARD
      </a>
    </div>

    ${receiptUrl ? `
    <!-- Stripe Receipt Link -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${receiptUrl}" style="color:#475569;font-size:11px;letter-spacing:1px;">
        View Stripe receipt →
      </a>
    </div>
    ` : ''}

    <!-- Free Forever Notice -->
    <div style="background:#0A0F1E;border:1px solid #00D9FF20;border-radius:8px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="color:#00D9FF;font-size:11px;letter-spacing:2px;margin:0 0 6px;font-weight:700;">
        🛡 CRISIS SUPPORT REMAINS FREE FOREVER
      </p>
      <p style="color:#475569;font-size:11px;margin:0;">
        Your premium subscription funds the mission. Crisis features will always be free for everyone.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid #1E293B;padding-top:24px;">
      <p style="color:#334155;font-size:10px;letter-spacing:1px;margin:0 0 8px;">
        AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC · Tucson, AZ
      </p>
      <p style="color:#1E293B;font-size:10px;margin:0;">
        Questions? <a href="mailto:ryvynn.live@gmail.com" style="color:#334155;">ryvynn.live@gmail.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `🔥 Receipt: ${tierName} — RYVYNN`,
      html,
    });

    if (error) {
      console.error('Resend receipt error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Resend send failed:', err);
    return { success: false, error: err };
  }
}

// ─── Welcome Email (sent after email confirmation) ─────────────────────────
export async function sendWelcomeEmail({ to }: { to: string }) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Courier New',monospace;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:64px;margin-bottom:12px;">🔥</div>
      <h1 style="color:#00D9FF;font-size:28px;font-weight:900;letter-spacing:4px;margin:0;">FLAME IGNITED</h1>
      <p style="color:#475569;font-size:11px;letter-spacing:3px;margin:8px 0 0;">WELCOME TO RYVYNN</p>
    </div>

    <div style="background:#0A0F1E;border:1px solid #1E3A5F;border-radius:12px;padding:32px;margin-bottom:24px;">
      <p style="color:#CBD5E1;font-size:15px;line-height:1.8;margin:0 0 20px;">
        Your darkness has a home now. Zero surveillance. No judgment. Just transformation.
      </p>
      <p style="color:#94A3B8;font-size:13px;line-height:1.7;margin:0 0 20px;">
        You've been given <span style="color:#8B5CF6;font-weight:700;">10 Soul Tokens</span> to start your journey. 
        Use them to unlock AI Guardian sessions and Shadow Transformations.
      </p>
      <p style="color:#94A3B8;font-size:13px;line-height:1.7;margin:0;">
        Crisis support is always free — no tokens required, no account needed.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://ryvynn.live/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#00D9FF,#8B5CF6);color:#000;font-weight:900;font-size:14px;letter-spacing:2px;padding:16px 32px;border-radius:8px;text-decoration:none;">
        🔥 ENTER YOUR SANCTUARY
      </a>
    </div>

    <div style="text-align:center;border-top:1px solid #1E293B;padding-top:24px;">
      <p style="color:#334155;font-size:10px;letter-spacing:1px;margin:0;">
        AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC · Tucson, AZ
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: '🔥 Your Flame is Lit — Welcome to RYVYNN',
      html,
    });

    if (error) {
      console.error('Resend welcome error:', error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Resend welcome send failed:', err);
    return { success: false, error: err };
  }
}
