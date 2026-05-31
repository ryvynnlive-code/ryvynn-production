// types/snarkjs.d.ts
// Minimal type declarations for snarkjs.
// Only the groth16 surface used by the ZKP proving wrappers is typed here.

declare module 'snarkjs' {
  export namespace groth16 {
    interface Proof {
      pi_a: string[];
      pi_b: string[][];
      pi_c: string[];
      protocol: string;
      curve: string;
    }

    interface ProveResult {
      proof: Proof;
      publicSignals: string[];
    }

    function fullProve(
      input: Record<string, string | string[]>,
      wasmFile: string | Uint8Array,
      zkeyFileName: string | Uint8Array,
      logger?: unknown,
    ): Promise<ProveResult>;

    function verify(
      vkey: object,
      publicSignals: string[],
      proof: object,
      logger?: unknown,
    ): Promise<boolean>;
  }
}
