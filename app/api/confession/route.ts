import { NextRequest, NextResponse } from 'next/server';

// Fallback transformation when Gemini API fails
function generateFallbackTransformation(confession: string, mode: string, language: string): string {
  const isSpanish = language === 'es';
  
  const fallbacks = {
    transmute: isSpanish 
      ? `Tu sombra ha sido escuchada. 

Aunque nuestro sistema de IA está experimentando dificultades técnicas en este momento, tu confesión no se pierde. Está siendo transmutada.

Lo que compartes en la oscuridad tiene el poder de convertirse en luz. Tu valentía al enfrentarlo es el primer paso de la transformación.

Recuerda: Esta crisis pasará. Llamadas de ayuda están disponibles las 24 horas (988 en EE.UU.). No estás solo.

Por favor, vuelve a intentarlo en unos momentos o llama al 988 si necesitas ayuda inmediata.`
      : `Your shadow has been heard.

While our AI system is experiencing technical difficulties right now, your confession is not lost. It's being transmuted.

What you share in darkness has the power to become light. Your courage in facing it is the first step of transformation.

Remember: This crisis will pass. Help is available 24/7 (call 988 in the US). You are not alone.

Please try again in a few moments, or call 988 if you need immediate support.`,
    
    raw: isSpanish
      ? `Tu oscuridad es real. La vemos. La enfrentamos contigo.

Nuestro sistema de IA está temporalmente fuera de servicio, pero tu confesión importa. 

La oscuridad que enfrentas es parte de tu historia, no toda tu historia. El hecho de que la nombraste es poder.

Crisis: 988 (EE.UU.) · Disponible 24/7 · Confidencial · Gratuito`
      : `Your darkness is real. We see it. We face it with you.

Our AI system is temporarily offline, but your confession matters.

The darkness you're facing is part of your story, not your whole story. The fact that you named it is power.

Crisis: 988 (US) · 24/7 · Confidential · Free`,
    
    confront: isSpanish
      ? `Tu enemigo ha sido nombrado. Eso es el primer movimiento en la batalla.

El sistema de IA está temporalmente inaccesible, pero tu guerra continúa.

Primer paso inmediato: Llama al 988 si estás en crisis. Habla con alguien. El silencio es el arma del enemigo.

Tu siguiente movimiento: vuelve aquí cuando el sistema esté restaurado, o busca ayuda ahora.`
      : `Your enemy has been named. That's the first move in the battle.

The AI system is temporarily unavailable, but your war continues.

Immediate first step: Call 988 if you're in crisis. Talk to someone. Silence is the enemy's weapon.

Your next move: come back when the system is restored, or get help now.`
  };

  return fallbacks[mode as keyof typeof fallbacks] || fallbacks.transmute;
}

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

    // Call Gemini API with fallback
    let transformation = '';
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error:', response.status, errorText);
        
        // Provide fallback transformation
        transformation = generateFallbackTransformation(confession, mode, language);
      } else {
        const data = await response.json();
        transformation = data?.candidates?.[0]?.content?.parts?.[0]?.text || generateFallbackTransformation(confession, mode, language);
      }
    } catch (fetchError) {
      console.error('❌ Gemini fetch failed:', fetchError);
      transformation = generateFallbackTransformation(confession, mode, language);
    }

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
