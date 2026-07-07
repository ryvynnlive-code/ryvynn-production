import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthedUserId } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// CREATE journal entry
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { encryptedContent } = await req.json();
    if (!encryptedContent) {
      return NextResponse.json({ error: 'encryptedContent required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: userId, encrypted_content: encryptedContent })
      .select()
      .single();
    if (error) throw error;

    const { error: tokenError } = await supabase.rpc('award_tokens', {
      user_uuid: userId,
      amount: 1,
      transaction_type: 'journal_save',
      description: 'Journal entry saved',
    });
    if (tokenError) console.error('Error awarding tokens:', tokenError);

    return NextResponse.json({ entry: data, tokensEarned: 1, message: 'Journal entry saved. +1 🔥 token' });
  } catch (error) {
    console.error('Journal POST error:', error);
    return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 });
  }
}

// READ journal entries (only the authenticated user's own)
export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entryId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (entryId) {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return NextResponse.json({ entry: data });
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error('Journal GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
  }
}

// UPDATE journal entry
export async function PUT(req: NextRequest) {
  try {
    const userId = await getAuthedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { entryId, encryptedContent } = await req.json();
    if (!entryId || !encryptedContent) {
      return NextResponse.json({ error: 'entryId and encryptedContent required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ encrypted_content: encryptedContent })
      .eq('id', entryId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ entry: data, message: 'Journal entry updated' });
  } catch (error) {
    console.error('Journal PUT error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
}

// DELETE journal entry
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const entryId = searchParams.get('entryId');
    if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId)
      .eq('user_id', userId);
    if (error) throw error;

    return NextResponse.json({ message: 'Journal entry deleted' });
  } catch (error) {
    console.error('Journal DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}
