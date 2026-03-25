import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if ((body as any).secret !== 'RYVYNN_MIGRATE_FINAL_2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const raw = process.env.DATABASE_URL || 'NOT_SET';
    if (raw === 'NOT_SET') return NextResponse.json({ error: 'DATABASE_URL not set' });

    // Parse without exposing password
    let parsed: any = {};
    try {
      const u = new URL(raw);
      parsed = {
        protocol: u.protocol,
        username: u.username,
        host: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hasPassword: u.password.length > 0,
        passwordLength: u.password.length,
        isPooler: u.hostname.includes('pooler.supabase.com'),
        isDirect: u.hostname.includes('.supabase.co') && !u.hostname.includes('pooler'),
        rawPort: raw.includes(':6543') ? '6543-txn' : raw.includes(':5432') ? '5432-session' : 'unknown',
      };

      // Try the transformation and show result (no password)
      let transformed = raw.replace(':6543/', ':5432/');
      const u2 = new URL(transformed);
      if (u2.username === 'postgres' && u2.hostname.includes('pooler.supabase.com')) {
        u2.username = 'postgres.iofkxyljwemnnbwzcrke';
        transformed = u2.toString();
      }
      const u3 = new URL(transformed);
      parsed.transformedUsername = u3.username;
      parsed.transformedHost = u3.hostname;
      parsed.transformedPort = u3.port;
      parsed.transformedPasswordLength = u3.password.length;
    } catch(e: any) {
      parsed.parseError = e.message;
      parsed.rawStart = raw.substring(0, 30) + '...';
    }

    // Also check if NEXT_PUBLIC_SUPABASE_URL is set (to confirm Supabase project)
    parsed.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET';

    return NextResponse.json({ debug: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
