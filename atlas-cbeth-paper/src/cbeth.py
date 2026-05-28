from dataclasses import dataclass

from web3 import Web3
from web3.exceptions import ContractLogicError, Web3Exception

# Minimal ABI — only the functions we actually call
_CBETH_ABI = [
    {
        "name": "exchangeRate",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
    },
    {
        "name": "symbol",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "string"}],
        "stateMutability": "view",
    },
    {
        "name": "decimals",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint8"}],
        "stateMutability": "view",
    },
]

# Expected bounds for the normalized exchange rate (ETH per cbETH).
# cbETH was issued at 1.0 and accrues ~4% APY. Upper bound of 1.3 gives years of headroom.
_RATE_MIN: float = 1.0
_RATE_MAX: float = 1.3

# Denominator for 18-decimal fixed-point normalization
_DECIMALS_DIVISOR: int = 10 ** 18


class cbETHError(Exception):
    pass


@dataclass
class ExchangeRateResult:
    raw: int           # uint256 directly from contract — never modified
    normalized: float  # raw / 1e18, ETH per cbETH
    block_number: int  # block at which this was read


class cbETHReader:
    def __init__(self, w3: Web3, address: str):
        checksum = Web3.to_checksum_address(address)
        self._contract = w3.eth.contract(address=checksum, abi=_CBETH_ABI)
        self._validated = False

    def validate_contract(self) -> None:
        """
        Call at startup. Verifies symbol and decimals match expectations.
        Raises cbETHError on any mismatch.
        """
        try:
            symbol: str = self._contract.functions.symbol().call()
        except (ContractLogicError, Web3Exception) as exc:
            raise cbETHError(f"symbol() call failed — check CBETH_ADDRESS: {exc}") from exc

        if symbol != "cbETH":
            raise cbETHError(
                f"Contract symbol '{symbol}' != 'cbETH' — wrong address?"
            )

        try:
            decimals: int = self._contract.functions.decimals().call()
        except (ContractLogicError, Web3Exception) as exc:
            raise cbETHError(f"decimals() call failed: {exc}") from exc

        if decimals != 18:
            raise cbETHError(
                f"Unexpected decimals={decimals}; expected 18. "
                "Decimal normalization would be wrong."
            )

        self._validated = True

    def get_exchange_rate(self, block_number: int) -> ExchangeRateResult:
        """
        Read exchangeRate() and return normalized float.

        Math (triple-checked):
          raw: uint256 with 18 implicit decimal places
          e.g. 1_070_000_000_000_000_000 represents 1.07 ETH/cbETH

          normalized = raw / (10 ** 18)
          This gives the exact ETH-per-cbETH ratio as a float.

          At float64 precision (53-bit mantissa ≈ 15-17 significant digits),
          values in [1.0, 1.3] are represented with error < 1e-15, far below
          the 0.01 bps (= 1e-6) precision we need for edge calculations.
        """
        if not self._validated:
            raise cbETHError(
                "validate_contract() must be called before get_exchange_rate()"
            )

        try:
            raw: int = self._contract.functions.exchangeRate().call()
        except (ContractLogicError, Web3Exception) as exc:
            raise cbETHError(f"exchangeRate() call failed: {exc}") from exc

        if raw == 0:
            raise cbETHError(
                "exchangeRate() returned 0 — contract may be paused or address is wrong"
            )

        # Integer division would lose all decimal precision; use float division
        normalized: float = raw / _DECIMALS_DIVISOR

        if not (_RATE_MIN <= normalized <= _RATE_MAX):
            raise cbETHError(
                f"exchangeRate() out of expected range "
                f"[{_RATE_MIN}, {_RATE_MAX}]: got {normalized:.8f} "
                f"(raw={raw}). Possible: wrong contract, fork, or decimal error."
            )

        return ExchangeRateResult(
            raw=raw,
            normalized=normalized,
            block_number=block_number,
        )
