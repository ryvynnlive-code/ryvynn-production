import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/crisis/deep')) return NextResponse.next();
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data:{ user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.redirect(new URL('/login', req.url));
  const { data: p } = await supabase.from('profiles').select('is_premium,free_crisis_used').eq('id',user.id).single();
  if (p?.is_premium) return NextResponse.next();
  if ((p?.free_crisis_used||0)<1) { await supabase.from('profiles').update({free_crisis_used:(p?.free_crisis_used||0)+1}).eq('id',user.id); return NextResponse.next(); }
  return NextResponse.redirect(new URL('/pricing?msg=Deep crisis access requires Soul Token', req.url));
}
export const config = { matcher:['/crisis/deep/:path*'] };
