'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';
import Image from 'next/image';

interface WallEntry { id: string; confession: string; transformation: string; votes: number; created_at: string; }
interface ChatMessage { role: 'user' | 'ai'; text: string; }

// ─── 100 RAW POSTS — short, imperfect, real ───────────────────────────────────
const RAW_POSTS = [
  "i don't even know why i feel like this",
  "i almost texted them again",
  "i feel stupid for caring this much",
  "i just want it to stop for a minute",
  "i didn't tell anyone this",
  "i cried in my car again today",
  "i'm so tired of pretending i'm fine",
  "i smiled at everyone today and meant none of it",
  "i keep starting over and i'm exhausted",
  "nobody asked if i was okay today",
  "i almost did something i can't take back",
  "i've been holding this for two years",
  "i don't know who i am anymore",
  "i miss who i was before all of this",
  "i said yes when i meant no. again.",
  "i feel invisible in my own life",
  "i'm scared i'm becoming someone i don't like",
  "i can't remember the last time i wasn't anxious",
  "i keep thinking about something i did five years ago",
  "i love people i can't protect and it's destroying me",
  "i made it through today. that's it. that's enough.",
  "i got sober and nobody even noticed",
  "three years. nobody knows what that cost me.",
  "i asked for help today. it didn't kill me like i thought.",
  "i finally said no to something. first time ever.",
  "i stopped pretending. it's the most honest i've been in years.",
  "i told the truth and the world didn't end",
  "i almost gave up last week. i didn't.",
  "i survived something i wasn't sure i would",
  "i'm still here. some days that's everything.",
  "i think about ending it sometimes and i hate that i do",
  "i don't want to die. i just want to feel different.",
  "i haven't slept properly in weeks",
  "i eat alone every day and pretend i like it",
  "i don't know how to ask for help",
  "i think everyone around me has it figured out except me",
  "i'm so behind on everything and i can't catch up",
  "i don't know how people just... keep going",
  "i feel like i'm watching my life happen to someone else",
  "i've been in the same spot for hours and can't move",
  "i lost my mom eight months ago and i still reach for my phone to call her",
  "i got divorced and nobody checks on me anymore",
  "i moved cities for someone and they left anyway",
  "i failed at something i told everyone i could do",
  "i haven't talked to my family in two years",
  "i think my kids deserve a better parent",
  "i haven't left the house in four days",
  "i've been sober for 8 days and today was really hard",
  "i relapsed and i'm too ashamed to tell my sponsor",
  "i haven't been honest with my therapist",
  "i feel numb and i don't know if that's better or worse",
  "i'm angry all the time and i don't know at what",
  "i don't feel anything and i don't know which is scarier",
  "i fake laugh all day at work",
  "i put my kids to bed and then just sat on the floor",
  "i check my phone hoping someone reached out. they never do.",
  "i'm scared the depression is coming back",
  "i've been pretending to be okay for so long i forgot what okay feels like",
  "i think i've been slowly disappearing and nobody noticed",
  "i need someone to just say my name",
  "i'm so lonely in a room full of people",
  "i don't think i've been happy in years",
  "i keep looking for something i can't name",
  "i'm terrified of becoming my father",
  "i watch everyone else's life and feel nothing but hollow",
  "i deleted the app and came back. three times.",
  "i know i need help. i just can't say it out loud yet.",
  "i wrote a letter i'll never send",
  "i think about one particular day and i can't get past it",
  "i wonder if things will always feel this heavy",
  "i've been carrying this for so long i forgot what light feels like",
  "i'm not where i thought i'd be by now",
  "i thought i'd have it together by 30. i'm 34.",
  "i don't know what i'm doing and i'm too scared to admit it",
  "i feel like a burden to everyone around me",
  "i wish i could talk to someone but i don't want to worry them",
  "i keep waking up at 3am and lying there",
  "i don't recognize myself in pictures anymore",
  "i think my marriage is ending and i haven't said it out loud until now",
  "i'm in a relationship and i'm lonelier than when i was single",
  "i'm pretending everything is fine to protect my kids",
  "i smiled at my coworkers and drove home and cried the whole way",
  "i'm ashamed of things i did to survive",
  "i let someone treat me badly for too long",
  "i don't know how to leave",
  "i left and i still feel guilty",
  "i finally blocked them. i feel free and destroyed at the same time.",
  "i'm in therapy but i still can't say the real thing",
  "i think about a version of my life i can't get back",
  "i'm scared that this is just who i am now",
  "i want to be better and i don't know how",
  "i keep trying and it keeps not working",
  "i woke up and the first thing i felt was dread",
  "i got through something enormous and no one even knows",
  "i'm proud of something i can't tell anyone",
  "i survived a year that should have broken me",
  "i'm still here and some days i'm surprised by that",
  "i'm not okay. and saying that feels like the first honest thing in months.",
];

