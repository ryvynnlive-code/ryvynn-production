'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';

export default function PricingPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [loading, setLoading] = useState<string | null>(null);

  const TIERS = [
    {
      id: 'solo',
      name: t('tierSolo'),
      icon: '🔥',
      regular: 12.12,
      intro: 3.69,
      priceId: 'price_1TCvSUFXY1nWj7h7PAn2aUcb',
      coupon: 'WwwAy1Zm',
      badge: t('pricingBadgeMostPopular'),
      borderClass: 'border-ryvynn-cyan',
      glowClass: 'shadow-[0_0_50px_rgba(0,217,255,0.3)]',
      cta: t('pricingCtaIgniteFlame'),
      primary: true,
      features: [
        '120 ' + t('soulTokensLabel') + '/mo',
        t('feature2Title'),
        t('feature3Title'),
        t('journalTitle') || 'Dark Journal (encrypted)',
        t('featureCrisisDetection'),
        t('actionEternity'),
      ],
    },
    {
      id: 'family',
      name: t('tierFamily'),
      icon: '🔥🔥',
      regular: 36.93,
      intro: null,
      priceId: 'price_1TCvSdFXY1nWj7h7UlL16h0R',
      coupon: null,
      badge: null,
      borderClass: 'border-ryvynn-purple',
      glowClass: 'shadow-[0_0_40px_rgba(139,92,246,0.2)]',
      cta: t('pricingCtaJoinFamily'),
      primary: false,
      features: [
        '369 ' + t('soulTokensLabel') + '/mo',
        t('tierFamilyDesc'),
        t('hpPricingFamilyF2'),
        t('hpPricingFamilyF3'),
      ],
    },
    {
      id: 'therapist',
      name: t('tierTherapist'),
      icon: '💎',
      regular: 69.36,
      intro: null,
      priceId: 'price_1TCvSnFXY1nWj7h7zOhi50a7',
      coupon: null,
      badge: null,
      borderClass: 'border-ryvynn-cyan',
      glowClass: 'shadow-[0_0_40px_rgba(0,217,255,0.2)]',
      cta: t('pricingCtaUpgradePro'),
      primary: false,
      features: [
        '693 ' + t('soulTokensLabel') + '/mo',
        t('tierTherapistDesc'),
        t('featureCrisisDetection'),
        'C-SSRS tracking',
      ],
    },
    {
      id: 'enterprise',
      name: t('tierEnterprise'),
      icon: '⚡',
      regular: 96.36,
      intro: null,
      priceId: 'price_1TCvSxFXY1nWj7h7N6KbQ6Yt',
      coupon: null,
      badge: null,
      borderClass: 'border-gray-600',
      glowClass: '',
      cta: t('pricingCtaScaleTeam'),
      primary: false,
      features: [
        '963 ' + t('soulTokensLabel') + '/mo',
        t('tierEnterpriseDesc'),
        'API access',
        'White-label option',
      ],
    },
  ];

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
              className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_18px_rgba(0,217,255,0.5)]"
            />
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            RYVYNN {t('pricingBadgeFree')}.{' '}
            <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              {t('crisisFreeSubtext')}
            </span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {t('pricingHeroSubtitle')}
          </p>
          <div className="mt-4 text-sm text-gray-600">
            {t('privacyNotice')}{' '}
            <Link href="/sign-up" className="text-ryvynn-cyan hover:underline">
              {t('createAccount')} →
            </Link>
          </div>
        </div>

        {/* Intro price callout */}
        <div className="bg-ryvynn-cyan/5 border border-ryvynn-cyan/20 rounded-2xl p-4 text-center mb-10">
          <span className="text-ryvynn-cyan text-sm font-semibold">{t('firstMonth')} $3.69 → </span>
          <span className="text-gray-300 text-sm">
            {t('pricingCtaIgniteFlame')} · {t('cancelAnytime')}
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
                    <span className="text-gray-500 text-sm">/{t('firstMonth')}</span>
                    <div className="text-gray-600 text-xs mt-0.5">{t('then')} ${tier.regular}{t('perMonth')}</div>
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-bold text-white">${tier.regular}</span>
                    <span className="text-gray-500 text-sm">{t('perMonth')}</span>
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
                {loading === tier.id ? t('pricingProcessing') : tier.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Lifetime */}
        <div className="mt-8 bg-gradient-to-r from-ryvynn-cyan/5 to-ryvynn-purple/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-lg">{t('tierLifetime')} — $369.36</div>
            <div className="text-gray-400 text-sm mt-1">
              {t('tierLifetimeDesc')}
            </div>
          </div>
          <button
            onClick={() => handleCheckout('price_1TCvT0FXY1nWj7h7tM5K3AzL', 'lifetime')}
            className="px-8 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/5 transition-all whitespace-nowrap"
          >
            {t('pricingCtaBurnEternal')} →
          </button>
        </div>

        {/* Bottom */}
        <div className="mt-10 text-center space-y-2">
          <p className="text-gray-600 text-xs">
            {t('crisisFreeSubtext')} · 988 {t('crisisCtaLabel')}
          </p>
          <p className="text-gray-700 text-xs">
            {t('cancelAnytime')} · {t('privacyNotice')}
          </p>
          <Link href="/" className="text-gray-600 hover:text-gray-400 text-xs transition-colors inline-block mt-2">
            ← {t('home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
