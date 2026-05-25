'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const TIERS = [
  {
    id: 'solo',
    name: 'Solo Flame',
    icon: '🔥',
    regular: 12.12,
    intro: 3.69,
    priceId: 'price_1TCvSUFXY1nWj7h7PAn2aUcb',
    coupon: 'WwwAy1Zm',
    badge: 'Most popular',
    borderClass: 'border-ryvynn-cyan',
    glowClass: 'shadow-[0_0_50px_rgba(0,217,255,0.3)]',
    cta: 'Ignite the flame',
    primary: true,
    features: [
      '120 Soul Tokens/mo',
      'AI Guardian companion',
      'Shadow → Miracle engine',
      'Dark Journal (encrypted)',
      'Crisis detection + 988',
      'Digital Eternity vault',
    ],
  },
  {
    id: 'family',
    name: 'Family Flame',
    icon: '🔥🔥',
    regular: 36.93,
    intro: null,
    priceId: 'price_1TCvSdFXY1nWj7h7UlL16h0R',
    coupon: null,
    badge: null,
    borderClass: 'border-ryvynn-purple',
    glowClass: 'shadow-[0_0_40px_rgba(139,92,246,0.2)]',
    cta: 'Join as a family',
    primary: false,
    features: [
      '369 Soul Tokens/mo (shared)',
      'Up to 6 family members',
      'Family crisis visibility',
      'Shared Miracle Wall',
      'Everything in Solo',
    ],
  },
  {
    id: 'therapist',
    name: 'Therapist Pro',
    icon: '💎',
    regular: 69.36,
    intro: null,
    priceId: 'price_1TCvSnFXY1nWj7h7zOhi50a7',
    coupon: null,
    badge: null,
    borderClass: 'border-ryvynn-cyan',
    glowClass: 'shadow-[0_0_40px_rgba(0,217,255,0.2)]',
    cta: 'Upgrade to Pro',
    primary: false,
    features: [
      '693 Soul Tokens/mo',
      'Client dashboards',
      'Crisis protocol access',
      'C-SSRS tracking',
      'Therapist-mode Guardian',
      'Everything in Solo',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: '⚡',
    regular: 96.36,
    intro: null,
    priceId: 'price_1TCvSxFXY1nWj7h7N6KbQ6Yt',
    coupon: null,
    badge: null,
    borderClass: 'border-gray-600',
    glowClass: '',
    cta: 'Contact us',
    primary: false,
    features: [
      '963 Soul Tokens/mo',
      'Unlimited team members',
      'API access',
      'White-label option',
      'SLA support',
      'Everything in Therapist Pro',
    ],
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, tierId: string, coupon?: string | null) => {
    if (!user) {
      window.location.href = '/sign-up';
      return;
    }
    setLoading(tierId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, couponId: coupon || undefined }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">

        {/* Mission first */}
        <div className="text-center mb-12">
          <Link href="/">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN"
              className="w-12 h-12 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0,217,255,0.4)]"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            RYVYNN is free.{' '}
            <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              Always.
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            No one in crisis will ever hit a paywall here. If you want to support the mission
            and get more for yourself — this is how.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            Anonymous account required to subscribe. No real name. No ID.{' '}
            <Link href="/sign-up" className="text-ryvynn-cyan hover:underline">
              Create yours →
            </Link>
          </div>
        </div>

        {/* Intro price callout */}
        <div className="bg-ryvynn-cyan/5 border border-ryvynn-cyan/20 rounded-2xl p-4 text-center mb-10">
          <span className="text-ryvynn-cyan text-sm font-semibold">First month $3.69 → </span>
          <span className="text-gray-300 text-sm">
            Auto-applied at checkout for Solo Flame. No code needed.
          </span>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={[
                'rounded-2xl border p-6 flex flex-col bg-gray-900/50',
                tier.borderClass,
                tier.glowClass,
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tier.icon}</span>
                  <span className="font-bold text-white">{tier.name}</span>
                </div>
                {tier.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ryvynn-cyan/10 text-ryvynn-cyan border border-ryvynn-cyan/20">
                    {tier.badge}
                  </span>
                )}
              </div>

              <div className="mb-4 mt-2">
                {tier.intro ? (
                  <div>
                    <span className="text-3xl font-bold text-white">${tier.intro}</span>
                    <span className="text-gray-500 text-sm">/first month</span>
                    <div className="text-gray-600 text-xs mt-0.5">then ${tier.regular}/mo</div>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-white">${tier.regular}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                )}
              </div>

              <ul className="space-y-1.5 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-ryvynn-cyan mt-0.5 flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(tier.priceId, tier.id, tier.coupon)}
                disabled={loading === tier.id}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
                style={{
                  background: tier.primary
                    ? 'linear-gradient(135deg, #00D9FF, #8B5CF6)'
                    : 'rgba(255,255,255,0.05)',
                  color: tier.primary ? '#000' : '#fff',
                  border: tier.primary ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {loading === tier.id ? 'Loading...' : tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Lifetime */}
        <div className="mt-8 bg-gradient-to-r from-ryvynn-cyan/5 to-ryvynn-purple/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-lg">Lifetime — $369.36</div>
            <div className="text-gray-400 text-sm mt-1">
              One time. Everything. Forever. For the people who know this matters.
            </div>
          </div>
          <button
            onClick={() => handleCheckout('price_1TCvT0FXY1nWj7h7tM5K3AzL', 'lifetime')}
            className="px-8 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            Light the flame forever →
          </button>
        </div>

        {/* Bottom */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            Crisis support is always free. 988 is always surfaced. No one gets locked out when it matters.
          </p>
          <p className="text-gray-700 text-xs">
            Cancel anytime. No questions. Powered by Stripe. Anonymous account only — no real name required.
          </p>
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors inline-block mt-2">
            ← back to RYVYNN
          </Link>
        </div>
      </div>
    </div>
  );
}
