import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { confession, mode, language } = await req.json();

    if (!confession || !mode) {
      return NextResponse.json(
        { error: 'Confession and mode required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI system not configured' },
        { status: 500 }
      );
    }

    // Build Gemini prompts based on mode
    const prompts = {
      raw: `You are RYVYNN's shadow keeper. Someone has shared their darkness with you.

Their shadow: "${confession}"

Respond with EXACTLY 3 things:
1. A single sentence acknowledging their shadow with raw honesty (no softening, no therapy-speak)
2. A metaphor that captures the essence of their darkness (50 words max)
3. A question that makes them face it deeper

Language: ${language === 'es' ? 'Spanish' : 'English'}
Tone: Direct, unflinching, shadow-facing. NO positivity. NO "you've got this." Just truth.`,

      transmute: `You are RYVYNN's alchemist. Someone has shared their shadow and wants to transform it.

Their shadow: "${confession}"

Create a transformation in EXACTLY 3 parts:
1. Name the shadow (1 sentence, direct)
2. Show what it becomes when transmuted (50 words, poetic but grounded)
3. Give them ONE concrete action to start the transmutation

Language: ${language === 'es' ? 'Spanish' : 'English'}
Tone: Transformative but not toxic-positive. Real alchemy, not wishful thinking.`,

      confront: `You are RYVYNN's warrior trainer. Someone has shared their shadow and wants to confront it.

Their shadow: "${confession}"

Give them EXACTLY 3 things:
1. Name the enemy (1 sentence, clear)
2. Describe the battle ahead (50 words, honest about the difficulty)
3. Their first move in the fight (specific, actionable)

Language: ${language === 'es' ? 'Spanish' : 'English'}
Tone: Warrior mentorship. Honest about the fight, but confident they can win it.`,
    };

    const prompt = prompts[mode as keyof typeof prompts];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return NextResponse.json(
        { error: 'AI transformation failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const transformation =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Transformation unavailable';

    // Return transformation (original confession is NEVER stored)
    return NextResponse.json({
      transformation,
      mode,
    });

  } catch (error) {
    console.error('Confession API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
