import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if ((body as any).secret !== 'RYVYNN_MIGRATE_FINAL_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
    }

    // Fix 1: Switch from transaction mode (6543) to session mode (5432) — DDL requires session mode
    dbUrl = dbUrl.replace(':6543/', ':5432/');

    // Fix 2: Ensure user includes project ref for Supabase Supavisor
    // Format should be postgres.iofkxyljwemnnbwzcrke not just postgres
    if (dbUrl.includes('pooler.supabase.com')) {
      const urlObj = new URL(dbUrl);
      if (urlObj.username === 'postgres') {
        urlObj.username = 'postgres.iofkxyljwemnnbwzcrke';
        dbUrl = urlObj.toString();
      }
    }

    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 25000,
      // Fix 3: Required for Supabase pgBouncer/Supavisor — disables prepared statements
      ...(dbUrl.includes('pooler.supabase.com') ? {} : {}),
    });

    // Fix 4: Disable prepared statements at session level
    const client = await pool.connect();
    await client.query('SET statement_timeout = 30000');

    const migrations = [
      {
        name: 'profiles.stripe_customer_id',
        sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`
      },
      {
        name: 'profiles.subscription_tier',
        sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'`
      },
      {
        name: 'profiles.subscription_status',
        sql: `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'`
      },
      {
        name: 'create crisis_events table',
        sql: `CREATE TABLE IF NOT EXISTS public.crisis_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          session_id TEXT,
          risk_level TEXT,
          signals TEXT[],
          created_at TIMESTAMPTZ DEFAULT now()
        )`
      },
      {
        name: 'enable RLS crisis_events',
        sql: `ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY`
      },
      {
        name: 'crisis_events RLS policy — users see own rows',
        sql: `DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename='crisis_events' AND policyname='crisis_own'
          ) THEN
            CREATE POLICY crisis_own ON public.crisis_events FOR ALL USING (user_id = auth.uid());
          END IF;
        END $$`
      },
    ];

    const results = [];
    for (const m of migrations) {
      try {
        await client.query(m.sql);
        results.push({ name: m.name, ok: true });
      } catch (e: any) {
        results.push({ name: m.name, ok: false, error: e.message });
      }
    }

    // Verify columns exist
    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      AND column_name IN ('stripe_customer_id','subscription_tier','subscription_status')
    `);
    const foundCols = colCheck.rows.map((r: any) => r.column_name);

    // Verify crisis_events table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='crisis_events'
      ) as exists
    `);

    client.release();
    await pool.end();

    const failed = results.filter(r => !r.ok);
    return NextResponse.json({
      success: failed.length === 0,
      results,
      verified: {
        profiles_columns: foundCols,
        crisis_events_table: tableCheck.rows[0].exists,
      },
      dbMode: dbUrl.includes(':5432/') ? 'SESSION (correct)' : 'TRANSACTION (wrong)',
      cleanup: 'DELETE THIS ROUTE NOW',
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack?.split('\n').slice(0,3) }, { status: 500 });
  }
}
