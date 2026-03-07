'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';
import { useSoulTokens } from '@/contexts/SoulTokenContext';
import { PersonaSelector } from '@/components/persona/PersonaSelector';
import { AgeTierSelector } from '@/components/persona/AgeTierSelector';
import Link from 'next/link';

export default function DashboardPage() {
  const { tf, tp } = useI18n();
  const { persona, ratedMode } = usePersona();
  const { tokens, checkDailyLogin } = useSoulTokens();
  const [crisisTier] = useState<'baseline' | 'heightened' | 'active' | 'critical'>('baseline');

  // Check daily login and award tokens on mount
  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  const getCrisisColor = () => {
    switch(crisisTier) {
      case 'baseline': return 'text-green-500';
      case 'heightened': return 'text-yellow-500';
      case 'active': return 'text-orange-500';
      case 'critical': return 'text-red-500';
    }
  };

  const getCrisisTierText = () => {
    switch(crisisTier) {
      case 'baseline': return tf('crisisTierBaseline');
      case 'heightened': return tf('crisisTierHeightened');
      case 'active': return tf('crisisTierActive');
      case 'critical': return tf('crisisTierCritical');
    }
  };

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-ryvynn-cyan mb-8">
          {tf('dashboard')}
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crisis Status */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{tf('crisisStatus')}</h2>
                <span className={`text-2xl ${getCrisisColor()}`}>
                  {crisisTier === 'baseline' && '✓'}
                  {crisisTier === 'heightened' && '⚠️'}
                  {crisisTier === 'active' && '🚨'}
                  {crisisTier === 'critical' && '🆘'}
                </span>
              </div>
              <p className={`font-medium ${getCrisisColor()}`}>
                {getCrisisTierText()}
              </p>
              {crisisTier === 'critical' && (
                <button className="mt-4 w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700">
                  {tf('call988')}
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/wall"
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-ryvynn-cyan transition-colors"
              >
                <div className="text-3xl mb-2">🌑</div>
                <h3 className="font-bold text-lg mb-1">The Wall</h3>
                <p className="text-sm text-gray-400">Confessions / Transformations</p>
              </Link>

              <Link
                href="/journal"
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-ryvynn-cyan transition-colors"
              >
                <div className="text-3xl mb-2">📓</div>
                <h3 className="font-bold text-lg mb-1">{tf('journalTitle')}</h3>
                <p className="text-sm text-gray-400">{tf('encrypted')}</p>
              </Link>

              <Link
                href="/guardian"
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-ryvynn-purple transition-colors"
              >
                <div className="text-3xl mb-2">🛡️</div>
                <h3 className="font-bold text-lg mb-1">{tf('guardianTitle')}</h3>
                <p className="text-sm text-gray-400">{tf('guardianSubtitle')}</p>
              </Link>

              <Link
                href="/eternity"
                className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 hover:border-ryvynn-purple transition-colors"
              >
                <div className="text-3xl mb-2">⏳</div>
                <h3 className="font-bold text-lg mb-1">{tf('eternityTitle')}</h3>
                <p className="text-sm text-gray-400">{tf('eternitySubtitle')}</p>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Soul Tokens */}
            <div className="bg-gradient-to-br from-ryvynn-purple/10 to-ryvynn-cyan/10 border border-ryvynn-purple/30 rounded-lg p-6">
              <h2 className="text-sm font-bold text-ryvynn-purple mb-2">
                {tf('soulTokens')}
              </h2>
              <div className="text-4xl font-bold text-white mb-1">
                🪙 {tokens.balance}
              </div>
              <div className="text-xs text-gray-400">{tf('tokensAvailable')}</div>
              
              {tokens.streak > 0 && (
                <div className="mt-3 text-sm text-ryvynn-cyan">
                  🔥 {tokens.streak} day streak
                </div>
              )}
              
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Daily login</span>
                  <span className="text-ryvynn-cyan">+10</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>3-day streak</span>
                  <span className="text-ryvynn-cyan">+5</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>7-day streak</span>
                  <span className="text-ryvynn-cyan">+15</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Confession</span>
                  <span className="text-ryvynn-cyan">+1</span>
                </div>
              </div>
            </div>

            {/* Persona */}
            <PersonaSelector />

            {/* Age Tier */}
            <AgeTierSelector />

            {/* Current Mode */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 text-sm">
              <div className="text-gray-400 mb-1">Active Mode:</div>
              <div className="font-medium capitalize">{persona}</div>
              {ratedMode && (
                <div className="mt-2 text-red-400 text-xs">
                  ⚠️ {tp('ratedEnabled')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
