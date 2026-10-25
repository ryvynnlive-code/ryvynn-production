import { supabase } from '@/lib/supabase';

// Attach a Supabase token only to same-origin private API requests.
export async function authenticatedFetch(input: string, init: RequestInit = {}) {
  if (!input.startsWith('/api/') || input.startsWith('//')) {
    throw new Error('Private API requests must be same-origin');
  }
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(input, { ...init, headers });
}
