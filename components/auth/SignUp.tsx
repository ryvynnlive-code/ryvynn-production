'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { TurnstileWidget } from './TurnstileWidget';

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export function SignUp({ isOpen, onClose, onSwitchToSignIn }: SignUpProps) {
  const { signUp } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [persona, setPersona] = useState('neutral');
  const [ageTier, setAgeTier] = useState('adult');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
  };

  const handleTurnstileError = () => {
    setError(t('errorBotProtection'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('errorPasswordsNoMatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('errorPasswordTooShort'));
      return;
    }

    // Check Turnstile token (only if configured)
    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError(t('errorSecurityVerification'));
      return;
    }

    setLoading(true);

    const result = await signUp(
      email, 
      password, 
      persona, 
      ageTier,
      turnstileToken || undefined
    );

    if (result.error) {
      // Check for specific error types
      if (result.error.includes('fetch') || result.error.includes('network') || result.error.includes('connection')) {
        setError(t('errorDatabaseConnection'));
      } else {
        setError(result.error);
      }
      setLoading(false);
      // Reset Turnstile on error
      setTurnstileToken(null);
    } else if (result.requiresEmailConfirmation) {
      // Email confirmation required - show success message
      setLoading(false);
      setError('');
      alert(`✅ Account created! ${result.message}`);
      onClose();
    } else {
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPersona('neutral');
      setAgeTier('adult');
      setTurnstileToken(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple rounded-3xl max-w-md w-full p-8 my-8 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-black bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
            ✨ {t('signUp')}
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
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('passwordMin')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('guardianPersona')}
              </label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                disabled={loading}
              >
                <option value="neutral">{t('personaNeutral')}</option>
                <option value="feminine">{t('personaFeminine')}</option>
                <option value="masculine">{t('personaMasculine')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('ageGroup')}
              </label>
              <select
                value={ageTier}
                onChange={(e) => setAgeTier(e.target.value)}
                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-ryvynn-purple transition-colors"
                disabled={loading}
              >
                <option value="youth">{t('ageTierYouth')}</option>
                <option value="young_adult">{t('ageTierYoungAdult')}</option>
                <option value="adult">{t('ageTierAdult')}</option>
                <option value="mature">{t('ageTierMature')}</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Cloudflare Turnstile - Invisible Bot Protection */}
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="mb-4">
              <TurnstileWidget 
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-black text-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]"
          >
            {loading ? `⚡ ${t('creatingAccount')}` : `🔥 ${t('createAccount')}`}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-ryvynn-purple hover:text-ryvynn-cyan transition-colors font-medium"
            >
              {t('alreadyHaveAccount')} {t('signIn')}
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
