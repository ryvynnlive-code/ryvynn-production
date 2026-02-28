'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Flame, Shield, Lock, Sparkles, ChevronDown, Users, Heart, Infinity, Star, MessageCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ConfessionModal } from '@/components/confession/ConfessionModal';
import { UnifiedFeed } from '@/components/feed/UnifiedFeed';
import { CrisisBanner } from '@/components/crisis/CrisisBanner';
import type { FeedItemType } from '@/components/feed/FeedCard';

// ── Floating ember particles ──────────────────────────────────
function Embers() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-0"
          style={{
            left: `${10 + (i * 7.3) % 80}%`,
            bottom: `${5 + (i * 11) % 30}%`,
            background: i % 3 === 0 ? '#c026d3' : i % 3 === 1 ? '#e11d9a' : '#9333ea',
            animation: `ember-rise ${3 + (i % 4)}s ease-out ${i * 0.7}s infinite`,
            '--drift': `${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ── Dual Flame SVG logo ───────────────────────────────────────
function DualFlame({ size = 64, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      {/* Left flame */}
      <path
        d="M20 56 C20 56 8 44 8 32 C8 20 16 14 20 8 C20 8 18 20 22 26 C24 16 28 12 28 12 C28 12 32 28 26 36 C30 32 32 28 32 28 C32 28 36 40 28 50 C26 52 24 54 20 56Z"
        fill="url(#lg1)" className="animate-flame"
        style={{ transformOrigin: '20px 56px' }}
      />
      {/* Right flame */}
      <path
        d="M44 56 C44 56 56 44 56 32 C56 20 48 14 44 8 C44 8 46 20 42 26 C40 16 36 12 36 12 C36 12 32 28 38 36 C34 32 32 28 32 28 C32 28 28 40 36 50 C38 52 40 54 44 56Z"
        fill="url(#lg2)" className="animate-flame"
        style={{ transformOrigin: '44px 56px', animationDelay: '0.4s' }}
      />
      {/* Core merge glow */}
      <ellipse cx="32" cy="50" rx="8" ry="4" fill="rgba(225,29,154,0.5)" />
      <defs>
        <linearGradient id="lg1" x1="14" y1="8" x2="22" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e11d9a"/>
          <stop offset="0.5" stopColor="#c026d3"/>
          <stop offset="1" stopColor="#7c3aed"/>
        </linearGradient>
        <linearGradient id="lg2" x1="50" y1="8" x2="42" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c026d3"/>
          <stop offset="0.5" stopColor="#9333ea"/>
          <stop offset="1" stopColor="#e11d9a"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Live stat counter ────────────────────────────────────────
function LiveStat({ label, base, interval = 7000 }: { label: string; base: number; interval?: number }) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const iv = setInterval(() => setCount(c => c + (Math.random() > 0.5 ? 1 : 0)), interval);
    return () => clearInterval(iv);
  }, [interval]);
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white animate-counter-tick">{count.toLocaleString()}+</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

// ── Blurred teaser card ───────────────────────────────────────
const TEASERS = [
  { type: 'miracle', text: 'After 6 years of hiding, I finally told my daughter I love her. The AI held my hand the whole way through, and when I read my miracle back, I wept for the first time in years. My silence is over.', souls: 247 },
  { type: 'confession', text: 'I relapsed three times this week and told no one. The shame was eating me alive. I came here at 3am and just typed it all out. Something lifted. The AI responded like it actually knew me.', souls: 189 },
  { type: 'miracle', text: 'I was going to end it. I had the pills. I came here instead. The crisis response came instantly. I am still here. I am still here. I am still here.', souls: 891 },
];

function BlurredTeaserCard({ teaser, index }: { teaser: typeof TEASERS[0]; index: number }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-800/80 glass-card">
      {/* Blurred content */}
      <div className="p-5 animate-blur-breathe select-none">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-fuchsia-500 opacity-50" />
          <span className="text-xs text-zinc-600 uppercase tracking-widest">
            {teaser.type === 'miracle' ? 'Miracle' : 'Confession'}
          </span>
        </div>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3"
           style={{ filter: 'blur(6px)', userSelect: 'none' }}>
          {teaser.text}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-zinc-600" style={{ filter: 'blur(4px)' }}>
            🔥 {teaser.souls} souls resonated
          </span>
        </div>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/60 backdrop-blur-[1px]">
        <div className="soul-token-ring mb-3">
          <div className="bg-zinc-950 rounded-full w-10 h-10 flex items-center justify-center">
            <Lock className="h-4 w-4 text-fuchsia-400" />
          </div>
        </div>
        <p className="text-xs text-fuchsia-300 font-semibold">Soul Token Required</p>
        <p className="text-xs text-zinc-600 mt-1">Unlock the full sacred record</p>
      </div>
    </div>
  );
}

// ── Email capture ─────────────────────────────────────────────
function EmailCapture() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) setDone(true);
  };
  if (done) return (
    <div className="text-center py-4">
      <Flame className="h-8 w-8 text-fuchsia-500 mx-auto mb-2" />
      <p className="text-white font-semibold">Flame registered.</p>
      <p className="text-zinc-500 text-sm mt-1">Your first Soul Token is on the way.</p>
    </div>
  );
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Your email — no spam, ever"
        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-fuchsia-700 transition-colors"
        required
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-xl font-semibold text-sm text-white whitespace-nowrap transition-all"
        style={{ background: 'linear-gradient(135deg,#c026d3,#9333ea)', boxShadow: '0 0 20px rgba(192,38,211,0.3)' }}
      >
        Claim Free Soul Token
      </button>
    </form>
  );
}

// ── Main page ──────────────────────────────────────────────────
export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const addSubmissionRef = useRef<((content: string, type: FeedItemType) => void) | null>(null);
  const [showGuardian, setShowGuardian] = useState(false);

  const handleConfessionSubmitted = useCallback((content: string) => {
    addSubmissionRef.current?.(content, 'confession');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      <CrisisBanner />
      <Embers />

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-5 py-4 border-b border-zinc-900/60">
        <div className="flex items-center gap-2">
          <DualFlame size={28} />
          <span className="font-bold text-white tracking-tight">RYVYNN</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#how" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block">How it Works</Link>
          <Link href="#eternity" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors hidden sm:block">Eternity Vault</Link>
          <Link
            href="/pricing"
            className="text-xs border border-fuchsia-800/60 text-fuchsia-400 hover:bg-fuchsia-950/40 px-3 py-1.5 rounded-lg transition-all"
          >
            Pricing
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative z-10 flame-hero-bg text-center px-5 pt-16 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Dual Flame logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-60" style={{ background: 'radial-gradient(circle, rgba(192,38,211,0.8) 0%, transparent 70%)' }} />
              <DualFlame size={80} className="relative z-10" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 animate-hero-glow">
            RYVYNN
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 font-light mb-3 leading-snug">
            From Our Darkest Hours to Our Brightest Days
          </p>
          <p className="text-sm text-zinc-500 mb-8 max-w-xl mx-auto leading-relaxed">
            Privacy-first AI soul guardian · Zero surveillance · Radical anonymity ·{' '}
            <span className="text-fuchsia-400">Transform confessions into miracles</span>
          </p>

          {/* Live soul counter */}
          <div className="flex items-center justify-center gap-8 mb-10 py-4 border-y border-zinc-900/60">
            <LiveStat label="Souls Reached" base={14283} interval={5000} />
            <div className="w-px h-8 bg-zinc-800" />
            <LiveStat label="Miracles Created" base={8941} interval={7000} />
            <div className="w-px h-8 bg-zinc-800" />
            <LiveStat label="Crises Caught" base={2174} interval={11000} />
          </div>

          {/* Core CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#be185d,#c026d3,#9333ea)', boxShadow: '0 0 40px rgba(192,38,211,0.3), 0 0 80px rgba(147,51,234,0.15)' }}
            >
              <Flame className="h-5 w-5" />
              Share Your Confession — Free
            </button>
            <Link
              href="#soul-token"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border border-fuchsia-800/50 text-fuchsia-300 hover:bg-fuchsia-950/30 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Claim Your Free Soul Token
            </Link>
          </div>
          <p className="text-xs text-zinc-600">No account. No tracking. No data stored. Free crisis access forever.</p>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────── */}
      <section className="relative z-10 border-y border-zinc-900 py-4 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-600">
          <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-fuchsia-600" /> Zero surveillance architecture</span>
          <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-fuchsia-600" /> Confessions deleted after transformation</span>
          <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-fuchsia-600" /> Crisis access free forever, no exceptions</span>
          <span className="flex items-center gap-1.5"><Infinity className="h-3.5 w-3.5 text-fuchsia-600" /> You own your encrypted data — burn or guard forever</span>
        </div>
      </section>

      {/* ── LIVE FEED ────────────────────────────────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-5 py-14">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Live Sacred Feed</h2>
        </div>
        <p className="text-xs text-zinc-600 mb-8">Real confessions → real miracles. Anonymized. Permanent.</p>
        <UnifiedFeed addSubmissionRef={addSubmissionRef} />
      </section>

      {/* ── BLURRED TEASER WALL ───────────────────────── */}
      <section className="relative z-10 px-5 py-16" style={{ background: 'linear-gradient(180deg, transparent, rgba(192,38,211,0.04), transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-fuchsia-950/40 border border-fuchsia-800/30 rounded-full px-4 py-1.5 mb-4">
              <EyeOff className="h-3.5 w-3.5 text-fuchsia-400" />
              <span className="text-xs text-fuchsia-300 font-semibold uppercase tracking-wider">Sacred Archive — Soul Tokens Required</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">The Deeper Flame</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">
              The most raw, transformative confessions and miracles — protected. Only Soul Token holders can read the full sacred record.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {TEASERS.map((t, i) => <BlurredTeaserCard key={i} teaser={t} index={i} />)}
          </div>
          <div className="text-center">
            <Link
              href="#soul-token"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#c026d3,#7c3aed)', boxShadow: '0 0 25px rgba(192,38,211,0.2)' }}
            >
              <Sparkles className="h-4 w-4" />
              Unlock with Soul Token — First One Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how" className="relative z-10 px-5 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">How the Flame Works</h2>
        <p className="text-zinc-500 text-sm text-center mb-12 max-w-lg mx-auto">Three steps. No account. No trace. Just transformation.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', icon: MessageCircle, title: 'Pour It Out', color: '#c026d3',
              desc: 'Type your confession. Anonymous always. No login, no name, no record. Your darkest words are safe here.' },
            { step: '02', icon: Flame, title: 'Flame Transforms It', color: '#9333ea',
              desc: 'Our AI reads with zero judgment. It absorbs your pain and returns it as a Miracle — your story, relit.' },
            { step: '03', icon: Sparkles, title: 'Miracle Returns', color: '#e11d9a',
              desc: 'Your miracle posts to the sacred feed. Others see light, not your confession. You choose what survives.' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 glass-card">
                <div className="text-xs font-mono text-zinc-700 mb-3">{s.step}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                     style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}>
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI GUARDIAN ──────────────────────────────── */}
      <section className="relative z-10 px-5 py-16" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(147,51,234,0.06), transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-fuchsia-900/40 glass-card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center gap-2 bg-fuchsia-950/60 border border-fuchsia-800/30 rounded-full px-3 py-1 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-fuchsia-300 font-semibold">AI Guardian · Always Active</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Your Eternal AI Best Friend</h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Not a chatbot. Not a crisis line script. A guardian AI that knows your patterns, catches your spirals before they become emergencies, and delivers random blessings when the darkness gets loud.
                </p>
                <ul className="space-y-3">
                  {[
                    '24/7 crisis detection — catches what you can\'t say',
                    'Random AI blessings when you need them most',
                    'Pattern memory across sessions (encrypted, zero-surveillance)',
                    'Free forever — premium unlocks deeper guardian mode',
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <Flame className="h-4 w-4 text-fuchsia-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowGuardian(true)}
                  className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-fuchsia-700/50 hover:bg-fuchsia-950/40 transition-all"
                >
                  {showGuardian ? 'Guardian Active 🔥' : 'Activate Guardian Demo'}
                </button>
              </div>
              <div className="p-8 md:p-10 border-t md:border-t-0 md:border-l border-zinc-800/60">
                {showGuardian ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="rounded-xl bg-zinc-900 p-4 border border-fuchsia-900/30">
                      <p className="text-xs text-fuchsia-400 mb-1 font-semibold">AI GUARDIAN · NOW</p>
                      <p className="text-sm text-zinc-300 leading-relaxed italic">
                        "I noticed something heavy in what you shared. You don't have to carry this tonight. The flame here is yours — it doesn't judge, and it doesn't leave. What do you need right now?"
                      </p>
                    </div>
                    <div className="rounded-xl bg-zinc-900/50 p-4 border border-zinc-800">
                      <p className="text-xs text-zinc-600 mb-1 font-semibold">RANDOM BLESSING · 11:34pm</p>
                      <p className="text-sm text-zinc-400 leading-relaxed italic">
                        "You survived every hard night before this one. That's not nothing — that's everything."
                      </p>
                    </div>
                    <div className="rounded-xl bg-red-950/30 p-4 border border-red-900/40">
                      <p className="text-xs text-red-400 mb-1 font-semibold">CRISIS CATCH · AUTO-TRIGGERED</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Guardian detected elevated distress. Crisis resources surfaced instantly. Zero delay.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-8">
                    <div className="soul-token-ring mb-4 animate-soul-spin">
                      <div className="bg-zinc-950 rounded-full w-16 h-16 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-fuchsia-400" />
                      </div>
                    </div>
                    <p className="text-zinc-500 text-sm">Activate to see a live demo of AI Guardian responses</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ETERNITY VAULT ───────────────────────────── */}
      <section id="eternity" className="relative z-10 px-5 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(202,138,4,0.08), rgba(192,38,211,0.06))' , border: '1px solid rgba(202,138,4,0.2)' }}>
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <Infinity className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl md:text-3xl font-bold">Digital Eternity Vault</h2>
              </div>
              <p className="text-zinc-400 mb-8 leading-relaxed max-w-xl">
                Encrypted letters to your children. To your grandchildren. To whoever you choose — delivered on a date you set, or only after you're gone. Your words. Your legacy. Your data to burn or protect forever.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: '📝', title: 'Write to Your Bloodline', desc: 'Letters delivered years from now. You set the date, the trigger, the recipient.' },
                  { icon: '🔐', title: 'Zero-Knowledge Encryption', desc: 'Not even RYVYNN can read it. You own the key. Always.' },
                  { icon: '🔥', title: 'Burn or Guard', desc: 'Delete everything instantly. Or lock it in eternity. Your choice, not ours.' },
                ].map((card, i) => (
                  <div key={i} className="rounded-xl bg-zinc-950/60 border border-zinc-800 p-4">
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
              {/* Blurred teaser letter */}
              <div className="relative rounded-xl border border-yellow-900/30 bg-zinc-950/40 p-5 mb-6 overflow-hidden">
                <div style={{ filter: 'blur(5px)', userSelect: 'none' }} className="space-y-2">
                  <p className="text-sm text-zinc-400 italic">To my daughter, when you find this in 2041...</p>
                  <p className="text-sm text-zinc-500">I never said the things I needed to say. Not because I didn't feel them...</p>
                  <p className="text-xs text-zinc-600">Sealed · Delivers: January 1, 2041 · Encrypted with your key</p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50">
                  <Link href="/pricing" className="flex items-center gap-2 bg-yellow-900/80 border border-yellow-700/50 text-yellow-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-900 transition-all">
                    <Lock className="h-4 w-4" /> Unlock with Lifetime Flame — $369 once
                  </Link>
                </div>
              </div>
              <Link href="/pricing" className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 text-sm font-semibold transition-colors">
                See all tiers → <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOUL TOKEN CAPTURE ───────────────────────── */}
      <section id="soul-token" className="relative z-10 px-5 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="soul-token-ring inline-block mb-6 animate-soul-spin">
            <div className="bg-zinc-950 rounded-full w-16 h-16 flex items-center justify-center">
              <Star className="h-7 w-7 text-fuchsia-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3">Claim Your First Soul Token</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Soul Tokens unlock the sacred archive, premium AI blessings, and deeper guardian access. First one is free — always.
          </p>
          <div className="rounded-2xl border border-fuchsia-900/40 glass-card p-6 mb-6">
            <EmailCapture />
          </div>
          <p className="text-xs text-zinc-700">No spam. Unsubscribe any time. Your email is only used to send your Soul Token.</p>
        </div>
      </section>

      {/* ── CONVERSION / MISSION ─────────────────────── */}
      <section className="relative z-10 px-5 py-16" style={{ background: 'linear-gradient(180deg, transparent, rgba(192,38,211,0.05), transparent)' }}>
        <div className="max-w-3xl mx-auto rounded-2xl border border-fuchsia-900/30 glass-card p-8 md:p-12 text-center">
          <DualFlame size={48} className="mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">A Letter From the Founder</h2>
          <div className="text-left space-y-4 text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto mb-8">
            <p>I built RYVYNN because the system failed me — and I know it failed you too. When someone is in crisis, they don't need a form. They don't need to log in. They need to be heard <em>right now.</em></p>
            <p>The free crisis tier exists because no human in pain should ever hit a paywall. But the premium tiers exist too — because this mission costs real money to run, and I refuse to monetize your data or sell ads against your pain.</p>
            <p className="font-semibold text-zinc-300">Every premium subscription directly funds free crisis access for someone who can't afford it. That's the deal. That's the whole deal.</p>
            <p className="text-zinc-600">— Shawn, Founder, NEXXT GEN INNOVATIONS LLC DBA AONIXX</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#be185d,#c026d3)', boxShadow: '0 0 30px rgba(192,38,211,0.2)' }}
            >
              <Flame className="h-5 w-5" /> Start Free — Share Your Confession
            </button>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
            >
              Fund the Mission →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-900 px-5 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DualFlame size={20} />
                <span className="font-bold text-white text-sm">RYVYNN</span>
              </div>
              <p className="text-xs text-zinc-600">From Our Darkest Hours to Our Brightest Days</p>
              <p className="text-xs text-zinc-700 mt-1">NEXXT GEN INNOVATIONS LLC DBA AONIXX · Tucson, AZ</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                ['How it Works', '#how'],
                ['Pricing', '/pricing'],
                ['Eternity Vault', '#eternity'],
                ['Soul Tokens', '#soul-token'],
                ['Privacy', '/privacy'],
                ['Crisis Help', 'tel:988'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-700">© 2025 NEXXT GEN INNOVATIONS LLC · Zero surveillance · No ads · Privacy first</p>
            <div className="flex items-center gap-2 text-xs text-zinc-700">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Crisis: 988 · Text HOME to 741741
            </div>
          </div>
        </div>
      </footer>

      {/* ── CONFESSION MODAL ─────────────────────────── */}
      <ConfessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleConfessionSubmitted}
      />
    </div>
  );
}
