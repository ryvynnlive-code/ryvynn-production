'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Persona = 'feminine' | 'masculine' | 'neutral' | 'aged';

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  ratedMode: boolean;
  setRatedMode: (v: boolean) => void;
  emotionalDepth: boolean;
  setEmotionalDepth: (v: boolean) => void;
  is18Plus: boolean;
  setIs18Plus: (v: boolean) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona,        setPersonaState]        = useState<Persona>('neutral');
  const [ratedMode,      setRatedModeState]      = useState(false);
  const [emotionalDepth, setEmotionalDepthState] = useState(false);
  const [is18Plus,       setIs18PlusState]       = useState(true);
  const [darkMode,       setDarkModeState]       = useState(true);

  useEffect(() => {
    const p = localStorage.getItem('ryvynn-persona') as Persona;
    if (p && ['feminine','masculine','neutral','aged'].includes(p)) setPersonaState(p);
    if (localStorage.getItem('ryvynn-rated') === 'true') setRatedModeState(true);
    if (localStorage.getItem('ryvynn-emotional-depth') === 'true') setEmotionalDepthState(true);
    const dm = localStorage.getItem('ryvynn-dark-mode');
    setDarkModeState(dm === null ? true : dm !== 'false');
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    }
  }, [darkMode]);

  const setPersona = (p: Persona) => { setPersonaState(p); localStorage.setItem('ryvynn-persona', p); };
  const setRatedMode = (v: boolean) => { setRatedModeState(v); localStorage.setItem('ryvynn-rated', String(v)); };
  const setEmotionalDepth = (v: boolean) => { setEmotionalDepthState(v); localStorage.setItem('ryvynn-emotional-depth', String(v)); };
  const setIs18Plus = (v: boolean) => { setIs18PlusState(v); localStorage.setItem('ryvynn-18plus', String(v)); if (!v) setRatedMode(false); };
  const setDarkMode = (v: boolean) => { setDarkModeState(v); localStorage.setItem('ryvynn-dark-mode', String(v)); };

  return (
    <PersonaContext.Provider value={{ persona, setPersona, ratedMode, setRatedMode, emotionalDepth, setEmotionalDepth, is18Plus, setIs18Plus, darkMode, setDarkMode }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}
