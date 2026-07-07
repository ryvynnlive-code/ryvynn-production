import { supabase } from '@/lib/supabase';

/**
 * fetch() wrapper that attaches the current Supabase access token as a
 * `Authorization: Bearer <jwt>` header. Use this for every call to an API route
 * that acts on the signed-in user's data, so the server can verify identity from
 * the token instead of trusting a client-supplied userId.
 */
export async function authedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
