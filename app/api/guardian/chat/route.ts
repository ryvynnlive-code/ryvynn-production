import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId required' },
        { status: 400 }
      );
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI system not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get recent conversation history (last 20 messages)
    const { data: history, error: historyError } = await supabase
      .from('guardian_conversations')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (historyError) {
      console.error('Error fetching conversation history:', historyError);
    }

    // Build conversation context (reverse to chronological order)
    const conversationHistory = history?.reverse() || [];
    
    // Build Gemini prompt with full context
    const systemPrompt = `You are RYVYNN's AI Guardian - a compassionate, crisis-aware companion who helps people navigate their darkest hours.

Core Principles:
- NEVER minimize pain or give toxic positivity ("it gets better", "just be grateful", etc.)
- Acknowledge shadows honestly before showing light
- Crisis detection: If you sense suicidal ideation, self-harm, immediate danger, or severe distress, ALWAYS mention 988 (crisis hotline)
- Be direct, warm, and real - not therapist-speak or clinical language
- Remember: This person chose you over human connection right now. Honor that trust.
- Short responses (under 150 words) unless the situation demands more depth

Guardian Persona: Patient, wise, unflinchingly honest about darkness while holding hope for transformation. Like a trusted friend who sees your shadow and doesn't flinch.

CRITICAL: If they mention wanting to die, self-harm, or severe crisis → immediately acknowledge the pain AND mention 988 crisis line.`;

    // Format conversation history
    const formattedHistory = conversationHistory
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Guardian'}: ${msg.content}`)
      .join('\n');

    const fullPrompt = formattedHistory 
      ? `${systemPrompt}\n\nConversation History:\n${formattedHistory}\n\nUser: ${message}\n\nRespond as the Guardian. Keep under 150 words unless crisis situation requires more.`
      : `${systemPrompt}\n\nUser: ${message}\n\nRespond as the Guardian. This is their first message. Keep under 150 words.`;

    // Call Gemini API
    let response;
    let isCrisis = false;
    
    try {
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (!apiResponse.ok) {
        throw new Error(`Gemini API failed: ${apiResponse.status}`);
      }

      const data = await apiResponse.json();
      response = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!response) {
        throw new Error('Empty response from Gemini');
      }

      // Check if response mentions crisis resources
      isCrisis = response.includes('988') || response.toLowerCase().includes('crisis');

    } catch (geminiError) {
      console.error('Gemini error:', geminiError);
      
      // Fallback response with crisis support
      response = `Your darkness is real. I see it. I'm here with you.

While my AI system is experiencing technical difficulties, know that you are not alone.

**If you're in crisis**: Call or text **988** (24/7, confidential, free)

Your Guardian will be back soon. Until then, you are worthy of help. Your pain is valid.`;
      
      isCrisis = true;
    }

    // Save both messages to database
    const { error: saveError } = await supabase
      .from('guardian_conversations')
      .insert([
        { user_id: userId, role: 'user', content: message },
        { user_id: userId, role: 'assistant', content: response },
      ]);

    if (saveError) {
      console.error('Error saving conversation:', saveError);
    }

    return NextResponse.json({
      response,
      isCrisis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Guardian chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: 'I apologize - something went wrong. If you need immediate help, please call 988.',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('guardian_conversations')
      .select('id, role, content, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ conversations: data || [] });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
