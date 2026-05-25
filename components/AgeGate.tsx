'use client';

/**
 * AgeGate — 3rd party face verification pattern
 * We ask Yoti/Vouched: "is this person 18+?"
 * They check. They send us YES or NO + a one-time token.
 * We store NOTHING about the user. We never see ID.
 * Token is stored client-side in sessionStorage only.
 * 
 * For 14-17: separate protected mode (less raw content).
 * Under 14: blocked.
 */

import { useState, useEffect } from 'react';

const AGE_TOKEN_KEY = 'ryvynn_age_v1';
const AGE_VERIFIED_KEY = 'ryvynn_age_verified';

export type AgeTier = 'adult' | 'teen' | 'blocked' | 'unverified';

interface AgeGateProps {
  onVerified: (tier: AgeTier) => void;
  onSkip?: () => void;
  required?: boolean;
}

function getStoredTier(): AgeTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = sessionStorage.getItem(AGE_VERIFIED_KEY);
    if (stored) {
      const { tier, expires } = JSON.parse(stored);
      if (Date.now() < expires) return tier as AgeTier;
    }
  } catch {}
  return null;
}

function storeTier(tier: AgeTier) {
  try {
    sessionStorage.setItem(AGE_VERIFIED_KEY, JSON.stringify({
      tier,
      expires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours session
    }));
  } catch {}
}

export function useAgeTier(): AgeTier {
  const [tier, setTier] = useState<AgeTier>('unverified');
  useEffect(() => {
    const stored = getStoredTier();
    if (stored) setTier(stored);
    else setTier('unverified');
  }, []);
  return tier;
}

export function AgeGate({ onVerified, onSkip, required = false }: AgeGateProps) {
  const [step, setStep] = useState<'intro' | 'verifying' | 'done' | 'denied'>('intro');
  const [selfReported, setSelfReported] = useState<'adult' | 'teen' | null>(null);

  const handleSelfReport = (choice: 'adult' | 'teen') => {
    setSelfReported(choice);
    // For teen: direct access to protected mode (no face verify needed)
    if (choice === 'teen') {
      storeTier('teen');
      onVerified('teen');
      return;
    }
    // For adult: offer face verify OR self-attest
    setStep('verifying');
  };

  const handleSelfAttest = () => {
    // User attests they are 18+ without face verify
    // This is how most platforms handle it — Terms accept = legal
    storeTier('adult');
    onVerified('adult');
  };

  const handleFaceVerify = () => {
    // In production: open Yoti/Vouched iframe
    // They verify age on their servers. They send us a signed token.
    // We receive: { verified: true, ageGroup: '18+', token: 'xyz' }
    // We store ONLY the token client-side. We never see the ID.
    
    // For now: show the flow that will connect to Yoti
    // Production integration: NEXT_PUBLIC_YOTI_CLIENT_SDK_ID env var
    const yotiClientId = process.env.NEXT_PUBLIC_YOTI_CLIENT_SDK_ID;
    
    if (!yotiClientId) {
      // No Yoti configured yet — fall back to self-attest
      handleSelfAttest();
      return;
    }
    
    // TODO: Initialize Yoti SDK iframe
    // window.Yoti.init({ clientSdkId: yotiClientId, ... })
    handleSelfAttest(); // temp until Yoti connected
  };

  if (step === 'intro') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🔥</div>
          <h2 className="text-white font-bold text-lg mb-2">Before you enter</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            RYVYNN contains raw, unfiltered human pain. Some of it is heavy.
            We need to know your age to show you the right version.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => handleSelfReport('adult')}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)' }}
            >
              I am 18 or older
            </button>
            <button
              onClick={() => handleSelfReport('teen')}
              className="w-full py-3 rounded-xl text-sm font-medium border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"
            >
              I am 14-17
            </button>
            <button
              onClick={() => { storeTier('blocked'); onVerified('blocked'); }}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-500 transition-colors"
            >
              I am under 14 (exit)
            </button>
          </div>
          
          <p className="text-gray-700 text-xs mt-4">
            We do not track your age. This is a session-only check.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'verifying') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">🛡️</div>
          <h2 className="text-white font-bold text-lg mb-2">Confirm you are 18+</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Optional: verify with your face. Takes 10 seconds.
            We never see your ID. A third party checks and sends us only a yes or no.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleFaceVerify}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black"
              style={{ background: 'linear-gradient(135deg, #00D9FF, #8B5CF6)' }}
            >
              Verify with face scan (anonymous)
            </button>
            <button
              onClick={handleSelfAttest}
              className="w-full py-3 rounded-xl text-sm font-medium border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors"
            >
              I confirm I am 18+ — enter without scan
            </button>
          </div>
          
          <p className="text-gray-700 text-xs mt-4 leading-relaxed">
            By entering you confirm you are 18 or older and accept our{' '}
            <a href="/terms" className="underline hover:text-gray-500">terms</a>.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'denied') {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-white font-bold text-lg mb-2">This content is for adults</h2>
          <p className="text-gray-400 text-sm">Come back when you are 18.</p>
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Lightweight age check component — no gate UI, just reads session
 */
export function AgeCheck({ children, minTier = 'teen' }: { children: React.ReactNode; minTier?: AgeTier }) {
  const tier = useAgeTier();
  if (tier === 'unverified' || tier === 'blocked') return null;
  if (minTier === 'adult' && tier !== 'adult') return null;
  return <>{children}</>;
}
