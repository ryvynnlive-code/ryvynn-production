from dataclasses import dataclass

from web3 import Web3
from web3.exceptions import ContractLogicError, Web3Exception

# ── Uniswap V3 QuoterV2 ABI (quoteExactInputSingle only) ─────────────────────
#
# Note: stateMutability is "nonpayable" in the contract but we call it via
# eth_call (no gas, no state change). web3.py handles this correctly.
#
# gasEstimate returned by QuoterV2 is in GAS UNITS, not wei.
# To get gas cost in ETH: gas_units * gas_price_wei / 1e18
_QUOTER_V2_ABI = [
    {
        "name": "quoteExactInputSingle",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [
            {
                "name": "params",
                "type": "tuple",
                "components": [
                    {"name": "tokenIn",           "type": "address"},
                    {"name": "tokenOut",          "type": "address"},
                    {"name": "amountIn",          "type": "uint256"},
                    {"name": "fee",               "type": "uint24"},
                    {"name": "sqrtPriceLimitX96", "type": "uint160"},
                ],
            }
        ],
        "outputs": [
            {"name": "amountOut",                "type": "uint256"},
            {"name": "sqrtPriceX96After",        "type": "uint160"},
            {"name": "initializedTicksCrossed",  "type": "uint32"},
            {"name": "gasEstimate",              "type": "uint256"},
        ],
    }
]

# ── Uniswap V3 Pool ABI (liquidity, fee, token0, token1 only) ────────────────
_POOL_ABI = [
    {
        "name": "liquidity",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint128"}],
        "stateMutability": "view",
    },
    {
        "name": "fee",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint24"}],
        "stateMutability": "view",
    },
    {
        "name": "token0",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
    },
    {
        "name": "token1",
        "type": "function",
        "inputs": [],
        "outputs": [{"name": "", "type": "address"}],
        "stateMutability": "view",
    },
]

# 1 cbETH in wei — used for the spot-price quote (1-unit quote)
_ONE_CBETH_WEI: int = 10 ** 18


class DEXError(Exception):
    pass


@dataclass
class QuoteResult:
    ok: bool
    reason: str
    # Populated regardless of ok (for logging):
    pool_liquidity: int
    # Populated when ok=True:
    spot_price: float        # ETH per cbETH, from 1-cbETH quote (pool fee embedded)
    exec_price: float        # ETH per cbETH, from trade-size quote (pool fee embedded)
    price_impact_bps: float  # (spot_price - exec_price) / spot_price * 10_000
    gas_estimate_units: int  # gas units from QuoterV2 (NOT wei — multiply by gas_price to get cost)


