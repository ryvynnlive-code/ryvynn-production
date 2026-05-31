// components/DeletionReceiptPanel.tsx
// Shown after session burn. Generates a ZK deletion receipt the user can save.
// All proof generation happens in browser WASM — the server only records the hash.

'use client';

import { useState, useEffect } from 'react';
import {
  generateDeletionReceipt,
  hashSessionId,
  generateUserCommitment,
  type DeletionReceipt,
} from '@/zkp/proofs/deletionReceipt';

const COMMITMENT_KEY = 'ryvynn_del_commitment_v1';

interface DeletionReceiptPanelProps {
  sessionId: string;
  onDismiss: () => void;
}

type PanelState =
  | { status: 'generating' }
  | { status: 'ready'; receipt: DeletionReceipt }
  | { status: 'no_zkp' }   // snarkjs artifacts not compiled yet
  | { status: 'error'; message: string };

export function DeletionReceiptPanel({ sessionId, onDismiss }: DeletionReceiptPanelProps) {
  const [state, setState] = useState<PanelState>({ status: 'generating' });

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        // Retrieve or create the user's commitment for this device/session
        let commitmentStr = sessionStorage.getItem(COMMITMENT_KEY);
        let commitment: bigint;

        if (commitmentStr) {
          commitment = BigInt(commitmentStr);
        } else {
          commitment = generateUserCommitment();
          sessionStorage.setItem(COMMITMENT_KEY, commitment.toString());
        }

        const sessionIdHash   = await hashSessionId(sessionId);
        const deletionTimestamp = Math.floor(Date.now() / 1000);

        const receipt = await generateDeletionReceipt({
          sessionIdHash,
          userCommitment: commitment,
          deletionTimestamp,
        });

        if (cancelled) return;

        // Register hash with server (fire-and-forget — deletion already happened)
        fetch('/api/deletion/receipt', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receiptHash:       receipt.receiptHash,
            deletionTimestamp: receipt.deletionTimestamp,
            proof:             receipt.proof,
            publicSignals:     receipt.publicSignals,
          }),
        }).catch(() => {
          // Server registration is best-effort. The proof itself is the source of truth.
        });

        setState({ status: 'ready', receipt });
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);

        // If artifacts are missing, show a graceful fallback instead of an error
        if (message.includes('missing') || message.includes('unavailable')) {
          setState({ status: 'no_zkp' });
        } else {
          setState({ status: 'error', message });
        }
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [sessionId]);

  const copyHash = async (hash: string) => {
    await navigator.clipboard.writeText(hash);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-6"
      style={{ background: 'rgba(5,5,16,0.96)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Deletion receipt"
    >
      <div className="max-w-sm w-full space-y-7 text-center">

        {state.status === 'generating' && (
          <>
            <div
              className="text-3xl animate-pulse select-none"
              style={{ filter: 'drop-shadow(0 0 12px #00FFFF)' }}
              aria-hidden
            >
              🔥
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Generating your deletion proof…
            </p>
          </>
        )}

        {state.status === 'ready' && (
          <>
            <div className="space-y-2">
              <p
                className="text-base font-light"
                style={{ color: 'rgba(255,255,255,0.82)' }}
              >
                Your session is gone.
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Here is your cryptographic receipt — proof that the deletion happened.
              </p>
            </div>

            <div
              className="rounded-lg px-4 py-3 space-y-2 text-left"
              style={{ background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.12)' }}
            >
              <p className="text-xs font-mono break-all" style={{ color: 'rgba(0,255,255,0.7)' }}>
                {state.receipt.receiptHash}
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Deleted {state.receipt.issuedAt}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => copyHash(state.status === 'ready' ? state.receipt.receiptHash : '')}
                className="flex-1 py-2.5 rounded-full text-xs border transition-all hover:scale-[1.02]"
                style={{
                  borderColor: 'rgba(0,255,255,0.2)',
                  color:       'rgba(0,255,255,0.7)',
                }}
              >
                Copy Receipt Hash
              </button>
              <button
                onClick={onDismiss}
                className="flex-1 py-2.5 rounded-full text-xs border transition-all hover:scale-[1.02]"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                  color:       'rgba(255,255,255,0.4)',
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {state.status === 'no_zkp' && (
          <>
            <p className="text-base font-light" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Your session is gone.
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              ZK receipts require compiled circuit artifacts.
              Everything was still deleted — the proof system just isn&apos;t active yet.
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full text-sm border transition-all"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color:       'rgba(255,255,255,0.4)',
              }}
            >
              Close
            </button>
          </>
        )}

        {state.status === 'error' && (
          <>
            <p className="text-sm" style={{ color: 'rgba(255,100,100,0.75)' }}>
              Receipt generation failed — but your data was still deleted.
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-3 rounded-full text-sm border transition-all"
              style={{
                borderColor: 'rgba(255,255,255,0.1)',
                color:       'rgba(255,255,255,0.4)',
              }}
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
