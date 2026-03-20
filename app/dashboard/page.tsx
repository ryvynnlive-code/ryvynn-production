'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SanctuaryExit from '@/components/SanctuaryExit';

interface TokenData {
  balance: number;
  streak: number;
  lastCheckIn: string;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const { tf } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    const loadTokenData = async () => {
      try {
        const response = await fetch(`/api/tokens?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to load tokens');
        const data = await response.json();
        setTokenData(data);
      } catch (error) {
        console.error('Error loading token data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTokenData();
  }, [user]);

  const handleCheckIn = async () => {
    if (!user || checkingIn) return;
    setCheckingIn(true);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) throw new Error('Check-in failed');

      const data = await response.json();
      setTokenData(data);
      alert(`✨ ${tf('tokenCheckInBtn')} +${data.tokensEarned} 🔥`);
    } catch (error) {
      console.error('Check-in error:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔥</div>
          <p className="text-gray-400">{tf('dashboardLoading')}</p>
        </div>
      </main>
    );
  }

  if (!user || !tokenData) return null;

  const canCheckIn = tokenData.lastCheckIn
    ? new Date(tokenData.lastCheckIn).toDateString() !== new Date().toDateString()
    : true;

  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent mb-2">
            🎯 {tf('dashboardTitle')}
          </h1>
          <p className="text-gray-400">{tf('dashboardSubtitle')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Soul Tokens */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple rounded-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🔥</span>
              <span className="text-xs text-gray-500">{tf('tokenBalance')}</span>
            </div>
            <div className="text-5xl font-black text-ryvynn-purple mb-2">
              {tokenData.balance}
            </div>
            <p className="text-sm text-gray-400">{tf('soulTokensLabel')}</p>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-2xl p-6 shadow-[0_0_30px_rgba(0,217,255,0.3)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">⚡</span>
              <span className="text-xs text-gray-500">{tf('tokenStreak')}</span>
            </div>
            <div className="text-5xl font-black text-ryvynn-cyan mb-2">
              {tokenData.streak}
            </div>
            <p className="text-sm text-gray-400">{tf('tokenDayStreak')}</p>
          </div>

          {/* Daily Check-In */}
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">✨</span>
              <span className="text-xs text-gray-500">{tf('tokenCheckIn')}</span>
            </div>
            {canCheckIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl font-bold text-white hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all"
              >
                {checkingIn ? tf('tokenCheckingIn') : tf('tokenCheckInBtn')}
              </button>
            ) : (
              <div className="text-center py-3 text-gray-500">
                {tf('tokenCheckInDone')}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 text-center">{tf('tokenEarnDaily')}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/guardian"
            className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6 hover:border-ryvynn-purple transition-all group text-center"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🛡️</div>
            <h3 className="font-bold text-white mb-1">{tf('actionGuardian')}</h3>
            <p className="text-xs text-gray-500">{tf('actionGuardianSub')}</p>
          </Link>

          <Link
            href="/journal"
            className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6 hover:border-ryvynn-cyan transition-all group text-center"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">📔</div>
            <h3 className="font-bold text-white mb-1">{tf('actionJournal')}</h3>
            <p className="text-xs text-gray-500">{tf('actionJournalSub')}</p>
          </Link>

          <Link
            href="/eternity"
            className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6 hover:border-ryvynn-purple transition-all group text-center"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">🌌</div>
            <h3 className="font-bold text-white mb-1">{tf('actionEternity')}</h3>
            <p className="text-xs text-gray-500">{tf('actionEternitySub')}</p>
          </Link>

          <Link
            href="/wall"
            className="bg-gray-900/50 border-2 border-gray-800 rounded-xl p-6 hover:border-ryvynn-cyan transition-all group text-center"
          >
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">✨</div>
            <h3 className="font-bold text-white mb-1">{tf('actionWall')}</h3>
            <p className="text-xs text-gray-500">{tf('actionWallSub')}</p>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span>💰</span>
            {tf('recentTokenActivity')}
          </h2>

          {tokenData.transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>{tf('noTransactions')}</p>
              <p className="text-sm mt-2">{tf('noTransactionsSub')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokenData.transactions.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`text-xl font-bold ${
                    tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} 🔥
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Streak Bonuses */}
        <div className="mt-6 p-4 bg-gray-900/30 border border-gray-800 rounded-xl">
          <h3 className="font-bold text-ryvynn-cyan mb-2">{tf('streakBonusTitle')}</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• {tf('streakBonus3')}</li>
            <li>• {tf('streakBonus7')}</li>
            <li>• {tf('streakBonus30')}</li>
          </ul>
        </div>
      </div>

        {/* Sanctuary Exit — Ritual of Letting Go */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setShowExit(true)}
            className="text-zinc-600 hover:text-zinc-400 text-xs tracking-widest uppercase transition-colors"
          >
            ◦ Release & Exit This Space ◦
          </button>
        </div>
      </div>

      {/* Sanctuary Exit Modal */}
      {showExit && user && (
        <SanctuaryExit
          userId={user.id}
          isPlusUser={false}
          onComplete={() => { setShowExit(false); window.location.href = '/'; }}
          onCancel={() => setShowExit(false)}
        />
      )}
    </main>
  );
}
