import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';

// GET token balance + streak + recent transactions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('soul_tokens, streak_days, last_checkin')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Get recent transactions
    const { data: transactions, error: txError } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (txError) console.error('Error fetching transactions:', txError);

    // Return shape that matches dashboard TokenData interface
    return NextResponse.json({
      balance: profile.soul_tokens,
      streak: profile.streak_days,
      lastCheckIn: profile.last_checkin,
      transactions: transactions || [],
    });

  } catch (error) {
    console.error('Token GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch token data' }, { status: 500 });
  }
}

// POST - daily check-in
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current profile
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

    if (hoursSince >= 24 && hoursSince < 48) {
      newStreak = profile.streak_days + 1;
      bonusTokens = 1;
      if (newStreak === 3) {
        bonusTokens += 5;
        message = '🔥 3-day streak! +6 tokens total';
      } else if (newStreak === 7) {
        bonusTokens += 15;
        message = '🔥🔥 7-day streak! +16 tokens total';
      } else if (newStreak === 30) {
        bonusTokens += 50;
        message = '🔥🔥🔥 30-day streak! +51 tokens total';
      } else {
        message = `✨ Day ${newStreak} streak! +${bonusTokens} token`;
      }
    } else if (hoursSince < 24) {
      message = `⏰ Check back in ${Math.ceil(24 - hoursSince)}h for daily bonus`;
    } else {
      newStreak = 1;
      bonusTokens = 1;
      message = '🔄 Streak reset. Starting fresh! +1 token';
    }

    // Update profile
    const newBalance = profile.soul_tokens + bonusTokens;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_checkin: now.toISOString(),
        streak_days: newStreak,
        soul_tokens: newBalance,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Log transaction
    if (bonusTokens > 0) {
      const { error: txError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: bonusTokens,
          type: hoursSince < 24 ? 'daily_checkin' : 'streak_bonus',
          description: message,
        });
      if (txError) console.error('Transaction log error:', txError);
    }

    // Fetch updated transactions
    const { data: transactions } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Return full TokenData shape so dashboard setTokenData(data) works
    return NextResponse.json({
      balance: newBalance,
      streak: newStreak,
      lastCheckIn: now.toISOString(),
      transactions: transactions || [],
      tokensEarned: bonusTokens,
      message,
    });

  } catch (error) {
    console.error('Token POST error:', error);
    return NextResponse.json({ error: 'Failed to process check-in' }, { status: 500 });
  }
}
