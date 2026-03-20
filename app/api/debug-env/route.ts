import { NextResponse } from 'next/server';
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'NOT SET';
  const anthropicKey = process.env.ANTHROPIC_API_KEY || 'NOT SET';
  return NextResponse.json({
    supabase_url: supabaseUrl,
    service_key_prefix: serviceKey.substring(0, 25) + '...',
    anthropic_set: anthropicKey !== 'NOT SET',
    anthropic_prefix: anthropicKey !== 'NOT SET' ? anthropicKey.substring(0, 15) + '...' : 'NOT SET',
  });
}
