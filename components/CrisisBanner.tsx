'use client';

import { usePathname } from 'next/navigation';

// CrisisBanner is now SUPPRESSED on the homepage.
// The red 🆘 bar was the first thing every visitor saw — raising anxiety
// before any empathy or relief was offered.
// It now only appears on /guardian and /crisis where it's contextually appropriate.

export function CrisisBanner() {
  const pathname = usePathname();

  // Only show on pages where crisis routing is contextually appropriate
  const showOn = ['/guardian', '/crisis', '/journal', '/eternity'];
  if (!showOn.some(p => pathname.startsWith(p))) return null;

  return (
    <div style={{
      background: 'rgba(185,28,28,0.15)',
      borderBottom: '1px solid rgba(239,68,68,0.2)',
      padding: '8px 16px',
      textAlign: 'center',
    }}>
      <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>
        If you're in immediate danger:{' '}
        <a href="tel:988" style={{ color: '#fff', fontWeight: 700 }}>call or text 988</a>
        {' '}— free, 24/7
      </p>
    </div>
  );
}
