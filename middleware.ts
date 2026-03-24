import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication — hard blocked server-side
const protectedRoutes = ['/dashboard', '/journal', '/eternity'];

// Routes always public — crisis tier is free forever, no auth ever
const alwaysPublic = [
  '/',
  '/wall',
  '/crisis',
  '/pricing',
  '/sign-up',
  '/login',
  '/safety',
  '/press',
  '/referral',
  '/support',
  '/auth/callback',
];

// Supabase project ref extracted from URL: iofkxyljwemnnbwzcrke.supabase.co
const SUPABASE_REF = 'iofkxyljwemnnbwzcrke';

function hasValidSession(req: NextRequest): boolean {
  // Supabase stores session in cookies named:
  // sb-{ref}-auth-token  (single chunk)
  // sb-{ref}-auth-token.0, .1 ... (multi-chunk for large tokens)
  const cookies = req.cookies;
  
  // Check for any Supabase auth token cookie
  const tokenCookie = cookies.get(`sb-${SUPABASE_REF}-auth-token`);
  if (tokenCookie?.value) return true;

  // Check chunked format
  const chunked = cookies.get(`sb-${SUPABASE_REF}-auth-token.0`);
  if (chunked?.value) return true;

  // Also check generic supabase auth cookie patterns
  const allCookies = req.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    c => c.name.startsWith(`sb-${SUPABASE_REF}-auth`) && c.value
  );

  return hasAuthCookie;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Always allow API routes — they handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Always allow static/public assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Always allow public routes — no auth needed
  if (alwaysPublic.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Guardian is public — free anonymous access forever
  if (pathname.startsWith('/guardian')) {
    return NextResponse.next();
  }

  // Check protected routes
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const authenticated = hasValidSession(req);

    if (!authenticated) {
      // Redirect to sign-up, preserve intended destination
      const signUpUrl = new URL('/sign-up', req.url);
      signUpUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signUpUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
