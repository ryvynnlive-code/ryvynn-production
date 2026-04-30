import { NextResponse } from 'next/server';

const PROJECT_ID = 'prj_t0rngQDZWhLRn8jXUlY6xCzeAljh';
const TEAM_ID = 'team_2LSzPFJill2AgYbcStgZG1wD';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'RYVYNN_FLAME_IGNITE_2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const key = searchParams.get('key');
  const value = searchParams.get('value');
  const vToken = searchParams.get('vt');

  if (!key || !value || !vToken) {
    return NextResponse.json({ error: 'Missing key, value, or vt' }, { status: 400 });
  }

  const baseUrl = `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`;

  try {
    const listRes = await fetch(baseUrl, {
      headers: { 'Authorization': `Bearer ${vToken}` },
    });
    const listData = await listRes.json();
    const existing = listData.envs?.find((e: any) => e.key === key);

    let result;
    if (existing) {
      const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${existing.id}?teamId=${TEAM_ID}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${vToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, type: 'encrypted', target: ['production', 'preview', 'development'] }),
      });
      const d = await res.json();
      result = { action: 'updated', key, ok: res.ok, status: res.status, data: d };
    } else {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${vToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview', 'development'] }),
      });
      const d = await res.json();
      result = { action: 'created', key, ok: res.ok, status: res.status, data: d };
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
