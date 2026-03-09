'use client';

import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';
import { ImpactStats } from '@/components/ImpactStats';
import { SPACE } from '@/lib/sacred-geometry';

export default function HomePage() {
  const { t, tf } = useI18n();

  return (
    <main className="min-h-screen">
      {/* FREE FOREVER BANNER - Top Priority */}
      <div className="bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan py-6 sticky top-16 z-40 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🛡</span>
              <h2 className="text-3xl md:text-4xl font-black text-white">
                {t('crisisCtaLabel')}
              </h2>
            </div>
            <Link
              href="/wall"
              className="px-8 py-3 bg-white text-ryvynn-purple rounded-xl font-black text-lg hover:scale-105 transition-all shadow-lg"
            >
              {t('crisisCtaButton')}
            </Link>
          </div>
          <p className="text-white text-sm mt-2 font-medium">
            {t('crisisTrustLine')}
          </p>
        </div>
      </div>

      {/* Hero Section - Sacred Geometry Spacing */}
      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        {/* Dual Flame Logo - Sacred Brand Identity */}
        <div className="flex justify-center mb-12 animate-float">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <img 
              src="/assets/dual-flame-logo.png" 
              alt="RYVYNN Dual Flame - From our darkest hours to our brightest days" 
              className="w-full h-full object-contain drop-shadow-[0_0_60px_rgba(0,217,255,0.4)]"
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-ryvynn-cyan/20 via-transparent to-ryvynn-purple/20 blur-3xl -z-10"></div>
          </div>
        </div>
        
        {/* Hero Title - Golden Ratio Typography */}
        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-purple bg-clip-text text-transparent drop-shadow-2xl">
            {t('tagline')}
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl md:text-4xl text-gray-200 font-light mb-6 leading-relaxed">
          {t('heroSubtitle')}
        </p>
        
        {/* Description */}
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('heroDescription')}
        </p>
        
        {/* CTAs - Sacred Spacing */}
        <div className="flex flex-col gap-4 items-center mb-8">
          <div className="flex gap-6 justify-center">
            <Link
              href="/pricing"
              className="group relative px-12 py-5 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.6)] overflow-hidden"
            >
              <span className="relative z-10">{t('startFree')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-ryvynn-purple to-ryvynn-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link 
              href="/pricing"
              className="px-12 py-5 border-2 border-gray-700 rounded-2xl font-bold text-white text-lg hover:bg-gray-900 hover:border-ryvynn-cyan transition-all hover:scale-105"
            >
              {t('pricing')}
            </Link>
          </div>

          {/* FREE FOREVER ACCESS - Prominent */}
          <Link
            href="/wall"
            className="group relative px-16 py-4 bg-black border-2 border-ryvynn-cyan rounded-2xl font-bold text-white text-xl transition-all hover:scale-105 hover:bg-ryvynn-cyan/10 animate-pulse-slow"
          >
            <span className="text-ryvynn-cyan">{t('crisisFreeBadge')}</span>
            <div className="text-xs text-gray-400 mt-1">{t('crisisFreeSubtext')}</div>
          </Link>
        </div>

        {/* Trust Signals */}
        <div className="flex justify-center gap-8 text-sm text-gray-500 mt-8">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>{t('pricingTrust1')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🛡</span>
            <span>{t('pricingTrust3')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>{t('pricingTrust2')}</span>
          </div>
        </div>
      </section>

      {/* Impact Stats - NEW */}
      <ImpactStats />

      {/* Features Section - Premium Cards */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-5xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            {t('featuresTitle')}
          </span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Core Features */}
          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-cyan transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">🔐</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-cyan">{tf('featureZeroSurveillance')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureZeroDesc')}</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-purple transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-purple">{tf('featureCrisisDetection')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureCrisisDesc')}</p>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-cyan transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">🌑</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-cyan">{tf('featureTransformation')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureTransformDesc')}</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-purple transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-purple">{tf('featureGuardian')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureGuardianDesc')}</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-cyan transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">⏳</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-cyan">{tf('featureEternity')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureEternityDesc')}</p>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 hover:border-ryvynn-purple transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-ryvynn-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
            <div className="relative">
              <div className="text-5xl mb-6">🪙</div>
              <h3 className="text-2xl font-bold mb-3 text-ryvynn-purple">{tf('featureTokens')}</h3>
              <p className="text-gray-400 leading-relaxed">{tf('featureTokensDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-gray-800">
        <div className="text-center mb-16">
          <div className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">⌚</div>
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-ryvynn-purple via-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              {t('comingSoonSubtitle')}: {t('comingSoonTitle')}
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('comingSoonDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-2xl p-8 text-center hover:border-ryvynn-cyan transition-all">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="font-bold text-xl mb-3 text-ryvynn-cyan">{t('comingSoonFeature1')}</h3>
            <p className="text-gray-500">{t('comingSoonFeature2')}</p>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-2xl p-8 text-center hover:border-ryvynn-purple transition-all">
            <div className="text-5xl mb-4">😴</div>
            <h3 className="font-bold text-xl mb-3 text-ryvynn-purple">{t('comingSoonFeature3')}</h3>
            <p className="text-gray-500">{t('comingSoonFeature4')}</p>
          </div>

          <div className="bg-gradient-to-b from-gray-900/80 to-black border border-gray-800 rounded-2xl p-8 text-center hover:border-ryvynn-cyan transition-all">
            <div className="text-5xl mb-4">🏃</div>
            <h3 className="font-bold text-xl mb-3 text-ryvynn-cyan">{t('comingSoonBadge')}</h3>
            <p className="text-gray-500">{t('comingSoonSubtitle')}</p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 italic text-lg">
            {t('comingSoonBadge')} 🔥
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6 mt-24 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-gray-400">{t('companyInfo')}</p>
          <p className="text-xl font-bold bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan bg-clip-text text-transparent">
            {t('missionStatement')}
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-600 pt-4">
            <span>{t('footerCopyright')}</span>
            <span>•</span>
            <span>{t('footerBuiltFor')}</span>
            <span>•</span>
            <span>{t('footerZeroSurveillance')}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
