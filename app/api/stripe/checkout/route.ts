import { NextResponse } from 'next/server';

// Retire paid access at the server, including old clients and bookmarked links.
export async function POST() {
  return NextResponse.json({ error: 'RYVYNN is free. No subscription or token purchase is required.', access: 'free', url: '/guardian' }, { status: 410 });
}
