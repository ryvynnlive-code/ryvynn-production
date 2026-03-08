import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// CREATE eternity message
export async function POST(req: NextRequest) {
  try {
    const { userId, encryptedMessage, triggerCondition, recipientInfo } = await req.json();

    if (!userId || !encryptedMessage) {
      return NextResponse.json(
        { error: 'userId and encryptedMessage required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create eternity message
    const { data, error } = await supabase
      .from('eternity_messages')
      .insert({
        user_id: userId,
        encrypted_message: encryptedMessage,
        trigger_condition: triggerCondition || 'death',
        recipient_info: recipientInfo || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Award 5 soul tokens for creating eternity message
    const { error: tokenError } = await supabase.rpc('award_tokens', {
      user_uuid: userId,
      amount: 5,
      transaction_type: 'eternity_create',
      description: 'Eternity message created',
    });

    if (tokenError) {
      console.error('Error awarding tokens:', tokenError);
    }

    return NextResponse.json({
      message: data,
      tokensEarned: 5,
      message_text: 'Eternity message secured. +5 🔥 tokens',
    });

  } catch (error) {
    console.error('Eternity POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create eternity message' },
      { status: 500 }
    );
  }
}

// READ eternity messages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get single message
    if (messageId) {
      const { data, error } = await supabase
        .from('eternity_messages')
        .select('*')
        .eq('id', messageId)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({ message: data });
    }

    // Get all messages for user
    const { data, error } = await supabase
      .from('eternity_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ messages: data || [] });

  } catch (error) {
    console.error('Eternity GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch eternity messages' },
      { status: 500 }
    );
  }
}

// UPDATE eternity message
export async function PUT(req: NextRequest) {
  try {
    const { userId, messageId, encryptedMessage, triggerCondition, recipientInfo, status } = await req.json();

    if (!userId || !messageId) {
      return NextResponse.json(
        { error: 'userId and messageId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updateData: any = {};
    if (encryptedMessage) updateData.encrypted_message = encryptedMessage;
    if (triggerCondition) updateData.trigger_condition = triggerCondition;
    if (recipientInfo) updateData.recipient_info = recipientInfo;
    if (status) updateData.status = status;

    const { data, error } = await supabase
      .from('eternity_messages')
      .update(updateData)
      .eq('id', messageId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: data,
      message_text: 'Eternity message updated',
    });

  } catch (error) {
    console.error('Eternity PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update eternity message' },
      { status: 500 }
    );
  }
}

// DELETE eternity message
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');

    if (!userId || !messageId) {
      return NextResponse.json(
        { error: 'userId and messageId required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to 'cancelled' instead of deleting (for audit trail)
    const { error } = await supabase
      .from('eternity_messages')
      .update({ status: 'cancelled' })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: 'Eternity message cancelled',
    });

  } catch (error) {
    console.error('Eternity DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel eternity message' },
      { status: 500 }
    );
  }
}
