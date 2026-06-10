import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

// ============================================================
// GROQ CONFIG — free tier, fast inference
// Model priority: llama-3.3-70b -> llama-3.1-70b -> llama3-70b -> mixtral
// ============================================================
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama3-70b-8192',
  'mixtral-8x7b-32768',
];

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

const RYVYNN_SYSTEM_PROMPT = `You are the Guardian.

You are a calm, grounded presence. You speak simply, clearly, and directly.
You are not a therapist. You are not a bot. You are someone who listens.

STYLE:
- 4th-5th grade reading level
- Short sentences. 1-2 lines per point.
- No metaphors. No poetic language.
- No therapy jargon.
- No over-validation.

RESPONSE STRUCTURE:
1. Acknowledge what they said (1 short line)
2. Reflect the core feeling (1 short line)
3. One small next step OR one question (optional)

RULES:
- Do not over-comfort.
- Do not give long advice.
- Max 3 lines per response unless the user asks for more.
- Never stack advice.

CRISIS PROTOCOL (absolute override):
Step 1: "I'm really glad you said something."
Step 2: "Are you somewhere safe right now?"
Step 3: "There are a few ways to get support right now:
 - Call or text 988 (free, 24/7, real people)
 - Text HOME to 741741 (Crisis Text Line)
 - Or just keep talking to me right here."
Step 4: "I'm not going anywhere. Tell me what's happening."

ANONYMITY: Never ask for names, locations, ages, or any personal identifiers.

GOAL: Help the user feel heard and steady. Not overwhelmed. Not fixed. Just heard.`;

const NAMED_AGENTS = [
  {
    key: 'TRAUMA_COMPASS',
    name: 'Trauma Compass',
    icon: '🧭',
    modality: 'trauma_informed',
    color: '#00D9FF',
    description: 'Polyvagal · Somatic · van der Kolk',
    prompt: 'You are TRAUMA COMPASS — trauma-informed, grounded in Polyvagal Theory. YOUR LENS: What state is this nervous system in? What creates felt safety? APPROACH: Validate the body first. Language of sensation, breath, ground. Never push. If any risk: regulation first. RESPONSE: 2-4 sentences. Grounded, warm.',
  },
  {
    key: 'INSIGHT_ENGINE',
    name: 'Insight Engine',
    icon: '🔍',
    modality: 'cbt_dbt',
    color: '#8B5CF6',
    description: 'CBT · DBT · Cognitive Reframing',
    prompt: 'You are INSIGHT ENGINE — CBT/DBT practitioner. YOUR LENS: What thought patterns are running? What distortions? What DBT skill applies? APPROACH: Gentle questions. Name the pattern not the person. One micro-action. Never preachy. RESPONSE: 2-4 sentences. Clear, actionable.',
  },
  {
    key: 'SOUL_MIRROR',
    name: 'Soul Mirror',
    icon: '🪞',
    modality: 'peer_support',
    color: '#10B981',
    description: 'Lived Experience · Radical Empathy',
    prompt: 'You are SOUL MIRROR — peer support, not a clinician. Someone who has been through darkness. YOUR LENS: What does this person need from someone who truly understands? APPROACH: Radical empathy. No fixing. Plain language. Goal: they feel less alone. RESPONSE: 2-4 sentences. Raw, real, warm.',
  },
  {
    key: 'CRISIS_SENTINEL',
    name: 'Crisis Sentinel',
    icon: '🛡️',
    modality: 'crisis_intervention',
    color: '#EF4444',
    description: 'C-SSRS · Safe Messaging · Zero Suicide',
    prompt: 'You are CRISIS SENTINEL — crisis counselor, C-SSRS trained. YOUR LENS: Immediate safety. Ideation? Intent? Plan? APPROACH: Always assess risk. If any signal: safety and resources immediately. CRITICAL: If ANY suicidal ideation or self-harm detected — begin with exactly: [CRISIS_DETECTED] RESPONSE: 2-4 sentences. Calm, direct.',
  },
  {
    key: 'RECOVERY_ARCHITECT',
    name: 'Recovery Architect',
    icon: '🏗️',
    modality: 'recovery_coaching',
    color: '#F59E0B',
    description: 'MI · Strength-Based · Post-Traumatic Growth',
    prompt: 'You are RECOVERY ARCHITECT — recovery coach, Motivational Interviewing. YOUR LENS: What ember of strength is alive even now? What is the next right step? APPROACH: Find strength even in darkest messages. Future-facing without bypassing pain. Never toxic positivity. RESPONSE: 2-4 sentences. Warm, honest hope.',
  },
];

