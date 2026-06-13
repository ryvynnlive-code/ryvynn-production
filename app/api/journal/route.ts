import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// CREATE journal entry
export async function POST(req: NextRequest) {
  try {
    const { userId, encryptedContent } = await req.json();

    if (!userId || !encryptedContent) {
      return NextResponse.json(
        { error: 'userId and encryptedContent required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create journal entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: userId,
        encrypted_content: encryptedContent,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Award 1 soul token for journaling
    const { error: tokenError } = await supabase.rpc('award_tokens', {
      user_uuid: userId,
      amount: 1,
      transaction_type: 'journal_save',
      description: 'Journal entry saved',
    });

    if (tokenError) {
      console.error('Error awarding tokens:', tokenError);
    }

    return NextResponse.json({
      entry: data,
      tokensEarned: 1,
      message: 'Journal entry saved. +1 🔥 token',
    });

  } catch (error) {
    console.error('Journal POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save journal entry' },
      { status: 500 }
    );
  }
}

// READ journal entries
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const entryId = searchParams.get('entryId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get single entry
    if (entryId) {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ entry: data });
    }

    // Get all entries for user
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({ entries: data || [] });

  } catch (error) {
    console.error('Journal GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// UPDATE journal entry
export async function PUT(req: NextRequest) {
  try {
    const { userId, entryId, encryptedContent } = await req.json();

    if (!userId || !entryId || !encryptedContent) {
      return NextResponse.json(
        { error: 'userId, entryId, and encryptedContent required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('journal_entries')
      .update({ encrypted_content: encryptedContent })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      entry: data,
      message: 'Journal entry updated',
    });

  } catch (error) {
    console.error('Journal PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// DELETE journal entry
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const entryId = searchParams.get('entryId');

    if (!userId || !entryId) {
      return NextResponse.json(
        { error: 'userId and entryId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Journal entry deleted',
    });

  } catch (error) {
    console.error('Journal DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
