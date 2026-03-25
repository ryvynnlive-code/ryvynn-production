import { NextResponse } from 'next/server';

const V2_STATEMENTS = [
  // Add Stripe cols to profiles (idempotent)
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'`,
  `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'`,

  // Fix: Add UNIQUE constraint on subscriptions.user_id so webhook upsert works
  `DO $$ BEGIN
    ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);
  EXCEPTION WHEN duplicate_table THEN NULL; WHEN others THEN NULL; END $$`,

  // Create Crisis Events table (Guardian audit log)
  `CREATE TABLE IF NOT EXISTS public.crisis_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    risk_level TEXT,
    signals TEXT[],
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // Create Payment Events table (Stripe audit log)
  `CREATE TABLE IF NOT EXISTS public.payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_customer_id TEXT,
    event_type TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // Enable RLS
  `ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY`,

  // RLS: users see own crisis events
  `DO $$ BEGIN
    CREATE POLICY "Users view own crisis events" ON public.crisis_events FOR SELECT USING (auth.uid() = user_id);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // RLS: payment_events service-role only (no public access)
  `DO $$ BEGIN
    CREATE POLICY "No public payment event access" ON public.payment_events FOR ALL USING (false);
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // Index on crisis_events
  `CREATE INDEX IF NOT EXISTS idx_crisis_events_user_id ON public.crisis_events(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_crisis_events_created_at ON public.crisis_events(created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_payment_events_customer ON public.payment_events(stripe_customer_id)`,

  // Sync: update profiles.subscription_tier from subscriptions on upsert
  `CREATE OR REPLACE FUNCTION sync_profile_subscription()
  RETURNS TRIGGER AS $$
  BEGIN
    UPDATE public.profiles
      SET subscription_tier = NEW.tier,
          subscription_status = NEW.status,
          stripe_customer_id = NEW.stripe_customer_id
    WHERE id = NEW.user_id;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER`,

  `DO $$ BEGIN
    CREATE TRIGGER sync_subscription_to_profile
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION sync_profile_subscription();
  EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
];

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { secret } = body as { secret?: string };

    if (secret !== 'DUAL_FLAME_V2_IGNITE_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
    }

    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 20000,
    });

    const results: { stmt: string; ok: boolean; error?: string }[] = [];

    for (const stmt of V2_STATEMENTS) {
      const label = stmt.trim().substring(0, 90).replace(/\s+/g, ' ');
      try {
        await pool.query(stmt);
        results.push({ stmt: label, ok: true });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        results.push({ stmt: label, ok: false, error: msg });
      }
    }

    await pool.end();

    const failed = results.filter(r => !r.ok);
    return NextResponse.json({
      success: true,
      total: results.length,
      passed: results.length - failed.length,
      failedCount: failed.length,
      results,
      note: 'DELETE THIS ENDPOINT — run was successful',
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
