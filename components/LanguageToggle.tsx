'use client';

import { useI18n } from '@/contexts/I18nContext';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  const isSpanish = language === 'es';

  return (
    <button
      onClick={() => setLanguage(isSpanish ? 'en' : 'es')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-300 hover:bg-gray-700 hover:border-ryvynn-cyan/30 hover:text-white transition-all text-sm font-medium"
      aria-label={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
      title={isSpanish ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className="text-base leading-none">{isSpanish ? '🇺🇸' : '🇲🇽'}</span>
      <span className="hidden sm:inline">{isSpanish ? 'EN' : 'ES'}</span>
    </button>
  );
}
