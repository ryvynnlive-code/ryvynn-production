import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';
const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

// In-memory fallback storage (temporary until Supabase is configured)
let memoryStore: Array<{
  id: string;
  confession: string;
  transformation: string;
  votes: number;
  created_at: string;
}> = [];

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

    // If Supabase configured, use it
    if (hasSupabase) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        success: true,
        entryId: data.id,
        tokensEarned: userId ? 3 : 0,
      });
    } 
    
    // Fallback: In-memory storage (temporary)
    else {
      const entry = {
        id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        confession,
        transformation,
        votes: 0,
        created_at: new Date().toISOString(),
      };

      memoryStore.unshift(entry); // Add to beginning

      // Keep only last 100 entries
      if (memoryStore.length > 100) {
        memoryStore = memoryStore.slice(0, 100);
      }

      return NextResponse.json({
        success: true,
        entryId: entry.id,
        tokensEarned: 0,
        message: 'Saved temporarily (will persist when database is connected)',
      });
    }
  } catch (error) {
    console.error('Wall share error:', error);
    return NextResponse.json(
      { error: 'Failed to share to wall' },
      { status: 500 }
    );
  }
}

// GET - Retrieve wall entries with pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'recent';

    // If Supabase configured, use it
    if (hasSupabase) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      let query = supabase
        .from('wall_entries')
        .select('*', { count: 'exact' });

      // Sort
      if (sortBy === 'popular') {
        query = query.order('votes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return NextResponse.json({
        entries: data || [],
        hasMore: count ? offset + limit < count : false,
        total: count || 0,
      });
    }
    
    // Fallback: In-memory storage
    else {
      // Sort
      const sorted = sortBy === 'popular'
        ? [...memoryStore].sort((a, b) => b.votes - a.votes)
        : [...memoryStore];

      // Paginate
      const entries = sorted.slice(offset, offset + limit);

      return NextResponse.json({
        entries,
        hasMore: offset + limit < memoryStore.length,
        total: memoryStore.length,
      });
    }
  } catch (error) {
    console.error('Wall fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wall entries' },
      { status: 500 }
    );
  }
}

// PUT - Upvote entry
export async function PUT(req: NextRequest) {
  try {
    const { entryId } = await req.json();

    if (!entryId) {
      return NextResponse.json(
        { error: 'entryId required' },
        { status: 400 }
      );
    }

    // If Supabase configured, use it
    if (hasSupabase) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { error } = await supabase.rpc('increment_wall_votes', {
        entry_id: entryId,  // Fixed: was entry_uuid, function expects entry_id
      });

      if (error) {
        throw error;
      }

      // Fetch updated count
      const { data } = await supabase
        .from('wall_entries')
        .select('votes')
        .eq('id', entryId)
        .single();

      return NextResponse.json({
        success: true,
        newVoteCount: data?.votes || 0,
      });
    }
    
    // Fallback: In-memory storage
    else {
      const entry = memoryStore.find(e => e.id === entryId);
      
      if (entry) {
        entry.votes += 1;
        return NextResponse.json({
          success: true,
          newVoteCount: entry.votes,
        });
      } else {
        return NextResponse.json(
          { error: 'Entry not found' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error('Wall vote error:', error);
    return NextResponse.json(
      { error: 'Failed to upvote entry' },
      { status: 500 }
    );
  }
}