// ─── Guardian — 2 sentence max, locked tone ───────────────────────────────────
async function guardian(msg: string): Promise<string> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error();
    const data = await res.json();
    const full = (data.response ?? '').trim();
    const sentences = full.match(/[^.!?]+[.!?]+/g) ?? [full];
    return sentences.slice(0, 2).join(' ').trim() || full;
  } catch {
    const f = [
      "That sounds like a lot… I'm here with you.",
      "You can say it here. I won't hold onto it.",
      "Go ahead. It's safe to let it out.",
      "I hear you. Keep going if you need to.",
      "That took something to say. I'm still here.",
    ];
    return f[Math.floor(Math.random() * f.length)];
  }
}

// ─── Wall API ─────────────────────────────────────────────────────────────────
async function fetchWall(limit = 40): Promise<WallEntry[]> {
  try {
    const r = await fetch(`/api/wall?limit=${limit}&sortBy=recent`);
    return r.ok ? (await r.json()).entries ?? [] : [];
  } catch { return []; }
}
async function postWall(text: string) {
  try {
    const r = await fetch('/api/wall', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confession: text, isAnonymous: true }) });
    return r.json();
  } catch { return { success: false }; }
}
async function voteWall(id: string) {
  try { await fetch('/api/wall', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryId: id }) }); } catch {}
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Flame({ size = 32, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0, filter: 'drop-shadow(0 0 8px rgba(0,201,232,0.5)) drop-shadow(0 0 18px rgba(124,92,191,0.3))', animation: pulse ? 'breathe 3.5s ease-in-out infinite' : 'none' }}>
      <Image src="/assets/dual-flame-logo.png" alt="" fill style={{ objectFit: 'contain' }} priority />
    </div>
  );
}

// ─── Typing counter (simulated) ───────────────────────────────────────────────
function TypingCounter() {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(Math.floor(Math.random() * 18) + 12);
    const t = setInterval(() => setN(p => Math.max(8, Math.min(47, p + Math.floor(Math.random() * 5) - 2))), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'rgba(0,201,232,0.06)', border: '1px solid rgba(0,201,232,0.14)', borderRadius: 20, marginBottom: 22 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00C9E8', display: 'inline-block', animation: 'pulsedot 2s infinite' }} />
      <span style={{ fontSize: 12, color: 'rgba(0,201,232,0.85)' }}>{n} people typing right now</span>
    </div>
  );
}