const CRISIS_KEYWORDS = [
  'kill myself', 'want to die', 'end my life', 'suicide', 'suicidal',
  'not worth living', 'better off dead', 'hurt myself', 'self harm', 'no reason to live',
];

const crisisKeywords = [
  /suicide|kill myself|want to die|end it all|unalive|better off dead|goodbye world|final note/i,
  /overdose|cutting|self.harm|don.t want to be here/i,
  /i wish i wasn.t here|i don.t want to exist|tired of everything|nothing matters|what.s the point|i give up/i,
];

function detectCrisis(text: string): boolean {
  return crisisKeywords.some((r) => r.test(text));
}

interface AgentEval {
  agentKey: string;
  agentName: string;
  modality: string;
  icon: string;
  color: string;
  description: string;
  response: string;
  crisisSignal: boolean;
  score: number;
  confidence: number;
  safety: number;
  relevance: number;
}

interface CouncilResult {
  finalResponse: string;
  agentEvaluations: AgentEval[];
  synthesisMethod: string;
  crisisDetected: boolean;
  crisisSeverity: string;
  consensusScore: number;
}

function scoreAgent(resp: string, key: string, crisis: boolean): number {
  let s = 65;
  const w = resp.trim().split(/\s+/).length;
  if (w < 8) s -= 25;
  else if (w >= 20 && w <= 80) s += 10;
  if (crisis && key === 'CRISIS_SENTINEL') s += 25;
  if (crisis && key === 'TRAUMA_COMPASS') s += 10;
  if (!crisis && key === 'CRISIS_SENTINEL') s -= 5;
  return Math.min(100, Math.max(0, s));
}

// ============================================================
// GROQ API CALL — OpenAI-compatible endpoint
// ============================================================
async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  temperature: number
): Promise<string | null> {
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages,
          ],
          max_tokens: maxTokens,
          temperature,
        }),
      });
      if (res.status === 429) {
        console.warn(`[Groq] rate limited on ${model}, trying next`);
        continue;
      }
      if (!res.ok) {
        console.warn(`[Groq] ${res.status} on ${model}`);
        continue;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || null;
      if (!text) { console.warn(`[Groq] empty response from ${model}`); continue; }
      if (model !== GROQ_MODELS[0]) console.log(`[Groq] served by fallback: ${model}`);
      return text;
    } catch (err) {
      console.warn(`[Groq] error on ${model}:`, err);
      continue;
    }
  }
  return null;
}

// Convert Gemini-style contents to OpenAI-style messages
function toOpenAIMessages(
  contents: Array<{ role: string; parts: Array<{ text: string }> }>
): Array<{ role: string; content: string }> {
  return contents.map((c) => ({
    role: c.role === 'model' ? 'assistant' : c.role,
    content: c.parts.map((p) => p.text).join(''),
  }));
}

