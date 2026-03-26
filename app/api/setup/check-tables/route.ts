import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get('t') !== 'RYVYNN_VERIFY_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const tables = [
    'profiles',
    'journal_entries',
    'eternity_letters',
    'wall_posts',
    'soul_tokens',
    'subscriptions',
    'payment_events',
    'crisis_events',
  ];

  const results: Record<string, string> = {};
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    results[t] = error ? `❌ ${error.message}` : '✅ EXISTS';
  }

  return NextResponse.json({ tables: results, checked_at: new Date().toISOString() });
}
