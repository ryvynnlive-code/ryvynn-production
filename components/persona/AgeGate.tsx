'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

// Non-blocking age notice — appears as a dismissible bottom banner ONLY on first visit.
// Does NOT block access. Compliance via acknowledgement, not gatekeeping.
export function AgeGate() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once, on first visit — never again after dismissed
    const seen = localStorage.getItem('ryvynn-age-notice');
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('ryvynn-age-notice', 'seen');
    setShow(false);
  };

  const leave = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="max-w-2xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        style={{
          background: 'rgba(10,10,14,0.97)',
          border: '1px solid rgba(0,217,255,0.18)',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'all',
        }}
      >
        <p className="text-sm leading-relaxed flex-1" style={{ color: '#9aA0b0' }}>
          {t('v2AgeNotice' as any)}
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={leave}
            className="text-xs px-3 py-2 rounded-xl"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#7a8499', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}
          >
            Leave
          </button>
          <button
            onClick={dismiss}
            className="text-xs px-4 py-2 rounded-xl font-semibold"
            style={{ background: 'rgba(0,217,255,0.12)', border: '1px solid rgba(0,217,255,0.3)', color: '#00D9FF', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}
          >
            {t('v2AgeDismiss' as any)}
          </button>
        </div>
      </div>
    </div>
  );
}
