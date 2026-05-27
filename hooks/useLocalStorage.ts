'use client';

import { useState, useEffect } from 'react';

/**
 * useLocalStorage — typed, SSR-safe persistent state.
 * Hydrates from localStorage after mount to avoid hydration mismatch.
 * Tab-syncs via 'storage' event so changes in one tab show in others.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {}
    setHydrated(true);
  }, [key]);

  // Persist + tab sync
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value, hydrated]);

  // Listen for cross-tab changes
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setValue(JSON.parse(e.newValue) as T);
      } catch {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [value, setValue];
}

/**
 * useTheme — dark/light toggle with system-preference detection.
 * Stores choice in localStorage; falls back to prefers-color-scheme.
 */
export type Theme = 'dark' | 'light';

export function useTheme(): [Theme, () => void, (t: Theme) => void] {
  const [theme, setTheme] = useState<Theme>('dark');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ryvynn-theme') as Theme | null;
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      } else {
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        setTheme(prefersLight ? 'light' : 'dark');
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('ryvynn-theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, [theme, hydrated]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  return [theme, toggle, setTheme];
}
