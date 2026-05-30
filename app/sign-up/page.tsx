'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const { signUp, signIn, user, loading: authLoading } = useAuth();
  const { language } = useI18n();
  const router = useRouter();
  const es = language === 'es';

  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(es ? 'Las contraseñas no coinciden.' : 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError(es ? 'La contraseña debe tener al menos 8 caracteres.' : 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const result = await signUp(email, password, 'neutral', 'adult');
    setLoading(false);
    if (result.error) { setError(result.error); } else { router.push('/dashboard'); }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (result.error) { setError(result.error); } else { router.push('/dashboard'); }
  };

  const subheading = tab === 'signup'
    ? (es ? 'Mantente anónimo. Obtén más.' : 'Stay anonymous. Get more.')
    : (es ? 'Bienvenido de vuelta.' : 'Welcome back.');

  const subtext = tab === 'signup'
    ? (es
        ? 'Tu cuenta no tiene nombre real. Sin teléfono. Sin identidad. Solo un correo para que la cuenta sea tuya — nada más.'
        : 'Your account has no real name. No phone. No identity. Just an email to keep your account yours — nothing else.')
    : (es
        ? 'Sin nombre. Sin rastreo. Solo tu hogar anónimo.'
        : 'No name. No tracking. Just your anonymous home.');

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/assets/dual-flame-logo.png"
              alt="RYVYNN"
              className="w-14 h-14 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(0,217,255,0.5)]"
            />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">{subheading}</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{subtext}</p>
        </div>

        {/* Anonymous promise banner */}
        {tab === 'signup' && (
          <div className="bg-ryvynn-cyan/5 border border-ryvynn-cyan/20 rounded-xl p-4 mb-6">
            <div className="flex flex-col gap-1.5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-ryvynn-cyan">✓</span>
                <span>{es ? 'Sin nombre real requerido — nunca' : 'No real name required — ever'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ryvynn-cyan">✓</span>
                <span>{es ? 'Sin número de teléfono, sin verificación de identidad' : 'No phone number, no ID verification'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ryvynn-cyan">✓</span>
                <span>{es ? 'Tus publicaciones permanecen anónimas en el Muro' : 'Your posts stay anonymous on the Wall'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ryvynn-cyan">✓</span>
                <span>{es ? 'Tu correo solo mantiene la cuenta tuya' : 'Your email only keeps the account yours'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-ryvynn-purple">+</span>
                <span className="text-white">
                  {es
                    ? 'Tokens del Alma · Diario Oscuro · Historial del Guardián · Bóveda de Eternidad'
                    : 'Soul Tokens · Dark Journal · Guardian history · Eternity vault'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-xl p-1">
          <button
            onClick={() => setTab('signup')}
            className={[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              tab === 'signup' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300',
            ].join(' ')}
          >
            {es ? 'Crear cuenta' : 'Create account'}
          </button>
          <button
            onClick={() => setTab('signin')}
            className={[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              tab === 'signin' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-300',
            ].join(' ')}
          >
            {es ? 'Iniciar sesión' : 'Sign in'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={tab === 'signup' ? handleSignUp : handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
              {es ? 'Correo' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={es ? 'cualquier@correo.com' : 'anything@anywhere.com'}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ryvynn-cyan/50 placeholder-gray-600 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1">
              {es ? 'No almacenado con tus publicaciones. No compartido. Nunca.' : 'Not stored with your posts. Not shared. Ever.'}
            </p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
              {es ? 'Contraseña' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder={es ? '8+ caracteres' : '8+ characters'}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ryvynn-cyan/50 placeholder-gray-600 transition-colors"
            />
          </div>

          {tab === 'signup' && (
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">
                {es ? 'Confirmar Contraseña' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder={es ? 'igual de nuevo' : 'same again'}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ryvynn-cyan/50 placeholder-gray-600 transition-colors"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)', color: '#000' }}
          >
            {loading
              ? (es ? 'Un momento...' : 'One moment...')
              : tab === 'signup'
                ? (es ? 'Crear mi cuenta anónima' : 'Create my anonymous account')
                : (es ? 'Iniciar sesión' : 'Sign in')}
          </button>
        </form>

        {/* Soft support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs">
            {es ? 'RYVYNN es gratis.' : 'RYVYNN is free.'}{' '}
            <Link href="/pricing" className="text-gray-500 hover:text-white transition-colors underline underline-offset-2">
              {es ? 'Apoya la misión' : 'Support the mission'}
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
            {es ? 'volver, sin cuenta necesaria' : 'back, no account needed'}
          </Link>
        </div>

      </div>
    </div>
  );
}
