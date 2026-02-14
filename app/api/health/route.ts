import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '7.1.1',
    service: 'RYVYNN',
    timestamp: new Date().toISOString()
  });
}
