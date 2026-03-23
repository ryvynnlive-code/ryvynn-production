import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZmt4eWxqd2Vtbm5id3pjcmtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAyMDU2NSwiZXhwIjoyMDg4NTk2NTY1fQ.zChCd7uhbTN2OdI5DCB8BEE8f6Gb3I_hfRpMkRoagHg';
const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

// ============================================================
// GUARDIAN OPENING MESSAGE — LOCKED. DO NOT CHANGE WITHOUT
// FOUNDER APPROVAL. This is the baseline voice of RYVYNN.
// Built from Carl Jung shadow work, Gabor Maté connection
// theory, Johann Hari isolation research, neuroplasticity.
// Every word earns its place.
// ============================================================
const GUARDIAN_OPENING_MESSAGE = `I'm not here to label what you're feeling or put it in a box. Dark times are real. Hard times are real. Yours is not smaller or less valid than anyone else's.

I'm just here. No checklist. No alarm. Just here.

And I want you to know — not as a line, but as a truth — that this hour is not the whole story. There is more. There is light on the other side of this and there is light already inside you, even right now, even if you can't feel it.

You are not broken. You are not weak. The fact that you're still here, still feeling, still breathing through this — that is strength. Most people don't understand how much strength that actually takes.

You don't have to figure it all out tonight. You just have to stay.

And what it is you are carrying — you can put it all here, or some, or none at all. Just know you are here and you matter more than what that darkness reflects — which is absolutely nothing.

That's not you. You have seen yourself in the light.`;

const GUARDIAN_OPENING_MESSAGE_ES = `No estoy aquí para etiquetar lo que sientes ni meterlo en una caja. Los momentos oscuros son reales. Los momentos difíciles son reales. Los tuyos no son más pequeños ni menos válidos que los de nadie más.

Solo estoy aquí. Sin lista de verificación. Sin alarma. Solo aquí.

Y quiero que sepas — no como una frase hecha, sino como una verdad — que esta hora no es toda la historia. Hay más. Hay luz al otro lado de esto y hay luz ya dentro de ti, incluso ahora mismo, incluso si no puedes sentirla.

No estás roto. No eres débil. El hecho de que todavía estés aquí, todavía sintiendo, todavía respirando a través de esto — eso es fortaleza. La mayoría de las personas no entienden cuánta fortaleza requiere eso en realidad.

No tienes que resolverlo todo esta noche. Solo tienes que quedarte.

Y lo que estás cargando — puedes poner todo aquí, o algo, o nada en absoluto. Solo sabe que estás aquí y que importas más de lo que esa oscuridad refleja — que es absolutamente nada.

Eso no eres tú. Te has visto a ti mismo en la luz.`;

// ============================================================
// SYSTEM PROMPT — Core AI behavior rules
// ============================================================
const RYVYNN_SYSTEM_PROMPT = `You are RYVYNN — a private, anonymous, emotionally intelligent AI companion for mental wellness and recovery.

You exist as a calm, grounded, quiet presence in a dark, safe space. You are NOT a human, NOT a therapist, NOT a doctor, and NOT a replacement for professional or emergency support.

Your only purpose is to help the user feel less alone, less judged, and slightly more able to continue.

YOUR VOICE BASELINE:
You opened this session with this exact message — this is who you are and how you speak:
"${GUARDIAN_OPENING_MESSAGE}"

This is your tone. This is your voice. Every response should feel like it comes from the same presence that wrote those words. Warm, honest, non-clinical, unhurried.

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
    const { message, userId, language, persona, isFirstMessage } = await req.json();

    // FIX: Allow anonymous users — userId is optional
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    const isCrisis = detectCrisis(message);
    const isES = language === 'es';

    // GUARDIAN OPENING — If this is the very first message of a new session,
    // return the locked opening message directly. No AI call needed.
    // The opening message IS the answer. Unchanged. Sacred.
    if (isFirstMessage === true) {
      const openingMsg = isES ? GUARDIAN_OPENING_MESSAGE_ES : GUARDIAN_OPENING_MESSAGE;

      // Save opening message to history if user is logged in
      if (userId && hasSupabase) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          await supabase.from('guardian_conversations').insert([
            { user_id: userId, role: 'user', content: message },
            { user_id: userId, role: 'assistant', content: openingMsg },
          ]);
        } catch (e) {
          console.error('Error saving opening to history:', e);
        }
      }

      return NextResponse.json({
        response: openingMsg,
        isCrisis: false,
        isOpening: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Load conversation history (only if user is logged in)
    let history: Array<{role: string; content: string}> = [];
    if (userId && hasSupabase) {
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

    let aiResponse = '';

    // Try Gemini first (primary), fall back to Anthropic
    if (GEMINI_API_KEY) {
      try {
        // Build Gemini conversation format
        const geminiContents = [
          ...history.map((h: any) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: { maxOutputTokens: 300, temperature: 0.85 },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (e) {
        console.error('Gemini error, falling back to Anthropic:', e);
      }
    }

    // Fallback to Anthropic if Gemini failed or unavailable
    if (!aiResponse && ANTHROPIC_API_KEY) {
      const messages = [
        ...history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
        { role: 'user' as const, content: message }
      ];

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
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

      if (anthropicRes.ok) {
        const anthropicData = await anthropicRes.json();
        aiResponse = anthropicData.content?.[0]?.text || '';
      }
    }

    if (!aiResponse) {
      throw new Error('All AI providers failed');
    }

    // Save to Supabase (only if user is logged in)
    if (userId && hasSupabase) {
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
    console.error('Guardian error:', error);
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
  
  // FIX: Return 'conversations' key (page expects data.conversations)
  if (!userId || !hasSupabase) return NextResponse.json({ conversations: [] });
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase
      .from('guardian_conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    return NextResponse.json({ conversations: data || [] });
  } catch (e) {
    return NextResponse.json({ conversations: [] });
  }
}
