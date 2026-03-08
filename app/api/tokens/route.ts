import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// GET token balance and check daily streak
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile with token balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('soul_tokens, streak_days, last_checkin')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    return NextResponse.json({
      tokens: profile.soul_tokens,
      streakDays: profile.streak_days,
      lastCheckin: profile.last_checkin,
    });

  } catch (error) {
    console.error('Token GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  }
}

// POST to check in daily and update streak
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    const now = new Date();
    const lastCheckin = new Date(profile.last_checkin);
    const hoursSinceCheckin = (now.getTime() - lastCheckin.getTime()) / (1000 * 60 * 60);

    let newStreak = profile.streak_days;
    let bonusTokens = 0;
    let message = '';

    // If checked in within 24-48 hours: maintain/increment streak
    if (hoursSinceCheckin >= 24 && hoursSinceCheckin < 48) {
      newStreak = profile.streak_days + 1;
      bonusTokens = 1; // Daily check-in bonus
      
      // Streak bonuses
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
      
    // If checked in too early (< 24 hours): no change
    } else if (hoursSinceCheckin < 24) {
      message = `⏰ Check back in ${Math.ceil(24 - hoursSinceCheckin)} hours for daily bonus`;
      
    // If checked in too late (> 48 hours): reset streak
    } else {
      newStreak = 1;
      bonusTokens = 1;
      message = '🔄 Streak reset. Starting fresh! +1 token';
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        last_checkin: now.toISOString(),
        streak_days: newStreak,
        soul_tokens: profile.soul_tokens + bonusTokens,
      })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    // Log transaction if bonus awarded
    if (bonusTokens > 0) {
      const { error: txError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: bonusTokens,
          type: newStreak > 1 && hoursSinceCheckin >= 24 ? 'streak_bonus' : 'daily_checkin',
          description: message,
        });

      if (txError) {
        console.error('Error logging transaction:', txError);
      }
    }

    return NextResponse.json({
      tokens: profile.soul_tokens + bonusTokens,
      streakDays: newStreak,
      bonusTokens,
      message,
      canCheckInAgain: hoursSinceCheckin >= 24,
    });

  } catch (error) {
    console.error('Token POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process check-in' },
      { status: 500 }
    );
  }
}

// GET transaction history
export async function PUT(req: NextRequest) {
  try {
    const { userId, limit = 50 } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ transactions: data || [] });

  } catch (error) {
    console.error('Token transaction history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
