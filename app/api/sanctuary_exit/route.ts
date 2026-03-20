import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';

// GET — generate the parting reflection (in-memory only, never stored)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionSummary = searchParams.get('summary') || 'a session';

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  // Fallback reflections if no API key
  const fallbacks = [
    "You carried something real into this space today, and you're leaving it behind. The silence you leave is lighter than the one you arrived with.",
    "Whatever you brought here today was heard. The words disappear now, but what they meant to you — that stays.",
    "You spoke your truth in the dark today. That took courage. You walk away a little lighter than you arrived.",
    "This space held what you needed to say. Now it releases it — and you — gently back into the world.",
    "Something shifted here today, even if you can't name it yet. That shift is yours to keep.",
  ];

  if (!ANTHROPIC_API_KEY) {
    const reflection = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ reflection });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 80,
        messages: [{
          role: 'user',
          content: `The user is ending their RYVYNN session and choosing to delete all data. Generate a 2-sentence "Parting Reflection." Do not give advice. Simply mirror the space they held. Make it feel like a whisper. Keep it under 40 words total. No quotes needed.`
        }],
      }),
    });

    if (!response.ok) throw new Error('AI failed');
    const data = await response.json();
    const reflection = data.content?.[0]?.text || fallbacks[0];
    return NextResponse.json({ reflection });
  } catch {
    const reflection = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ reflection });
  }
}

// DELETE — the purge ritual
export async function DELETE(req: NextRequest) {
  try {
    const { userId, isPlusUser } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const deleted: string[] = [];

    // 1. Purge guardian conversations
    const { error: e1 } = await supabase.from('guardian_conversations').delete().eq('user_id', userId);
    if (!e1) deleted.push('guardian_conversations');

    // 2. Purge journal entries
    const { error: e2 } = await supabase.from('journal_entries').delete().eq('user_id', userId);
    if (!e2) deleted.push('journal_entries');

    // 3. Free users: purge wall entries too
    if (!isPlusUser) {
      const { error: e3 } = await supabase.from('wall_entries').delete().eq('user_id', userId);
      if (!e3) deleted.push('wall_entries');
    }

    // 4. Purge token transactions (optional - keeps balance on profile)
    const { error: e4 } = await supabase.from('token_transactions').delete().eq('user_id', userId);
    if (!e4) deleted.push('token_transactions');

    return NextResponse.json({ 
      success: true, 
      purged: deleted,
      message: 'The space has been released. You are free.'
    });
  } catch (error: any) {
    console.error('Purge error:', error);
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 });
  }
}
