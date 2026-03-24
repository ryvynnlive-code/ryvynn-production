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
    { href: '/wall', label: t('wall') },
    { href: '/crisis', label: t('crisis') },
    { href: '/pricing', label: t('pricing') },
    { href: '/support', label: '🔥 Donate' },
    ...(user ? [{ href: '/dashboard', label: tf('dashboard'), protected: true }] : []),
  ];

  return (
    <>
      <nav className="border-b border-gray-800 py-3 px-4 md:px-6 bg-black/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group flex-shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <img
                src="/assets/dual-flame-logo.png"
                alt="RYVYNN Dual Flame"
                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,217,255,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300"
              />
            </div>
            <span className="font-bold text-lg md:text-xl bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              RYVYNN
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-5 items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.href === '/support'
                    ? `text-sm font-bold transition-all ${
                        pathname === item.href
                          ? 'text-ryvynn-cyan'
                          : 'bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent hover:opacity-80'
                      }`
                    : `text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? 'text-ryvynn-cyan'
                          : 'text-gray-400 hover:text-white'
                      }`
                }
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side: Auth + Language */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <LanguageToggle />

            {loading ? (
              <div className="w-6 h-6 border-2 border-ryvynn-cyan rounded-full animate-spin border-t-transparent" />
            ) : user ? (
              /* Logged In State */
              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center gap-2 text-sm text-gray-300 hover:text-ryvynn-cyan transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ryvynn-cyan to-ryvynn-purple flex items-center justify-center text-xs font-black text-black">
                    {(profile?.soul_tokens ?? 0)}
                  </div>
                  <span className="hidden lg:inline">{user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-gray-700 hover:border-red-400"
                >
                  Exit
                </button>
              </div>
            ) : (
              /* Logged Out State — PROMINENT CTA */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSignIn(true)}
                  className="hidden sm:block text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5"
                >
                  {t('signIn')}
                </button>
                <button
                  onClick={() => setShowSignUp(true)}
                  className="text-sm font-black px-4 py-2 rounded-xl bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] transition-all duration-200"
                >
                  🔥 {t('signUp') || 'START FREE'}
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1.5 w-5">
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-800 mt-3 pt-4 pb-2 px-4 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 ${
                  pathname === item.href ? 'text-ryvynn-cyan' : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-3 mt-2 pt-3 border-t border-gray-800">
                <button
                  onClick={() => { setShowSignIn(true); setMobileOpen(false); }}
                  className="flex-1 text-sm py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-ryvynn-cyan hover:text-white transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setShowSignUp(true); setMobileOpen(false); }}
                  className="flex-1 text-sm font-black py-2.5 rounded-xl bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple text-black"
                >
                  🔥 START FREE
                </button>
              </div>
            )}
            {user && (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="text-sm text-red-400 py-2 text-left"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <SignIn
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => { setShowSignIn(false); setShowSignUp(true); }}
      />
      <SignUp
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => { setShowSignUp(false); setShowSignIn(true); }}
      />
    </>
  );
}
