'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SoulTokenState {
  balance: number;
  lastLogin: string | null;
  streak: number;
  totalEarned: number;
  totalSpent: number;
}

interface TokenTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface SoulTokenContextType {
  tokens: SoulTokenState;
  transactions: TokenTransaction[];
  loading: boolean;
  refresh: () => Promise<void>;
  checkDailyLogin: () => Promise<void>;
  // Legacy compat — use refresh() or checkDailyLogin() for real mutations
  earnTokens: (amount: number, reason: string) => void;
  spendTokens: (amount: number, reason: string) => boolean;
}

const SoulTokenContext = createContext<SoulTokenContextType | undefined>(undefined);

const DEFAULT_STATE: SoulTokenState = {
  balance: 0,
  lastLogin: null,
  streak: 0,
  totalEarned: 0,
  totalSpent: 0,
};

export function SoulTokenProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<SoulTokenState>(DEFAULT_STATE);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokenData = useCallback(async () => {
    if (!user) {
      setTokens(DEFAULT_STATE);
      setTransactions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tokens?userId=${user.id}`);
      if (!res.ok) throw new Error('Token fetch failed');
      const data = await res.json();

      setTokens({
        balance: data.balance ?? 0,
        lastLogin: data.lastCheckIn ?? null,
        streak: data.streak ?? 0,
        totalEarned: 0,
        totalSpent: 0,
      });
      setTransactions(data.transactions ?? []);
    } catch (err) {
      console.error('[SoulTokenContext] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on mount + whenever user changes
  useEffect(() => {
    fetchTokenData();
  }, [fetchTokenData]);

  const checkDailyLogin = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Check-in failed');
      const data = await res.json();
      setTokens(prev => ({
        ...prev,
        balance: data.balance ?? prev.balance,
        streak: data.streak ?? prev.streak,
        lastLogin: data.lastCheckIn ?? prev.lastLogin,
      }));
      if (data.transactions) setTransactions(data.transactions);
    } catch (err) {
      console.error('[SoulTokenContext] checkDailyLogin error:', err);
    }
  };

  return (
    <SoulTokenContext.Provider
      value={{
        tokens,
        transactions,
        loading,
        refresh: fetchTokenData,
        checkDailyLogin,
        earnTokens: () => {}, // legacy no-op — mutations go through API
        spendTokens: () => false, // legacy no-op
      }}
    >
      {children}
    </SoulTokenContext.Provider>
  );
}

export function useSoulTokens() {
  const context = useContext(SoulTokenContext);
  if (!context) throw new Error('useSoulTokens must be used within SoulTokenProvider');
  return context;
}
