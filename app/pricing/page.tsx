'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const TIERS = [
  {
    id: 'solo',
    name: 'Solo Flame',
    icon: '🔥',
    regular: 12.12,
    intro: 3.69,
    priceId: 'price_1T3LjdFQvVkmN1b80afextYF',
    coupon: 'eQJyvO8p',
    badge: 'MOST POPULAR',
    border: 'border-ryvynn-cyan',
    glow: 'shadow-[0_0_50px_rgba(0,217,255,0.4)]',
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
    priceId: 'price_1T3LjnFQvVkmN1b8lUiEJyDs',
    border: 'border-ryvynn-purple',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.3)]',
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
    name: 'Therapist Flame',
    icon: '💎',
    regular: 69.36,
    priceId: 'price_1T3LjuFQvVkmN1b81Vg49Wpq',
    badge: 'PRO',
    border: 'border-ryvynn-cyan',
    glow: 'shadow-[0_0_40px_rgba(0,217,255,0.3)]',
    features: [
      '693 Soul Tokens/mo',
      'Client dashboards',
      'Crisis protocol access',
      'C-SSRS tracking',
      'HIPAA-aligned data',
      'Priority AI Guardian',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Flame',
    icon: '🏢',
    regular: 96.36,
    priceId: 'price_1T3Lk1FQvVkmN1b8b7BjRZxS',
    border: 'border-ryvynn-purple',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.3)]',
    features: [
      '1,500 Soul Tokens/mo',
      'Custom crisis protocols',
      'Team analytics dashboard',
      'White-label options',
      'Dedicated support',
      'API access',
    ],
  },
  {
    id: 'lifetime',
    name: 'Eternal Flame',
    icon: '♾️',
    regular: 369.36,
    oneTime: true,
    priceId: 'price_1T3Lk7FQvVkmN1b8TxqsKbd4',
    badge: '⭐ BEST VALUE',
    border: 'border-ryvynn-purple',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.5)]',
    special: true,
    features: [
      'Unlimited Soul Tokens',
      'All features forever',
      'Zero recurring fees',
      'Founder status badge',
      'Early access (2026 wearables)',
      'Priority crisis response',
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();

  const handleCheckout = async (tier: typeof TIERS[0]) => {
    setLoading(tier.id);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.priceId,
          coupon: tier.coupon,
          userId: user?.id || null,
          userEmail: user?.email || null,
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Checkout failed. Please try again.');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen py-20 px-6 bg-black relative overflow-hidden">
      {/* Electric background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ryvynn-cyan/5 via-transparent to-ryvynn-purple/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-ryvynn-cyan/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-ryvynn-purple/10 rounded-full blur-3xl animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-7xl md:text-9xl font-black mb-6 leading-none">
            <span className="block bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-purple bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,217,255,0.6)]">
              Ignite Your Flame
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-200 max-w-4xl mx-auto mb-8 font-light leading-relaxed">
            Premium AI mental wellness. <span className="text-ryvynn-cyan font-bold">Zero surveillance.</span> From your darkest hours to brightest days.
          </p>
          <div className="flex justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-ryvynn-cyan text-xl">⚡</span>
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ryvynn-purple text-xl">🔒</span>
              <span>Zero Surveillance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ryvynn-cyan text-xl">🛡</span>
              <span>Crisis Tier Free Forever</span>
            </div>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`group relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-8 hover:scale-105 transition-all duration-300 ${
                tier.special
                  ? 'md:col-span-2 lg:col-span-1 border-4 ' + tier.border + ' ' + tier.glow
                  : tier.badge
                  ? 'border-2 ' + tier.border + ' ' + tier.glow
                  : 'border border-gray-800 hover:border-ryvynn-purple'
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan text-white text-xs font-black px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
                  {tier.badge}
                </div>
              )}

              <div className="relative">
                {/* Icon */}
                <div className={`mb-6 ${tier.special ? 'text-7xl' : 'text-5xl'} ${tier.badge ? 'mt-6' : ''}`}>
                  {tier.icon}
                </div>

                {/* Name */}
                <h3 className={`font-black mb-4 ${tier.special ? 'text-4xl bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-purple bg-clip-text text-transparent' : 'text-3xl text-white'}`}>
                  {tier.name}
                </h3>

                {/* Pricing */}
                {tier.oneTime ? (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-8xl font-black bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
                        ${Math.floor(tier.regular)}
                      </span>
                      <span className="text-4xl font-bold text-gray-400">.{(tier.regular % 1).toFixed(2).substring(2)}</span>
                    </div>
                    <div className="text-2xl font-bold text-ryvynn-purple">Pay once. Own forever.</div>
                  </div>
                ) : tier.intro ? (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-7xl font-black text-white">${Math.floor(tier.regular)}</span>
                      <span className="text-3xl font-bold text-gray-400">.{(tier.regular % 1).toFixed(2).substring(2)}</span>
                      <span className="text-lg text-gray-500">/mo</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-ryvynn-purple/20 to-ryvynn-cyan/20 border-2 border-ryvynn-purple rounded-xl px-5 py-4 animate-pulse-slow">
                      <span className="text-5xl font-black text-ryvynn-purple">${tier.intro}</span>
                      <span className="text-base text-ryvynn-cyan font-bold">First month special</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-white">${Math.floor(tier.regular)}</span>
                      <span className="text-2xl font-bold text-gray-400">.{(tier.regular % 1).toFixed(2).substring(2)}</span>
                      <span className="text-lg text-gray-500">/mo</span>
                    </div>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-4 mb-8 text-gray-300">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`text-2xl ${i % 2 === 0 ? 'text-ryvynn-cyan' : 'text-ryvynn-purple'}`}>✓</span>
                      <span className={tier.special ? 'font-bold text-lg' : 'font-medium'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleCheckout(tier)}
                  disabled={loading !== null}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-50 ${
                    tier.special
                      ? 'bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan text-white shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:scale-105'
                      : tier.badge
                      ? 'bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-white shadow-[0_0_30px_rgba(0,217,255,0.3)] hover:shadow-[0_0_50px_rgba(0,217,255,0.5)] hover:scale-105'
                      : 'bg-gradient-to-r from-gray-800 to-gray-900 border-2 border-ryvynn-purple text-white hover:from-ryvynn-purple/20 hover:to-ryvynn-purple/10 hover:scale-105'
                  }`}
                >
                  {loading === tier.id ? '⚡ PROCESSING...' : `🔥 IGNITE ${tier.name.toUpperCase()}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Free Tier Banner */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-black via-gray-900 to-black border-2 border-ryvynn-cyan rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-cyan/10 to-ryvynn-purple/5"></div>
            <div className="relative z-10">
              <h3 className="text-5xl font-black mb-6 text-center bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
                🛡 Crisis Support: FREE FOREVER
              </h3>
              <p className="text-gray-200 text-center mb-8 text-xl leading-relaxed max-w-3xl mx-auto">
                Premium members fuel the mission. <span className="text-ryvynn-cyan font-bold">Crisis features will always be free</span> for everyone who needs them.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-gray-200 max-w-2xl mx-auto">
                {[
                  'C-SSRS Crisis Detection',
                  '988 Direct Routing',
                  'Local Crisis Resources',
                  'Anonymous Confession Wall',
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`text-2xl ${i % 2 === 0 ? 'text-ryvynn-cyan' : 'text-ryvynn-purple'}`}>✓</span>
                    <span className="font-medium text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
