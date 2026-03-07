'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Persona = 'feminine' | 'masculine' | 'neutral';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  ratedMode: boolean;
  setRatedMode: (enabled: boolean) => void;
  is18Plus: boolean;
  setIs18Plus: (is18: boolean) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>('neutral');
  const [ratedMode, setRatedModeState] = useState(false);
  const [is18Plus, setIs18PlusState] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedPersona = localStorage.getItem('ryvynn-persona') as Persona;
    const savedRated = localStorage.getItem('ryvynn-rated') === 'true';
    const saved18Plus = localStorage.getItem('ryvynn-18plus') === 'true';
    
    if (savedPersona && ['feminine', 'masculine', 'neutral'].includes(savedPersona)) {
      setPersonaState(savedPersona);
    }
    setRatedModeState(savedRated);
    setIs18PlusState(saved18Plus);
    setMounted(true);
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    localStorage.setItem('ryvynn-persona', p);
  };

  const setRatedMode = (enabled: boolean) => {
    // Can only enable rated mode if 18+
    if (enabled && !is18Plus) return;
    setRatedModeState(enabled);
    localStorage.setItem('ryvynn-rated', String(enabled));
  };

  const setIs18Plus = (is18: boolean) => {
    setIs18PlusState(is18);
    localStorage.setItem('ryvynn-18plus', String(is18));
    // If setting to under 18, disable rated mode
    if (!is18) {
      setRatedMode(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <PersonaContext.Provider value={{ persona, setPersona, ratedMode, setRatedMode, is18Plus, setIs18Plus }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}
