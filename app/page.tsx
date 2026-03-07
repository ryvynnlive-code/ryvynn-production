'use client';

import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';

export default function HomePage() {
  const { t, tf } = useI18n();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center gap-4 mb-8">
          <span className="text-6xl">🔥</span>
          <span className="text-6xl">🔥</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan bg-clip-text text-transparent">
          {t('tagline')}
        </h1>
        
        <p className="text-2xl md:text-3xl text-gray-300 font-light mb-4">
          {t('heroSubtitle')}
        </p>
        
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          {t('heroDescription')}
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/pricing"
            className="px-8 py-4 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg font-bold text-white hover:opacity-90 transition-opacity"
          >
            {t('startFree')}
          </Link>
          <Link 
            href="/pricing"
            className="px-8 py-4 border border-gray-700 rounded-lg font-bold text-white hover:bg-gray-900 transition-colors"
          >
            {t('pricing')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-ryvynn-cyan">
          {t('featuresTitle')}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-cyan">{tf('featureZeroSurveillance')}</h3>
            <p className="text-gray-400">{tf('featureZeroDesc')}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-cyan">{tf('featureCrisisDetection')}</h3>
            <p className="text-gray-400">{tf('featureCrisisDesc')}</p>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🌑</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-cyan">{tf('featureTransformation')}</h3>
            <p className="text-gray-400">{tf('featureTransformDesc')}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-purple">{tf('featureGuardian')}</h3>
            <p className="text-gray-400">{tf('featureGuardianDesc')}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-purple">{tf('featureEternity')}</h3>
            <p className="text-gray-400">{tf('featureEternityDesc')}</p>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-4xl mb-4">🪙</div>
            <h3 className="text-xl font-bold mb-2 text-ryvynn-purple">{tf('featureTokens')}</h3>
            <p className="text-gray-400">{tf('featureTokensDesc')}</p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-800">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">⌚</div>
          <h2 className="text-3xl font-bold mb-4 text-ryvynn-purple">
            Coming Soon: Wearables Integration
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time biometric crisis detection through Apple Watch, Fitbit, and more. 
            Your body knows when you're in crisis — we'll help you catch it early.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">❤️</div>
            <h3 className="font-bold mb-2 text-ryvynn-cyan">Heart Rate Monitoring</h3>
            <p className="text-sm text-gray-500">Detect anxiety spikes & panic attacks</p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">😴</div>
            <h3 className="font-bold mb-2 text-ryvynn-cyan">Sleep Tracking</h3>
            <p className="text-sm text-gray-500">Identify depression patterns early</p>
          </div>

          <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🏃</div>
            <h3 className="font-bold mb-2 text-ryvynn-cyan">Activity Patterns</h3>
            <p className="text-sm text-gray-500">Track behavioral changes over time</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600 italic">
            Premium members will get early access when wearables launch in 2026.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm space-y-2">
          <p>{t('companyInfo')}</p>
          <p className="font-bold text-ryvynn-purple">{t('missionStatement')}</p>
        </div>
      </footer>
    </main>
  );
}
