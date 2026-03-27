'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ─── Demo calls the internal Gemini-backed route — never direct browser API calls
async function getDemoResponse(msg: string): Promise<string | null> {
  try {
    const res = await fetch('/api/guardian/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    if (!res.ok) throw new Error('err');
    const data = await res.json();
    return data.response ?? null;
  } catch { return null; }
}

// ─── Rotating confessions ─────────────────────────────────────────────────────
const CONFESSIONS = [
  "I just need somewhere to say it.",
  "I don't want advice. I just want to not be alone with it.",
  "There's no one I can actually tell.",
  "I'm fine in public. I'm not fine.",
  "I've been holding this for weeks.",
  "I don't want to be fixed. I want to be heard.",
];

export default function HomePage() {
  // Demo state
  const [input, setInput]       = useState('');
  const [reply, setReply]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  // Confession rotator
  const [confIdx, setConfIdx]   = useState(0);
  const [showFloat, setShowFloat]       = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [wallCount, setWallCount]           = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFloat(true), 8000);
    const t2 = setInterval(() => setConfIdx(i => (i + 1) % CONFESSIONS.length), 4000);
    // Show onboarding on first ever visit
    const seen = localStorage.getItem('ryvynn-onboarded');
    if (!seen) setShowOnboarding(true);
    // Fetch live wall count for social proof
    fetch('/api/wall?limit=1').then(r => r.json()).then(d => {
      if (d.total) setWallCount(d.total);
    }).catch(() => {});
    return () => { clearTimeout(t1); clearInterval(t2); };
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setSent(true);
    setLoading(true);
    setReply(null);
    const r = await getDemoResponse(text.trim());
    setReply(r ?? "I'm right here. Take a breath. What's going on?");
    setLoading(false);
  }, [loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const reset = () => { setInput(''); setReply(null); setSent(false); };

  const scrollToDemo = () =>
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <main className="min-h-screen bg-[#07080f] text-[#d8e0ee]" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap');
        :root {
          --cyan: #00C9E8;
          --purple: #7C5CBF;
          --dim: #636e84;
          --dimmer: #3a4352;
          --card: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --border-cyan: rgba(0,201,232,0.25);
        }
        .lora { font-family: 'Lora', Georgia, serif; }
        .dim  { color: var(--dim); }
        .dimmer { color: var(--dimmer); }
        .cyan { color: var(--cyan); }
        .section { max-width: 680px; margin: 0 auto; padding: 80px 24px; }
        .section-wide { max-width: 900px; margin: 0 auto; padding: 80px 24px; }
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
        .card-cyan { border-color: var(--border-cyan); }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(0,201,232,0.1); border: 1.5px solid var(--cyan);
          border-radius: 99px; padding: 14px 28px;
          color: var(--cyan); font-size: 15px; font-weight: 500;
          cursor: pointer; text-decoration: none; transition: all .15s;
          box-shadow: 0 0 20px rgba(0,201,232,0.1);
        }
        .btn-primary:hover { background: rgba(0,201,232,0.18); transform: translateY(-1px); }
        .btn-ghost {
          background: none; border: none; color: var(--dim);
          font-size: 14px; cursor: pointer; text-decoration: underline;
          text-underline-offset: 3px; font-family: inherit;
        }
        .btn-ghost:hover { color: var(--cyan); }
        .pulse { animation: lp 2.5s infinite; }
        @keyframes lp { 0%,100%{box-shadow:0 0 0 0 rgba(0,201,232,.35)} 60%{box-shadow:0 0 0 14px rgba(0,201,232,0)} }
        .fade-in { animation: fi .5s ease forwards; }
        @keyframes fi { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .slide-up { animation: su .6s ease forwards; opacity: 0; }
        @keyframes su { to{opacity:1;transform:translateY(0)} from{opacity:0;transform:translateY(16px)} }
        .su1 { animation-delay:.05s }
        .su2 { animation-delay:.15s }
        .su3 { animation-delay:.25s }
        .su4 { animation-delay:.35s }
        .su5 { animation-delay:.45s }
        .su6 { animation-delay:.55s }
        .conf-slide { animation: cs 4s ease-in-out infinite; }
        @keyframes cs { 0%{opacity:0;transform:translateY(6px)} 10%{opacity:1;transform:translateY(0)} 85%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
        .blink0 { animation: bl 1.2s ease 0s infinite; }
        .blink1 { animation: bl 1.2s ease .3s infinite; }
        .blink2 { animation: bl 1.2s ease .6s infinite; }
        @keyframes bl { 0%,100%{opacity:.2} 50%{opacity:1} }
        .divider { border: none; border-top: 1px solid var(--border); margin: 0; }
        .demo-ta {
          background: transparent; border: none; outline: none; resize: none;
          width: 100%; font-family: inherit; font-size: 16px; line-height: 1.7;
          color: #d8e0ee; min-height: 90px;
        }
        .demo-ta::placeholder { color: var(--dimmer); }
        @media(max-width:600px){
          .section,.section-wide{padding:60px 18px}
          .btn-primary{padding:13px 22px;font-size:14px}
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════════════
          MICRO BAR — one line, no drama, zero color alarm
      ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        padding: '9px 20px', textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(255,255,255,.02)',
      }}>
        <span style={{ fontSize: 12, letterSpacing: '.05em', color: 'var(--dimmer)' }}>
          Private by design — nothing you type is stored or remembered.
        </span>
      </div>

      {/* Social proof — live count, only shows when wall has entries */}
      {wallCount && wallCount > 10 && (
        <div style={{ padding: '8px 20px', textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,.05)',
          background: 'rgba(124,92,191,.04)' }}>
          <span style={{ fontSize: 12, color: '#636e84' }}>
            {wallCount.toLocaleString()} voices on the wall · anonymous · nothing stored
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — above the fold. Calm. No barriers. No warnings.
          First 3 seconds = "I am safe here."
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>

          {/* Logo — small, calm, not dominant */}
          <div className="slide-up su1" style={{ marginBottom: 28 }}>
            <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={48} height={48}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(0,201,232,.3))' }} />
          </div>

          {/* Headline */}
          <h1 className="lora slide-up su2"
            style={{ fontSize: 'clamp(2.2rem,6vw,3.8rem)', fontWeight: 400, lineHeight: 1.2, color: '#eef2fa', marginBottom: 18 }}>
            You’re not alone with this right now.
          </h1>

          {/* Sub */}
          <p className="slide-up su3" style={{ fontSize: 'clamp(1rem,2.5vw,1.18rem)', lineHeight: 1.8, color: 'var(--dim)', maxWidth: 460, margin: '0 auto 36px' }}>
            There’s something heavy you’ve been carrying — and you don’t have to find the right words for it.<br />
            Just start. No account. No memory. Gone the second you leave.
          </p>

          {/* CTAs */}
          <div className="slide-up su4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <Link href="/guardian" className="btn-primary" style={{ fontSize: 16, padding: '16px 36px' }}>
              Start Talking — Nothing Saved
            </Link>
            <span style={{ fontSize: 12, color: 'var(--dimmer)' }}>No signup. No judgment. No trace.</span>
          </div>

          {/* Inline trust bullets */}
          <div className="slide-up su5" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px 24px' }}>
            {[
              'Anonymous by default',
              'No chat history, ever',
              'No tracking, no accounts',
              'Not therapy — just a place to say it',
            ].map(t => (
              <span key={t} style={{ fontSize: 13, color: 'var(--dim)' }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          LIVE DEMO — embedded, no scroll required.
          This is the product. Let them feel it before committing.
      ═══════════════════════════════════════════════════════════════════ */}
      <section ref={demoRef} style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>

          <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: 20 }}>
            Try it right now. Nothing is saved.
          </p>

          <div className={`card card-cyan`} style={{
            borderColor: sent ? 'rgba(0,201,232,.4)' : 'var(--border-cyan)',
            transition: 'border-color .3s',
          }}>
            {!sent ? (
              /* Input state */
              <>
                <textarea
                  className="demo-ta"
                  placeholder="Type whatever's on your mind... this goes nowhere."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--dimmer)' }}>Enter to send</span>
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim()}
                    className="btn-primary"
                    style={{ padding: '10px 22px', fontSize: 14, opacity: input.trim() ? 1 : .35, animation: input.trim() ? 'lp 2.5s infinite' : 'none' }}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              /* Response state */
              <>
                {/* User bubble */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--dimmer)', marginBottom: 8, textTransform: 'uppercase' }}>You</div>
                  <div style={{
                    display: 'inline-block', background: 'rgba(124,92,191,.15)',
                    border: '1px solid rgba(124,92,191,.25)', borderRadius: '14px 14px 4px 14px',
                    padding: '10px 16px', fontSize: 15, lineHeight: 1.65, color: '#d8e0ee', maxWidth: '90%',
                  }}>
                    {input}
                  </div>
                </div>

                {/* RYVYNN response */}
                {loading ? (
                  <div style={{ display: 'flex', gap: 6, padding: '4px 0' }}>
                    <div className="blink0" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                    <div className="blink1" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                    <div className="blink2" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                  </div>
                ) : reply ? (
                  <div className="fade-in">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Image src="/assets/dual-flame-logo.png" alt="" width={14} height={14}
                        style={{ objectFit: 'contain', opacity: .8 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--cyan)', textTransform: 'uppercase' }}>RYVYNN</span>
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.8, color: '#d8e0ee', whiteSpace: 'pre-wrap', marginBottom: 20 }}>
                      {reply}
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <Link href="/guardian" className="btn-primary" style={{ fontSize: 14, padding: '11px 22px' }}>
                        Continue in RYVYNN →
                      </Link>
                      <button onClick={reset} className="btn-ghost">Start over</button>
                    </div>
                    <p style={{ marginTop: 12, fontSize: 12, color: 'var(--dimmer)', fontStyle: 'italic' }}>
                      This conversation is not saved anywhere. Close the tab and it's gone.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          HOW IT WORKS — 3 steps. That's it.
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'rgba(255,255,255,.015)' }}>
        <div className="section" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 12 }}>How it works</p>
          <h2 className="lora" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: '#eef2fa', marginBottom: 48 }}>
            Three steps. No setup.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24, textAlign: 'left' }}>
            {[
              ['01', 'You type', "Open the app. Start typing. No intro, no form, no signup. Just say what you need to say."],
              ['02', 'It listens', "RYVYNN responds with calm, grounded presence. No judgment. No scripts. No rushing you toward anything."],
              ['03', 'It disappears', "Close the tab. Everything vanishes. Not archived. Not logged. Gone completely."],
            ].map(([n, title, desc]) => (
              <div key={n} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <span className="lora" style={{ position: 'absolute', top: -12, right: 12, fontSize: '5rem', fontWeight: 400, color: 'rgba(0,201,232,.06)', lineHeight: 1 }}>{n}</span>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 8 }}>Step {n}</p>
                <h3 style={{ fontSize: 17, fontWeight: 500, color: '#eef2fa', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--dim)', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          THIS IS FOR YOU IF — emotionally specific, not generic
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="section">
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 12 }}>This is for you if</p>
        <h2 className="lora" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: '#eef2fa', marginBottom: 36 }}>
          You recognize yourself in any of these.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            "There's something on your mind you haven't been able to say out loud to anyone.",
            "You've been carrying it alone for a while and you're tired.",
            "Therapy feels too big, too formal, or too far away right now.",
            "You need to vent — not be fixed, not be redirected, just heard.",
            "You've been burned by apps that track, log, or remember too much.",
            "You're fine in front of everyone. You're not fine.",
            "You just need a private place to put it down for a minute.",
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--cyan)', fontSize: 14, marginTop: 2, flexShrink: 0 }}>→</span>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--dim)', margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 36, textAlign: 'center' }}>
          <Link href="/guardian" className="btn-primary">
            That's me — start talking
          </Link>
        </div>
      </div>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          ROTATING CONFESSION — emotional proof, anonymous
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'rgba(124,92,191,.04)', borderTop: '1px solid rgba(124,92,191,.1)', borderBottom: '1px solid rgba(124,92,191,.1)' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--purple)', textTransform: 'uppercase', marginBottom: 24 }}>
            What people actually type
          </p>
          <div style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p key={confIdx} className="lora conf-slide"
              style={{ fontSize: 'clamp(1.1rem,2.5vw,1.35rem)', fontStyle: 'italic', lineHeight: 1.6, color: '#d8e0ee', margin: 0 }}>
              &ldquo;{CONFESSIONS[confIdx]}&rdquo;
            </p>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: 'var(--dimmer)' }}>— Anonymous · shared voluntarily</p>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST & PRIVACY — plain language, no tech jargon
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="section">
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 12 }}>Privacy</p>
        <h2 className="lora" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: '#eef2fa', marginBottom: 12 }}>
          Built to forget you on purpose.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--dim)', marginBottom: 36, maxWidth: 520 }}>
          Most apps store everything you say, learn from it, sell signals from it. We built RYVYNN the opposite way — structurally incapable of remembering.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[
            ['🔒', 'No accounts needed', "You don't have to sign up, log in, or give us anything to use RYVYNN."],
            ['🧠', 'No chat logs', "Your conversations are never written to a database. Close the tab and they cease to exist."],
            ['🚫', 'No training on your words', "Your messages are never used to train AI models. What you say stays private."],
            ['🛡', 'Nothing to hand over', "If anyone asked us for your data, we couldn't give it. There's nothing to give."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="card" style={{ background: 'rgba(0,201,232,.04)', borderColor: 'rgba(0,201,232,.15)' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#eef2fa', marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--dim)', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIALS — real, raw, relief-focused (not transformation)
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ background: 'rgba(255,255,255,.015)' }}>
        <div className="section-wide">
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.1em', color: 'var(--dim)', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>What people say</p>
          <h2 className="lora" style={{ fontSize: 'clamp(1.6rem,3.5vw,2.2rem)', fontWeight: 400, color: '#eef2fa', marginBottom: 40, textAlign: 'center' }}>
            Real moments. Real 3 AM.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {[
              { quote: "I don't want advice. I don't want fixing. I needed somewhere to put it. This is that place.", time: "2:47 AM", tag: "Anonymous" },
              { quote: "I typed something I've never said out loud to anyone. It didn't judge me. It just... stayed.", time: "3:12 AM", tag: "Recovery, 11 months" },
              { quote: "My therapist has a 4-month waitlist. RYVYNN was there in 30 seconds when I couldn't breathe.", time: "11:48 PM", tag: "Anonymous" },
              { quote: "I tested it. Cleared my browser, came back. It remembered nothing. That's the only reason I kept returning.", time: "7:33 AM", tag: "Privacy-conscious user" },
              { quote: "It's not therapy. It's not a hotline. It's just somewhere to put the weight down for a minute.", time: "1:19 AM", tag: "Anonymous" },
            ].map(({ quote, time, tag }, i) => (
              <div key={i} className="card" style={{ borderLeft: '2px solid rgba(0,201,232,.2)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, color: 'var(--dimmer)', background: 'rgba(0,0,0,.3)', padding: '2px 8px', borderRadius: 99 }}>{time}</span>
                <p style={{ fontSize: 14, lineHeight: 1.75, fontStyle: 'italic', color: '#d8e0ee', marginBottom: 12, paddingTop: 4 }}>&ldquo;{quote}&rdquo;</p>
                <span style={{ fontSize: 12, color: 'var(--dimmer)' }}>— {tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA — calm, not dramatic. Same energy as the hero.
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <Image src="/assets/dual-flame-logo.png" alt="" width={40} height={40}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 16px rgba(0,201,232,.35))' }} />
          </div>
          <h2 className="lora" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, color: '#eef2fa', lineHeight: 1.3, marginBottom: 16 }}>
            You don't have to keep carrying it alone.
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--dim)', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
            No pressure. No account. No memory. Just a place to put it down.
          </p>
          <Link href="/guardian" className="btn-primary pulse" style={{ fontSize: 17, padding: '18px 40px' }}>
            Start Talking Now
          </Link>
          <div style={{ marginTop: 18 }}>
            <button className="btn-ghost" onClick={scrollToDemo}>Try the demo first</button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER — minimal. Legal. Calm crisis mention.
      ═══════════════════════════════════════════════════════════════════ */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}>
          <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={22} height={22}
            style={{ objectFit: 'contain', opacity: .4 }} />
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.8, color: 'var(--dimmer)', maxWidth: 480, margin: '0 auto 8px' }}>
          RYVYNN is not a licensed therapist, doctor, or crisis service. AI responses are for support only and do not constitute medical advice.
        </p>
        <p style={{ fontSize: 12, color: 'var(--dimmer)', marginBottom: 12 }}>
          If you're in danger, call or text{' '}
          <a href="tel:988" style={{ color: '#d8e0ee', fontWeight: 500 }}>988</a>
          {' '}(US) or your local emergency services.
        </p>
        <p style={{ fontSize: 11, color: '#2a3040', marginTop: 16 }}>
          © 2026 AONIXX, a DBA of NEXXT GEN INNOVATIONS LLC · ryvynn.live
        </p>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          ONBOARDING — first visit only. 3 choices. Gets them to value fast.
      ═══════════════════════════════════════════════════════════════════ */}
      {showOnboarding && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(7,8,15,.95)',
            backdropFilter: 'blur(12px)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
            {/* Flame */}
            <Image src="/assets/dual-flame-logo.png" alt="RYVYNN" width={52} height={52}
              style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0,201,232,.4))', marginBottom: 28 }} />

            {/* Question */}
            <h2 className="lora" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 400,
              color: '#eef2fa', lineHeight: 1.3, marginBottom: 10 }}>
              What do you need right now?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 36 }}>
              No account. No judgment. You choose.
            </p>

            {/* 3 choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Choice 1 — Get it out */}
              <a href="/guardian"
                onClick={() => localStorage.setItem('ryvynn-onboarded', '1')}
                style={{
                  display: 'block', padding: '18px 24px', textDecoration: 'none',
                  background: 'rgba(0,201,232,.08)', border: '1.5px solid rgba(0,201,232,.35)',
                  borderRadius: 16, transition: 'all .15s', cursor: 'pointer',
                }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#00C9E8', marginBottom: 4 }}>
                  Get it out
                </div>
                <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                  Talk to Guardian. Private. Anonymous. Nothing saved.
                </div>
              </a>

              {/* Choice 2 — Be heard */}
              <a href="/wall"
                onClick={() => localStorage.setItem('ryvynn-onboarded', '1')}
                style={{
                  display: 'block', padding: '18px 24px', textDecoration: 'none',
                  background: 'rgba(124,92,191,.08)', border: '1.5px solid rgba(124,92,191,.3)',
                  borderRadius: 16, transition: 'all .15s', cursor: 'pointer',
                }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#7C5CBF', marginBottom: 4 }}>
                  Be heard
                </div>
                <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                  Leave something on the wall. Or read what others left.
                </div>
              </a>

              {/* Choice 3 — Just read */}
              <a href="/wall"
                onClick={() => localStorage.setItem('ryvynn-onboarded', '1')}
                style={{
                  display: 'block', padding: '18px 24px', textDecoration: 'none',
                  background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 16, transition: 'all .15s', cursor: 'pointer',
                }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#d8e0ee', marginBottom: 4 }}>
                  Just read
                </div>
                <div style={{ fontSize: 13, color: 'var(--dim)' }}>
                  See what other people are carrying. No pressure.
                </div>
              </a>
            </div>

            {/* Skip */}
            <button
              onClick={() => { localStorage.setItem('ryvynn-onboarded', '1'); setShowOnboarding(false); }}
              style={{ marginTop: 20, background: 'none', border: 'none',
                color: 'var(--dimmer)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Skip — just show me the site
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          FLOAT — appears after 8s. Calm. Not pushy.
      ═══════════════════════════════════════════════════════════════════ */}
      {showFloat && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 30, animation: 'fi .4s ease forwards' }}>
          <Link href="/guardian" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(7,8,15,.96)', border: '1.5px solid var(--cyan)',
            borderRadius: 99, padding: '12px 20px', textDecoration: 'none',
            boxShadow: '0 0 20px rgba(0,201,232,.18)', backdropFilter: 'blur(20px)',
            transition: 'all .15s',
            animation: 'none',
          }}>
            <Image src="/assets/dual-flame-logo.png" alt="" width={16} height={16} style={{ objectFit: 'contain' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--cyan)', fontFamily: 'inherit' }}>
              Talk now — nothing saved
            </span>
          </Link>
        </div>
      )}
    </main>
  );
}


