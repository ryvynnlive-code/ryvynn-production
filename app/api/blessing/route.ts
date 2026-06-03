import { NextRequest, NextResponse } from 'next/server';

// Crisis content is met with presence + real resources, never a "blessing as usual".
const HIGH_RISK = /\b(suicide|kill myself|want to die|end it all|unalive|better off dead|self.?harm|overdose|cutting myself)\b/i;

const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

// Curated fallback pool — framed as light GIVEN, not self-esteem commands.
// (Avoids the "positive self-statement backfire" for low self-worth users.)
const BLESSINGS_EN: string[] = [
  "You are not alone in this moment. Right now, someone is wishing you peace, and meaning it.",
  "You don't have to carry today perfectly. You only have to carry it. And you are.",
  "Rest is allowed. The world can hold itself for a while so you can breathe.",
  "Whatever you survived to get here, it did not get the last word. You are still here, still speaking.",
  "You are allowed to be a work in progress and still be worthy of gentleness today.",
  "This hour is not the whole story. There is more coming that you cannot see yet. Stay for it.",
  "May the weight feel a little lighter for having set it down here, even for a moment.",
  "You are witnessed. Not fixed, not judged — just seen, and welcome.",
  "The light you can't feel right now is not gone. It is on the other side of this. Walk toward it slowly.",
  "May you be a little kinder to yourself tonight than the world has been.",
  "You made it to now. That counts. That is not nothing — that is everything.",
  "May you remember that needing help is not weakness. It is how humans are built to survive.",
  "You are wanted in tomorrow, even by people who haven't met you yet. Stay long enough to find them.",
  "Breathe. You are here. That is enough for right now. The rest can wait.",
  "May the part of you that is tired be allowed to rest, and the part that is still fighting be honored.",
  "You don't have to believe in yourself tonight. Let someone else believe in you until you can.",
  "Peace to the version of you that is holding it all together. You can let go a little here.",
  "May you find one small mercy today, and may you let yourself accept it.",
  "You are not behind. You are walking a road only you can walk, at the only pace that is yours.",
  "Whatever brought you here, you are safe in this moment. Set the weight down. The ground can hold it.",
  "May you be reminded that you have already survived every worst day so far. Your record is unbroken.",
  "You are someone's quiet reason to keep going, even if no one has told you yet.",
  "May the night be gentle, and may morning find you still here.",
  "You are allowed to take up space, to feel what you feel, and to still be loved through it.",
];
const BLESSINGS_ES: string[] = [
  "No estás solo en este momento. Ahora mismo, alguien te desea paz, y lo dice en serio.",
  "No tienes que cargar el día a la perfección. Solo tienes que cargarlo. Y lo estás haciendo.",
  "Descansar está permitido. El mundo puede sostenerse un rato para que puedas respirar.",
  "Esta hora no es toda la historia. Viene más de lo que aún no puedes ver. Quédate para verlo.",
  "Eres visto. No corregido, no juzgado — solo visto, y bienvenido.",
  "Llegaste hasta ahora. Eso cuenta. Eso no es poca cosa — eso lo es todo.",
  "No tienes que creer en ti esta noche. Deja que alguien más crea en ti hasta que puedas hacerlo.",
  "Que la noche sea amable, y que la mañana te encuentre todavía aquí.",
];

function pickRandom(lang: string) {
  const pool = lang.startsWith('es') ? BLESSINGS_ES : BLESSINGS_EN;
  const i = Math.floor(Math.random() * pool.length);
  return { blessing: pool[i], id: i, total: pool.length, lang: lang.startsWith('es') ? 'es' : 'en', source: 'curated' as const };
}

async function writeBlessing(apiKey: string, text: string, isES: boolean): Promise<string | null> {
  const prompt =
    `You are the Dual Flame — a calm, loving presence at RYVYNN, a sanctuary for people in pain.
Someone just told you what they are carrying. Write them a blessing in response.

RULES:
- 2 to 4 short lines. Plain, warm words.
- Speak TO them. Witness what they shared. Then turn gently toward worth, staying, and not being alone.
- Respond to THEIR specific words — do not be generic.
- Do NOT give advice. Do NOT diagnose. Do NOT command them how to feel ("you should", "just").
- No clichés. No toxic positivity. Never pretend the pain isn't real.
${isES ? '- Write entirely in warm, natural Spanish.' : ''}
Return ONLY the blessing text. No quotes, no preamble, no title.

WHAT THEY ARE CARRYING:
"""${text}"""`;
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.85, maxOutputTokens: 200 } }) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (out) return (out as string).trim();
    } catch { continue; }
  }
  return null;
}

// GET — just receive light (random curated blessing)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return NextResponse.json(pickRandom((searchParams.get('lang') || 'en').toLowerCase()));
}

// POST — a blessing written FOR you, in answer to what you shared
export async function POST(req: NextRequest) {
  try {
    const { text, lang } = await req.json();
    const isES = (lang || 'en').toLowerCase().startsWith('es');

    if (!text || typeof text !== 'string' || text.trim().length < 2) {
      return NextResponse.json(pickRandom(isES ? 'es' : 'en'));
    }

    if (HIGH_RISK.test(text)) {
      return NextResponse.json({
        held: true,
        blessing: isES
          ? 'Lo que compartiste importa, y tú importas. Si estás en crisis: llama o envía un mensaje al 988, o escribe HOME al 741741. El Guardián está aquí contigo.'
          : "What you shared matters, and so do you. If you're in crisis right now: call or text 988, or text HOME to 741741. The Guardian is here with you too.",
        source: 'crisis',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const written = await writeBlessing(apiKey, text.trim().slice(0, 1000), isES);
      if (written) return NextResponse.json({ blessing: written, source: 'written', lang: isES ? 'es' : 'en' });
    }
    // Always return light, even if the model is unavailable.
    return NextResponse.json(pickRandom(isES ? 'es' : 'en'));
  } catch {
    return NextResponse.json(pickRandom('en'));
  }
}
