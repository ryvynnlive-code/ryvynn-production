// zkp/zkp.config.ts
// Paths to pre-compiled circuit artifacts served from /public/zkp/.
// Compile circuits with: cd zkp/circuits && ./compile.sh
// Artifacts belong in public/zkp/ so the browser can fetch them.

export const ZKP_CONFIG = {
  ageGate: {
    wasmPath:            '/zkp/age_gate_js/age_gate.wasm',
    zkeyPath:            '/zkp/age_gate_final.zkey',
    verificationKeyPath: '/zkp/age_gate_vkey.json',
  },
  deletionReceipt: {
    wasmPath:            '/zkp/deletion_receipt_js/deletion_receipt.wasm',
    zkeyPath:            '/zkp/deletion_receipt_final.zkey',
    verificationKeyPath: '/zkp/deletion_receipt_vkey.json',
  },
} as const;

// Minimum age enforced by the age-gate circuit
export const MINIMUM_AGE = 18;
