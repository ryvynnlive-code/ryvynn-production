import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iofkxyljwemnnbwzcrke.supabase.co';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Verifies the caller's Supabase access token (sent as `Authorization: Bearer <jwt>`)
 * and returns the authenticated user id, or null if the token is missing/invalid.
 *
 * This is the ONLY trustworthy source of the caller's identity. API routes must never
 * trust a `userId` sent in the request body or query string — with the service-role key
 * (which bypasses RLS) that would let anyone read/write another user's data.
 */
export async function getAuthedUserId(req: NextRequest): Promise<string | null> {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  try {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