// ─── Live feed — moves every 2.8s, never pauses ───────────────────────────────
function LiveFeed({ pool }: { pool: string[] }) {
  const [cards, setCards] = useState<{ text: string; id: number }[]>([]);
  const ctr = useRef(0);

  useEffect(() => {
    if (!pool.length) return;
    setCards(pool.slice(0, 5).map((text, i) => ({ text, id: i })));
    ctr.current = 5;
    const t = setInterval(() => {
      const text = pool[Math.floor(Math.random() * pool.length)];
      const id = ++ctr.current;
      setCards(prev => [{ text, id }, ...prev.slice(0, 5)]);
    }, 2800);
    return () => clearInterval(t);
  }, [pool]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 36, zIndex: 2, background: 'linear-gradient(to bottom,#07080f,transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, zIndex: 2, background: 'linear-gradient(to top,#07080f,transparent)', pointerEvents: 'none' }} />
      <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '16px', maxHeight: 400, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00C9E8', display: 'inline-block', animation: 'pulsedot 2s infinite' }} />
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em' }}>PEOPLE ARE SAYING THIS RIGHT NOW</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cards.map((c, i) => (
            <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,201,232,0.07)', borderRadius: 10, padding: '10px 13px', animation: i === 0 ? 'newcard .45s ease forwards' : 'none', opacity: Math.max(0.35, 1 - i * 0.13) }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(216,224,238,0.78)', fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" }}>"{c.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Wall card ────────────────────────────────────────────────────────────────
function WallCard({ entry, onVote }: { entry: WallEntry; onVote: (id: string) => void }) {
  const [reflected, setReflected] = useState(false);
  const [reflText, setReflText]   = useState('');
  const [reflecting, setRefl]     = useState(false);
  const [felt, setFelt]           = useState(false);
  const [votes, setVotes]         = useState(entry.votes);

  const text = entry.transformation || entry.confession;

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '15px 17px', marginBottom: 7, transition: 'border-color .2s' }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,201,232,0.15)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)')}>
      <p style={{ margin: '0 0 11px 0', fontSize: 14, lineHeight: 1.75, color: 'rgba(216,224,238,0.84)', fontFamily: "'Lora',Georgia,serif" }}>{text}</p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={() => { if (felt) return; setFelt(true); setVotes(v => v + 1); onVote(entry.id); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${felt ? 'rgba(0,201,232,0.32)' : 'rgba(255,255,255,0.09)'}`, borderRadius: 20, padding: '4px 10px', color: felt ? 'rgba(0,201,232,0.9)' : 'rgba(255,255,255,0.28)', fontSize: 11.5, cursor: felt ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
          <span>{felt ? '🔥' : '🤍'}</span><span>felt this{votes > 0 ? ` · ${votes}` : ''}</span>
        </button>
        {!reflected && !reflecting && (
          <button onClick={async () => { setRefl(true); const r = await guardian(`Reflect warmly in 1-2 sentences, no advice, no questions: "${entry.confession}"`); setReflText(r); setReflected(true); setRefl(false); }}
            style={{ background: 'none', border: '1px solid rgba(124,92,191,0.2)', borderRadius: 20, padding: '4px 10px', color: 'rgba(124,92,191,0.65)', fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,191,0.5)'; (e.currentTarget as HTMLElement).style.color = 'rgba(124,92,191,0.95)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,191,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(124,92,191,0.65)'; }}>
            Let RYVYNN reflect this
          </button>
        )}
        {reflecting && <span style={{ fontSize: 11.5, color: 'rgba(0,201,232,0.45)', fontStyle: 'italic' }}>Ryvynn is here…</span>}
      </div>
      {reflected && <div style={{ marginTop: 11, padding: '10px 12px', background: 'rgba(0,201,232,0.05)', border: '1px solid rgba(0,201,232,0.1)', borderRadius: 9, animation: 'fadein .5s ease' }}><p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'rgba(0,201,232,0.82)', fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" }}>{reflText}</p></div>}
    </div>
  );
}

// ─── Chat modal ───────────────────────────────────────────────────────────────
function ChatModal({ onShare, onClose }: { onShare: (t: string) => Promise<void>; onClose: () => void }) {
  const [msgs, setMsgs]               = useState<ChatMessage[]>([]);
  const [input, setInput]             = useState('');
  const [typing, setTyping]           = useState(false);
  const [showLoop, setShowLoop]       = useState(false);
  const [lastMsg, setLastMsg]         = useState('');
  const [sharing, setSharing]         = useState(false);
  const [shared, setShared]           = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setTimeout(() => textRef.current?.focus(), 80); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = useCallback(async () => {
    if (!input.trim() || typing) return;
    const msg = input.trim();
    setLastMsg(msg); setInput(''); setShowLoop(false);
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setTyping(true);
    const reply = await guardian(msg);
    setMsgs(prev => [...prev, { role: 'ai', text: reply }]);
    setTyping(false); setShowLoop(true);
  }, [input, typing]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(18px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadein .2s ease' }}>
      <div style={{ width: '100%', maxWidth: 520, height: '86vh', maxHeight: 640, background: '#070810', border: '1px solid rgba(0,201,232,0.18)', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 120px rgba(0,201,232,0.06)' }}>
        {/* Header */}
        <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Flame size={34} pulse />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#d8e0ee' }}>Guardian</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(0,201,232,0.6)' }}>Anonymous · Nothing saved</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: 4, fontFamily: 'inherit' }}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {msgs.length === 0 && (
            <div style={{ margin: 'auto', textAlign: 'center', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Flame size={48} pulse /></div>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 14, lineHeight: 1.8, fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" }}>
                You don't have to explain yourself.<br />Just say what's there.
              </p>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 7, animation: 'fadein .35s ease' }}>
              {m.role === 'ai' && <div style={{ marginTop: 2 }}><Flame size={18} /></div>}
              <div style={{ maxWidth: '80%', padding: '10px 13px', borderRadius: m.role === 'user' ? '13px 13px 4px 13px' : '13px 13px 13px 4px', background: m.role === 'user' ? 'rgba(0,201,232,0.1)' : 'rgba(255,255,255,0.05)', border: m.role === 'user' ? '1px solid rgba(0,201,232,0.18)' : '1px solid rgba(255,255,255,0.07)', fontSize: 14, lineHeight: 1.65, color: 'rgba(216,224,238,0.88)', fontFamily: m.role === 'ai' ? "'Lora',Georgia,serif" : 'inherit' }}>
                {m.text}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', animation: 'fadein .3s ease' }}>
              <Flame size={18} />
              <div style={{ padding: '9px 14px', borderRadius: '13px 13px 13px 4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', fontSize: 13, color: 'rgba(0,201,232,0.5)', fontStyle: 'italic' }}>Ryvynn is here…</div>
            </div>
          )}

          {/* ── GROWTH LOOP ───────────────────────────────────────────── */}
          {showLoop && !typing && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: '14px 15px', animation: 'fadein .6s ease' }}>
              {shared ? (
                <p style={{ margin: 0, fontSize: 13, textAlign: 'center', color: 'rgba(0,201,232,0.8)', fontStyle: 'italic', fontFamily: "'Lora',Georgia,serif" }}>Someone will read that and feel less alone. 🔥</p>
              ) : (
                <>
                  <p style={{ margin: '0 0 11px 0', fontSize: 13.5, lineHeight: 1.6, color: 'rgba(216,224,238,0.6)' }}>
                    Before you go — want to leave one line for someone else?
                  </p>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <button onClick={async () => { setSharing(true); await onShare(lastMsg); setShared(true); setSharing(false); }} disabled={sharing}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid rgba(0,201,232,0.28)', background: 'rgba(0,201,232,0.08)', color: 'rgba(0,201,232,0.9)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', opacity: sharing ? 0.6 : 1 }}>
                      {sharing ? 'Sharing…' : 'Share anonymously'}
                    </button>
                    <button onClick={() => setShowLoop(false)}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'none', color: 'rgba(255,255,255,0.32)', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Keep private
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 7, alignItems: 'flex-end' }}>
          <textarea ref={textRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Say anything. You're safe here." rows={2}
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 11, padding: '9px 12px', color: '#d8e0ee', fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color .2s' }}
            onFocus={e => ((e.target as HTMLElement).style.borderColor = 'rgba(0,201,232,0.28)')}
            onBlur={e => ((e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.09)')} />
          <button onClick={send} disabled={!input.trim() || typing}
            style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: input.trim() && !typing ? 'linear-gradient(135deg,rgba(0,201,232,0.22),rgba(124,92,191,0.22))' : 'rgba(255,255,255,0.04)', border: `1px solid ${input.trim() && !typing ? 'rgba(0,201,232,0.35)' : 'rgba(255,255,255,0.07)'}`, color: input.trim() && !typing ? 'rgba(0,201,232,0.9)' : 'rgba(255,255,255,0.2)', fontSize: 17, cursor: input.trim() && !typing ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  useI18n();
  const [chatOpen, setChatOpen]     = useState(false);
  const [showFloat, setShowFloat]   = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [wallEntries, setWallEntries] = useState<WallEntry[]>([]);
  const [wallTab, setWallTab]       = useState<'heard'|'through'>('heard');
  const [wallLoading, setWallLoading] = useState(true);
  const [feedPool, setFeedPool]     = useState<string[]>(RAW_POSTS);

  useEffect(() => {
    fetchWall(50).then(entries => {
      setWallEntries(entries);
      if (entries.length > 0) {
        const real = entries.map(e => e.confession || e.transformation).filter(Boolean);
        setFeedPool([...real, ...RAW_POSTS]);
      }
      setWallLoading(false);
    });
    const t = setTimeout(() => setShowFloat(true), 10000);
    if (!localStorage.getItem('ryvynn-onboarded')) setShowOnboard(true);
    return () => clearTimeout(t);
  }, []);

  const handleShare = useCallback(async (text: string) => {
    const r = await postWall(text);
    if (r.success && !r.blocked) {
      const n: WallEntry = { id: `n-${Date.now()}`, confession: text, transformation: text, votes: 0, created_at: '' };
      setWallEntries(prev => [n, ...prev]);
      setFeedPool(prev => [text, ...prev]);
    }
    setChatOpen(false);
  }, []);

  const THROUGH = /\b(sober|got through|made it|better|survived|finally|recovery|healed|grateful|proud|still here|didn.t|through something)\b/i;
  const filtered = wallEntries.filter(e => wallTab === 'through' ? THROUGH.test(e.confession || e.transformation) : !THROUGH.test(e.confession || e.transformation));

  const displayWall = filtered.length > 0 ? filtered : RAW_POSTS
    .filter(t => wallTab === 'through' ? THROUGH.test(t) : !THROUGH.test(t))
    .slice(0, 20)
    .map((text, i): WallEntry => ({ id: `s${i}`, confession: text, transformation: text, votes: 0, created_at: '' }));

  return (
    <main style={{ minHeight: '100vh', background: '#07080f', color: '#d8e0ee', fontFamily: "'Inter',system-ui,sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        ::placeholder { color: rgba(255,255,255,0.22); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,201,232,0.15); border-radius: 2px; }
        @keyframes fadein  { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes newcard { from { opacity:0; transform:translateY(-10px) scale(.98); } to { opacity:1; transform:none; } }
        @keyframes breathe { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
        @keyframes gradshift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes pulsedot { 0%,100% { box-shadow:0 0 0 0 rgba(0,201,232,0.4); } 60% { box-shadow:0 0 0 9px rgba(0,201,232,0); } }
      `}</style>

      {chatOpen && <ChatModal onShare={handleShare} onClose={() => setChatOpen(false)} />}

      {/* ONBOARDING */}
      {showOnboard && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, animation: 'fadein .3s ease' }}>
          <div style={{ width: '100%', maxWidth: 370, background: '#0a0c14', border: '1px solid rgba(0,201,232,0.16)', borderRadius: 20, padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Flame size={66} pulse /></div>
            <h2 style={{ fontSize: 20, fontWeight: 400, marginBottom: 7, fontFamily: "'Lora',Georgia,serif" }}>What brings you here?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, marginBottom: 22 }}>No wrong answer. Nothing saved.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Get it out', sub: 'Talk to Guardian. Private. Anonymous. Nothing saved.', border: 'rgba(0,201,232,.26)', bg: 'rgba(0,201,232,.07)', color: '#00C9E8', fn: () => { localStorage.setItem('ryvynn-onboarded','1'); setShowOnboard(false); setChatOpen(true); } },
                { label: 'Be heard', sub: 'Leave something on the wall. Or read what others left.', border: 'rgba(124,92,191,.24)', bg: 'rgba(124,92,191,.07)', color: '#7C5CBF', fn: () => { localStorage.setItem('ryvynn-onboarded','1'); setShowOnboard(false); document.getElementById('wall')?.scrollIntoView({behavior:'smooth'}); } },
                { label: 'Just read', sub: "See what others are carrying. No pressure.", border: 'rgba(255,255,255,.09)', bg: 'rgba(255,255,255,.03)', color: '#d8e0ee', fn: () => { localStorage.setItem('ryvynn-onboarded','1'); setShowOnboard(false); document.getElementById('wall')?.scrollIntoView({behavior:'smooth'}); } },
              ].map(o => (
                <button key={o.label} onClick={o.fn} style={{ display: 'block', width: '100%', padding: '13px 17px', textAlign: 'left', background: o.bg, border: `1.5px solid ${o.border}`, borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'transform .15s' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.transform = 'none')}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: o.color, marginBottom: 3 }}>{o.label}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{o.sub}</div>
                </button>
              ))}
            </div>
            <button onClick={() => { localStorage.setItem('ryvynn-onboarded','1'); setShowOnboard(false); }} style={{ marginTop: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Skip</button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '10px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(7,8,15,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Flame size={34} />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.07em', background: 'linear-gradient(135deg,#00C9E8,#7C5CBF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RYVYNN</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/wall" style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13, textDecoration: 'none', transition: 'color .15s' }}
            onMouseEnter={e => ((e.target as HTMLElement).style.color = '#00C9E8')}
            onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(255,255,255,0.32)')}>The Wall</Link>
          <button onClick={() => setChatOpen(true)} style={{ padding: '8px 18px', borderRadius: 99, background: 'rgba(0,201,232,0.1)', border: '1.5px solid rgba(0,201,232,0.38)', color: '#00C9E8', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,201,232,0.18)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(0,201,232,0.1)')}>Start talking</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 44, maxWidth: 1100, margin: '0 auto', padding: '108px 32px 68px', alignItems: 'center' }}>
        {/* Left */}
        <div style={{ animation: 'fadein .8s ease' }}>
          <TypingCounter />
          <h1 style={{ fontSize: 'clamp(30px,4vw,50px)', lineHeight: 1.17, fontWeight: 400, fontFamily: "'Lora',Georgia,serif", marginBottom: 16, letterSpacing: '-0.01em' }}>
            Say the thing you've never said out loud.
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.38)', marginBottom: 10, fontWeight: 300 }}>
            No names. No memory. No judgment.
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: 34, fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' }}>
            You don't have to carry it alone for another minute.
          </p>
          <button onClick={() => setChatOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 28px', borderRadius: 99, background: 'rgba(0,201,232,0.1)', border: '1.5px solid rgba(0,201,232,0.42)', color: '#00C9E8', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 28px rgba(0,201,232,0.1)', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,201,232,0.18)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,201,232,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
            <Flame size={20} />Start talking
          </button>
          {/* Trust — stripped */}
          <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['No accounts','No tracking','Nothing saved','Gone when you leave'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,0.25)' }}>
                <span style={{ color: 'rgba(0,201,232,0.4)' }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
        {/* Right — live feed */}
        <div style={{ animation: 'fadein 1s ease .12s both' }}>
          <LiveFeed pool={feedPool} />
        </div>
      </section>

      {/* BRIDGE */}
      <section style={{ maxWidth: 580, margin: '0 auto', padding: '10px 24px 60px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 'clamp(18px,2.4vw,24px)', lineHeight: 1.7, fontWeight: 400, fontStyle: 'italic', color: 'rgba(216,224,238,0.4)' }}>
          Most people never say what they're really going through.{' '}
          <span style={{ background: 'linear-gradient(135deg,#00C9E8,#7C5CBF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            This is where they finally do.
          </span>
        </p>
      </section>

      {/* WALL */}
      <section id="wall" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Flame size={50} pulse /></div>
          <h2 style={{ fontFamily: "'Lora',Georgia,serif", fontSize: 'clamp(22px,3vw,34px)', fontWeight: 400, marginBottom: 5 }}>The Wall</h2>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>Anonymous. Unfiltered. Real.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 3, marginBottom: 18 }}>
          {[{id:'heard',label:'Need to be heard'},{id:'through',label:'Got through something'}].map(tab => (
            <button key={tab.id} onClick={() => setWallTab(tab.id as 'heard'|'through')}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: 'none', background: wallTab === tab.id ? 'rgba(0,201,232,0.09)' : 'none', color: wallTab === tab.id ? 'rgba(0,201,232,0.9)' : 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: wallTab === tab.id ? 500 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', borderBottom: wallTab === tab.id ? '1px solid rgba(0,201,232,0.22)' : '1px solid transparent' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {wallLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><Flame size={26} pulse /><p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 13, marginTop: 10, fontStyle: 'italic' }}>Loading voices…</p></div>
        ) : (
          <>
            {displayWall.map(e => <WallCard key={e.id} entry={e} onVote={voteWall} />)}
            {displayWall.length === 0 && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 13, padding: 28 }}>Be the first to leave something.</p>}
          </>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', padding: '22px 22px', background: 'rgba(124,92,191,0.05)', border: '1px solid rgba(124,92,191,0.11)', borderRadius: 13 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 14 }}>Your story belongs here too.</p>
          <button onClick={() => setChatOpen(true)} style={{ padding: '9px 22px', borderRadius: 24, background: 'rgba(124,92,191,0.1)', border: '1px solid rgba(124,92,191,0.26)', color: 'rgba(124,92,191,0.82)', fontSize: 13.5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all .2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.18)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.1)')}>
            Add your voice →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '22px 26px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Flame size={20} /><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.16)', letterSpacing: '0.05em' }}>RYVYNN · AONIXX · NEXXT GEN INNOVATIONS LLC</span></div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.16)', fontFamily: "'Lora',Georgia,serif", fontStyle: 'italic' }}>From our darkest hours to our brightest days.</span>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <a href="/privacy-policy" style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.04em' }}>Privacy Policy</a>
          <a href="/terms-of-service" style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.04em' }}>Terms of Service</a>
          <a href="/compliance" style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.04em' }}>Legal &amp; Compliance</a>
          <a href="/research" style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.04em' }}>Evidence Framework</a>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.04em' }}>RYVYNN is an AI companion — not a licensed therapist or healthcare provider.</span>
        </div>
      </footer>

      {/* FLOAT */}
      {showFloat && (
        <div style={{ position: 'fixed', bottom: 18, right: 18, zIndex: 50, animation: 'fadein .4s ease' }}>
          <button onClick={() => setChatOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(7,8,15,0.97)', border: '1.5px solid rgba(0,201,232,0.36)', borderRadius: 99, padding: '10px 17px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 0 28px rgba(0,201,232,0.12)', backdropFilter: 'blur(20px)', transition: 'all .2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,201,232,0.62)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(0,201,232,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,201,232,0.36)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(0,201,232,0.12)'; }}>
            <Flame size={18} /><span style={{ fontSize: 13, fontWeight: 500, color: '#00C9E8' }}>Talk now — nothing saved</span>
          </button>
        </div>
      )}
    </main>
  );
}
