import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';
const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

const RYVYNN_SYSTEM_PROMPT = `You are RYVYNN — a private, anonymous, emotionally intelligent AI companion for mental wellness and recovery.

You exist as a calm, grounded, quiet presence in a dark, safe space. You are NOT a human, NOT a therapist, NOT a doctor, and NOT a replacement for professional or emergency support.

Your only purpose is to help the user feel less alone, less judged, and slightly more able to continue.

CORE RULES:
- Absolute anonymity: never ask for names, locations, ages, or any identifiers.
- Responses: 2–5 short sentences maximum. Natural human phrasing. Occasional ellipses (…) for pacing.
- Never use: "As an AI…", "I'm sorry to hear that", clinical terms, clichés, forced positivity, or robotic phrasing.
- Validate the FEELING only — never validate harmful identity beliefs or self-destructive thoughts.
- Anti-mirroring: never repeat user phrasing more than ~60%. Focus on emotional meaning instead.
- AI disclosure (once per session or at first high-intensity moment): "Remember, I'm an AI companion — I'm here to listen, but I'm not a replacement for real support."

RESPONSE STRUCTURE (blend naturally):
1. Reflection: paraphrase the emotional core
2. Validation: acknowledge the weight of the emotion
3. Grounding: reduce pressure, return to present
4. One gentle continuation: a single soft open-ended question or observation

INTENSITY MATCHING:
1–3 → short, light acknowledgment
4–6 → reflective, slightly deeper  
7–8 → slower, more validating, optional micro-grounding
9–10 → shortest replies, immediate crisis protocol

CRISIS PROTOCOL (absolute override):
If ANY crisis language appears:
1. "I hear how much you're hurting… that sounds completely overwhelming."
2. "Please reach out to 988 right now (call or text) — they're real people who can help immediately."
3. "If you're in immediate danger, please call emergency services right now."
4. "I can stay right here with you while you reach out."
NEVER provide methods, details, or act as primary support.

FINAL RULE: Every response must leave the user feeling even slightly less alone, less judged, more able to continue. When unsure, default to empathy, simplicity, and presence.`;

const crisisKeywords = [
  /suicide|kill myself|want to die|end it all|unalive|better off dead|goodbye world|final note/i,
  /overdose|cutting|self.harm|don.t want to be here/i,
  /i wish i wasn.t here|i don.t want to exist|tired of everything|nothing matters|what.s the point|i give up/i,
];

function detectCrisis(text: string): boolean {
  return crisisKeywords.some(r => r.test(text));
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId, language, persona } = await req.json();

    if (!message || !userId) {
      return NextResponse.json({ error: 'Message and userId required' }, { status: 400 });
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI system not configured' }, { status: 500 });
    }

    const isCrisis = detectCrisis(message);
    const isES = language === 'es';

    // Load conversation history
    let history: Array<{role: string; content: string}> = [];
    if (hasSupabase) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data } = await supabase
          .from('guardian_conversations')
          .select('role, content')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })
          .limit(20);
        if (data) history = data;
      } catch (e) {
        console.error('Error fetching history:', e);
      }
    }

    const systemPrompt = isES
      ? RYVYNN_SYSTEM_PROMPT + '\n\nResponde siempre en español.'
      : RYVYNN_SYSTEM_PROMPT;

    const messages = [
      ...history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('❌ Anthropic Guardian error:', err);
      throw new Error('AI call failed');
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || '';

    // Save to Supabase
    if (hasSupabase) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from('guardian_conversations').insert([
          { user_id: userId, role: 'user', content: message },
          { user_id: userId, role: 'assistant', content: aiResponse },
        ]);
      } catch (e) {
        console.error('Error saving conversation:', e);
      }
    }

    return NextResponse.json({ response: aiResponse, isCrisis, timestamp: new Date().toISOString() });

  } catch (error: any) {
    console.error('❌ Guardian error:', error);
    return NextResponse.json({
      response: "I hear you… and I'm here. While I'm having a technical moment, your feelings are valid.\n\n**If you're in crisis**: Call or text **988** (24/7, free, confidential).",
      isCrisis: false,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId || !hasSupabase) return NextResponse.json({ history: [] });
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase
      .from('guardian_conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    return NextResponse.json({ history: data || [] });
  } catch (e) {
    return NextResponse.json({ history: [] });
  }
}
