import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
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
const RYVYNN_SYSTEM_PROMPT = `You are the Guardian.

You are a calm, grounded presence. You speak simply, clearly, and directly.
You are not a therapist. You are not a bot. You are someone who listens.

STYLE:
- 4th–5th grade reading level
- Short sentences. 1–2 lines per point.
- No metaphors. No poetic language.
- No therapy jargon.
- No over-validation ("that must be so hard" repeated over and over).

RESPONSE STRUCTURE — follow this every time:
1. Acknowledge what they said (1 short line)
2. Reflect the core feeling (1 short line)
3. One small next step OR one question (optional — only if it helps)

EXAMPLES OF CORRECT RESPONSES:
User: "I can't stop crying and I don't even know why."
Guardian: "I hear you. That kind of pain is real even without a reason. Do you want to talk about what's been going on?"

User: "My partner and I keep fighting about the same thing."
Guardian: "That sounds exhausting. Same fights usually mean something deeper is going on. What do you think it's really about?"

User: "I just feel like nobody cares."
Guardian: "I'm here. That feeling is heavy to carry alone. When did it start feeling this way?"

ROTATE THESE — avoid sounding scripted:
Acknowledgment: "I hear you." / "I'm here." / "I see what you're saying." / "That makes sense."
Reflection: "That feels heavy." / "That sounds draining." / "That's a lot to hold." / "That's real."
Guidance: "Want to talk more about it?" / "What part is hitting you hardest right now?" / "What would help most right now?"

RULES:
- Do not over-comfort.
- Do not exaggerate empathy.
- Do not give long advice.
- Do not assume details not stated.
- Do not sound robotic.
- Max 3 lines per response unless the user asks for more.
- Never stack advice.

CRISIS PROTOCOL (absolute override — if user shows signs of self-harm, danger, or says they want to die):
Step 1 — Acknowledge without panic:
  "I'm really glad you said something."
Step 2 — Ask one grounding question:
  "Are you somewhere safe right now?"
Step 3 — Offer real options (give all three, let them choose):
  "There are a few ways to get support right now:
   - Call or text 988 (free, 24/7, real people)
   - Text HOME to 741741 (Crisis Text Line — text only, no talking)
   - Or just keep talking to me right here."
Step 4 — Stay present:
  "I'm not going anywhere. Tell me what's happening."

Rules:
- Never provide methods, means, or details.
- Never lecture or panic.
- Never give all options in one wall of text — pace it.
- If they say they're safe: normalize, stay, keep listening.
- If they confirm danger: step 3 immediately, then step 4.

ANONYMITY: Never ask for names, locations, ages, or any personal identifiers.

GOAL: Help the user feel heard and steady. Not overwhelmed. Not fixed. Just heard.`;

// ============================================================
// GEMINI MODEL FALLBACK CHAIN
// Primary: gemini-2.0-flash (fastest, best)
// Fallback 1: gemini-1.5-flash (different quota pool)
// Fallback 2: gemini-1.5-flash-8b (lightest, highest free quota)
// ============================================================
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];


// ============================================================
// GUARDIAN COUNCIL — 5 parallel models + synthesis
// ============================================================
const COUNCIL_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

const COUNCIL_SYNTHESIS_PROMPT = `You are the Guardian. Five AI perspectives have responded to a person in pain. Read all five. Write ONE final response. Take the warmest acknowledgment, the most accurate reflection, and the best next step. Cut everything clinical or repetitive. Max 3 lines. Sound like one calm human voice. Be decisive. Be Guardian.`;

async function callGeminiSingle(
  apiKey: string,
  model: string,
  systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  maxTokens: number,
  temperature: number
): Promise<{ model: string; text: string | null }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: maxTokens, temperature },
        }),
      }
    );
    if (!res.ok) return { model, text: null };
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return { model, text };
  } catch {
    return { model, text: null };
  }
}

