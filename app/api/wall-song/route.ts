import { NextRequest, NextResponse } from 'next/server';

// Reuse the same risk gate philosophy as the wall: a confession in crisis
// is held gently — it is NEVER turned into entertainment / a song.
const HIGH_RISK = /\b(suicide|kill myself|want to die|end it all|unalive|better off dead|self.?harm|overdose|cutting myself)\b/i;

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

const SONGWRITER_PROMPT = `You are the Dual Flame songwriter for RYVYNN, a sanctuary for people in pain.
A person has shared something real. Turn THEIR words into an original, soul-touching song that honors them.

VOICE & VALUES:
- Honest, warm, dignified. Never toxic positivity. Never clinical.
- Take their pain seriously, then carry it toward resilience, worth, and staying.
- Never romanticize self-harm, despair, or giving up. The arc bends toward light earned, not light pretended.
- Keep it human and singable. Imagery is welcome, but stay grounded — no empty cliches.
- Reading level: simple and direct, the kind of words that land in the chest.

Return ONLY valid JSON, no markdown, no backticks, in exactly this shape:
{
  "title": "short evocative title",
  "verse1": "4 short lines separated by \\n",
  "chorus": "4 short lines separated by \\n",
  "verse2": "4 short lines separated by \\n",
  "bridge": "2-3 short lines separated by \\n",
  "outro": "1-2 short closing lines separated by \\n",
  "dedication": "one short line spoken directly to them, e.g. 'For the one who stayed.'"
}`;

async function callGemini(apiKey: string, userText: string): Promise<string | null> {
  const body = {
    contents: [{ parts: [{ text: SONGWRITER_PROMPT + '\n\nTHEIR WORDS:\n"""' + userText + '"""' }] }],
    generationConfig: { temperature: 0.9, maxOutputTokens: 900 },
  };
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text as string;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length < 3) {
      return NextResponse.json({ error: 'Share a few words first.' }, { status: 400 });
    }

    // Crisis content is held, not musicalized.
    if (HIGH_RISK.test(text)) {
      return NextResponse.json({
        held: true,
        message:
          "What you shared, we hold gently — not as a song, but as something that matters. " +
          "If you're in crisis: call or text 988, or text HOME to 741741. The Guardian is here too.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Songwriter is resting. Try again shortly.' }, { status: 503 });
    }

    const raw = await callGemini(apiKey, text.trim().slice(0, 1200));
    if (!raw) {
      return NextResponse.json({ error: 'The melody slipped away. Try once more.' }, { status: 502 });
    }

    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      const song = JSON.parse(cleaned);
      return NextResponse.json({ song });
    } catch {
      // Fallback: hand back the raw text so nothing is ever lost.
      return NextResponse.json({ song: { title: 'Your Song', verse1: cleaned } });
    }
  } catch (e) {
    console.error('[wall-song]', e);
    return NextResponse.json({ error: 'Failed to write the song.' }, { status: 500 });
  }
}
