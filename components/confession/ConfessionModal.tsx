'use client';

import { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePersona } from '@/contexts/PersonaContext';
import { useAuth } from '@/contexts/AuthContext';

interface ConfessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FlowStep = 'write' | 'transforming' | 'reveal';

export function ConfessionModal({ isOpen, onClose }: ConfessionModalProps) {
  const { tp, language } = useI18n();
  const { persona, ratedMode } = usePersona();
  const { user } = useAuth();
  const [confession, setConfession] = useState('');
  const [transformation, setTransformation] = useState('');
  const [step, setStep] = useState<FlowStep>('write');
  const [sharing, setSharing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confession.trim()) return;

    setStep('transforming');
    
    try {
      const response = await fetch('/api/confession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confession,
          mode: 'transmute',
          language: language || 'en',
        }),
      });

      if (!response.ok) throw new Error('Transformation failed');

      const data = await response.json();
      setTransformation(data.transformation);
      setStep('reveal');

    } catch (error) {
      console.error('Transformation failed:', error);
      alert(tp('confessionTransformFailed'));
      setStep('write');
    }
  };

  const handleReset = () => {
    setConfession('');
    setTransformation('');
    setStep('write');
    setSharing(false);
    onClose();
  };

  const handleShareToWall = async () => {
    if (!confession || !transformation || sharing) return;

    setSharing(true);

    try {
      const response = await fetch('/api/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          confession,
          transformation,
          isAnonymous: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to share to wall');

      const data = await response.json();

      if (data.tokensEarned && data.tokensEarned > 0) {
        alert(`✨ ${tp('confessionSharedAnon')} (+${data.tokensEarned} 🔥)`);
      } else {
        alert(tp('confessionSharedAnon'));
      }

      handleReset();

    } catch (error) {
      console.error('Share to wall failed:', error);
      alert(tp('confessionShareFailed'));
    } finally {
      setSharing(false);
    }
  };

  // WRITE STEP
  if (step === 'write') {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 rounded-3xl max-w-3xl w-full p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-black bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple bg-clip-text text-transparent">
              🌑 {tp('submitConfession')}
            </h2>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-white text-3xl transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={confession}
              onChange={(e) => setConfession(e.target.value)}
              placeholder={tp('confessionWritePlaceholder')}
              className="w-full h-64 bg-black/50 border-2 border-gray-700 rounded-2xl p-6 text-white text-lg placeholder-gray-600 focus:outline-none focus:border-ryvynn-cyan resize-none transition-all"
              autoFocus
            />

            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {tp('confessionPersonaLabel')}: <span className="text-ryvynn-cyan font-medium">{persona}</span>
                {ratedMode && <span className="ml-2 text-ryvynn-purple">| {tp('confessionRatedMode')}</span>}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-3 border-2 border-gray-700 rounded-xl text-white font-bold hover:bg-gray-800 transition-all"
                >
                  {tp('confessionCancel')}
                </button>
                <button
                  type="submit"
                  disabled={!confession.trim()}
                  className="px-8 py-3 bg-gradient-to-r from-ryvynn-cyan to-ryvynn-purple rounded-xl text-white font-black hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                >
                  {tp('confessionTransformBtn')}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-500 border-t border-gray-800 pt-6 flex items-start gap-3">
            <span className="text-ryvynn-cyan text-xl">🔐</span>
            <span className="leading-relaxed">
              {tp('confessionPrivacyNote')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // TRANSFORMING STEP
  if (step === 'transforming') {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-cyan rounded-3xl max-w-3xl w-full p-12 text-center shadow-[0_0_60px_rgba(0,217,255,0.4)] animate-pulse-slow">
          <div className="text-8xl mb-8 animate-pulse">🔥</div>
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-purple bg-clip-text text-transparent">
            {tp('confessionTransformingTitle')}
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            {tp('confessionTransformingDesc')}
          </p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-ryvynn-cyan animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // REVEAL STEP
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-ryvynn-purple rounded-3xl max-w-4xl w-full p-8 my-8 shadow-[0_0_60px_rgba(139,92,246,0.4)]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-float">✨</div>
          <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-ryvynn-cyan via-white to-ryvynn-purple bg-clip-text text-transparent">
            {tp('confessionMiracleTitle')}
          </h2>
          <p className="text-lg text-gray-400">
            {tp('confessionMiracleSubtitle')}
          </p>
        </div>

        {/* 50/50 Display */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Confession (Left - Shadow) */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black border-2 border-gray-700 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🌑</span>
              <h3 className="text-2xl font-bold text-gray-300">{tp('confessionYourShadow')}</h3>
            </div>
            <p className="text-gray-400 leading-relaxed italic">
              &ldquo;{confession}&rdquo;
            </p>
            <div className="mt-4 text-xs text-gray-600 border-t border-gray-800 pt-3">
              {tp('confessionStorageNote')}
            </div>
          </div>

          {/* Transformation (Right - Light) */}
          <div className="bg-gradient-to-br from-ryvynn-purple/10 to-ryvynn-cyan/10 border-2 border-ryvynn-purple rounded-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h3 className="text-2xl font-bold text-ryvynn-purple">{tp('confessionYourMiracle')}</h3>
            </div>
            <p className="text-white leading-relaxed font-medium">
              {transformation}
            </p>
            <div className="mt-4 text-xs text-ryvynn-cyan border-t border-ryvynn-purple/30 pt-3">
              {tp('confessionAiNote')}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleShareToWall}
            disabled={sharing}
            className="w-full py-5 bg-gradient-to-r from-ryvynn-cyan via-ryvynn-purple to-ryvynn-cyan rounded-2xl text-white font-black text-xl hover:scale-105 disabled:opacity-60 disabled:cursor-wait transition-all shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)]"
          >
            {tp('confessionShareWallBtn')}
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(transformation);
                alert(tp('confessionCopied'));
              }}
              className="flex-1 py-4 border-2 border-ryvynn-cyan rounded-xl text-ryvynn-cyan font-bold hover:bg-ryvynn-cyan/10 transition-all"
            >
              {tp('confessionCopyBtn')}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-4 border-2 border-gray-700 rounded-xl text-white font-bold hover:bg-gray-800 transition-all"
            >
              {tp('confessionWriteAnother')}
            </button>
          </div>
        </div>

        {/* Free Forever Notice */}
        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-800 pt-6">
          {tp('confessionFreeForever')}
        </div>
      </div>
    </div>
  );
}
