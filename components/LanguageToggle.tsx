'use client';

import { useI18n } from '@/contexts/I18nContext';

export function LanguageToggle() {
  const { language, setLanguage, t } = useI18n();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-medium"
      aria-label={t('language')}
    >
      {language === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
