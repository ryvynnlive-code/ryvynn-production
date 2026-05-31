// components/ZKAgeGate.tsx
// Client Component — all ZK proving happens in the browser via WASM.
// The birth year is private. Only the boolean "isAdult" result is ever surfaced.
// Stores a compact proof attestation in sessionStorage for the current session only.

'use client';

import { useState, useCallback } from 'react';

const SESSION_KEY = 'ryvynn_zk_age_v1';

type GateState =
  | { status: 'idle' }
  | { status: 'proving' }
  | { status: 'passed'; receiptHash: string }
  | { status: 'blocked' }
  | { status: 'error'; message: string };

interface ZKAgeGateProps {
  onPassed: () => void;
  onBlocked?: () => void;
}

function getStoredAttestation(): { receiptHash: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function ZKAgeGate({ onPassed, onBlocked }: ZKAgeGateProps) {
  const stored = getStoredAttestation();
  const [gateState, setGateState] = useState<GateState>(
    stored ? { status: 'passed', receiptHash: stored.receiptHash } : { status: 'idle' },
  );
  const [yearInput, setYearInput] = useState('');

  // Signal passing immediately if session already holds a proof
  if (stored && gateState.status === 'idle') {
    onPassed();
    return null;
  }

  if (gateState.status === 'passed') {
    onPassed();
    return null;
  }

  const handleProve = useCallback(async () => {
    const birthYear = parseInt(yearInput, 10);
    if (isNaN(birthYear) || birthYear < 1900 || birthYear > new Date().getFullYear()) {
      setGateState({ status: 'error', message: 'Please enter a valid birth year.' });
      return;
    }

    setGateState({ status: 'proving' });

    try {
      // Dynamic import keeps snarkjs out of the main bundle entirely.
      // This also means the WASM only loads when the gate is actually triggered.
      const { proveAge } = await import('@/zkp/proofs/ageGate');
      const result = await proveAge({ birthYear });

      if (!result.isAdult) {
        sessionStorage.removeItem(SESSION_KEY);
        setGateState({ status: 'blocked' });
        onBlocked?.();
        return;
      }

      // Store only the receipt hash — not the proof or birth year
      const attestation = { receiptHash: result.publicSignals[0] };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(attestation));
      setGateState({ status: 'passed', receiptHash: attestation.receiptHash });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setGateState({ status: 'error', message });
    }
  }, [yearInput, onBlocked]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(5,5,16,0.97)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
    >
      <div className="max-w-sm w-full space-y-8 text-center">

        <div className="space-y-3">
          <h2
            className="text-lg font-light tracking-wide"
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            Some content here is for adults.
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.36)' }}
          >
            Enter your birth year. We verify your age using a zero-knowledge proof —
            your year is never sent to our servers.
          </p>
        </div>

        {gateState.status === 'error' && (
          <p className="text-sm" style={{ color: 'rgba(255,100,100,0.8)' }}>
            {gateState.message}
          </p>
        )}

        {gateState.status === 'blocked' && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            This section is for adults only. The rest of RYVYNN is still open to you.
          </p>
        )}

        {gateState.status !== 'blocked' && (
          <div className="space-y-4">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Birth year (e.g. 1995)"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleProve()}
              disabled={gateState.status === 'proving'}
              className="w-full px-4 py-3 rounded-lg text-center text-white
                         bg-white/5 border border-white/10
                         focus:outline-none focus:border-cyan-400/40
                         placeholder-white/20 disabled:opacity-40"
            />

            <button
              onClick={handleProve}
              disabled={gateState.status === 'proving' || !yearInput}
              className="w-full py-3 rounded-full text-sm font-medium
                         border transition-all duration-300
                         disabled:opacity-30 disabled:cursor-not-allowed
                         hover:scale-[1.02] focus:outline-none focus-visible:ring-2
                         focus-visible:ring-cyan-400/40"
              style={{
                background:  'linear-gradient(135deg, rgba(0,255,255,0.08), rgba(155,48,255,0.08))',
                borderColor: 'rgba(0,255,255,0.22)',
                color:       '#00FFFF',
              }}
            >
              {gateState.status === 'proving' ? 'Verifying privately…' : 'Verify Age Privately'}
            </button>
          </div>
        )}

        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.16)' }}>
          Zero-knowledge proof · your birth year stays on your device
        </p>
      </div>
    </div>
  );
}
