import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if ((body as any).secret !== 'RYVYNN_MIGRATE_FINAL_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const projectRef = 'iofkxyljwemnnbwzcrke';

    // Try Supabase Management API with service role key
    const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' ORDER BY column_name`
      })
    });
    const mgmtData = await mgmtRes.json();

    if (mgmtRes.ok) {
      // Management API worked! Now run migrations
      const ddlStatements = [
        `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`,
        `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free'`,
        `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'`,
        `CREATE TABLE IF NOT EXISTS public.crisis_events (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          session_id TEXT, risk_level TEXT, signals TEXT[],
          created_at TIMESTAMPTZ DEFAULT now()
        )`,
        `ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY`,
      ];

      const results = [];
      for (const sql of ddlStatements) {
        const r = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql })
        });
        const d = await r.json();
        results.push({ sql: sql.slice(0, 50), ok: r.ok, response: d });
      }
      return NextResponse.json({ method: 'management_api', columns_before: mgmtData, migrations: results });
    }

    // Management API failed — try via Supabase admin client RPC
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if columns exist via admin client
    const { data: colData, error: colErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_tier, subscription_status')
      .limit(1);

    return NextResponse.json({
      method: 'fallback_check',
      mgmt_api_status: mgmtRes.status,
      mgmt_api_error: mgmtData,
      profiles_col_check: colErr ? { missing: true, error: colErr.message } : { exists: true },
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
