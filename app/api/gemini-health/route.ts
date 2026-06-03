import { NextRequest, NextResponse } from 'next/server';

// TEMP diagnostic — remove after use. Gated by a query secret.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'flamecheck_2026') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ hasKey: false });
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key);
    const text = await res.text();
    let models: string[] | undefined;
    try {
      const j = JSON.parse(text);
      models = (j.models || []).map((m: { name?: string }) => m.name || '').filter(Boolean);
    } catch { /* not json */ }
    return NextResponse.json({
      hasKey: true,
      keyTail: key.slice(-4),
      status: res.status,
      ok: res.ok,
      modelCount: models?.length ?? 0,
      models: models?.slice(0, 60),
      bodySnippet: models ? undefined : text.slice(0, 500),
    });
  } catch (e) {
    return NextResponse.json({ hasKey: true, fetchError: String(e).slice(0, 300) });
  }
}
