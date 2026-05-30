'use client';

import { useI18n } from '@/contexts/I18nContext';

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();
  const next = language === 'en' ? 'es' : 'en';
  const label = language === 'en' ? 'ES' : 'EN';

  return (
    <button
      onClick={() => setLanguage(next)}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-widest transition-all border"
      style={{
        background: language === 'es' ? 'rgba(139,92,246,0.15)' : 'rgba(0,217,255,0.08)',
        border: language === 'es' ? '1.5px solid rgba(139,92,246,0.5)' : '1.5px solid rgba(0,217,255,0.3)',
        color: language === 'es' ? '#a78bfa' : '#00d9ff',
      }}
      aria-label={`Switch to ${label}`}
    >
      {label}
    </button>
  );
}
