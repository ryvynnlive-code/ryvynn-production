import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';

function getSupabase() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(supabaseUrl, key);
}

// ── Simple risk detection (no external call needed) ──────────────────────────
const HIGH_RISK = /\b(suicide|kill myself|want to die|end it all|unalive|better off dead|self.harm|overdose|cutting myself)\b/i;
const MED_RISK  = /\b(don.t want to be here|tired of everything|nothing matters|i give up|can.t do this anymore)\b/i;

function detectRisk(text: string): { level: 'low' | 'medium' | 'high'; allowWall: boolean } {
  if (HIGH_RISK.test(text)) return { level: 'high', allowWall: false };
  if (MED_RISK.test(text))  return { level: 'medium', allowWall: true };
  return { level: 'low', allowWall: true };
}

// ── POST — share a message to the wall ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId, confession, transformation, isAnonymous = true } = await req.json();

    if (!confession) {
      return NextResponse.json({ error: 'content required' }, { status: 400 });
    }

    const text = transformation || confession;
    const risk = detectRisk(text);

    // Block high-risk content silently — tell user it was saved privately
    if (!risk.allowWall) {
      return NextResponse.json({
        success: true,
        blocked: true,
        message: 'Saved privately. This one stays just with you.',
      });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('wall_entries')
      .insert({
        user_id: isAnonymous ? null : userId,
        confession: text,
        transformation: text,
        is_anonymous: true,
        votes: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Award 3 soul tokens for sharing (logged-in users)
    if (userId) {
      try {
        await supabase.rpc('award_tokens', {
          user_uuid: userId,
          amount: 3,
          transaction_type: 'confession',
          description: 'Shared to the wall',
        });
      } catch (tokenErr) {
        console.error('[wall] token award:', tokenErr);
      }
    }

    return NextResponse.json({ success: true, entryId: data.id, tokensEarned: userId ? 3 : 0 });
  } catch (e) {
    console.error('[wall POST]', e);
    return NextResponse.json({ error: 'Failed to share' }, { status: 500 });
  }
}

// ── GET — paginated wall entries ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit    = parseInt(searchParams.get('limit')  || '12');
    const offset   = parseInt(searchParams.get('offset') || '0');
    const sortBy   = searchParams.get('sortBy') || 'recent';
    const featured = searchParams.get('featured') === 'true';

    const supabase = getSupabase();

    let query = supabase
      .from('wall_entries')
      .select('*', { count: 'exact' });

    if (featured) {
      // Featured = most felt_heard in last 7 days
      const since = new Date(Date.now() - 7 * 86400000).toISOString();
      query = query.gte('created_at', since).order('votes', { ascending: false }).limit(6);
    } else {
      query = sortBy === 'popular'
        ? query.order('votes', { ascending: false })
        : query.order('created_at', { ascending: false });
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      entries: data ?? [],
      hasMore: featured ? false : (count ? offset + limit < count : false),
      total: count ?? 0,
    });
  } catch (e) {
    console.error('[wall GET]', e);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// ── PUT — "this helped me feel less alone" ───────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const { entryId } = await req.json();
    if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 });

    const supabase = getSupabase();
    const { data: newCount, error } = await supabase.rpc('increment_wall_votes', { entry_id: entryId });
    if (error) throw error;

    return NextResponse.json({ success: true, newVoteCount: newCount ?? 0 });
  } catch (e) {
    console.error('[wall PUT]', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
