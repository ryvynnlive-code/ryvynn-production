'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';

interface SignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export function SignIn({ isOpen, onClose, onSwitchToSignUp }: SignInProps) {
  const { signIn } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      // Check for specific error types
      if (signInError.includes('fetch') || signInError.includes('network') || signInError.includes('connection')) {
        setError(t('errorDatabaseConnection'));
      } else {
        setError(signInError);
      }
      setLoading(false);
    } else {
      onClose();
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-3xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(0,217,255,0.3)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            🔥 {t('signIn')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-cyan transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-cyan transition-colors"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-black text-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-[0_0_30px_rgba(0,217,255,0.3)]"
          >
            {loading ? `⚡ ${t('signIn')}...` : `🔥 ${t('signIn')}`}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="text-ryvynn-cyan hover:text-ryvynn-purple transition-colors font-medium"
            >
              {t('dontHaveAccount')} {t('signUp')}
            </button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-500 border-t border-gray-800 pt-4 text-center">
          <span className="text-ryvynn-cyan font-bold">🔒 {t('privacyNotice').split('.')[0]}.</span> {t('privacyNotice').split('.')[1]}.
        </div>
      </div>
    </div>
  );
}