class DEXQuoter:
    def __init__(
        self,
        w3: Web3,
        quoter_address: str,
        pool_address: str,
        cbeth_address: str,
        weth_address: str,
        fee_tier: int,
        min_pool_liquidity: int,
        max_price_impact_bps: float,
    ):
        self._w3 = w3
        self._quoter = w3.eth.contract(
            address=Web3.to_checksum_address(quoter_address),
            abi=_QUOTER_V2_ABI,
        )
        self._pool = w3.eth.contract(
            address=Web3.to_checksum_address(pool_address),
            abi=_POOL_ABI,
        )
        self._cbeth = Web3.to_checksum_address(cbeth_address)
        self._weth = Web3.to_checksum_address(weth_address)
        self._fee_tier = fee_tier
        self._min_pool_liquidity = min_pool_liquidity
        self._max_price_impact_bps = max_price_impact_bps

    def validate_pool(self) -> None:
        """
        Call at startup. Verifies the pool has the expected fee tier and tokens.
        Raises DEXError on mismatch.
        """
        try:
            pool_fee: int = self._pool.functions.fee().call()
        except (ContractLogicError, Web3Exception) as exc:
            raise DEXError(f"pool.fee() failed — check POOL_ADDRESS: {exc}") from exc

        if pool_fee != self._fee_tier:
            raise DEXError(
                f"Pool fee mismatch: config says {self._fee_tier}, "
                f"pool.fee() returned {pool_fee}. "
                "Check POOL_ADDRESS and POOL_FEE_TIER."
            )

        try:
            token0: str = self._pool.functions.token0().call()
            token1: str = self._pool.functions.token1().call()
        except (ContractLogicError, Web3Exception) as exc:
            raise DEXError(f"pool.token0/token1() failed: {exc}") from exc

        pool_tokens = {token0.lower(), token1.lower()}
        expected = {self._cbeth.lower(), self._weth.lower()}
        if pool_tokens != expected:
            raise DEXError(
                f"Pool token mismatch. Expected {expected}, got {pool_tokens}. "
                "Check POOL_ADDRESS, CBETH_ADDRESS, WETH_ADDRESS."
            )

    def _quote_single(self, amount_in_wei: int) -> tuple[int, int]:
        """
        Call quoteExactInputSingle via eth_call (read-only, no gas spent).

        Returns:
          (amount_out_wei, gas_estimate_units)

        amount_out_wei: WETH received in wei for amount_in_wei cbETH
          - pool fee is already deducted from this amount
          - price impact is already reflected for the given trade size

        gas_estimate_units: estimated gas UNITS for the real swap (not wei, not ETH)
          - convert to ETH cost: gas_estimate_units * gas_price_wei / 1e18
        """
        params = {
            "tokenIn": self._cbeth,
            "tokenOut": self._weth,
            "amountIn": amount_in_wei,
            "fee": self._fee_tier,
            "sqrtPriceLimitX96": 0,  # no price limit
        }
        try:
            result = self._quoter.functions.quoteExactInputSingle(params).call()
        except (ContractLogicError, Web3Exception) as exc:
            raise DEXError(f"quoteExactInputSingle failed: {exc}") from exc

        amount_out: int = int(result[0])
        gas_estimate_units: int = int(result[3])
        return amount_out, gas_estimate_units

    def get_quote(self, trade_size_wei: int) -> QuoteResult:
        """
        Get spot price and execution price for selling `trade_size_wei` cbETH.

        Math (triple-checked):

        Spot price (1-cbETH quote):
          spot_weth_out_wei = quoteExactInputSingle(1e18 wei cbETH)
          spot_price = spot_weth_out_wei / 1e18
          Units: (wei WETH) / (wei cbETH) = ETH per cbETH (dimensionless ratio)
          Pool fee is embedded: if fee=500 (0.05%), spot_price ≈ mid_price × 0.9995

        Execution price (trade_size_wei quote):
          exec_weth_out_wei = quoteExactInputSingle(trade_size_wei cbETH)
          exec_price = exec_weth_out_wei / trade_size_wei
          Units: (wei WETH) / (wei cbETH) = ETH per cbETH
          Both pool fee AND price impact are embedded for the actual trade size.

        Price impact:
          price_impact_bps = (spot_price - exec_price) / spot_price × 10_000
          Always ≥ 0: execution price is always ≤ spot price due to depth.
          Negative price impact would indicate a floating-point artifact; clamped to 0.
        """
        _empty = QuoteResult(
            ok=False, reason="", pool_liquidity=0,
            spot_price=0.0, exec_price=0.0,
            price_impact_bps=0.0, gas_estimate_units=0,
        )

        # ── Liquidity check ───────────────────────────────────────────────────
        try:
            liquidity: int = int(self._pool.functions.liquidity().call())
        except (ContractLogicError, Web3Exception) as exc:
            return QuoteResult(
                ok=False, reason=f"LIQUIDITY_READ_FAILED: {exc}",
                pool_liquidity=0, spot_price=0.0, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        if liquidity < self._min_pool_liquidity:
            return QuoteResult(
                ok=False,
                reason=f"LIQUIDITY_BELOW_MIN: {liquidity} < {self._min_pool_liquidity}",
                pool_liquidity=liquidity, spot_price=0.0, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        # ── Spot price: quote for 1 cbETH ─────────────────────────────────────
        try:
            spot_weth_out, _ = self._quote_single(_ONE_CBETH_WEI)
        except DEXError as exc:
            return QuoteResult(
                ok=False, reason=f"SPOT_QUOTE_FAILED: {exc}",
                pool_liquidity=liquidity, spot_price=0.0, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        if spot_weth_out == 0:
            return QuoteResult(
                ok=False, reason="SPOT_QUOTE_RETURNED_ZERO",
                pool_liquidity=liquidity, spot_price=0.0, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        # spot_price: (wei WETH) / (wei cbETH) — exact integer ratio converted to float
        # 1e18 wei cbETH → spot_weth_out wei WETH → ratio = spot_weth_out / 1e18
        spot_price: float = spot_weth_out / _ONE_CBETH_WEI

        # ── Execution price: quote for full trade size ────────────────────────
        try:
            exec_weth_out, gas_estimate_units = self._quote_single(trade_size_wei)
        except DEXError as exc:
            return QuoteResult(
                ok=False, reason=f"EXEC_QUOTE_FAILED: {exc}",
                pool_liquidity=liquidity, spot_price=spot_price, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        if exec_weth_out == 0:
            return QuoteResult(
                ok=False, reason="EXEC_QUOTE_RETURNED_ZERO",
                pool_liquidity=liquidity, spot_price=spot_price, exec_price=0.0,
                price_impact_bps=0.0, gas_estimate_units=0,
            )

        # exec_price: (wei WETH out) / (wei cbETH in) — same units as spot_price
        exec_price: float = exec_weth_out / trade_size_wei

        # ── Price impact ──────────────────────────────────────────────────────
        # Clamp to 0 to suppress floating-point noise when spot ≈ exec
        if spot_price > 0:
            price_impact_bps = max(0.0, (spot_price - exec_price) / spot_price * 10_000)
        else:
            price_impact_bps = 0.0

        if price_impact_bps > self._max_price_impact_bps:
            return QuoteResult(
                ok=False,
                reason=(
                    f"PRICE_IMPACT_EXCEEDS_MAX: {price_impact_bps:.2f} bps "
                    f"> {self._max_price_impact_bps} bps"
                ),
                pool_liquidity=liquidity,
                spot_price=spot_price,
                exec_price=exec_price,
                price_impact_bps=price_impact_bps,
                gas_estimate_units=gas_estimate_units,
            )

        return QuoteResult(
            ok=True,
            reason="OK",
            pool_liquidity=liquidity,
            spot_price=spot_price,
            exec_price=exec_price,
            price_impact_bps=price_impact_bps,
            gas_estimate_units=gas_estimate_units,
        )
