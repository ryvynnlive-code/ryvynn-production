import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function POST(req: Request) {
  try {
    const { email, password, persona, ageTier } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Create user with email already confirmed — bypasses confirmation email entirely
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { persona: persona || 'neutral', age_tier: ageTier || 'adult' }
    });

    if (error) {
      // If user already exists, return a clear message
      if (error.message?.includes('already') || error.message?.includes('duplicate')) {
        return NextResponse.json({ error: 'Email already registered. Please sign in.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Profile auto-created by DB trigger, but upsert as safety net
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        persona: persona || 'neutral',
        age_tier: ageTier || 'adult',
        r_rated_mode: false,
        soul_tokens: 10,
        streak_days: 0,
        last_checkin: new Date().toISOString(),
      }, { onConflict: 'id' });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
