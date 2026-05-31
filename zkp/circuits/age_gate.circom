// zkp/circuits/age_gate.circom
// Proves a person is at or above minAge without revealing their birth year.
// Private input: birthYear
// Public inputs: currentYear, minAge
// Output: isAdult (1 = passes gate, 0 = blocked)
//
// Compile:
//   circom age_gate.circom --r1cs --wasm --sym
//   snarkjs groth16 setup age_gate.r1cs pot12_final.ptau age_gate_0000.zkey
//   snarkjs zkey contribute age_gate_0000.zkey age_gate_final.zkey --name="ryvynn"
//   snarkjs zkey export verificationkey age_gate_final.zkey age_gate_vkey.json
//   cp age_gate_js/ ../../../public/zkp/
//   cp age_gate_final.zkey ../../../public/zkp/
//   cp age_gate_vkey.json ../../../public/zkp/

pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/comparators.circom";

template AgeGate() {
    // Private — never leaves the browser
    signal input birthYear;

    // Public — caller supplies, verifier checks
    signal input currentYear;
    signal input minAge;

    // 1 when age >= minAge, 0 otherwise
    signal output isAdult;

    // Age derived in-circuit from public and private inputs
    signal age;
    age <== currentYear - birthYear;

    // GreaterEqThan(n): n bits covers values 0 to 2^n - 1.
    // 7 bits handles 0–127 years, sufficient for age comparison.
    component gte = GreaterEqThan(7);
    gte.in[0] <== age;
    gte.in[1] <== minAge;

    isAdult <== gte.out;
}

component main { public [currentYear, minAge] } = AgeGate();
