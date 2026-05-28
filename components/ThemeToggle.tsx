'use client';

import { useTheme } from '@/hooks/useLocalStorage';

export default function ThemeToggle({ size = 36 }: { size?: number }) {
  const [theme, toggle] = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: theme === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(20,16,40,0.06)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(20,16,40,0.10)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.3s ease',
        color: theme === 'dark' ? '#94a3b8' : '#4a4a68',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'scale(1.08)';
        el.style.borderColor = theme === 'dark'
          ? 'rgba(139,92,246,0.45)'
          : 'rgba(139,92,246,0.5)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.transform = 'scale(1)';
        el.style.borderColor = theme === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(20,16,40,0.10)';
      }}
    >
      {theme === 'dark' ? (
        /* Sun — switches TO light */
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        /* Moon — switches TO dark */
        <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
