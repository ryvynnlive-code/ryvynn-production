'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SoulTokenState {
  balance: number;
  lastLogin: string | null;
  streak: number;
  totalEarned: number;
  totalSpent: number;
}

interface TokenTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
}

interface SoulTokenContextType {
  tokens: SoulTokenState;
  earnTokens: (amount: number, reason: string) => void;
  spendTokens: (amount: number, reason: string) => boolean;
  checkDailyLogin: () => void;
  transactions: TokenTransaction[];
}

const SoulTokenContext = createContext<SoulTokenContextType | undefined>(undefined);

export function SoulTokenProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<SoulTokenState>({
    balance: 0,
    lastLogin: null,
    streak: 0,
    totalEarned: 0,
    totalSpent: 0,
  });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTokens = localStorage.getItem('ryvynn-soul-tokens');
    const savedTx = localStorage.getItem('ryvynn-token-transactions');
    
    if (savedTokens) {
      try {
        setTokens(JSON.parse(savedTokens));
      } catch {}
    }
    
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch {}
    }
    
    setMounted(true);
  }, []);

  const saveState = (newState: SoulTokenState, newTx?: TokenTransaction) => {
    localStorage.setItem('ryvynn-soul-tokens', JSON.stringify(newState));
    if (newTx) {
      const updated = [newTx, ...transactions].slice(0, 100); // Keep last 100
      setTransactions(updated);
      localStorage.setItem('ryvynn-token-transactions', JSON.stringify(updated));
    }
  };

  const earnTokens = (amount: number, reason: string) => {
    const newState = {
      ...tokens,
      balance: tokens.balance + amount,
      totalEarned: tokens.totalEarned + amount,
    };
    
    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };
    
    setTokens(newState);
    saveState(newState, tx);
  };

  const spendTokens = (amount: number, reason: string): boolean => {
    if (tokens.balance < amount) return false;
    
    const newState = {
      ...tokens,
      balance: tokens.balance - amount,
      totalSpent: tokens.totalSpent + amount,
    };
    
    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'spend',
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };
    
    setTokens(newState);
    saveState(newState, tx);
    return true;
  };

  const checkDailyLogin = () => {
    const today = new Date().toDateString();
    const lastLogin = tokens.lastLogin ? new Date(tokens.lastLogin).toDateString() : null;
    
    if (lastLogin === today) return; // Already logged in today
    
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const isConsecutive = lastLogin === yesterday;
    
    const newStreak = isConsecutive ? tokens.streak + 1 : 1;
    let bonus = 10; // Base daily login
    
    // Streak bonuses
    if (newStreak >= 7) bonus += 15; // Week streak
    else if (newStreak >= 3) bonus += 5; // 3-day streak
    
    const newState = {
      ...tokens,
      balance: tokens.balance + bonus,
      totalEarned: tokens.totalEarned + bonus,
      lastLogin: new Date().toISOString(),
      streak: newStreak,
    };
    
    const tx: TokenTransaction = {
      id: Date.now().toString(),
      type: 'earn',
      amount: bonus,
      reason: `Daily login (${newStreak} day streak)`,
      timestamp: new Date().toISOString(),
    };
    
    setTokens(newState);
    saveState(newState, tx);
  };

  if (!mounted) {
    return null;
  }

  return (
    <SoulTokenContext.Provider value={{ tokens, earnTokens, spendTokens, checkDailyLogin, transactions }}>
      {children}
    </SoulTokenContext.Provider>
  );
}

export function useSoulTokens() {
  const context = useContext(SoulTokenContext);
  if (!context) {
    throw new Error('useSoulTokens must be used within SoulTokenProvider');
  }
  return context;
}
