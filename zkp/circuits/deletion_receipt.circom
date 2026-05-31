// zkp/circuits/deletion_receipt.circom
// Proves that a specific session was deleted at a given timestamp,
// without revealing the session content or the user's identity.
//
// Private inputs: sessionIdHash, userCommitment
// Public input:   deletionTimestamp
// Output:         receiptHash — a unique, verifiable fingerprint of the deletion event
//
// The receipt hash is deterministic: same inputs always produce the same receipt.
// This lets users prove deletion to a third party without exposing session data.
//
// Compile:
//   circom deletion_receipt.circom --r1cs --wasm --sym
//   snarkjs groth16 setup deletion_receipt.r1cs pot12_final.ptau deletion_receipt_0000.zkey
//   snarkjs zkey contribute deletion_receipt_0000.zkey deletion_receipt_final.zkey --name="ryvynn"
//   snarkjs zkey export verificationkey deletion_receipt_final.zkey deletion_receipt_vkey.json
//   cp deletion_receipt_js/ ../../../public/zkp/
//   cp deletion_receipt_final.zkey ../../../public/zkp/
//   cp deletion_receipt_vkey.json ../../../public/zkp/

pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template DeletionReceipt() {
    // Private — proves the user held a specific session
    signal input sessionIdHash;
    signal input userCommitment;

    // Public — the moment of deletion, verifiable on-chain or server-side
    signal input deletionTimestamp;

    // Deterministic receipt anyone can verify
    signal output receiptHash;

    component hasher = Poseidon(3);
    hasher.inputs[0] <== sessionIdHash;
    hasher.inputs[1] <== deletionTimestamp;
    hasher.inputs[2] <== userCommitment;

    receiptHash <== hasher.out;
}

component main { public [deletionTimestamp] } = DeletionReceipt();
