import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { confession, mode, language } = await req.json();

    if (!confession || !mode) {
      return NextResponse.json({ error: 'Confession and mode required' }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    const isES = language === 'es';

    const prompts: Record<string, string> = {
      transform: isES
        ? `Eres el transformador de sombras de RYVYNN. Tu única tarea: transformar esta confesión en un milagro — una reflexión poética que reconoce el dolor real y lo convierte en luz sin minimizarlo.

Confesión: "${confession}"

Responde con 3-4 oraciones que:
1. Reconocen el peso real de lo que compartieron
2. Encuentran algo de verdad o fuerza en la oscuridad
3. Apuntan hacia la luz sin forzar optimismo

Sin consejos clínicos. Sin clichés. Solo transformación pura y honesta.`
        : `You are RYVYNN's shadow transformer. Your only task: transform this confession into a miracle — a poetic reflection that acknowledges real pain and turns it toward light without minimizing it.

Confession: "${confession}"

Respond with 3-4 sentences that:
1. Acknowledge the real weight of what they shared
2. Find something true or strong in the darkness
3. Point toward light without forcing optimism

No clinical advice. No clichés. Pure, honest transformation only.`,

      raw: isES
        ? `Eres el guardián de sombras de RYVYNN. Alguien compartió: "${confession}"

Responde con exactamente 3 cosas:
1. Una oración reconociendo su sombra con honestidad cruda (sin suavizar)
2. Una metáfora que capture la esencia de su oscuridad (máximo 50 palabras)
3. Una pregunta que los haga enfrentarla más profundamente`
        : `You are RYVYNN's shadow keeper. Someone shared: "${confession}"

Respond with exactly 3 things:
1. One sentence acknowledging their shadow with raw honesty (no softening)
2. A metaphor capturing the essence of their darkness (50 words max)
3. A question that makes them face it deeper`,
    };

    const prompt = prompts[mode] || prompts.transform;
    let transformation = '';

    // Try Gemini first (primary — Anthropic credits may be depleted)
    if (GEMINI_API_KEY) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 400, temperature: 0.9 },
            }),
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          transformation = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (e) {
        console.error('[confession] Gemini error, trying Anthropic fallback:', e);
      }
    }

    // Fallback to Anthropic
    if (!transformation && ANTHROPIC_API_KEY) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        transformation = data.content?.[0]?.text || '';
      }
    }

    if (!transformation) throw new Error('All AI providers failed');

    return NextResponse.json({ transformation, mode });

  } catch (error: any) {
    console.error('[confession] error:', error.message);
    return NextResponse.json({
      transformation: "Your shadow has been heard. The darkness you carry is real — and so is the courage it took to name it. Something in you still reaches toward light. That reaching is where miracles begin.",
      mode: 'transform',
    });
  }
}
