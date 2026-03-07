'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AgeTier = 'youth' | 'youngadult' | 'adult' | 'mature';

interface AgeTierContextType {
  ageTier: AgeTier;
  setAgeTier: (tier: AgeTier) => void;
  getAgeRange: () => string;
}

const AgeTierContext = createContext<AgeTierContextType | undefined>(undefined);

export function AgeTierProvider({ children }: { children: ReactNode }) {
  const [ageTier, setAgeTierState] = useState<AgeTier>('adult');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ryvynn-age-tier') as AgeTier;
    if (saved && ['youth', 'youngadult', 'adult', 'mature'].includes(saved)) {
      setAgeTierState(saved);
    }
    setMounted(true);
  }, []);

  const setAgeTier = (tier: AgeTier) => {
    setAgeTierState(tier);
    localStorage.setItem('ryvynn-age-tier', tier);
  };

  const getAgeRange = (): string => {
    switch(ageTier) {
      case 'youth': return '13-17';
      case 'youngadult': return '18-29';
      case 'adult': return '30-54';
      case 'mature': return '55+';
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <AgeTierContext.Provider value={{ ageTier, setAgeTier, getAgeRange }}>
      {children}
    </AgeTierContext.Provider>
  );
}

export function useAgeTier() {
  const context = useContext(AgeTierContext);
  if (!context) {
    throw new Error('useAgeTier must be used within AgeTierProvider');
  }
  return context;
}
