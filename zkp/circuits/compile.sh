#!/bin/bash
# zkp/circuits/compile.sh
# Compiles Circom circuits to WASM + zkey artifacts for browser use.
# Run once locally, then commit the artifacts in public/zkp/.
#
# Prerequisites:
#   npm install -g circom snarkjs
#   Download a Powers of Tau file (BN128, pot12 is sufficient for these circuits):
#     wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -O pot12_final.ptau

set -euo pipefail

OUT="../../public/zkp"
POT="pot12_final.ptau"

mkdir -p "$OUT"

compile_circuit() {
  local name="$1"
  echo "Compiling $name..."

  circom "${name}.circom" --r1cs --wasm --sym --output .

  snarkjs groth16 setup "${name}.r1cs" "$POT" "${name}_0000.zkey"
  snarkjs zkey contribute "${name}_0000.zkey" "${name}_final.zkey" \
    --name="ryvynn-${name}" -e="$(openssl rand -hex 32)"
  snarkjs zkey export verificationkey "${name}_final.zkey" "${name}_vkey.json"

  # Copy artifacts to public/zkp for browser fetch
  cp -r "${name}_js" "$OUT/"
  cp "${name}_final.zkey"  "$OUT/"
  cp "${name}_vkey.json"   "$OUT/"

  # Clean intermediate files
  rm -f "${name}_0000.zkey"

  echo "$name done."
}

compile_circuit "age_gate"
compile_circuit "deletion_receipt"

echo "All circuits compiled. Artifacts in $OUT/"
