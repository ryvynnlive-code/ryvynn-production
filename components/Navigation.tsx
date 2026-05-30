'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { SignIn } from '@/components/auth/SignIn';
import { SignUp } from '@/components/auth/SignUp';

export function Navigation() {
  const { t, tf } = useI18n();
  const { user, profile, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/sanctuary', label: 'Sanctuary' },
    { href: '/wall', label: t('wall') },
    { href: '/crisis', label: t('crisis') },
    ...(user ? [
      { href: '/dashboard', label: tf('dashboard'), protected: true },
      { href: '/settings', label: t('settings') },
    ] : []),
  ];

  return (
    <>
      <nav className="border-b border-gray-800 py-3 px-4 md:px-6 bg-black/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

          {/* Logo — BIGGER */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group flex-shrink-0">
            <div className="relative w-14 h-14 md:w-16 md:h-16">
              <img
                src="/assets/dual-flame-logo.png"
                alt="RYVYNN Dual Flame"
                className="w-full h-full object-contain drop-shadow-[0_0_24px_rgba(0,217,255,0.7)] group-hover:drop-shadow-[0_0_36px_rgba(139,92,246,0.9)] transition-all duration-300"
              />
            </div>
            <span className="font-bold text-xl md:text-2xl bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent tracking-wide">
              RYVYNN
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-5 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-all ${
                  pathname === item.href
                    ? 'text-white font-semibold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageToggle />

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 hidden md:block">anonymous</span>
                    <button
                      onClick={signOut}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t('signIn')}
                    </button>
                    <button
                      onClick={() => setShowSignUp(true)}
                      className="text-sm px-4 py-1.5 rounded-full border border-ryvynn-cyan/40 text-ryvynn-cyan hover:bg-ryvynn-cyan/10 transition-all font-medium"
                    >
                      stay anonymous, get more
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-gray-800 pt-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-2 py-1.5 text-sm rounded transition-colors ${
                  pathname === item.href ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <>
                <button
                  onClick={() => { setShowSignIn(true); setMobileOpen(false); }}
                  className="block w-full text-left px-2 py-1.5 text-sm text-gray-400 hover:text-white"
                >
                  {t('signIn')}
                </button>
                <button
                  onClick={() => { setShowSignUp(true); setMobileOpen(false); }}
                  className="block w-full text-left px-2 py-1.5 text-sm text-ryvynn-cyan"
                >
                  stay anonymous, get more →
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      {showSignIn && <SignIn isOpen={showSignIn} onClose={() => setShowSignIn(false)} onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }} />}
      {showSignUp && <SignUp isOpen={showSignUp} onClose={() => setShowSignUp(false)} onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }} />}
    </>
  );
}
