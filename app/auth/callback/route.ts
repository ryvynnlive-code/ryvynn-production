import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as 'email' | 'recovery' | 'invite' | null;
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Handle token_hash (email confirmation link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.error('Auth callback OTP error:', error.message);
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, request.url));
  }

  // Handle PKCE code flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    console.error('Auth callback code error:', error.message);
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error.message)}`, request.url));
  }

  // No valid params - redirect home
  return NextResponse.redirect(new URL('/', request.url));
}
