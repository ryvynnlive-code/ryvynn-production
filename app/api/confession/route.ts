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

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI system not configured' },
        { status: 500 }
      );
    }

    const isES = language === 'es';

    const prompts: Record<string, string> = {
      transform: isES
        ? `Eres el transformador de sombras de RYVYNN. Alguien ha compartido su oscuridad contigo.\n\nSu sombra: "${confession}"\n\nTransforma esto en un milagro — una reflexión poética y sanadora que reconoce su dolor y lo convierte en luz. 3-4 oraciones. Sin consejos clínicos. Solo transformación pura.`
        : `You are RYVYNN's shadow transformer. Someone has shared their darkness with you.\n\nTheir shadow: "${confession}"\n\nTransform this into a miracle — a poetic, healing reflection that acknowledges their pain and turns it toward light. 3-4 sentences. No clinical advice. Pure transformation only.`,
      raw: isES
        ? `Eres el guardián de sombras de RYVYNN. Alguien compartió: "${confession}"\n\nResponde con exactamente 3 cosas:\n1. Una oración reconociendo su sombra con honestidad cruda\n2. Una metáfora que capture la esencia de su oscuridad (máximo 50 palabras)\n3. Una pregunta que los haga enfrentarla más profundamente`
        : `You are RYVYNN's shadow keeper. Someone shared: "${confession}"\n\nRespond with exactly 3 things:\n1. One sentence acknowledging their shadow with raw honesty\n2. A metaphor capturing the essence of their darkness (50 words max)\n3. A question that makes them face it deeper`,
    };

    const prompt = prompts[mode] || prompts.transform;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('❌ Anthropic API error:', err);
      throw new Error('AI call failed');
    }

    const data = await response.json();
    const transformation = data.content?.[0]?.text || '';

    return NextResponse.json({ transformation, mode });

  } catch (error: any) {
    console.error('❌ Confession error:', error);
    // Compassionate fallback
    return NextResponse.json({
      transformation: "Your shadow has been heard. The darkness you carry is real — and so is your courage in naming it. Something in you reaches toward light even now. That reaching is the miracle. Please try again in a moment, or call 988 if you need immediate support.",
      mode: 'transform',
    });
  }
}
