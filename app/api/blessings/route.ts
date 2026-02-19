import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateBlessing() {
  const msg = await anthropic.messages.create({ model:'claude-sonnet-4-6', max_tokens:200, messages:[{role:'user',content:'Generate a short powerful RYVYNN blessing for someone struggling. 2-3 sentences. Raw and real. Dual Flame energy. No platitudes.'}] });
  return (msg.content[0] as {text:string}).text;
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
