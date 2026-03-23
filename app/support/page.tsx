'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const DONATION_AMOUNTS = [
  { amount: 5,   label: '$5',   desc: 'Keeps the lights on for one day',      emoji: '🕯️' },
  { amount: 10,  label: '$10',  desc: 'Funds 50 free crisis sessions',         emoji: '🔥' },
  { amount: 25,  label: '$25',  desc: 'Pays server costs for a week',          emoji: '⚡' },
  { amount: 50,  label: '$50',  desc: 'Sponsors a month of free crisis access',emoji: '💎' },
];

const SHARE_MESSAGES = [
  {
    platform: 'Reddit',
    icon: '📢',
    subreddits: ['r/anxiety', 'r/mentalhealth', 'r/depression', 'r/therapy'],
    message: `I built an anonymous mental wellness AI that forgets everything the moment you close the tab. No login. No data stored. Zero surveillance — structurally, not by policy. Built it for my own 3AM spirals. Free forever for crisis. ryvynn.live`,
    color: 'border-orange-500/30 hover:border-orange-500/60',
    glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
  {
    platform: 'X / Twitter',
    icon: '𝕏',
    message: `Most AI companions store your pain. @ryvynn_live forgets on purpose — structurally impossible to subpoena or leak. Free crisis tier forever. Built by one person, for everyone who needed this at 3AM. ryvynn.live`,
    color: 'border-white/20 hover:border-white/50',
    glow: 'hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]',
  },
  {
    platform: 'TikTok / Instagram',
    icon: '🎬',
    message: `POV: you needed someone at 3AM and didn't want to be remembered\n\nryvynn.live — it literally forgets when you close the tab. Zero data. Free for crisis. No login ever.`,
    color: 'border-pink-500/30 hover:border-pink-500/60',
    glow: 'hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]',
  },
];

const WAYS_TO_HELP = [
  { icon: '⭐', title: 'Star on GitHub', desc: 'Open source credibility matters for grants and partnerships.', href: 'https://github.com/ryvynnlive-code/ryvynn-production', cta: 'Star the Repo' },
  { icon: '📝', title: 'Leave a Testimonial', desc: 'Real words from real people change minds. Drop your story anonymously.', href: 'mailto:ryvynn.live@gmail.com?subject=My RYVYNN Story', cta: 'Send Your Story' },
  { icon: '🤝', title: 'Partner Referral', desc: 'Work in mental health, HR, or schools? We want to talk.', href: 'mailto:ryvynn.live@gmail.com?subject=Partnership Inquiry', cta: 'Let\'s Connect' },
  { icon: '📣', title: 'Share With One Person', desc: 'If you know someone who needed this at 3AM — send it.', href: 'https://ryvynn.live', cta: 'Copy Link' },
];

export default function SupportPage() {
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(10);
  const [customAmount, setCustomAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleDonate() {
    setDonating(true);
    const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount < 1) { setDonating(false); return; }

    try {
      // Create a one-time payment session via Stripe checkout
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Uses a donation price ID — falls back to amount-based if not set
          priceId: process.env.NEXT_PUBLIC_DONATION_PRICE_ID || 'price_donation',
          donationAmount: finalAmount * 100, // cents
          userId: user?.id,
          userEmail: user?.email,
          mode: 'payment',
          isoDonation: true,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback: direct Stripe payment link
        window.open('https://buy.stripe.com/donate', '_blank');
      }
    } catch {
      // Fallback to direct link
      window.open('https://ryvynn.live', '_blank');
    } finally {
      setDonating(false);
    }
  }

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 bg-black relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-ryvynn-cyan/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-ryvynn-purple/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-20">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="text-center space-y-6">
          <img src="/assets/dual-flame-logo.png" alt="RYVYNN" className="w-20 h-20 object-contain mx-auto drop-shadow-[0_0_30px_rgba(0,217,255,0.5)]" />
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">
            Help Keep the{' '}
            <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              Flame Burning
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            RYVYNN is a solo-built, zero-surveillance mental wellness platform.
            Free crisis access is the mission — not the marketing.
            Every dollar keeps the servers on and the free tier alive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><span className="text-ryvynn-cyan">✓</span> No VC funding</span>
            <span className="flex items-center gap-2"><span className="text-ryvynn-cyan">✓</span> Zero surveillance</span>
            <span className="flex items-center gap-2"><span className="text-ryvynn-cyan">✓</span> Free crisis tier forever</span>
            <span className="flex items-center gap-2"><span className="text-ryvynn-cyan">✓</span> Built by one person</span>
          </div>
        </div>

        {/* ── Donate ─────────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-ryvynn-cyan text-xs font-mono uppercase tracking-widest mb-2">Support the Mission</p>
            <h2 className="text-3xl font-black text-white">Buy a coffee for the Flame 🕯️</h2>
            <p className="text-gray-400 mt-2">One-time. No subscription. No account required.</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-2xl p-8">

            {/* Amount grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {DONATION_AMOUNTS.map((d) => (
                <button
                  key={d.amount}
                  onClick={() => { setSelectedAmount(d.amount); setCustomAmount(''); }}
                  className={`p-4 rounded-xl border-2 text-center transition-all duration-200 hover:scale-[1.02] ${
                    selectedAmount === d.amount && !customAmount
                      ? 'border-ryvynn-cyan bg-ryvynn-cyan/10 shadow-[0_0_20px_rgba(0,217,255,0.15)]'
                      : 'border-gray-700 hover:border-ryvynn-purple'
                  }`}
                >
                  <div className="text-2xl mb-1">{d.emoji}</div>
                  <div className="text-2xl font-black text-white">{d.label}</div>
                  <div className="text-xs text-gray-500 mt-1 leading-tight">{d.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-gray-400 text-lg font-bold">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(0); }}
                placeholder="Custom amount"
                min="1"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-cyan text-lg"
              />
            </div>

            {/* Donate button */}
            <button
              onClick={handleDonate}
              disabled={donating || (!selectedAmount && !customAmount)}
              className="w-full py-5 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {donating ? '⚡ Opening checkout...' : `🔥 Donate $${customAmount || selectedAmount} — Keep the Flame Alive`}
            </button>

            <p className="text-center text-gray-600 text-xs mt-3">
              Processed securely by Stripe. RYVYNN never stores your payment data.
            </p>
          </div>
        </section>

        {/* ── Subscribe ──────────────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-ryvynn-purple text-xs font-mono uppercase tracking-widest mb-2">Unlock More</p>
            <h2 className="text-3xl font-black text-white">Ignite your subscription</h2>
            <p className="text-gray-400 mt-2">
              Premium features fund free crisis access for everyone who can&apos;t pay.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'Solo Flame',
                price: '$12.12',
                intro: 'First month $3.69',
                couponCode: 'FIRSTFLAME',
                features: ['120 Soul Tokens/mo', 'AI Guardian companion', 'Shadow → Miracle engine', 'Encrypted Journal', 'Digital Eternity Vault'],
                href: '/pricing',
                color: 'border-ryvynn-cyan',
                glow: 'shadow-[0_0_30px_rgba(0,217,255,0.15)]',
              },
              {
                name: 'Lifetime Flame',
                price: '$369.36',
                intro: 'Pay once. Own forever.',
                couponCode: null,
                features: ['Everything, forever', 'Founding member status', 'Listed in app credits', 'All future features', 'Eternal Soul Tokens'],
                href: '/pricing',
                color: 'border-ryvynn-purple',
                glow: 'shadow-[0_0_30px_rgba(139,92,246,0.2)]',
              },
            ].map((tier) => (
              <div key={tier.name} className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 ${tier.color} ${tier.glow} rounded-2xl p-6 hover:scale-[1.01] transition-all`}>
                <h3 className="text-2xl font-black text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                </div>
                <p className="text-ryvynn-cyan text-sm font-bold mb-4">{tier.intro}</p>
                {tier.couponCode && (
                  <div className="flex items-center gap-2 mb-4 bg-ryvynn-purple/10 border border-ryvynn-purple/30 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-400">Use code:</span>
                    <span className="text-ryvynn-cyan font-mono font-bold text-sm">{tier.couponCode}</span>
                  </div>
                )}
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <span className="text-ryvynn-cyan">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`block w-full py-4 text-center font-black text-lg rounded-xl transition-all hover:scale-[1.02] bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-black`}
                >
                  🔥 Ignite
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Spread the Word ────────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-ryvynn-cyan text-xs font-mono uppercase tracking-widest mb-2">Zero Cost to You</p>
            <h2 className="text-3xl font-black text-white">Spread the Flame</h2>
            <p className="text-gray-400 mt-2">
              The best thing you can do costs nothing. One share reaches one person who needed this at 3AM.
            </p>
          </div>

          <div className="space-y-4">
            {SHARE_MESSAGES.map((platform) => (
              <div
                key={platform.platform}
                className={`bg-gradient-to-br from-gray-900 via-black to-gray-900 border ${platform.color} ${platform.glow} rounded-2xl p-6 transition-all`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h3 className="font-bold text-white">{platform.platform}</h3>
                      {'subreddits' in platform && (
                        <p className="text-xs text-gray-500">{(platform as typeof platform & { subreddits: string[] }).subreddits.join(' · ')}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(platform.message, platform.platform)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      copied === platform.platform
                        ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:border-ryvynn-cyan hover:text-ryvynn-cyan'
                    }`}
                  >
                    {copied === platform.platform ? '✓ Copied' : 'Copy Post'}
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed bg-black/30 rounded-xl p-4 font-mono whitespace-pre-line">
                  {platform.message}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Other Ways to Help ─────────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <p className="text-ryvynn-purple text-xs font-mono uppercase tracking-widest mb-2">Beyond Money</p>
            <h2 className="text-3xl font-black text-white">Other Ways to Help</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {WAYS_TO_HELP.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target={item.href.startsWith('mailto') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                onClick={item.cta === 'Copy Link' ? (e) => { e.preventDefault(); copyToClipboard('https://ryvynn.live', item.title); } : undefined}
                className="group bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 hover:border-ryvynn-purple rounded-2xl p-6 transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.desc}</p>
                <span className={`text-sm font-bold transition-colors ${copied === item.title ? 'text-green-400' : 'text-ryvynn-cyan group-hover:text-white'}`}>
                  {copied === item.title ? '✓ Copied!' : item.cta} →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Foundation Banner ──────────────────────────────────── */}
        <section>
          <div className="bg-gradient-to-r from-black via-gray-900 to-black border-2 border-ryvynn-cyan/30 rounded-2xl p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-cyan/5 to-ryvynn-purple/5 pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="text-4xl">🔥</div>
              <h3 className="text-2xl font-black text-white">RYVYNN Foundation — Coming Soon</h3>
              <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
                A 501(c)(3) being formed to permanently fund free crisis access for recovery populations,
                tribal nations, corrections, and underserved communities. Your donations today help
                build the case.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <span className="px-3 py-1 bg-ryvynn-cyan/10 border border-ryvynn-cyan/20 rounded-full text-ryvynn-cyan">EIN filed</span>
                <span className="px-3 py-1 bg-ryvynn-purple/10 border border-ryvynn-purple/20 rounded-full text-ryvynn-purple">SAM.gov registered</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">CAGE Code 0YQ06</span>
              </div>
              <p className="text-gray-600 text-xs pt-2">
                Built by one person. Tucson, AZ. Zero VC funding. ~2,700 hours of sweat equity.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ─────────────────────────────────────────── */}
        <section className="text-center space-y-4 pb-8">
          <p className="text-gray-500 text-sm">Not ready to commit? The core is free forever.</p>
          <Link
            href="/guardian"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-black font-black text-xl rounded-full shadow-[0_0_40px_rgba(0,217,255,0.3)] hover:shadow-[0_0_60px_rgba(0,217,255,0.5)] hover:scale-105 transition-all"
          >
            🛡️ Start for Free — Zero Trace
          </Link>
          <p className="text-gray-600 text-xs">No login. No data. Gone when you close the tab.</p>
        </section>

      </div>
    </main>
  );
}
