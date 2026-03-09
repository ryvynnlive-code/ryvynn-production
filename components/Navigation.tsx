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

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/dashboard', label: tf('dashboard'), protected: true },
    { href: '/wall', label: t('wall') },
    { href: '/crisis', label: t('crisis') },
    { href: '/pricing', label: t('pricing') },
  ];

  return (
    <>
      <nav className="border-b border-gray-800 py-4 px-6 bg-black/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="relative w-12 h-12">
                <img 
                  src="/assets/dual-flame-logo.png" 
                  alt="RYVYNN Dual Flame" 
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,217,255,0.6)] group-hover:drop-shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all duration-300"
                />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
                RYVYNN
              </span>
            </Link>
            
            <div className="hidden md:flex gap-6">
              {navItems.map((item) => {
                if (item.protected && !user) return null;
                return (
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
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium text-white">{user.email?.split('@')[0]}</div>
                      {profile && (
                        <div className="text-xs text-ryvynn-cyan">
                          {profile.soul_tokens} 🔥 {t('soulTokensLabel')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={signOut}
                      className="px-4 py-2 text-sm border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                      {t('signOut')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSignIn(true)}
                      className="px-4 py-2 text-sm border border-ryvynn-cyan rounded-lg text-ryvynn-cyan hover:bg-ryvynn-cyan/10 transition-colors"
                    >
                      {t('signIn')}
                    </button>
                    <button
                      onClick={() => setShowSignUp(true)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-lg text-white font-bold hover:scale-105 transition-transform"
                    >
                      {t('signUp')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      <SignIn 
        isOpen={showSignIn} 
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />
      
      <SignUp 
        isOpen={showSignUp} 
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />
    </>
  );
}
