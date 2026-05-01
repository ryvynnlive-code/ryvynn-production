import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const MIRACLE_AGENTS = [
  { name: 'Trauma Compass', prompt: 'Trauma lens: what survival strength does this confession reveal? ONE sentence, no preamble.' },
  { name: 'Insight Engine', prompt: 'Cognitive lens: what truth is this struggle teaching? ONE sentence, no preamble.' },
  { name: 'Soul Mirror', prompt: 'Lived experience: what is sacred in their honesty? ONE sentence, no preamble.' },
  { name: 'Recovery Architect', prompt: 'Recovery lens: what ember of strength is hidden here? ONE sentence, no preamble.' },
  { name: 'Soul Philosopher', prompt: 'Sacred meaning: what greater story might this pain be part of? Profound, not religious. ONE sentence, no preamble.' },
];

async function gemini(apiKey: string, prompt: string, userText: string): Promise<string> {
  const res = await fetch(`${GEMINI_API}?key=${apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nConfession: "${userText}"\n\nMiracle:` }] }], generationConfig: { maxOutputTokens: 80, temperature: 0.8 } }),
  });
  if (!res.ok) throw new Error('Gemini error');
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Your honesty is itself the miracle.';
}

export async function POST(req: NextRequest) {
  try {
    const { confession } = await req.json();
    if (!confession?.trim()) return NextResponse.json({ error: 'Confession required' }, { status: 400 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI unavailable' }, { status: 503 });

    const miracles = await Promise.all(MIRACLE_AGENTS.map(async a => {
      try { return { agent: a.name, miracle: await gemini(apiKey, a.prompt, confession) }; }
      catch { return { agent: a.name, miracle: 'Your honesty is itself the miracle.' }; }
    }));

    let final = miracles[0].miracle;
    try {
      const oraclePrompt = `You are the Miracle Oracle. Pick the SINGLE most psychologically powerful miracle for this confession.
CONFESSION: "${confession}"
PROPOSALS:\n${miracles.map(m => `[${m.agent}]: ${m.miracle}`).join('\n')}
Rules: Must feel earned. Specific to THIS confession. Not preachy. 1-2 sentences. No preamble.`;
      final = await gemini(apiKey, oraclePrompt, '');
    } catch {}

    return NextResponse.json({ miracle: final, councilMiracles: miracles });
  } catch (err) {
    console.error('[Miracle Council]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
