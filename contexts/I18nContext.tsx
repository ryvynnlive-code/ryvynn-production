'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey, personaTranslations, PersonaTranslationKey, featureTranslations, FeatureTranslationKey } from '@/lib/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  tp: (key: PersonaTranslationKey) => string;
  tf: (key: FeatureTranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ryvynn-language') as Language;
    if (saved && (saved === 'en' || saved === 'es')) {
      setLanguageState(saved);
    }
    setMounted(true);
  }, []);

  // Save language to localStorage when changed
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ryvynn-language', lang);
  };

  // Use a stable default during SSR/hydration - never return null (kills entire app)
  const effectiveLanguage = mounted ? language : 'en';

  const tEffective = (key: TranslationKey): string => {
    return translations[effectiveLanguage]?.[key] ?? translations['en'][key] ?? key;
  };

  const tpEffective = (key: PersonaTranslationKey): string => {
    return personaTranslations[effectiveLanguage]?.[key] ?? personaTranslations['en'][key] ?? key;
  };

  const tfEffective = (key: FeatureTranslationKey): string => {
    return featureTranslations[effectiveLanguage]?.[key] ?? featureTranslations['en'][key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ language: effectiveLanguage, setLanguage, t: tEffective, tp: tpEffective, tf: tfEffective }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
