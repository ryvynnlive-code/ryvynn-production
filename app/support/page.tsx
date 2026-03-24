'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const DONATION_TIERS = [
  { amount: 5,  priceId: 'price_1TEFPCFXY1nWj7h7uZdMTNXr', label: '$5',  emoji: '🕯️', desc: 'One day of server costs. Keeps the flame lit.' },
  { amount: 10, priceId: 'price_1TEFPbFXY1nWj7h7BrjdUovI', label: '$10', emoji: '🔥', desc: 'Funds 50 free crisis sessions. Real lives.' },
  { amount: 25, priceId: 'price_1TEFPgFXY1nWj7h7F5h6H4oc', label: '$25', emoji: '⚡', desc: 'One week of infrastructure. 24/7 uptime.' },
  { amount: 50, priceId: 'price_1TEFPlFXY1nWj7h78j3Usui9', label: '$50', emoji: '💎', desc: 'Sponsors a month of free crisis access.' },
];

const SHARE_MESSAGES = [
  {
    platform: 'Reddit',
    icon: '📢',
    subreddits: ['r/anxiety', 'r/mentalhealth', 'r/depression'],
    message: `I built an anonymous mental wellness AI that forgets everything the moment you close the tab. No login. No data stored. Zero surveillance — structurally, not by policy. Built it for my own 3AM spirals. Free forever for crisis. ryvynn.live`,
    color: 'border-orange-500/30 hover:border-orange-500/60',
    glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]',
  },
  {
    platform: 'X / Twitter',
    icon: '𝕏',
    message: `Most AI companions store your pain. RYVYNN forgets on purpose — structurally impossible to subpoena or leak. Free crisis tier forever. Built by one person, for everyone who needed this at 3AM. ryvynn.live`,
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

export default function SupportPage() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(DONATION_TIERS[1]);
  const [customAmount, setCustomAmount] = useState('');
  const [donating, setDonating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleDonate() {
    setError('');
    const finalAmount = customAmount ? parseInt(customAmount) : selectedTier.amount;
    if (!finalAmount || finalAmount < 1) return;
    setDonating(true);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedTier.priceId,
          userId: user?.id ?? null,
          userEmail: user?.email ?? null,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Checkout failed. Please try again.');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setDonating(false);
    }
  }

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(platform);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <main className="min-h-screen bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6">🔥</div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              Fuel the Mission
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            RYVYNN runs on zero revenue and zero funding. Crisis access stays free forever.
            But servers cost real money. Every dollar extends the flame.
          </p>
        </div>

        {/* Donation Card */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-3xl p-8 mb-12 shadow-[0_0_50px_rgba(0,217,255,0.2)]">
          <h2 className="text-3xl font-black text-white mb-8 text-center">
            Choose Your Contribution
          </h2>

          {/* Tier Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {DONATION_TIERS.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => { setSelectedTier(tier); setCustomAmount(''); }}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-center hover:scale-105 ${
                  selectedTier.amount === tier.amount && !customAmount
                    ? 'border-ryvynn-cyan bg-ryvynn-cyan/10 shadow-[0_0_20px_rgba(0,217,255,0.3)]'
                    : 'border-gray-700 hover:border-ryvynn-purple'
                }`}
              >
                <div className="text-3xl mb-1">{tier.emoji}</div>
                <div className="text-2xl font-black text-white">{tier.label}</div>
                <div className="text-xs text-gray-400 mt-1">{tier.desc}</div>
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-black/60 border-2 border-gray-700 focus:border-ryvynn-cyan rounded-xl py-3 pl-10 pr-4 text-white text-lg placeholder-gray-600 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleDonate}
            disabled={donating}
            className="w-full py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {donating
              ? '⚡ Igniting...'
              : `🔥 Donate ${customAmount ? `$${customAmount}` : selectedTier.label} — Fuel the Flame`}
          </button>

          <p className="text-center text-gray-500 text-sm mt-4">
            Secure checkout via Stripe. One-time donation. No subscription. No guilt.
          </p>
        </div>

        {/* What Your Money Does */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '🛡', title: 'Free Crisis Forever', desc: 'Your donation directly subsidizes free access for people in crisis who cannot pay.' },
            { icon: '⚡', title: '24/7 Uptime', desc: 'Servers, APIs, CDN — they all cost money. Every dollar buys another hour online.' },
            { icon: '🔥', title: 'Mission Fuel', desc: 'RYVYNN is built by one person with zero funding. You are the investor that makes this possible.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-black text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Spread the Word */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-center text-white mb-3">
            Can&apos;t donate? Spread the flame.
          </h2>
          <p className="text-gray-400 text-center mb-8">Copy and post. One share reaches someone who needs this tonight.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {SHARE_MESSAGES.map((s) => (
              <div
                key={s.platform}
                className={`bg-gray-900/50 border-2 rounded-2xl p-5 transition-all duration-200 cursor-pointer ${s.color} ${s.glow}`}
                onClick={() => copyToClipboard(s.message, s.platform)}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="font-bold text-white">{s.platform}</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4 line-clamp-4">{s.message}</p>
                <div className="text-xs font-bold text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  {copied === s.platform ? '✓ Copied!' : 'Copy Message'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Ways */}
        <div className="border border-gray-800 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-black text-white mb-6">Other Ways to Help</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: '⭐', title: 'Star on GitHub', href: 'https://github.com/ryvynnlive-code/ryvynn-production', cta: 'Star the Repo' },
              { icon: '📝', title: 'Share Your Story', href: 'mailto:ryvynn.live@gmail.com?subject=My RYVYNN Story', cta: 'Send Anonymously' },
              { icon: '🤝', title: 'Partner / Refer', href: 'mailto:ryvynn.live@gmail.com?subject=Partnership Inquiry', cta: "Let's Connect" },
              { icon: '💬', title: 'Upgrade to Premium', href: '/pricing', cta: 'See Plans' },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-800 hover:border-ryvynn-purple transition-all hover:bg-ryvynn-purple/5 text-left"
              >
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <div className="font-bold text-white text-sm">{item.title}</div>
                  <div className="text-xs text-ryvynn-cyan mt-0.5">{item.cta} →</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center mt-16 text-gray-600 text-sm">
          <p>RYVYNN is a product of NEXXT GEN INNOVATIONS LLC / AONIXX.</p>
          <p className="mt-1">Donations are not tax-deductible. For mission support, not equity.</p>
          <Link href="/pricing" className="text-ryvynn-cyan hover:underline mt-2 inline-block">
            Looking for premium plans? →
          </Link>
        </div>
      </div>
    </main>
  );
}
