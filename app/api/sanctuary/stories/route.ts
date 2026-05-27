import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://iofkxyljwemnnbwzcrke.supabase.co';

function supa() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(SUPABASE_URL, key);
}

// Block explicit crisis content from the public wall silently
const HIGH_RISK_RE = /\b(kill myself|kill my self|killing myself|end my life|ending my life|end it tonight|suicidal|going to do it|tonight is the night|my plan is|i have pills|i have a gun|won't be here tomorrow|this is goodbye|final goodbye)\b/i;

function parseMeta(raw: string): { category: string; feed: string } {
  try {
    const m = JSON.parse(raw);
    return { category: m.category || 'Hope', feed: m.feed || 'heard' };
  } catch {
    return { category: 'Hope', feed: 'heard' };
  }
}

function relativeLabel(iso: string): string {
  const diffHrs = (Date.now() - new Date(iso).getTime()) / 3_600_000;
  if (diffHrs < 0.5) return 'Anonymous — Just now';
  if (diffHrs < 1)   return 'Anonymous — Minutes ago';
  const h = new Date(iso).getHours();
  if (h >= 0 && h < 5) return 'Anonymous — ' + new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (h >= 22)          return 'Anonymous — Late';
  return 'Anonymous';
}

// ── GET — fetch sanctuary stories ───────────────────────────────────────────
export async function GET() {
  try {
    const { data, error } = await supa()
      .from('wall_entries')
      .select('id, confession, votes, transformation, created_at')
      .eq('is_anonymous', true)
      .not('confession', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const stories = (data || []).map(row => {
      const meta = parseMeta(row.transformation || '{}');
      return {
        id: row.id,
        label: relativeLabel(row.created_at),
        text: row.confession,
        felt: row.votes ?? 0,
        category: meta.category,
        feed: meta.feed,
        tier: 'safe',
        replies: [],
      };
    });

    return NextResponse.json({ stories });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error('[sanctuary GET]', msg);
    // Fail open — client falls back to seed data
    return NextResponse.json({ stories: [] });
  }
}

// ── POST — publish a story ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { text, category, feed } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });

    // Block high-risk content silently — don't tell the user why, just confirm save
    if (HIGH_RISK_RE.test(text)) {
      return NextResponse.json({ success: true, blocked: true });
    }

    const meta = JSON.stringify({ category: category || 'Hope', feed: feed || 'heard' });

    const { data, error } = await supa()
      .from('wall_entries')
      .insert({
        user_id: null,
        confession: text.trim(),
        transformation: meta,
        votes: Math.floor(Math.random() * 60) + 20, // warm start
        is_anonymous: true,
      })
      .select('id, confession, votes, transformation, created_at')
      .single();

    if (error) throw error;

    const m = parseMeta(data.transformation);
    return NextResponse.json({
      success: true,
      story: {
        id: data.id,
        label: 'Anonymous — Just now',
        text: data.confession,
        felt: data.votes,
        category: m.category,
        feed: m.feed,
        tier: 'safe',
        replies: [],
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error('[sanctuary POST]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── PATCH — increment felt count ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const client = supa();
    const { data: row } = await client
      .from('wall_entries')
      .select('votes')
      .eq('id', id)
      .single();

    await client
      .from('wall_entries')
      .update({ votes: (row?.votes ?? 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
