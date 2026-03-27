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
  // Default is18Plus to TRUE — no gate on first visit
  const [is18Plus, setIs18PlusState] = useState(true);

  useEffect(() => {
    const savedPersona = localStorage.getItem('ryvynn-persona') as Persona;
    const savedRated = localStorage.getItem('ryvynn-rated') === 'true';
    if (savedPersona && ['feminine', 'masculine', 'neutral'].includes(savedPersona)) {
      setPersonaState(savedPersona);
    }
    setRatedModeState(savedRated);
    // is18Plus stays true by default — we don't gate on first visit
  }, []);

  const setPersona = (p: Persona) => {
    setPersonaState(p);
    localStorage.setItem('ryvynn-persona', p);
  };

  const setRatedMode = (enabled: boolean) => {
    setRatedModeState(enabled);
    localStorage.setItem('ryvynn-rated', String(enabled));
  };

  const setIs18Plus = (is18: boolean) => {
    setIs18PlusState(is18);
    localStorage.setItem('ryvynn-18plus', String(is18));
    if (!is18) setRatedMode(false);
  };

  // REMOVED: if (!mounted) return null
  // That caused a full-app flash on every page load.
  // Context now renders immediately with safe defaults.

  return (
    <PersonaContext.Provider value={{ persona, setPersona, ratedMode, setRatedMode, is18Plus, setIs18Plus }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) throw new Error('usePersona must be used within PersonaProvider');
  return context;
}
