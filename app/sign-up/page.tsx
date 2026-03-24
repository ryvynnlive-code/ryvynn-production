'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [persona, setPersona] = useState('neutral');
  const [ageTier, setAgeTier] = useState('adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }

    setLoading(true);
    const result = await signUp(email, password, persona, ageTier);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      // Account created + signed in automatically — redirect to dashboard
      router.push('/dashboard');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/dashboard');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ryvynn-cyan rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN Dual Flame"
              className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(0,217,255,0.6)]"
            />
          </Link>
          <h1 className="text-4xl font-black bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            RYVYNN
          </h1>
          <p className="text-gray-400 text-sm mt-2">From Our Darkest Hours to Our Brightest Days</p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.2)]">

          {/* Tab Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-800 mb-8">
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                tab === 'signup'
                  ? 'bg-gradient-to-r from-ryvynn-cyan/20 to-ryvynn-purple/20 text-ryvynn-cyan border-b-2 border-ryvynn-cyan'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              🔥 Create Account
            </button>
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                tab === 'signin'
                  ? 'bg-gradient-to-r from-ryvynn-purple/20 to-ryvynn-cyan/20 text-ryvynn-purple border-b-2 border-ryvynn-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              ✨ Sign In
            </button>
          </div>

          {/* Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password (min 8 chars)</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-purple transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Guardian Persona</label>
                <select
                  value={persona} onChange={e => setPersona(e.target.value)} disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                >
                  <option value="neutral">Neutral</option>
                  <option value="feminine">Feminine</option>
                  <option value="masculine">Masculine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Age Group</label>
                <select
                  value={ageTier} onChange={e => setAgeTier(e.target.value)} disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                >
                  <option value="youth">Youth (13-17)</option>
                  <option value="young_adult">Young Adult (18-25)</option>
                  <option value="adult">Adult (26-64)</option>
                  <option value="mature">Mature (65+)</option>
                </select>
              </div>

              {error && <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}
              {message && <div className="p-3 bg-cyan-900/20 border border-cyan-500/50 rounded-xl text-cyan-400 text-sm">{message}</div>}

              <button
                type="submit" disabled={loading || !email || !password || !confirmPassword}
                className="w-full py-4 rounded-xl font-black text-lg text-white bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] mt-2"
              >
                {loading ? '⚡ Creating...' : '🔥 Create My Account'}
              </button>
            </form>
          )}

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-cyan transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={loading}
                  className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-ryvynn-cyan transition-colors"
                />
              </div>

              {error && <div className="p-3 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>}

              <button
                type="submit" disabled={loading || !email || !password}
                className="w-full py-4 rounded-xl font-black text-lg text-white bg-gradient-to-r from-ryvynn-purple to-ryvynn-cyan hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)] mt-2"
              >
                {loading ? '⚡ Signing in...' : '✨ Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600">
              <span className="text-ryvynn-cyan font-semibold">🔒 Zero surveillance.</span>{' '}
              Your data is yours forever.{' '}
              <Link href="/crisis" className="text-ryvynn-purple hover:text-ryvynn-cyan transition-colors">
                Crisis support always free.
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-gray-600 text-sm hover:text-gray-400 transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
