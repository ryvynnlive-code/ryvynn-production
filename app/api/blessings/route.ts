import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function generateBlessing() {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent('Generate a short powerful RYVYNN blessing for someone struggling. 2-3 sentences. Raw and real. Dual Flame energy. No platitudes.');
  return result.response.text();
}
export async function POST(req: Request) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { secret } = await req.json();
  if (secret !== process.env.CRON_SECRET) return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  const threeDaysAgo = new Date(Date.now()-3*24*60*60*1000).toISOString();
  const { data: users } = await supabase.from('profiles').select('id').lt('last_sign_in_at', threeDaysAgo).limit(10);
  const results = [];
  for (const u of (users||[])) {
    const blessing = await generateBlessing();
    await supabase.from('blessings_queue').insert({ user_id:u.id, blessing_text:blessing, scheduled_for:new Date(Date.now()+Math.random()*30*60*60*1000).toISOString() });
    results.push(u.id);
  }
  return NextResponse.json({ queued:results.length });
}
export async function GET() { return NextResponse.json({ status:'Blessing engine active' }); }
