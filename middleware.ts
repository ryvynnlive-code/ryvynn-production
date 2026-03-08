import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/journal', '/guardian', '/eternity'];

// Routes that are always public (crisis tier)
const publicRoutes = ['/', '/wall', '/crisis', '/pricing'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return res;
  }

  // Check if route requires auth
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // Note: Client-side auth check will redirect if not authenticated
    // Server-side protection can be added later with Supabase SSR
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
