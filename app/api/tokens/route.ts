import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(supabaseUrl, key);
}

// GET — token balance + streak + recent transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = getSupabase();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('soul_tokens, streak_days, last_checkin')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const { data: transactions, error: txError } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) console.error('[tokens GET] transactions error:', txError);

    return NextResponse.json({
      balance: profile.soul_tokens,
      streak: profile.streak_days,
      lastCheckIn: profile.last_checkin,
      transactions: transactions ?? [],
    });
  } catch (error) {
    console.error('[tokens GET] error:', error);
    return NextResponse.json({ error: 'Failed to fetch token data' }, { status: 500 });
  }
}

// POST — daily check-in
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = getSupabase();

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    const now = new Date();
    const lastCheckin = new Date(profile.last_checkin);
    const hoursSince = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60);

    let newStreak = profile.streak_days;
    let bonusTokens = 0;
    let message = '';
    let txType = 'daily_checkin';

    if (hoursSince < 24) {
      message = `Check back in ${Math.ceil(24 - hoursSince)}h for daily bonus`;
    } else if (hoursSince < 48) {
      newStreak = profile.streak_days + 1;
      bonusTokens = 1;
      txType = 'daily_checkin';

      if (newStreak === 30) {
        bonusTokens += 50;
        txType = 'streak_bonus';
        message = `30-day streak! +${bonusTokens} tokens`;
      } else if (newStreak === 7) {
        bonusTokens += 15;
        txType = 'streak_bonus';
        message = `7-day streak! +${bonusTokens} tokens`;
      } else if (newStreak === 3) {
        bonusTokens += 5;
        txType = 'streak_bonus';
        message = `3-day streak! +${bonusTokens} tokens`;
      } else {
        message = `Day ${newStreak} streak! +${bonusTokens} token`;
      }
    } else {
      newStreak = 1;
      bonusTokens = 1;
      txType = 'daily_checkin';
      message = 'Streak reset. Starting fresh! +1 token';
    }

    const newBalance = profile.soul_tokens + bonusTokens;

    if (bonusTokens > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          last_checkin: now.toISOString(),
          streak_days: newStreak,
          soul_tokens: newBalance,
        })
        .eq('id', userId);
      if (updateError) throw updateError;

      const { error: txError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: bonusTokens,
          type: txType,
          description: message,
        });
      if (txError) console.error('[tokens POST] tx log error:', txError);
    } else {
      await supabase
        .from('profiles')
        .update({ last_checkin: now.toISOString() })
        .eq('id', userId);
    }

    const { data: transactions } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      balance: newBalance,
      streak: newStreak,
      lastCheckIn: now.toISOString(),
      transactions: transactions ?? [],
      tokensEarned: bonusTokens,
      message,
    });
  } catch (error) {
    console.error('[tokens POST] error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
