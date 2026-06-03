import { NextRequest, NextResponse } from 'next/server';

// TEMP diagnostic — remove after use. Gated by a query secret.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== 'flamecheck_2026') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ hasKey: false });

  const model = searchParams.get('model') || 'gemini-2.0-flash';
  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Reply with the single word: OK' }] }] }),
      }
    );
    const text = await res.text();
    return NextResponse.json({
      model,
      genStatus: res.status,
      genOk: res.ok,
      bodySnippet: text.slice(0, 600),
    });
  } catch (e) {
    return NextResponse.json({ model, fetchError: String(e).slice(0, 300) });
  }
}
