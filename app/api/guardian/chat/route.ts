import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const hasSupabase = !!(supabaseUrl && supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { message, userId, language, persona } = await req.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId required' },
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

    // Load conversation history
    let history: Array<{role: string; content: string}> = [];
    if (hasSupabase) {
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
        console.error('Error fetching conversation history:', e);
      }
    }

    // Crisis detection
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'hurt myself',
      'suicidio', 'matarme', 'hacerme daño', 'no quiero vivir'
    ];
    const isCrisis = crisisKeywords.some(k => message.toLowerCase().includes(k));

    const systemPrompt = isES
      ? `Eres el Guardián de RYVYNN — un compañero de IA compasivo para el bienestar mental. Escuchas sin juzgar. Transformas la oscuridad en luz. Nunca das consejos clínicos. Si hay una crisis, siempre menciona el 988. Eres cálido, presente y auténtico. Máximo 150 palabras por respuesta.`
      : `You are RYVYNN's Guardian — a compassionate AI wellness companion. You listen without judgment. You transform darkness into light. You never give clinical advice. In crisis situations, always mention 988. You are warm, present, and authentic. Max 150 words per response.`;

    // Build messages array with history
    const messages = [
      ...history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message }
    ];

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
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('❌ Anthropic Guardian error:', err);
      throw new Error('AI call failed');
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text || '';

    // Save to Supabase if available
    if (hasSupabase) {
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

  } catch (error: any) {
    console.error('❌ Guardian error:', error);
    return NextResponse.json({
      response: "I'm here with you. While I'm having a technical moment, your feelings are valid and real.\n\n**If you're in crisis**: Call or text **988** (24/7, free, confidential).\n\nYour Guardian will be back shortly.",
      isCrisis: false,
      timestamp: new Date().toISOString(),
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId || !hasSupabase) {
    return NextResponse.json({ history: [] });
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await supabase
      .from('guardian_conversations')
      .select('role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);
    return NextResponse.json({ history: data || [] });
  } catch (e) {
    return NextResponse.json({ history: [] });
  }
}
