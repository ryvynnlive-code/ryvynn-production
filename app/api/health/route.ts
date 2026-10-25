import { NextResponse } from 'next/server';

// v8.1.1
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    access: 'free',
    billingRequired: false,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    version: '8.2.0',
    name: 'RYVYNN DARK',
    tagline: 'From Our Darkest Hours to Our Brightest Days',
    timestamp: new Date().toISOString(),
  });
}