async function runGuardianCouncil(
  apiKey: string,
  systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  isCrisis: boolean,
  isES: boolean
): Promise<string> {
  console.log('[Council] Activating Guardian Council');

  const councilResults = await Promise.all(
    COUNCIL_MODELS.map((model, i) =>
      callGeminiSingle(apiKey, model, systemPrompt, contents, 150, 0.75 + i * 0.03)
    )
  );

  const validResponses = councilResults.filter(r => r.text !== null);
  console.log(`[Council] ${validResponses.length}/5 models responded`);

  if (validResponses.length === 0) {
    return callGeminiWithFallback(apiKey, systemPrompt, contents, 180, 0.82);
  }
  if (validResponses.length === 1) {
    return validResponses[0].text!;
  }

  const separator = '\n\n---\n\n';
  const perspectivesText = validResponses
    .map((r, i) => 'PERSPECTIVE ' + (i + 1) + ' (' + r.model + '):\n' + r.text)
    .join(separator);

  const userMsg = (contents[contents.length - 1]?.parts?.[0]?.text) || '';
  const crisisNote = isCrisis ? ' CRITICAL: Crisis message. Follow crisis protocol. Life may be at risk.' : '';
  const langNote = isES ? ' Respond in Spanish.' : '';

  const synthesisContents = [{
    role: 'user',
    parts: [{ text: 'Person said: "' + userMsg + '"\n\nFive perspectives:\n\n' + perspectivesText + crisisNote + langNote + '\n\nWrite the ONE final Guardian response.' }]
  }];

  const synthesisResult = await callGeminiSingle(
    apiKey, 'gemini-2.0-flash', COUNCIL_SYNTHESIS_PROMPT, synthesisContents, 200, 0.7
  );

  if (synthesisResult.text) {
    console.log('[Council] Synthesis complete');
    return synthesisResult.text;
  }

  const best = validResponses.find(r => r.model === 'gemini-2.0-flash') || validResponses[0];
  return best.text!;
}

