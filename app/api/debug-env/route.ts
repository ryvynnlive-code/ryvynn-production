import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || '';

  // Test Supabase
  let supabaseStatus = 'not tested';
  let supabaseError = '';
  try {
    const sb = createClient(supabaseUrl, serviceKey);
    const { data, error } = await sb.from('wall_entries').select('id').limit(1);
    if (error) { supabaseStatus = 'ERROR'; supabaseError = error.message; }
    else { supabaseStatus = 'OK'; }
  } catch(e: any) { supabaseStatus = 'EXCEPTION'; supabaseError = e.message; }

  // Test Anthropic
  let anthropicStatus = 'not tested';
  let anthropicError = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 10, messages: [{ role: 'user', content: 'hi' }] })
    });
    const d = await res.json();
    if (d.error) { anthropicStatus = 'ERROR'; anthropicError = d.error.message; }
    else { anthropicStatus = 'OK'; }
  } catch(e: any) { anthropicStatus = 'EXCEPTION'; anthropicError = e.message; }

  return NextResponse.json({
    supabase_url: supabaseUrl,
    supabase_key_prefix: serviceKey.substring(0, 30),
    supabase_status: supabaseStatus,
    supabase_error: supabaseError,
    anthropic_key_prefix: anthropicKey.substring(0, 20),
    anthropic_key_length: anthropicKey.length,
    anthropic_status: anthropicStatus,
    anthropic_error: anthropicError,
  });
}
