// zkp/proofs/deletionReceipt.ts
// Generates a verifiable deletion receipt after a session is purged.
// The proof asserts: "I held session S, and it was deleted at time T."
// Neither the session content nor the user's identity is revealed.

import { ZKP_CONFIG } from '../zkp.config';

export interface DeletionInput {
  sessionIdHash: bigint;   // Poseidon hash of the session ID
  userCommitment: bigint;  // User-generated secret, stored in sessionStorage only
  deletionTimestamp: number;
}

export interface DeletionReceipt {
  proof: object;
  publicSignals: string[];
  receiptHash: string;
  deletionTimestamp: number;
  issuedAt: string; // ISO8601
}

export class DeletionProofError extends Error {
  constructor(
    message: string,
    public readonly code: 'PROOF_FAILED' | 'ARTIFACTS_MISSING',
  ) {
    super(message);
    this.name = 'DeletionProofError';
  }
}

/**
 * Generates a user-held deletion receipt using Web Crypto for the commitment,
 * then produces a ZK proof via snarkjs WASM.
 *
 * Call this BEFORE clearing session state — sessionId must still be in memory.
 */
export async function generateDeletionReceipt(
  input: DeletionInput,
): Promise<DeletionReceipt> {
  const snarkjs = await import('snarkjs').catch(() => {
    throw new DeletionProofError(
      'ZK proving library unavailable.',
      'ARTIFACTS_MISSING',
    );
  });

  const witnessInput = {
    sessionIdHash:     input.sessionIdHash.toString(),
    userCommitment:    input.userCommitment.toString(),
    deletionTimestamp: String(input.deletionTimestamp),
  };

  let proof: object;
  let publicSignals: string[];

  try {
    const result = await snarkjs.groth16.fullProve(
      witnessInput,
      ZKP_CONFIG.deletionReceipt.wasmPath,
      ZKP_CONFIG.deletionReceipt.zkeyPath,
    );
    proof = result.proof;
    publicSignals = result.publicSignals;
  } catch {
    throw new DeletionProofError(
      'Receipt proof failed. Circuit artifacts may be missing from /public/zkp/.',
      'ARTIFACTS_MISSING',
    );
  }

  return {
    proof,
    publicSignals,
    receiptHash:       publicSignals[0],
    deletionTimestamp: input.deletionTimestamp,
    issuedAt:          new Date(input.deletionTimestamp * 1000).toISOString(),
  };
}

/**
 * Derives a Poseidon-compatible integer hash from a session ID string
 * using Web Crypto SHA-256, then truncating to fit the field.
 */
export async function hashSessionId(sessionId: string): Promise<bigint> {
  const encoder = new TextEncoder();
  const data = encoder.encode(sessionId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);

  // Take first 31 bytes to stay within the BN128 scalar field (< 2^254)
  let result = 0n;
  for (let i = 0; i < 31; i++) {
    result = (result << 8n) | BigInt(hashArray[i]);
  }
  return result;
}

/**
 * Generates a random user commitment.
 * Store this in sessionStorage — lose it and the receipt can't be re-proved.
 */
export function generateUserCommitment(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(31));
  let result = 0n;
  for (const byte of bytes) {
    result = (result << 8n) | BigInt(byte);
  }
  return result;
}
