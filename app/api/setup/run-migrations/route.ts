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
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check profiles columns
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_tier, subscription_status')
      .limit(1);

    // Check crisis_events table
    const { data: crisisData, error: crisisErr } = await supabase
      .from('crisis_events')
      .select('id, user_id, risk_level')
      .limit(1);

    // Check payment_events table
    const { data: paymentData, error: paymentErr } = await supabase
      .from('payment_events')
      .select('id, stripe_customer_id, event_type')
      .limit(1);

    // Check core tables from original auth setup
    const tables = ['profiles', 'journal_entries', 'eternity_letters', 'wall_posts', 'soul_tokens', 'subscriptions'];
    const tableResults: Record<string, any> = {};
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id').limit(1);
      tableResults[t] = error ? `❌ ${error.message}` : '✅ exists';
    }

    return NextResponse.json({
      schema_verification: {
        profiles_stripe_columns: profileErr ? `❌ ${profileErr.message}` : '✅ all 3 exist',
        crisis_events_table: crisisErr ? `❌ ${crisisErr.message}` : '✅ exists',
        payment_events_table: paymentErr ? `❌ ${paymentErr.message}` : '✅ exists',
      },
      all_tables: tableResults,
      verdict: (!profileErr && !crisisErr && !paymentErr) ? '🔥 ALL SCHEMA VERIFIED — READY TO SHIP' : '⚠️ SOME ISSUES REMAIN'
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
