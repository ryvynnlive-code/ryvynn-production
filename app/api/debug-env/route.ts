import { NextResponse } from 'next/server';
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT SET';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT SET';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || 'NOT SET';
  return NextResponse.json({
    supabase_url: supabaseUrl,
    anon_key_prefix: anonKey.substring(0, 30) + '...',
    service_key_prefix: serviceKey.substring(0, 30) + '...',
    anthropic_key_length: anthropicKey.length,
    anthropic_key_start: anthropicKey.substring(0, 20),
    anthropic_key_end: '...' + anthropicKey.substring(anthropicKey.length - 6),
  });
}
