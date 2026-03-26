import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(supabaseUrl, key);
}

// POST — share transformation to wall
export async function POST(req: NextRequest) {
  try {
    const { userId, confession, transformation, isAnonymous = true } = await req.json();

    if (!confession || !transformation) {
      return NextResponse.json(
        { error: 'confession and transformation required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('wall_entries')
      .insert({
        user_id: isAnonymous ? null : userId,
        confession,
        transformation,
        is_anonymous: isAnonymous,
        votes: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Award 3 soul tokens for sharing (if logged in)
    if (userId) {
      const { error: tokenError } = await supabase.rpc('award_tokens', {
        user_uuid: userId,
        amount: 3,
        transaction_type: 'confession',
        description: 'Shared transformation to wall',
      });
      if (tokenError) console.error('[wall POST] token award error:', tokenError);
    }

    return NextResponse.json({
      success: true,
      entryId: data.id,
      tokensEarned: userId ? 3 : 0,
    });
  } catch (error) {
    console.error('[wall POST] error:', error);
    return NextResponse.json({ error: 'Failed to share to wall' }, { status: 500 });
  }
}

// GET — paginated wall entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'recent';

    const supabase = getSupabase();

    let query = supabase
      .from('wall_entries')
      .select('*', { count: 'exact' });

    query = sortBy === 'popular'
      ? query.order('votes', { ascending: false })
      : query.order('created_at', { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      entries: data ?? [],
      hasMore: count ? offset + limit < count : false,
      total: count ?? 0,
    });
  } catch (error) {
    console.error('[wall GET] error:', error);
    return NextResponse.json({ error: 'Failed to fetch wall entries' }, { status: 500 });
  }
}

// PUT — upvote entry (RPC returns new count directly)
export async function PUT(req: NextRequest) {
  try {
    const { entryId } = await req.json();
    if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 });

    const supabase = getSupabase();

    const { data: newVoteCount, error } = await supabase.rpc('increment_wall_votes', {
      entry_id: entryId,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      newVoteCount: newVoteCount ?? 0,
    });
  } catch (error) {
    console.error('[wall PUT] error:', error);
    return NextResponse.json({ error: 'Failed to upvote entry' }, { status: 500 });
  }
}