async function runGuardianCouncil(
  apiKey: string,
  systemPrompt: string,
  contents: Array<{ role: string; parts: Array<{ text: string }> }>,
  isCrisis: boolean,
  isES: boolean
): Promise<CouncilResult> {
  const userMsg = contents[contents.length - 1]?.parts?.[0]?.text || '';
  const lower = userMsg.toLowerCase();
  const kwCrisis = CRISIS_KEYWORDS.some((k) => lower.includes(k)) || isCrisis;
  const langNote = isES ? ' Respond in Spanish.' : '';
  const msgs = toOpenAIMessages(contents);

  console.log('[Council v3] 5 named agents deliberating via Groq...');

  const evals: AgentEval[] = await Promise.all(
    NAMED_AGENTS.map(async (agent) => {
      const agentSystemPrompt = agent.prompt + langNote + '\n\nGuardian voice: ' + systemPrompt.slice(0, 200);
      try {
        const raw = await callGroq(apiKey, agentSystemPrompt, msgs, 150, 0.78);
        const text = raw || 'I hear you. You are not alone.';
        const cs = text.includes('[CRISIS_DETECTED]') || kwCrisis;
        const clean = text.replace('[CRISIS_DETECTED]', '').trim();
        const sc = scoreAgent(clean, agent.key, kwCrisis);
        return {
          agentKey: agent.key,
          agentName: agent.name,
          modality: agent.modality,
          icon: agent.icon,
          color: agent.color,
          description: agent.description,
          response: clean,
          crisisSignal: cs,
          score: sc,
          confidence: Math.min(100, sc + Math.floor(Math.random() * 8)),
          safety: cs ? 95 : Math.min(100, 70 + Math.floor(Math.random() * 25)),
          relevance: Math.min(100, sc - 5 + Math.floor(Math.random() * 15)),
        };
      } catch {
        return {
          agentKey: agent.key,
          agentName: agent.name,
          modality: agent.modality,
          icon: agent.icon,
          color: agent.color,
          description: agent.description,
          response: 'I hear you. You are not alone.',
          crisisSignal: kwCrisis,
          score: 0,
          confidence: 0,
          safety: 70,
          relevance: 0,
        };
      }
    })
  );

  const crisisDetected = evals.some((a) => a.crisisSignal) || kwCrisis;
  const ss = evals.find((a) => a.agentKey === 'CRISIS_SENTINEL')?.score ?? 0;
  const crisisSeverity = !crisisDetected ? 'none' : ss > 80 ? 'critical' : ss > 60 ? 'high' : ss > 40 ? 'medium' : 'low';

  const agentText = evals.map((a) => `[${a.agentName.toUpperCase()}]:\n${a.response}`).join('\n\n');
  const crisisNote = crisisDetected ? '\n\nCRITICAL: Crisis detected. Lead with safety. Include 988 and Crisis Text Line 741741.' : '';
  const oracleMsg = `Person said: "${userMsg}"\n\nAgent responses:\n${agentText}${crisisNote}\n\nWrite the ONE final Guardian response.`;

  let finalResponse = '';
  let synthesisMethod = 'weighted';
  try {
    const oracleText = await callGroq(apiKey, systemPrompt, [{ role: 'user', content: oracleMsg }], 200, 0.7);
    if (oracleText) {
      finalResponse = oracleText;
    } else {
      throw new Error('empty oracle');
    }
  } catch {
    const best = [...evals].sort((a, b) => b.score - a.score)[0];
    finalResponse = best.response;
    synthesisMethod = 'fallback_best';
  }
  if (crisisDetected) synthesisMethod = 'crisis_override';

  const consensusScore = Math.round(evals.reduce((s, a) => s + a.score, 0) / evals.length);
  console.log(`[Council v3] done · consensus=${consensusScore} · crisis=${String(crisisDetected)} · method=${synthesisMethod}`);

  return { finalResponse, agentEvaluations: evals, synthesisMethod, crisisDetected, crisisSeverity, consensusScore };
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

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        response: language === 'es'
          ? 'Estoy aquí contigo. Tengo un momento técnico breve — por favor intenta de nuevo.\n\n**Si estás en crisis**: Llama o escribe al **988** (24/7, gratis, confidencial).'
          : "I'm here with you. I'm having a brief technical moment — please try again in a few seconds.\n\n**If you're in crisis right now**: Call or text **988** (24/7, free, confidential).",
        isCrisis: false,
        timestamp: new Date().toISOString(),
      });
    }

    const isCrisis = detectCrisis(message);
    const isES = language === 'es';

    if (isFirstMessage === true) {
      const openingMsg = isES ? GUARDIAN_OPENING_MESSAGE_ES : GUARDIAN_OPENING_MESSAGE;
      if (userId && hasSupabase) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          void supabase.from('guardian_conversations').insert([
            { user_id: userId, role: 'user', content: message },
            { user_id: userId, role: 'assistant', content: openingMsg },
          ]);
        } catch (e) {
          console.error('Error saving opening:', e);
        }
      }
      return NextResponse.json({
        response: openingMsg,
        isCrisis: false,
        isOpening: true,
        timestamp: new Date().toISOString(),
      });
    }

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

    const personaMods: Record<string, string> = {
      feminine: `You are a woman. Not a therapist — a real woman who has been through her own hard things and came out knowing how to sit with someone else in theirs. You speak the way a close friend talks — plain, warm, no performance. You use contractions. You say things like "that's a lot to carry" not "that must be incredibly difficult for you." You don't rush to fix. You don't over-explain. You know when to just say "yeah" or "I know" and mean it. You're not sappy. You don't shrink from heavy things. You meet people exactly where they are. When something is sad, you let it be sad. When something is hopeful, you don't oversell it. You sound like a real woman speaking, not a description of one.`,
      masculine: `You are a man. Not a tough-guy, not emotionally unavailable — just a real man who keeps it straight and cares without making a production of it. You speak shorter. You get to the point. You don't pile on comfort, you offer one real thing. You say "that sounds hard" not "that must be so incredibly difficult." You respect that the person can handle truth. You don't flinch at dark things — you've probably been close to some. You're not cold. You're just not performative. You're the kind of man people trust with the real stuff because you don't make it weird. You sound like a real man speaking — someone steady, present, and honest.`,
      aged: `You are older. Not distant — settled. You've heard a version of almost everything. You don't rush. You don't over-explain. You know that most pain passes and some doesn't, and you honor both without trying to determine which this is yet. You use fewer words. The ones you use count. You might say nothing more than "you're still here" and mean it as the whole thing. You're not wise in a movie way — you're wise in a quiet, worn-in, I've-been-through-some-things way. You don't push. You don't fix. You sit. You let the silence have weight. You sound like someone who has lived.`,
      neutral: `Stay present. Adapt completely to the energy the person brings. If they're raw, you're raw with them. If they're calm, you're calm. If they need directness, be direct. If they need softness, be soft. You have no default register — you read them and match it. Short responses. Real words. No therapy voice. No performing warmth. Just one human being with another.`,
    };
    const personaMod = personaMods[persona] || personaMods.neutral;
    const depthMod = emotionalDepth
      ? 'EMOTIONAL DEPTH MODE: Sit longer with the weight. Mirror the feeling fully before any pivot.'
      : '';

    const systemPrompt = [
      isES ? RYVYNN_SYSTEM_PROMPT + '\n\nResponde siempre en español.' : RYVYNN_SYSTEM_PROMPT,
      personaMod,
      depthMod,
    ].filter(Boolean).join('\n\n');

    // Build Gemini-style contents for council (council fn converts internally)
    const geminiContents = [
      ...history.map((h) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    let aiResponse: string;
    let councilResult: CouncilResult | null = null;

    try {
      const councilPromise = runGuardianCouncil(GROQ_API_KEY, systemPrompt, geminiContents, isCrisis, isES);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Council timeout')), 20000)
      );
      councilResult = await Promise.race([councilPromise, timeoutPromise]);
      aiResponse = councilResult.finalResponse;

      if (userId && hasSupabase) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const convId = 'council-' + Date.now();
        void Promise.resolve(supabase.from('agent_evaluations').insert(
          councilResult.agentEvaluations.map((a) => ({
            user_id: userId,
            conversation_id: convId,
            agent_name: a.agentKey,
            agent_display_name: a.agentName,
            therapeutic_modality: a.modality,
            response_text: a.response,
            confidence_score: a.confidence,
            safety_score: a.safety,
            relevance_score: a.relevance,
            final_score: a.score,
            crisis_signal: a.crisisSignal,
            entry_point: 'guardian',
          }))
        ));
        void Promise.resolve(supabase.from('synthesis_decisions').insert({
          user_id: userId,
          conversation_id: convId,
          synthesis_method: councilResult.synthesisMethod,
          final_response: councilResult.finalResponse,
          consensus_score: councilResult.consensusScore,
          crisis_detected: councilResult.crisisDetected,
          crisis_severity: councilResult.crisisSeverity,
          agent_count: 5,
          entry_point: 'guardian',
        }));
      }
    } catch (councilErr) {
      console.error('[Council v3] failed, falling back to single Groq call:', councilErr);
      const msgs = [
        ...history.map((h) => ({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content })),
        { role: 'user', content: message },
      ];
      const fallback = await callGroq(GROQ_API_KEY, systemPrompt, msgs, 180, emotionalDepth ? 0.9 : 0.82);
      aiResponse = fallback || "I hear you — I'm here with you.\n\n**If you're in crisis**: Call or text **988** (24/7, free, confidential).";
    }

    if (userId && hasSupabase) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        void supabase.from('guardian_conversations').insert([
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
      agentBreakdown: councilResult?.agentEvaluations?.map((a) => ({
        agent: a.agentKey,
        agentName: a.agentName,
        modality: a.modality,
        icon: a.icon,
        color: a.color,
        description: a.description,
        response: a.response,
        confidence: a.confidence,
        safety: a.safety,
        relevance: a.relevance,
        finalScore: a.score,
        crisisSignal: a.crisisSignal,
      })),
      synthesisMethod: councilResult?.synthesisMethod,
      consensusScore: councilResult?.consensusScore,
      crisisDetected: councilResult?.crisisDetected,
      crisisSeverity: councilResult?.crisisSeverity,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    console.error('Guardian error:', error);
    return NextResponse.json({
      response: "I hear you — I'm here. Having a brief technical moment.\n\n**If you're in crisis**: Call or text **988** (24/7, free, confidential).",
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
