import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Self-contained migration — runs inside Vercel where env vars ARE decrypted
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if ((body as any).secret !== 'RYVYNN_EXEC_2026_FINAL') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing Supabase env vars' }, { status: 500 });
    }

    // ── Use DATABASE_URL for raw SQL via pg ────────────────────────────────────
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set — cannot run DDL' }, { status: 500 });
    }

    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 20000,
    });

    const migrations = [
      { name: 'add stripe_customer_id', sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT` },
      { name: 'add subscription_tier',  sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'` },
      { name: 'add subscription_status',sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'` },
      { name: 'create payment_events',  sql: `CREATE TABLE IF NOT EXISTS public.payment_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          stripe_customer_id TEXT,
          event_type TEXT,
          amount INTEGER,
          currency TEXT DEFAULT 'usd',
          created_at TIMESTAMPTZ DEFAULT now()
        )` },
      { name: 'enable RLS payment_events', sql: `ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY` },
      { name: 'create crisis_events', sql: `CREATE TABLE IF NOT EXISTS public.crisis_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          session_id TEXT, risk_level TEXT, signals TEXT[],
          created_at TIMESTAMPTZ DEFAULT now()
        )` },
      { name: 'enable RLS crisis_events', sql: `ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY` },
    ];

    const results = [];
    for (const m of migrations) {
      try {
        await pool.query(m.sql);
        results.push({ name: m.name, ok: true });
      } catch (e: any) {
        results.push({ name: m.name, ok: false, error: e.message });
      }
    }

    await pool.end();

    // ── Verify columns now exist via REST ────────────────────────────────────
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Insert a test row into payment_events to confirm table exists
    const { error: insertErr } = await supabase
      .from('payment_events')
      .insert({ stripe_customer_id: 'verify_test', event_type: 'migration_check', amount: 0, currency: 'usd' })
      .select();

    // Also verify stripe webhook URL via Stripe API
    const stripeKey = process.env.STRIPE_SECRET_KEY!;
    const webhookId = 'we_1TDwY4FXY1nWj7h7b84cF93i';
    let webhookUrl = 'unknown';
    let webhookStatus = 'unchecked';
    try {
      const wRes = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${webhookId}`, {
        headers: { Authorization: `Bearer ${stripeKey}` }
      });
      const wData = await wRes.json();
      webhookUrl = wData.url || 'not found';
      const targetUrl = 'https://ryvynn.live/api/webhooks/stripe';
      webhookStatus = webhookUrl === targetUrl ? 'CORRECT' : `WRONG — got: ${webhookUrl}`;

      // Auto-fix if wrong
      if (webhookUrl !== targetUrl) {
        const fixBody = new URLSearchParams();
        fixBody.append('url', targetUrl);
        const fixRes = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${webhookId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: fixBody.toString(),
        });
        const fixData = await fixRes.json();
        webhookStatus = fixRes.ok ? `FIXED → ${fixData.url}` : `FIX FAILED: ${fixData.error?.message}`;
      }
    } catch (e: any) {
      webhookStatus = `ERROR: ${e.message}`;
    }

    const failed = results.filter(r => !r.ok);
    return NextResponse.json({
      migration: {
        success: failed.length === 0,
        passed: results.filter(r => r.ok).length,
        failed: failed.length,
        results,
      },
      payment_events_table: insertErr ? `FAILED: ${insertErr.message}` : 'VERIFIED ✅',
      webhook: {
        id: webhookId,
        url: webhookUrl,
        status: webhookStatus,
      },
      cleanup_note: 'DELETE THIS ROUTE AFTER RUNNING',
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
