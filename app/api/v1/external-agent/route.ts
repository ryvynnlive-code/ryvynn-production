import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

type AgentAction =
  | 'get_user_profile'
  | 'update_user_tokens'
  | 'create_journal_entry'
  | 'get_journal_entries'
  | 'create_wall_post'
  | 'get_wall_posts'
  | 'create_eternity_message'
  | 'log_crisis_event'
  | 'sync_stripe_status'
  | 'health_check';

interface AgentRequest {
  action: AgentAction;
  agent_id: string;
  user_id?: string;
  payload?: Record<string, unknown>;
}

interface AgentResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  action: AgentAction;
  agent_id: string;
  timestamp: string;
}

const ALLOWED_AGENTS = [
  'gemini-guardian-v1',
  'gemini-crisis-v1',
  'gemini-miracle-v1',
  'external-sync-v1',
  'manus-librarian-v1',
];

const AGENT_KEY = process.env.EXTERNAL_AGENT_SECRET_KEY;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function verifyAgentKey(request: NextRequest): boolean {
  const key = request.headers.get('x-agent-key');
  if (!AGENT_KEY || !key) return false;
  return key === AGENT_KEY;
}

const requestLog = new Map<string, number[]>();

function isRateLimited(agentId: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 30;
  const timestamps = (requestLog.get(agentId) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  requestLog.set(agentId, timestamps);
  return false;
}

async function handleAction(
  action: AgentAction,
  userId: string | undefined,
  payload: Record<string, unknown> | undefined,
  supabase: ReturnType<typeof getServiceClient>
): Promise<unknown> {
  switch (action) {
    case 'health_check':
      return { status: 'alive', version: 'v1', flame: 'burning', identity: 'Dual Flame #00D9FF + #8B5CF6' };

    case 'get_user_profile': {
      if (!userId) throw new Error('user_id required');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, soul_tokens, streak_days, subscription_tier, created_at')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    }

    case 'update_user_tokens': {
      if (!userId) throw new Error('user_id required');
      const delta = payload?.delta as number;
      if (typeof delta !== 'number') throw new Error('payload.delta (number) required');
      const { data: profile } = await supabase
        .from('profiles')
        .select('soul_tokens')
        .eq('id', userId)
        .single();
      const current = (profile?.soul_tokens as number) ?? 0;
      const newTotal = Math.max(0, current + delta);
      const { data, error } = await supabase
        .from('profiles')
        .update({ soul_tokens: newTotal, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, soul_tokens')
        .single();
      if (error) throw error;
      return { previous: current, current: newTotal, delta, ...data };
    }

    case 'create_journal_entry': {
      if (!userId) throw new Error('user_id required');
      const { encrypted_content, iv, salt, mood_score, tags } = payload as {
        encrypted_content: string; iv: string; salt: string;
        mood_score?: number; tags?: string[];
      };
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({ user_id: userId, encrypted_content, iv, salt,
          mood_score: mood_score ?? null, tags: tags ?? [],
          source: 'agent', created_at: new Date().toISOString() })
        .select('id, created_at').single();
      if (error) throw error;
      return data;
    }

    case 'get_journal_entries': {
      if (!userId) throw new Error('user_id required');
      const limit = (payload?.limit as number) ?? 10;
      const { data, error } = await supabase
        .from('journal_entries')
        .select('id, mood_score, tags, source, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    }

    case 'create_wall_post': {
      if (!userId) throw new Error('user_id required');
      const { confession, miracle, is_anonymous } = payload as {
        confession: string; miracle: string; is_anonymous?: boolean;
      };
      if (!confession || !miracle) throw new Error('confession and miracle required');
      const { data, error } = await supabase
        .from('wall_posts')
        .insert({ user_id: userId,
          confession: confession.slice(0, 1000),
          miracle: miracle.slice(0, 1000),
          is_anonymous: is_anonymous ?? true,
          is_approved: false,
          created_at: new Date().toISOString() })
        .select('id, created_at').single();
      if (error) throw error;
      return data;
    }

    case 'get_wall_posts': {
      const limit = (payload?.limit as number) ?? 20;
      const { data, error } = await supabase
        .from('wall_posts')
        .select('id, confession, miracle, is_anonymous, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    }

    case 'create_eternity_message': {
      if (!userId) throw new Error('user_id required');
      const { encrypted_content, iv, salt, deliver_after_years, recipient_hint } = payload as {
        encrypted_content: string; iv: string; salt: string;
        deliver_after_years?: number; recipient_hint?: string;
      };
      const { data, error } = await supabase
        .from('eternity_messages')
        .insert({ user_id: userId, encrypted_content, iv, salt,
          deliver_after_years: deliver_after_years ?? 10,
          recipient_hint: recipient_hint ?? null,
          created_at: new Date().toISOString() })
        .select('id, created_at').single();
      if (error) throw error;
      return data;
    }

    case 'log_crisis_event': {
      const { session_id, risk_level, signals, user_id: eventUserId } = payload as {
        session_id: string; risk_level: string; signals: string[]; user_id?: string;
      };
      const { data, error } = await supabase
        .from('crisis_events')
        .insert({ user_id: userId ?? eventUserId ?? null,
          session_id, risk_level, signals,
          created_at: new Date().toISOString() })
        .select('id').single();
      if (error) throw error;
      return { logged: true, event_id: data.id, risk_level };
    }

    case 'sync_stripe_status': {
      if (!userId) throw new Error('user_id required');
      const { tier, stripe_customer_id, subscription_status } = payload as {
        tier: string; stripe_customer_id?: string; subscription_status?: string;
      };
      const { data, error } = await supabase
        .from('profiles')
        .update({ subscription_tier: tier,
          stripe_customer_id: stripe_customer_id ?? null,
          subscription_status: subscription_status ?? 'active',
          updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, subscription_tier').single();
      if (error) throw error;
      return data;
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<AgentResponse>> {
  const timestamp = new Date().toISOString();

  if (!verifyAgentKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', action: 'health_check', agent_id: 'unknown', timestamp },
      { status: 401 }
    );
  }

  let body: AgentRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body', action: 'health_check', agent_id: 'unknown', timestamp },
      { status: 400 }
    );
  }

  const { action, agent_id, user_id, payload } = body;

  if (!ALLOWED_AGENTS.includes(agent_id)) {
    return NextResponse.json(
      { success: false, error: `Agent '${agent_id}' not registered`, action, agent_id, timestamp },
      { status: 403 }
    );
  }

  if (isRateLimited(agent_id)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded (30 req/min)', action, agent_id, timestamp },
      { status: 429 }
    );
  }

  try {
    const supabase = getServiceClient();
    const data = await handleAction(action, user_id, payload, supabase);
    return NextResponse.json({ success: true, data, action, agent_id, timestamp });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[external-agent] ${agent_id} -> ${action} FAILED:`, message);
    return NextResponse.json(
      { success: false, error: message, action, agent_id, timestamp },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// v1.0.1
