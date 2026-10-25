import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Never trust the userId supplied by a browser when using a service-role client.
export async function requireApiUser(req: Request, requestedUserId: unknown) {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  if (requestedUserId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return null;
}
