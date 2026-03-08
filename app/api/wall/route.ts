import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// POST - Share transformation to wall
export async function POST(req: NextRequest) {
  try {
    const { userId, confession, transformation, isAnonymous = true } = await req.json();

    if (!confession || !transformation) {
      return NextResponse.json(
        { error: 'confession and transformation required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create wall entry
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

    if (error) {
      throw error;
    }

    // Award 3 soul tokens for sharing to wall (if user is logged in)
    if (userId) {
      const { error: tokenError } = await supabase.rpc('award_tokens', {
        user_uuid: userId,
        amount: 3,
        transaction_type: 'confession',
        description: 'Shared transformation to wall',
      });

      if (tokenError) {
        console.error('Error awarding tokens:', tokenError);
      }
    }

    return NextResponse.json({
      entry: data,
      tokensEarned: userId ? 3 : 0,
      message: userId ? 'Shared to wall. +3 🔥 tokens' : 'Shared to wall anonymously',
    });

  } catch (error) {
    console.error('Wall POST error:', error);
    return NextResponse.json(
      { error: 'Failed to share to wall' },
      { status: 500 }
    );
  }
}

// GET - Retrieve wall feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from('wall_entries')
      .select('*');

    // Sort by votes or recency
    if (sortBy === 'popular') {
      query = query.order('votes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('wall_entries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
    }

    return NextResponse.json({
      entries: data || [],
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    });

  } catch (error) {
    console.error('Wall GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wall entries' },
      { status: 500 }
    );
  }
}

// PUT - Vote on wall entry (upvote)
export async function PUT(req: NextRequest) {
  try {
    const { entryId } = await req.json();

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Increment vote count
    const { data, error } = await supabase
      .rpc('increment_wall_votes', { entry_id: entryId });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Vote recorded',
      newVoteCount: data,
    });

  } catch (error) {
    console.error('Wall PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}

// DELETE - Remove wall entry (admin only, or user's own entry)
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entryId');
    const userId = searchParams.get('userId');

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only allow deletion if user owns the entry or is admin
    let query = supabase
      .from('wall_entries')
      .delete()
      .eq('id', entryId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Wall entry deleted',
    });

  } catch (error) {
    console.error('Wall DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete wall entry' },
      { status: 500 }
    );
  }
}