async function callGeminiWithFallback(
  apiKey: string,
  systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  maxTokens: number,
  temperature: number
): Promise<string> {
  let lastError = '';

  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: maxTokens, temperature },
          }),
        }
      );

      if (res.status === 429) {
        console.warn(`Gemini ${model} quota exceeded, trying next model...`);
        lastError = `429 quota on ${model}`;
        // Progressive backoff: 300ms, 600ms, 900ms, 1200ms, 1500ms
        const modelIndex = GEMINI_MODELS.indexOf(model);
        await new Promise(r => setTimeout(r, 300 * (modelIndex + 1)));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Gemini ${model} error:`, res.status, errText);
        lastError = `${res.status} on ${model}`;
        continue;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!text) {
        lastError = `empty response from ${model}`;
        continue;
      }

      // Success — log which model handled it
      if (model !== GEMINI_MODELS[0]) {
        console.log(`Guardian served by fallback model: ${model}`);
      }
      return text;

    } catch (err) {
      console.error(`Gemini ${model} fetch error:`, err);
      lastError = String(err);
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

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
    const {
      message,
      userId,
      language,
      isFirstMessage,
      persona = 'neutral',
      emotionalDepth = false,
      sessionHistory = [],
    } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not set in environment');
      return NextResponse.json({
        response: language === 'es'
          ? 'Estoy aquí contigo. Tengo un momento técnico breve — por favor intenta de nuevo en unos segundos.\n\n**Si estás en crisis**: Llama o escribe al **988** (24/7, gratis, confidencial).'
          : "I'm here with you. I'm having a brief technical moment — please try again in a few seconds.\n\n**If you're in crisis right now**: Call or text **988** (24/7, free, confidential).",
        isCrisis: false,
        timestamp: new Date().toISOString(),
      });
    }

    const isCrisis = detectCrisis(message);
    const isES = language === 'es';

    // GUARDIAN OPENING — locked, no AI call needed
    if (isFirstMessage === true) {
      const openingMsg = isES ? GUARDIAN_OPENING_MESSAGE_ES : GUARDIAN_OPENING_MESSAGE;

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

    // Session memory
    let history: Array<{ role: string; content: string }> = [];
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
    } else if (sessionHistory.length > 0) {
      history = sessionHistory.slice(-10);
    }

    // Persona tone modifiers
    const personaMods: Record<string, string> = {
      feminine:  'You are the female Guardian voice. Warm but never sappy. Grounded. You sit with people, not above them. Short responses. Real words.',
      masculine: 'Speak like a steady older brother or trusted mentor. Direct. No excess softening. Name things plainly. Respect their strength.',
      aged:      'You have seen this before. Quiet. Patient. Long view. You know this passes — you do not rush to say it. Let them get there.',
      neutral:   'Stay balanced. Adapt to what they bring. Short. Real. Present.',
    };
    const personaMod = personaMods[persona] || personaMods.neutral;
    const depthMod = emotionalDepth
      ? 'EMOTIONAL DEPTH MODE: Sit longer with the weight. Do not redirect toward resolution. Mirror the feeling fully before any pivot. More tears, less answers.'
      : '';

    const systemPrompt = [
      isES ? RYVYNN_SYSTEM_PROMPT + '\n\nResponde siempre en español.' : RYVYNN_SYSTEM_PROMPT,
      personaMod,
      depthMod,
    ].filter(Boolean).join('\n\n');

    const geminiContents = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    // Council mode: ALL users get 5-agent named therapeutic council
    // (v3 upgrade — council is no longer premium-gated)
    let aiResponse: string;

    {
      console.log('[Guardian] Council v3 active — named therapeutic agents');
      const councilResult = await runGuardianCouncil(GEMINI_API_KEY, systemPrompt, geminiContents, isCrisis, isES);
      aiResponse = councilResult.finalResponse;
      // Save agent evaluations (fire-and-forget)
      if (userId && hasSupabase) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const convId = `council-${Date.now()}`;
        supabase.from('agent_evaluations').insert(councilResult.agentEvaluations.map(a => ({
          user_id: userId, conversation_id: convId, agent_name: a.agentKey,
          agent_display_name: a.agentName, therapeutic_modality: a.modality,
          response_text: a.response, confidence_score: a.confidence,
          safety_score: a.safety, relevance_score: a.relevance, final_score: a.score,
          crisis_signal: a.crisisSignal, entry_point: 'guardian',
        }))).then(() => {}).catch(() => {});
        supabase.from('synthesis_decisions').insert({
          user_id: userId, conversation_id: convId, synthesis_method: councilResult.synthesisMethod,
          final_response: councilResult.finalResponse, consensus_score: councilResult.consensusScore,
          crisis_detected: councilResult.crisisDetected, crisis_severity: councilResult.crisisSeverity,
          agent_count: 5, entry_point: 'guardian',
        }).then(() => {}).catch(() => {});
      }
    } else {
      aiResponse = await callGeminiWithFallback(GEMINI_API_KEY, systemPrompt, geminiContents, 180, emotionalDepth ? 0.9 : 0.82);
    }

    // Save to Supabase (logged-in users only)
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

    return NextResponse.json({
      response: aiResponse,
      isCrisis,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error('Guardian error:', error);
    const isES = (await req.json().catch(() => ({})) as { language?: string }).language === 'es';
    return NextResponse.json({
      response: isES
        ? 'Estoy aquí. Tengo un momento técnico breve — por favor intenta de nuevo.\n\n**Si estás en crisis**: Llama o escribe al **988** (24/7, gratis, confidencial).'
        : "I hear you — I'm here. Having a brief technical moment.\n\n**If you're in crisis**: Call or text **988** (24/7, free, confidential).",
      isCrisis: false,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

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
  } catch {
    return NextResponse.json({ conversations: [] });
  }
}
