'use client';

import { useI18n } from '@/contexts/I18nContext';

export function CrisisBanner() {
  const { t } = useI18n();

  return (
    <div className="bg-red-900 border-b border-red-700 py-2 px-4 text-center">
      <p className="text-white text-sm font-medium">
        🆘 {t('crisisBanner')}
      </p>
    </div>
  );
}
