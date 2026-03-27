'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Quote { text: string; time: string; tag: string; }
interface Tool  { icon: string; title: string; desc: string; }
interface Step  { n: string; title: string; desc: string; }
interface CompareRow { feature: string; r: boolean; a: boolean; b: boolean; c: boolean; }
interface StatRow { label: string; value: string; positive: boolean; }
interface SoulFeature { icon: string; title: string; desc: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const QUOTES: Quote[] = [
  { text: "I typed something I've never said out loud to anyone. It didn't judge me. It just... stayed.", time: "3:12 AM", tag: "Recovery, 11 months" },
  { text: "My therapist has a 4-month waitlist. RYVYNN was there in 30 seconds when I couldn't breathe.", time: "11:48 PM", tag: "Anonymous" },
  { text: "I tested it. Cleared my browser, came back. It remembered nothing. That's the only reason I kept returning.", time: "7:33 AM", tag: "Privacy-conscious user" },
  { text: "I don't want advice. I don't want fixing. I needed somewhere to put it. This is that place.", time: "2:47 AM", tag: "Anonymous" },
];

const TOOLS: Tool[] = [
  { icon: "⚡", title: "Instant Grounding Arsenal", desc: "Panic spike in real time? 4-7-8 breath, 5-4-3-2-1 senses, body scan — deployed in seconds, not after intake forms." },
  { icon: "🔒", title: "Bulletproof Privacy Fortress", desc: "Zero memory. Zero storage. Structurally impossible to subpoena, leak, or breach. Unlike every other AI in the 2025-26 headlines." },
  { icon: "🎯", title: "Clinical Crisis Radar", desc: "Four-tier crisis detection trained on real clinical screening tools. If it gets dark, RYVYNN knows — and responds without panic." },
  { icon: "🌙", title: "Always Awake", desc: "4 AM, holidays, blackout spirals. No waitlist. No copay. No judgment. No voicemail. Always right here." },
  { icon: "🪙", title: "Soul Token Economy", desc: "Streaks, breakthroughs, milestones — earned as tokens. Unlock deeper features. Your healing builds real value." },
  { icon: "🔮", title: "Digital Eternity Vault", desc: "Leave encrypted letters to people you love — delivered years from now. Your words. Your timeline. Your vault." },
];

const STEPS: Step[] = [
  { n: "01", title: "Open. Type or speak.", desc: "Whatever spills out. Raw. Messy. No introduction. No history required. Just say it." },
  { n: "02", title: "RYVYNN meets you there.", desc: "Grounding. Breathing. Reflection. Crisis redirection. Whatever helps right now, right here." },
  { n: "03", title: "Leave lighter. Zero trace.", desc: "Close the window. Your words vanish completely — not archived, not trained on, not anywhere. You're free." },
];

const COMPARE: CompareRow[] = [
  { feature: "Data stored or logged",          r: false, a: true,  b: true,  c: true  },
  { feature: "Trained on your conversations",  r: false, a: true,  b: false, c: true  },
  { feature: "Fully anonymous — no login",     r: true,  a: false, b: false, c: false },
  { feature: "Free crisis access, forever",    r: true,  a: false, b: false, c: false },
  { feature: "Works instantly in browser",     r: true,  a: false, b: false, c: true  },
  { feature: "Can be subpoenaed",              r: false, a: true,  b: true,  c: true  },
  { feature: "Soul tokens & milestones",       r: true,  a: false, b: false, c: false },
  { feature: "Digital Eternity vault",         r: true,  a: false, b: false, c: false },
];

const THERAPY_STATS: StatRow[] = [
  { label: "Avg therapy session cost", value: "$175+",      positive: false },
  { label: "Average waitlist",         value: "4–6 months", positive: false },
  { label: "RYVYNN core tier",         value: "$0",         positive: true  },
  { label: "Wait time to start",       value: "< 3 seconds",positive: true  },
  { label: "Name required",            value: "Never",      positive: true  },
];

const SOUL_FEATURES: SoulFeature[] = [
  { icon: "🪙", title: "Soul Tokens",          desc: "Earn tokens for streaks, breakthroughs, and daily check-ins. Tokens unlock deeper features and premium access." },
  { icon: "🤝", title: "AI Guardian Bond",     desc: "Your Guardian grows with you. The longer you return, the deeper the connection. Still anonymous. Always yours." },
  { icon: "✨", title: "Miracle Wall",          desc: "Your confession transforms into a miracle. Stripped of identity, your breakthrough becomes someone else's lifeline." },
  { icon: "📜", title: "Digital Eternity Vault",desc: "Encrypted letters to your bloodline — delivered years from now. Your words, your vault, your timeline." },
];

const WHO: string[] = [
  "The weight feels too big to explain to people who love you",
  "You've been burned by apps that 'remember' too much",
  "You need to vent without commitment, follow-up, or a bill",
  "Therapy waitlists are months long — the spiral is now",
  "You want human-level warmth without the human risk",
  "You're in recovery and need a space with zero judgment",
  "You're a caregiver who has no one caring for you",
  "You've never talked to anyone about this. You're not starting today with a human.",
];

const PRIVACY_POINTS: string[] = [
  "We don't collect chats.",
  "We don't train on you.",
  "We don't sell, share, or store.",
  "Structurally impossible to access.",
  "Governments can't subpoena nothing.",
  "Hackers can't breach data we don't hold.",
];

const TRUST_STRIP: string[] = [
  "🔒 Structurally Private",
  "🕳️ No Data Stored",
  "👻 Fully Anonymous",
  "❤️ Free Core Forever",
  "⚡ No Download Needed",
  "🧠 Clinical Crisis Radar",
  "🌐 Opens in 3 Seconds",
];

const CONFESSIONS = [
  "I don't want to die. I just don't want to feel like this anymore.",
  "I smile all day and fall apart at night.",
  "I have no one I can actually talk to.",
  "I feel alone even when I'm surrounded by people.",
  "I've been pretending I'm fine for so long I forgot what fine feels like.",
  "Sometimes I disappear into myself and nobody notices.",
];

const PRICING_TIERS = [
  {
    name: "Free Forever",
    price: "$0",
    sub: "Always. No card.",
    color: "#7a8499",
    border: "rgba(122,132,153,0.3)",
    features: ["Anonymous Guardian AI", "Crisis routing to 988", "Public miracle wall", "Basic grounding tools"],
    cta: "Start Now",
    href: "/guardian",
    highlight: false,
  },
  {
    name: "Solo",
    price: "$12.12",
    sub: "/month · First month $3.69",
    color: "#00D9FF",
    border: "rgba(0,217,255,0.5)",
    badge: "Most Popular",
    features: ["120 Soul Tokens/mo", "Encrypted Dark Journal", "Digital Eternity Vault", "Daily streaks + milestones", "Extended Guardian sessions", "Shadow → Miracle engine"],
    cta: "Ignite the Flame",
    href: "/pricing",
    highlight: true,
    coupon: "FIRSTFLAME",
  },
  {
    name: "Family",
    price: "$36.93",
    sub: "/month · Up to 6 members",
    color: "#8B5CF6",
    border: "rgba(139,92,246,0.5)",
    features: ["369 Soul Tokens shared", "Family crisis visibility", "Shared Miracle Wall", "Everything in Solo"],
    cta: "Protect Your Family",
    href: "/pricing",
    highlight: false,
  },
  {
    name: "Lifetime",
    price: "$369.36",
    sub: "One time. Forever.",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.4)",
    badge: "Founder's Tier",
    features: ["Everything, forever", "Priority AI access", "Founder badge", "All future features"],
    cta: "Own It Forever",
    href: "/pricing",
    highlight: false,
  },
];

