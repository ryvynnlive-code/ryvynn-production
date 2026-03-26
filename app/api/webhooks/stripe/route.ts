import { NextRequest, NextResponse } from 'next/server';

// Legacy webhook URL — forwards to canonical handler at /api/stripe/webhook
// Both URLs are registered in Stripe dashboard for redundancy.
// All logic lives in /api/stripe/webhook/route.ts

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((val, key) => { headers[key] = val; });

  const canonical = new URL('/api/stripe/webhook', req.url);
  const forwarded = await fetch(canonical.toString(), {
    method: 'POST',
    headers,
    body,
  });

  const responseBody = await forwarded.text();
  return new NextResponse(responseBody, {
    status: forwarded.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
