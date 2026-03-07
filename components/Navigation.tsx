'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageToggle } from '@/components/LanguageToggle';

export function Navigation() {
  const { t, tf } = useI18n();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/dashboard', label: tf('dashboard') },
    { href: '/wall', label: 'Wall' },
    { href: '/crisis', label: 'Crisis' },
    { href: '/pricing', label: t('pricing') },
  ];

  return (
    <nav className="border-b border-gray-800 py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🔥🔥</span>
            <span className="font-bold text-xl">RYVYNN</span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-ryvynn-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <LanguageToggle />
      </div>
    </nav>
  );
}
