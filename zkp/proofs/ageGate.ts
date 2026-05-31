// zkp/proofs/ageGate.ts
// Browser-side age-gate proof generation and verification.
// Runs entirely in a Web Worker via snarkjs WASM — never touches the server.
// snarkjs is dynamically imported to keep the initial JS bundle lean.

import { ZKP_CONFIG, MINIMUM_AGE } from '../zkp.config';

export interface AgeProofInput {
  birthYear: number;
}

export interface AgeProof {
  proof: object;
  publicSignals: string[];
  isAdult: boolean;
}

export class AgeGateError extends Error {
  constructor(
    message: string,
    public readonly code: 'PROOF_FAILED' | 'INVALID_PROOF' | 'ARTIFACTS_MISSING',
  ) {
    super(message);
    this.name = 'AgeGateError';
  }
}

async function loadSnarkjs() {
  try {
    // Dynamic import keeps snarkjs out of the main bundle.
    // snarkjs ships its own types in newer releases; the @ts-ignore guards against
    // environments where the package types aren't resolved at build time.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const snarkjs = await import('snarkjs');
    return snarkjs as typeof import('snarkjs');
  } catch {
    throw new AgeGateError(
      'ZK proving library failed to load. Please refresh and try again.',
      'ARTIFACTS_MISSING',
    );
  }
}

/**
 * Generates a ZK proof asserting the user's birth year satisfies the age gate.
 * The birth year is kept private — only the boolean result is revealed.
 */
export async function proveAge(input: AgeProofInput): Promise<AgeProof> {
  const currentYear = new Date().getFullYear();

  if (input.birthYear > currentYear - MINIMUM_AGE) {
    // Fail fast before spending WASM cycles on a proof we know won't pass.
    throw new AgeGateError(
      'Age requirement not met.',
      'PROOF_FAILED',
    );
  }

  const snarkjs = await loadSnarkjs();

  const witnessInput = {
    birthYear:   String(input.birthYear),
    currentYear: String(currentYear),
    minAge:      String(MINIMUM_AGE),
  };

  let proof: object;
  let publicSignals: string[];

  try {
    const result = await snarkjs.groth16.fullProve(
      witnessInput,
      ZKP_CONFIG.ageGate.wasmPath,
      ZKP_CONFIG.ageGate.zkeyPath,
    );
    proof = result.proof;
    publicSignals = result.publicSignals;
  } catch (err) {
    throw new AgeGateError(
      'Proof generation failed. Circuit artifacts may be missing from /public/zkp/.',
      'ARTIFACTS_MISSING',
    );
  }

  const isAdult = publicSignals[0] === '1';

  return { proof, publicSignals, isAdult };
}

/**
 * Verifies a proof locally using the verification key.
 * Call this to re-check a proof returned from storage without re-proving.
 */
export async function verifyAge(proof: object, publicSignals: string[]): Promise<boolean> {
  const snarkjs = await loadSnarkjs();

  let vkeyRaw: Response;
  try {
    vkeyRaw = await fetch(ZKP_CONFIG.ageGate.verificationKeyPath);
    if (!vkeyRaw.ok) throw new Error('not found');
  } catch {
    throw new AgeGateError(
      'Verification key not found. Circuit artifacts may be missing.',
      'ARTIFACTS_MISSING',
    );
  }

  const vkey = await vkeyRaw.json();

  const valid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

  if (!valid) {
    throw new AgeGateError('Proof is invalid or has been tampered with.', 'INVALID_PROOF');
  }

  return valid;
}
