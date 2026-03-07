'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

const PRICING_TIERS = [
  {
    id: 'solo',
    name: 'Solo',
    price: 12.12,
    introPrice: 3.69,
    tokens: 120,
    priceId: 'price_1T3LjdFQvVkmN1b80afextYF',
    coupon: 'eQJyvO8p',
    features: [
      '120 Soul Tokens / month',
      'AI Guardian companion',
      'Shadow transformation engine',
      'Dark Journal + biometric vault',
      'Crisis detection + 988 access',
      'Anonymous — zero surveillance',
    ],
    highlight: true,
  },
  {
    id: 'family',
    name: 'Family',
    price: 36.93,
    tokens: 369,
    priceId: 'price_1T3LjnFQvVkmN1b8lUiEJyDs',
    features: [
      '369 Soul Tokens / month (shared)',
      'Up to 6 family members',
      'Everything in Solo',
      'Family crisis visibility',
      'Shared transformation feed',
    ],
    highlight: false,
  },
  {
    id: 'therapist',
    name: 'Therapist',
    price: 69.36,
    tokens: 693,
    priceId: 'price_1T3LjuFQvVkmN1b81Vg49Wpq',
    features: [
      '693 Soul Tokens / month',
      'Client dashboards',
      'Crisis protocol access',
      'C-SSRS tracking',
      'HIPAA-aligned handling',
    ],
    highlight: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 96.36,
    tokens: 1500,
    priceId: 'price_1T3Lk1FQvVkmN1b8b7BjRZxS',
    features: [
      '1,500 Soul Tokens / month',
      'Custom crisis protocols',
      'Team analytics',
      'White-label options',
      'API access',
    ],
    highlight: false,
  },
  {
    id: 'lifetime',
    name: 'Lifetime Flame',
    price: 369.36,
    tokens: 9999,
    priceId: 'price_1T3Lk7FQvVkmN1b8TxqsKbd4',
    features: [
      'Unlimited Soul Tokens',
      'Everything, forever',
      'Founder status badge',
      'Early access to all features',
      'Priority crisis response',
    ],
    oneTime: true,
    highlight: false,
  },
];

export default function PricingPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: typeof PRICING_TIERS[0]) => {
    setLoading(tier.id);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: tier.priceId,
          coupon: tier.coupon || null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Payment processing failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-4xl">🔥</span>
            <span className="text-4xl">🔥</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-ryvynn-cyan">
            {t('pricingTitle')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('pricingSubtitle')}
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-lg p-6 border ${
                tier.highlight
                  ? 'bg-gradient-to-b from-gray-900 to-black border-ryvynn-cyan shadow-lg shadow-ryvynn-cyan/20'
                  : 'bg-gray-900/50 border-gray-800'
              }`}
            >
              {/* Tier Name */}
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                tier.highlight ? 'text-ryvynn-cyan' : 'text-ryvynn-purple'
              }`}>
                {tier.name}
              </h3>

              {/* Price */}
              {tier.introPrice ? (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-ryvynn-cyan">
                      ${tier.introPrice}
                    </span>
                    <span className="text-gray-400 text-sm">{t('firstMonth')}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('then')} ${tier.price}{t('perMonth')} — {t('cancelAnytime')}
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${tier.price}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {tier.oneTime ? t('oneTime') : t('perMonth')}
                    </span>
                  </div>
                </div>
              )}

              {/* Soul Tokens */}
              <div className="text-sm text-ryvynn-purple mb-4">
                🪙 {tier.tokens === 9999 ? 'Unlimited' : tier.tokens} Soul Tokens
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-ryvynn-cyan mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleCheckout(tier)}
                disabled={loading !== null}
                className={`w-full py-3 rounded-lg font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${
                  tier.highlight
                    ? 'bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-white hover:opacity-90'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {loading === tier.id
                  ? '🔄 Loading...'
                  : tier.introPrice
                  ? `${t('startFree')} 🔥`
                  : `${t('ignite')} ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>🛡 Crisis access is always free — no card required, no account needed.</p>
          <p className="mt-2">All payments processed securely by Stripe. RYVYNN never sees your payment info.</p>
        </div>
      </div>
    </main>
  );
}