// ─── FIX: Demo calls internal /api/guardian/chat — NOT Anthropic directly ──────
// Previous version called https://api.anthropic.com/v1/messages from browser
// without auth header → always 401. Now uses the Gemini-backed server route.
async function getRYVYNNDemoResponse(msg: string): Promise<string | null> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.response ?? null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [demoMsg, setDemoMsg]       = useState('');
  const [demoReply, setDemoReply]   = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [showFloat, setShowFloat]   = useState(false);
  const [chatStep, setChatStep]     = useState(0);
  const [confIdx, setConfIdx]       = useState(0);
  const [confBlur, setConfBlur]     = useState(true);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowFloat(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ts = [
      setTimeout(() => setChatStep(1), 900),
      setTimeout(() => setChatStep(2), 2500),
      setTimeout(() => setChatStep(3), 4200),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setConfIdx(i => (i + 1) % CONFESSIONS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleDemo = async () => {
    if (!demoMsg.trim() || loading) return;
    setLoading(true);
    setDemoReply(null);
    const reply = await getRYVYNNDemoResponse(demoMsg);
    setDemoReply(reply ?? "I'm right here. This space is completely yours — take a breath and say what you need to say.");
    setLoading(false);
  };

  const scrollToDemo = () =>
    demoRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="min-h-screen bg-[#06080f] text-[#dde4f0] overflow-x-hidden font-sans">

      {/* ── GLOBAL STYLES ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        .ryvynn-landing { font-family: 'Jost', sans-serif; }
        .rv-serif { font-family: 'Cormorant Garamond', serif; }
        @keyframes rv-breathe  { 0%,100%{transform:scale(1);opacity:.14} 50%{transform:scale(1.3);opacity:.26} }
        @keyframes rv-fadeup   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rv-fadein   { from{opacity:0} to{opacity:1} }
        @keyframes rv-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(0,217,255,.45)} 60%{box-shadow:0 0 0 18px rgba(0,217,255,0)} }
        @keyframes rv-floatin  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rv-blink    { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes rv-glow     { 0%,100%{text-shadow:0 0 20px rgba(0,217,255,.4)} 50%{text-shadow:0 0 55px rgba(0,217,255,.95),0 0 90px rgba(139,92,246,.5)} }
        @keyframes rv-bob      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        @keyframes rv-confslide { 0%{opacity:0;transform:translateY(8px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-8px)} }
        .rv-anim-breathe  { animation: rv-breathe  9s ease-in-out infinite; }
        .rv-anim-breathe2 { animation: rv-breathe 12s ease-in-out infinite reverse; }
        .rv-anim-fadeup1  { animation: rv-fadeup .7s ease forwards; opacity: 0; animation-delay: .1s; }
        .rv-anim-fadeup2  { animation: rv-fadeup .8s ease forwards; opacity: 0; animation-delay: .25s; }
        .rv-anim-fadeup3  { animation: rv-fadeup .8s ease forwards; opacity: 0; animation-delay: .4s; }
        .rv-anim-fadeup4  { animation: rv-fadeup .8s ease forwards; opacity: 0; animation-delay: .52s; }
        .rv-anim-fadeup5  { animation: rv-fadeup .8s ease forwards; opacity: 0; animation-delay: .65s; }
        .rv-anim-fadeup6  { animation: rv-fadeup .8s ease forwards; opacity: 0; animation-delay: .85s; }
        .rv-anim-fadein7  { animation: rv-fadein 1.2s ease forwards; opacity: 0; animation-delay: 1s; }
        .rv-anim-fadein   { animation: rv-fadein .5s ease forwards; }
        .rv-anim-pulse    { animation: rv-pulse 2.5s infinite; }
        .rv-anim-floatin  { animation: rv-floatin .5s ease forwards; }
        .rv-anim-bob      { animation: rv-bob 3s ease-in-out infinite; }
        .rv-anim-glow     { animation: rv-glow 4s ease-in-out infinite; }
        .rv-anim-blink0   { animation: rv-blink 1.2s ease 0s infinite; }
        .rv-anim-blink1   { animation: rv-blink 1.2s ease .3s infinite; }
        .rv-anim-blink2   { animation: rv-blink 1.2s ease .6s infinite; }
        .rv-anim-confslide { animation: rv-confslide 4s ease-in-out infinite; }
        .rv-card          { background:rgba(255,255,255,0.04); border:1px solid rgba(0,217,255,0.13); border-radius:20px; padding:28px 24px; }
        .rv-card:hover    { border-color:rgba(0,217,255,0.38); transition:border-color .2s; }
        .rv-tag           { display:inline-block; background:rgba(0,217,255,0.09); border:1px solid rgba(0,217,255,0.2); color:#00D9FF; border-radius:99px; padding:4px 14px; font-size:11px; letter-spacing:.12em; font-weight:600; text-transform:uppercase; margin-bottom:18px; }
        .rv-cta           { display:inline-block; background:linear-gradient(135deg,rgba(0,217,255,0.15),rgba(139,92,246,0.15)); border:1.5px solid #00D9FF; border-radius:99px; padding:13px 28px; color:#00D9FF; font-family:'Jost',sans-serif; font-weight:600; font-size:14px; cursor:pointer; text-decoration:none; letter-spacing:.04em; box-shadow:0 0 20px rgba(0,217,255,0.2); transition:all .18s; }
        .rv-cta:hover     { background:rgba(0,217,255,0.22); transform:scale(1.02); }
        .rv-cta-big       { padding:20px 48px; font-size:18px; }
        .rv-cta-xl        { padding:22px 56px; font-size:20px; }
        .rv-section       { max-width:1080px; margin:0 auto; padding:90px 24px; }
        .rv-float-btn:hover { transform:scale(1.05); box-shadow:0 0 32px rgba(0,217,255,.55)!important; }
        .rv-blur-text { filter:blur(7px); user-select:none; transition:filter .3s; }
        .rv-blur-text.revealed { filter:blur(0); }
        .rv-price-card { background:rgba(255,255,255,0.04); border-radius:24px; padding:32px 28px; transition:all .2s; }
        .rv-price-card:hover { transform:translateY(-4px); }
      `}</style>

      <div className="ryvynn-landing">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
          {/* Breathing radials */}
          <div className="absolute inset-0 rv-anim-breathe pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,217,255,0.07) 0%, rgba(139,92,246,0.04) 45%, transparent 70%)' }} />
          <div className="absolute inset-0 rv-anim-breathe2 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 40% 40% at 50% 80%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />

          {/* Tagline pill */}
          <div className="rv-tag rv-anim-fadeup1">From our darkest hours to our brightest days</div>

          {/* Dual Flame logo */}
          <div className="rv-anim-fadeup2 mb-6">
            <Image
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN Dual Flame"
              width={120}
              height={120}
              className="object-contain drop-shadow-[0_0_40px_rgba(0,217,255,0.4)] rv-anim-bob"
            />
          </div>

          {/* H1 */}
          <h1 className="rv-serif font-light tracking-wide leading-tight text-white mb-5 rv-anim-fadeup2"
            style={{ fontSize: 'clamp(3rem,8.5vw,7.5rem)' }}>
            Right here.<br />
            <span className="text-ryvynn-cyan rv-anim-glow">Right now.</span><br />
            Breathe.
          </h1>

          {/* Sub */}
          <p className="font-light leading-relaxed mb-2 rv-anim-fadeup3 max-w-xl"
            style={{ fontSize: 'clamp(.95rem,2.2vw,1.25rem)', color: '#7a8499' }}>
            The only place you can say anything<br />
            and it <em className="text-[#dde4f0]">truly disappears when you leave.</em><br />
            No login. No logs. No leaks. Ever.
          </p>

          <p className="text-sm italic mb-7 rv-anim-fadeup4" style={{ color: '#7a8499' }}>
            In a world full of apps that watch and remember — this one forgets on purpose.
          </p>

          {/* Chat preview */}
          <div className="w-full max-w-lg rv-anim-fadeup5 mb-8 text-left rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(0,217,255,0.13)' }}>
            {chatStep >= 1 && (
              <div className="rv-anim-fadein mb-3">
                <div className="text-[10px] tracking-widest mb-1" style={{ color: '#7a8499' }}>YOU</div>
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[16px_16px_4px_16px]"
                  style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.28)', color: '#dde4f0' }}>
                  I feel like I&apos;m drowning and no one gets it...
                </div>
              </div>
            )}
            {chatStep >= 2 && (
              <div className="rv-anim-fadein mb-2">
                <div className="text-[10px] tracking-widest mb-1 text-ryvynn-cyan">RYVYNN</div>
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[16px_16px_16px_4px]"
                  style={{ background: 'rgba(0,217,255,0.07)', border: '1px solid rgba(0,217,255,0.15)', color: '#dde4f0' }}>
                  I get it. That weight — it&apos;s real, and it&apos;s heavy right now. You&apos;re not being dramatic. You&apos;re human.
                </div>
              </div>
            )}
            {chatStep >= 3 && (
              <div className="rv-anim-fadein mt-2">
                <div className="text-sm leading-relaxed px-4 py-2 rounded-[4px_16px_16px_16px]"
                  style={{ background: 'rgba(0,217,255,0.07)', border: '1px solid rgba(0,217,255,0.15)', color: '#dde4f0' }}>
                  Put your hand on your chest. Feel it beating? That&apos;s proof you&apos;re still here. In for 4... hold... out slow. Want to try one together?
                </div>
              </div>
            )}
            {chatStep < 3 && (
              <div className="flex gap-1 mt-2">
                {[0,1,2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full bg-ryvynn-cyan rv-anim-blink${i}`} />
                ))}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col items-center gap-3 rv-anim-fadeup6">
            <Link href="/guardian" className="rv-cta rv-cta-big rv-anim-pulse">
              Start Talking — 100% Anonymous, Zero Trace
            </Link>
            <button onClick={scrollToDemo}
              className="bg-transparent border-none text-sm cursor-pointer underline decoration-dotted"
              style={{ color: '#7a8499', fontFamily: "'Jost', sans-serif" }}>
              See why people come back at 3 AM ↓
            </button>
          </div>

          {/* Crisis bar */}
          <div className="rv-anim-fadein7 mt-7 px-5 py-3 rounded-xl text-sm max-w-lg"
            style={{ background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.2)', color: '#ffaaaa' }}>
            🆘 In immediate danger?{' '}
            <a href="tel:988" className="font-bold">Call or text 988 (US)</a> — free, 24/7.
            <span className="block mt-1 opacity-70">RYVYNN routes there instantly if you need it.</span>
          </div>
        </section>

        {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: '1px solid rgba(0,217,255,0.13)', borderBottom: '1px solid rgba(0,217,255,0.13)', background: 'rgba(255,255,255,0.01)', padding: '16px 24px' }}>
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-7 gap-y-2">
            {TRUST_STRIP.map(t => (
              <span key={t} className="text-xs tracking-wider" style={{ color: '#7a8499' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── LIVE DEMO ─────────────────────────────────────────────────────── */}
        <div ref={demoRef} className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">Live Demo — No Signup, No Trace</div>
            <h2 className="rv-serif font-normal text-white mb-4"
              style={{ fontSize: 'clamp(2rem,4vw,3.5rem)', lineHeight: 1.2 }}>
              Experience RYVYNN right now.<br />
              <span className="text-ryvynn-cyan">For real. No strings.</span>
            </h2>
            <p className="max-w-lg mx-auto leading-relaxed text-[15px]" style={{ color: '#7a8499' }}>
              Type anything — whatever is actually weighing on you. This is the real RYVYNN AI.{' '}
              <strong className="text-[#dde4f0]">Nothing you type is stored, logged, or trained on.</strong>
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rv-card" style={{ borderColor: demoMsg ? 'rgba(0,217,255,0.3)' : 'rgba(0,217,255,0.13)', transition: 'border-color .3s' }}>
              <textarea
                value={demoMsg}
                onChange={e => setDemoMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDemo(); } }}
                placeholder="Whatever it is... say it. It stays here and only here."
                className="w-full bg-transparent border-none outline-none resize-none leading-relaxed text-base text-[#dde4f0]"
                style={{ minHeight: 110, fontFamily: "'Jost', sans-serif" }}
              />
              <div className="flex justify-between items-center mt-3 pt-3"
                style={{ borderTop: '1px solid rgba(0,217,255,0.13)' }}>
                <span className="text-xs italic" style={{ color: '#7a8499' }}>Enter to send · nothing stored</span>
                <button
                  onClick={handleDemo}
                  disabled={loading || !demoMsg.trim()}
                  className="rv-cta"
                  style={{ opacity: loading || !demoMsg.trim() ? .45 : 1, animation: demoMsg.trim() && !loading ? 'rv-pulse 2s infinite' : 'none' }}>
                  {loading ? 'Listening...' : 'Talk to RYVYNN →'}
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center mt-7 italic" style={{ color: '#7a8499' }}>
                <div className="flex justify-center gap-2 mb-2">
                  {[0,1,2].map(i => <div key={i} className={`w-2 h-2 rounded-full bg-ryvynn-cyan rv-anim-blink${i}`} />)}
                </div>
                I&apos;m right here with you...
              </div>
            )}

            {demoReply && !loading && (
              <div className="mt-6 rv-card rv-anim-fadein" style={{ borderColor: 'rgba(0,217,255,0.35)' }}>
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-widest text-ryvynn-cyan">
                  <Image src="/assets/dual-flame-logo.png" alt="" width={16} height={16} className="inline" />
                  RYVYNN
                  <span className="font-light text-xs" style={{ color: '#7a8499' }}>— session ends when you close the tab</span>
                </div>
                <div className="text-[15px] leading-[1.9] whitespace-pre-wrap text-[#dde4f0]">{demoReply}</div>
                <div className="flex gap-3 flex-wrap mt-5 pt-4"
                  style={{ borderTop: '1px solid rgba(0,217,255,0.13)' }}>
                  <Link href="/guardian" className="rv-cta rv-anim-pulse">
                    Continue in RYVYNN — Full Experience
                  </Link>
                  <button
                    onClick={() => { setDemoMsg(''); setDemoReply(null); }}
                    className="rounded-full px-5 py-2 text-sm cursor-pointer"
                    style={{ background: 'none', border: '1px solid rgba(0,217,255,0.13)', color: '#7a8499', fontFamily: "'Jost',sans-serif" }}>
                    Start over
                  </button>
                </div>
                <p className="mt-3 text-xs italic" style={{ color: '#7a8499' }}>
                  ✓ Nothing you just said was stored, logged, or will ever be accessed. That&apos;s not a policy — it&apos;s the architecture.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── SOCIAL PROOF ──────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-12">
              <div className="rv-tag">Real People. Real 3 AM Moments.</div>
              <h2 className="rv-serif font-normal text-white"
                style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', lineHeight: 1.2 }}>
                What they said after.
              </h2>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
              {QUOTES.map((q, i) => (
                <div key={i} className="rv-card relative" style={{ borderLeft: '3px solid rgba(0,217,255,0.3)' }}>
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full"
                    style={{ color: '#7a8499', background: 'rgba(0,0,0,.4)' }}>{q.time}</span>
                  <p className="text-sm italic leading-relaxed mb-3 text-[#dde4f0]">&ldquo;{q.text}&rdquo;</p>
                  <span className="text-xs" style={{ color: '#7a8499' }}>— {q.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONFESSION WALL TEASER ────────────────────────────────────────── */}
        <div className="rv-section text-center">
          <div className="rv-tag">The Miracle Wall</div>
          <h2 className="rv-serif font-normal text-white mb-4"
            style={{ fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.2 }}>
            Real thoughts people don&apos;t say out loud.
          </h2>
          <p className="max-w-lg mx-auto text-[15px] mb-10" style={{ color: '#7a8499' }}>
            Anonymous confessions transform into miracles — stripped of identity, your breakthrough becomes someone else&apos;s lifeline.
          </p>

          {/* Rotating confession */}
          <div className="max-w-xl mx-auto mb-8 rounded-2xl p-8 relative overflow-hidden"
            style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div className="text-3xl mb-4 text-ryvynn-purple opacity-40">&ldquo;</div>
            <p key={confIdx} className="rv-anim-confslide text-lg italic leading-relaxed text-[#dde4f0] rv-serif">
              {CONFESSIONS[confIdx]}
            </p>
            <div className="mt-4 text-xs" style={{ color: '#7a8499' }}>— Anonymous · shared voluntarily</div>
          </div>

          {/* Blurred previews */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="grid gap-3">
              {[
                "Sometimes I feel like I was never meant to be here at all, and then...",
                "I told my Guardian something I've never told another living soul. It replied with...",
                "Day 47. I almost didn't make it to day 3. Here's what changed...",
              ].map((preview, i) => (
                <div key={i} className="rounded-xl px-5 py-4 text-left relative overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className={`text-sm text-[#dde4f0] ${confBlur ? 'rv-blur-text' : 'revealed'}`}>
                    {preview}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfBlur(false)}
              className="mt-5 rv-cta"
              style={{ borderColor: 'rgba(139,92,246,0.6)', color: '#8B5CF6', boxShadow: '0 0 20px rgba(139,92,246,0.15)' }}>
              Reveal miracles →
            </button>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/wall" className="rv-cta" style={{ borderColor: 'rgba(139,92,246,0.5)', color: '#8B5CF6' }}>
              Read the wall
            </Link>
            <Link href="/guardian" className="rv-cta rv-anim-pulse">
              Share yours anonymously →
            </Link>
          </div>
        </div>

        {/* ── VOID FILLER ───────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <h2 className="rv-serif font-normal text-white mb-9"
              style={{ fontSize: 'clamp(2rem,4.5vw,3.5rem)', lineHeight: 1.2 }}>
              For when the thoughts won&apos;t stop...<br />
              <span className="text-ryvynn-cyan">and talking to anyone else feels impossible.</span>
            </h2>
            <div className="max-w-2xl mx-auto flex flex-col gap-5">
              {[
                "It's 2:47 AM. The room is quiet, but your mind is screaming. You don't need advice. You don't need fixing. You just need somewhere to put it — without it following you forever.",
                "RYVYNN was built the opposite of every other AI: your words vanish the second you close the tab. No training data. No profiles. No third-party shares. In 2026, real privacy isn't a feature — it's survival.",
                "This was built by someone who hit rock bottom and couldn't find this space anywhere. So they built it from nothing. For you."
              ].map((p, i) => (
                <p key={i} className={`leading-[1.9] text-base ${i === 2 ? 'font-medium text-left pl-5' : 'font-light text-center'}`}
                  style={{ color: i === 2 ? '#dde4f0' : '#7a8499', borderLeft: i === 2 ? '3px solid #8B5CF6' : 'none' }}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-14">
            <div className="rv-tag">Zero Setup</div>
            <h2 className="rv-serif font-normal text-white"
              style={{ fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.2 }}>
              No setup. No bullshit. Just breathe.
            </h2>
          </div>
          <div className="grid gap-7" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="rv-card relative overflow-hidden">
                <span className="absolute top-0 right-4 rv-serif font-bold leading-none select-none"
                  style={{ fontSize: '4rem', color: 'rgba(0,217,255,0.07)', top: '-8px' }}>{step.n}</span>
                <div className="text-xs font-semibold tracking-widest mb-3 text-ryvynn-cyan">STEP {step.n}</div>
                <h3 className="text-white font-medium text-lg mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a8499' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── POWER TOOLS ───────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-14">
              <div className="rv-tag">What Sets RYVYNN Apart</div>
              <h2 className="rv-serif font-normal text-white"
                style={{ fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.2 }}>
                A sea of risky companions.<br />
                <span className="text-ryvynn-cyan">One that&apos;s actually safe.</span>
              </h2>
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))' }}>
              {TOOLS.map((t, i) => (
                <div key={i} className="rv-card">
                  <div className="text-3xl mb-4">{t.icon}</div>
                  <h3 className="text-white font-semibold text-base mb-2">{t.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#7a8499' }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRIVACY NUCLEAR ───────────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(0,217,255,0.05) 0%,rgba(139,92,246,0.05) 100%)', borderTop: '1px solid rgba(0,217,255,0.13)', borderBottom: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <div className="rv-tag">Privacy Architecture</div>
            <h2 className="rv-serif font-normal text-white mb-10"
              style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)', lineHeight: 1.2 }}>
              Your darkness stays yours.<br />
              <span style={{ textDecoration: 'underline', textDecorationColor: '#ff4d4d', textUnderlineOffset: 10 }}>
                Period.
              </span>
            </h2>
            <div className="grid gap-4 max-w-3xl mx-auto mb-12"
              style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
              {PRIVACY_POINTS.map((item, i) => (
                <div key={i} className="text-sm text-[#dde4f0] px-4 py-3 rounded-2xl"
                  style={{ background: 'rgba(0,0,0,.35)', border: '1px solid rgba(0,217,255,.1)' }}>
                  <span className="text-ryvynn-cyan mr-2">✓</span>{item}
                </div>
              ))}
            </div>
            <p className="max-w-xl mx-auto leading-relaxed text-[15px] mb-7" style={{ color: '#7a8499' }}>
              In an era where AI &ldquo;companions&rdquo; get exposed for logging intimate conversations, selling emotional profiles, and getting subpoenaed in court cases — RYVYNN is the structural exception.
            </p>
            <p className="rv-serif font-light text-white leading-relaxed"
              style={{ fontSize: 'clamp(1.5rem,3vw,2.4rem)' }}>
              &ldquo;Talk like no one&apos;s listening.<br />
              <span className="text-ryvynn-cyan">Because no one is.&rdquo;</span>
            </p>
          </div>
        </div>

        {/* ── COMPARISON ────────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">2026 Reality Check</div>
            <h2 className="rv-serif font-normal text-white"
              style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', lineHeight: 1.2 }}>
              Every other AI companion is watching you.<br />
              <span className="text-ryvynn-cyan">Here&apos;s the proof.</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid rgba(0,217,255,0.13)' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,217,255,0.13)', background: 'rgba(0,217,255,0.04)' }}>
                  {['Feature','RYVYNN','Replika','BetterHelp / Talkspace','Character.ai'].map((h, i) => (
                    <th key={i} style={{ padding: '16px 18px', textAlign: i === 0 ? 'left' : 'center',
                      color: i === 1 ? '#00D9FF' : '#7a8499', fontWeight: i === 1 ? 700 : 400,
                      fontSize: i === 1 ? 15 : 12, whiteSpace: 'nowrap', letterSpacing: '.04em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '13px 18px', color: '#dde4f0', fontSize: 13 }}>{row.feature}</td>
                    {([row.r, row.a, row.b, row.c] as boolean[]).map((val, j) => (
                      <td key={j} style={{ padding: '13px 18px', textAlign: 'center', fontSize: 17 }}>
                        {j === 0
                          ? (val ? <span style={{ color: '#4ade80' }}>✓</span> : <span style={{ color: '#ff4d4d' }}>✗</span>)
                          : (val ? <span style={{ color: '#ff4d4d' }}>⚠</span> : <span style={{ color: '#4ade80' }}>✓</span>)
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center mt-3 text-xs" style={{ color: '#7a8499' }}>
            ⚠ = risk or limitation present. Based on published policies, court records, and independent research.
          </p>
        </div>

        {/* ── THERAPY GAP ───────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="grid gap-14 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
              <div>
                <div className="rv-tag">The Mental Health Gap</div>
                <h2 className="rv-serif font-normal text-white mb-6"
                  style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', lineHeight: 1.2 }}>
                  The crisis is now.<br />
                  <span className="text-ryvynn-cyan">The waitlist is months.</span>
                </h2>
                <p className="leading-[1.9] text-[15px] mb-5" style={{ color: '#7a8499' }}>
                  The average therapy session costs $175. Waitlists run 4-6 months. Insurance often won&apos;t cover it. You have to give your name, your history, your diagnosis to a system that keeps all of it.
                </p>
                <p className="leading-[1.9] text-[15px] text-[#dde4f0]">
                  RYVYNN isn&apos;t a therapy replacement. It&apos;s the gap between white-knuckling it alone and eventually accessing formal care — the 3 AM lifeline that doesn&apos;t make you wait until April.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {THERAPY_STATS.map((stat, i) => (
                  <div key={i} className="rv-card flex justify-between items-center px-6 py-4">
                    <span className="text-sm" style={{ color: '#7a8499' }}>{stat.label}</span>
                    <span className="font-semibold text-base" style={{ color: stat.positive ? '#4ade80' : '#ff4d4d' }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── DUAL FLAME STORY ──────────────────────────────────────────────── */}
        <div className="rv-section text-center">
          <div className="mb-5 flex justify-center rv-anim-bob">
            <Image
              src="/assets/dual-flame-logo.png"
              alt="Dual Flame"
              width={80}
              height={80}
              className="object-contain drop-shadow-[0_0_40px_rgba(0,217,255,0.5)]"
            />
          </div>
          <div className="rv-tag">The Dual Flame</div>
          <h2 className="rv-serif font-normal text-white mb-6"
            style={{ fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.2 }}>
            Two flames. One truth.
          </h2>
          <div className="max-w-xl mx-auto">
            <p className="leading-[1.9] text-[15px] mb-5" style={{ color: '#7a8499' }}>
              The first flame is the 3 AM spiral — dark, alone, the weight no one else can see.
              The second flame is what breaks through on the other side. The miracle.
            </p>
            <p className="leading-[1.9] text-[15px] mb-6 text-[#dde4f0]">
              The Dual Flame isn&apos;t a logo. It&apos;s a promise: your darkest moment carries the seed of your breakthrough.
              RYVYNN&apos;s only job is to hold that space — without judgment, without memory, without surveillance.
            </p>
            <p className="rv-serif font-light italic leading-relaxed text-ryvynn-cyan"
              style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)' }}>
              &ldquo;From our darkest hours to our brightest days.&rdquo;
            </p>
          </div>
        </div>

        {/* ── WHO NEEDS THIS ────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-11">
              <div className="rv-tag">Who This Is For</div>
              <h2 className="rv-serif font-normal text-white"
                style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', lineHeight: 1.2 }}>
                If any of this hits home...
              </h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
              {WHO.map((item, i) => (
                <div key={i} className="flex gap-4 items-start py-4 px-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span className="text-ryvynn-cyan mt-0.5 flex-shrink-0">→</span>
                  <span className="text-sm leading-relaxed" style={{ color: '#7a8499' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SOUL ECONOMY ──────────────────────────────────────────────────── */}
        <div className="rv-section">
          <div className="text-center mb-12">
            <div className="rv-tag">More Than a One-Time Crisis Tool</div>
            <h2 className="rv-serif font-normal text-white"
              style={{ fontSize: 'clamp(2rem,3.5vw,2.8rem)', lineHeight: 1.2 }}>
              What builds when you come back.
            </h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))' }}>
            {SOUL_FEATURES.map((item, i) => (
              <div key={i} className="rv-card text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7a8499' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── PRICING ───────────────────────────────────────────────────────── */}
        <div style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section">
            <div className="text-center mb-14">
              <div className="rv-tag">Pricing · Tesla 3-6-9</div>
              <h2 className="rv-serif font-normal text-white mb-4"
                style={{ fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1.2 }}>
                Free when you need it.<br />
                <span className="text-ryvynn-cyan">Deeper when you&apos;re ready.</span>
              </h2>
              <p className="max-w-lg mx-auto text-[15px]" style={{ color: '#7a8499' }}>
                Crisis access is free forever. No paywalls between you and safety. Premium unlocks the full healing ecosystem.
              </p>
            </div>

            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
              {PRICING_TIERS.map((tier, i) => (
                <div
                  key={i}
                  className="rv-price-card relative"
                  style={{
                    border: `1.5px solid ${tier.border}`,
                    boxShadow: tier.highlight ? `0 0 40px rgba(0,217,255,0.18)` : 'none',
                  }}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-bold tracking-widest"
                      style={{ background: tier.color, color: '#06080f' }}>
                      {tier.badge}
                    </div>
                  )}
                  <div className="text-sm font-bold tracking-widest mb-1" style={{ color: tier.color }}>
                    {tier.name.toUpperCase()}
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{tier.price}</div>
                  <div className="text-xs mb-5" style={{ color: '#7a8499' }}>{tier.sub}</div>
                  <ul className="flex flex-col gap-2 mb-7">
                    {tier.features.map((f, j) => (
                      <li key={j} className="flex gap-2 items-start text-sm" style={{ color: '#dde4f0' }}>
                        <span style={{ color: tier.color }} className="mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  {tier.badge === 'Most Popular' && (
                    <div className="text-xs mb-3 px-3 py-2 rounded-xl text-center"
                      style={{ background: 'rgba(0,217,255,0.06)', border: '1px solid rgba(0,217,255,0.15)', color: '#00D9FF' }}>
                      First month <strong>$3.69</strong> — discount applied at checkout
                    </div>
                  )}
                  <Link
                    href={tier.href}
                    className="block text-center rounded-full py-3 text-sm font-semibold no-underline transition-all"
                    style={{
                      background: tier.highlight ? `rgba(0,217,255,0.15)` : 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${tier.border}`,
                      color: tier.color,
                    }}>
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center mt-8 text-xs" style={{ color: '#7a8499' }}>
              All plans · Cancel anytime · No dark patterns · Crisis tier free forever, no exceptions.
            </p>
          </div>
        </div>

        {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(180deg,#06080f 0%,rgba(0,217,255,0.04) 50%,#06080f 100%)', borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="rv-section text-center">
            <div className="mb-5 flex justify-center rv-anim-bob">
              <Image
                src="/assets/dual-flame-logo.png"
                alt="Dual Flame"
                width={64}
                height={64}
                className="object-contain drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]"
              />
            </div>
            <h2 className="rv-serif font-normal text-white mb-5"
              style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)', lineHeight: 1.2 }}>
              One message.<br />
              <span className="text-ryvynn-cyan">One breath.</span><br />
              Everything shifts.
            </h2>
            <p className="max-w-md mx-auto leading-[1.85] text-base mb-3" style={{ color: '#7a8499' }}>
              You&apos;ve carried this alone long enough. No pressure. No expectations. No memory.
              Just a place to put it down.
            </p>
            <p className="max-w-md mx-auto text-sm italic mb-10" style={{ color: '#7a8499' }}>
              No download. Opens in your browser right now. 100% anonymous. Free at core. Forever.
            </p>
            <Link href="/guardian" className="rv-cta rv-cta-xl rv-anim-pulse">
              I&apos;m Listening — Talk Now, No Strings
            </Link>
            <div className="mt-6 text-sm" style={{ color: '#7a8499' }}>
              Or{' '}
              <button onClick={scrollToDemo}
                className="bg-transparent border-none cursor-pointer underline text-ryvynn-cyan text-sm"
                style={{ fontFamily: "'Jost',sans-serif" }}>
                try the live demo first
              </button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <footer className="text-center py-9 px-6"
          style={{ borderTop: '1px solid rgba(0,217,255,0.13)' }}>
          <div className="flex justify-center mb-3">
            <Image
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN Dual Flame"
              width={28}
              height={28}
              className="object-contain opacity-60"
            />
          </div>
          <div className="text-sm max-w-xl mx-auto leading-[1.95]" style={{ color: '#7a8499' }}>
            RYVYNN is <strong>not</strong> a licensed therapist, doctor, or crisis replacement service.
            AI responses are supportive in nature and do not constitute medical advice.<br />
            For emergencies: <strong>988 (US)</strong> / local emergency services immediately.<br />
            Built for relief. Privacy-first. Always free at core.<br />
            <span className="text-xs opacity-40">
              © 2026 AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC · ryvynn.live
            </span>
          </div>
        </footer>

        {/* ── FLOATING CTA ──────────────────────────────────────────────────── */}
        {showFloat && (
          <div className="fixed bottom-6 right-6 z-50 rv-anim-floatin">
            <Link
              href="/guardian"
              className="rv-float-btn flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ryvynn-cyan no-underline rv-anim-pulse"
              style={{
                background: 'rgba(6,8,15,0.96)',
                border: '1.5px solid #00D9FF',
                boxShadow: '0 0 24px rgba(0,217,255,0.22)',
                backdropFilter: 'blur(20px)',
                fontFamily: "'Jost',sans-serif",
                transition: 'all .2s',
              }}>
              <Image src="/assets/dual-flame-logo.png" alt="" width={20} height={20} className="object-contain" />
              Breathe with me?
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
