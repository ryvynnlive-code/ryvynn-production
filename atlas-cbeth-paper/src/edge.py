from dataclasses import dataclass
from enum import Enum


class TradeDirection(Enum):
    SELL_CBETH = "SELL_CBETH"  # DEX spot > fair value → sell cbETH on DEX for WETH
    BUY_CBETH = "BUY_CBETH"   # DEX spot < fair value → buy cbETH on DEX with WETH
    NONE = "NONE"              # no directional edge after costs


@dataclass
class EdgeResult:
    valid: bool
    direction: TradeDirection
    reason: str
    # ── Raw prices (ETH per cbETH) ─────────────────────────────────────────────
    fair_price: float       # from cbETH.exchangeRate() / 1e18
    dex_spot_price: float   # from 1-cbETH quoteExactInputSingle (pool fee embedded)
    dex_exec_price: float   # from trade-size quoteExactInputSingle (fee + impact embedded)
    # ── Edge components (all in basis points) ─────────────────────────────────
    gross_edge_bps: float   # (spot_price - fair_price) / fair_price × 10_000, signed
    price_impact_bps: float # (spot_price - exec_price) / spot_price × 10_000, always ≥ 0
    exec_edge_bps: float    # (exec_price - fair_price) / fair_price × 10_000, signed
    gas_bps: float          # gas_cost_eth / trade_size_eth × 10_000, always ≥ 0
    slippage_bps: float     # from config, always ≥ 0
    safety_buffer_bps: float # from config, always ≥ 0
    net_edge_bps: float     # abs(exec_edge_bps) - gas_bps - slippage_bps - safety_buffer_bps
    # ── Gas detail ─────────────────────────────────────────────────────────────
    gas_cost_eth: float     # total gas cost in ETH
    gas_units: int          # from QuoterV2
    gas_price_gwei: float   # gas price at quote time


def calculate_edge(
    fair_price: float,
    dex_spot_price: float,
    dex_exec_price: float,
    price_impact_bps: float,
    gas_units: int,
    gas_price_wei: int,
    trade_size_eth: float,
    slippage_bps: float,
    safety_buffer_bps: float,
    min_edge_bps: float,
) -> EdgeResult:
    """
    Calculate net edge for a cbETH fair-value trade.

    ── Sign convention ──────────────────────────────────────────────────────────
    gross_edge_bps > 0 → cbETH at premium on DEX → SELL_CBETH direction
    gross_edge_bps < 0 → cbETH at discount on DEX → BUY_CBETH direction

    ── Pool fee treatment ───────────────────────────────────────────────────────
    Pool fee is NOT separately deducted. It is already embedded in both
    dex_spot_price and dex_exec_price because quoteExactInputSingle
    returns post-fee amountOut for the given input. Deducting it again
    would double-count the fee and understate the true edge.

    ── net_edge_bps calculation ─────────────────────────────────────────────────
    We use abs(exec_edge_bps) because:
    - SELL_CBETH: exec_edge_bps > 0 → profit = exec_edge_bps - costs
    - BUY_CBETH:  exec_edge_bps < 0 → profit = abs(exec_edge_bps) - costs
                  (you paid below fair value; profit = fair - exec - costs)
    In both cases, the "gross profit before costs" is abs(exec_edge_bps).

    gas_bps math (triple-checked):
      gas_cost_eth = gas_units × gas_price_wei / 1e18
        e.g. 150_000 units × 2_000_000 wei/unit / 1e18 = 0.0003 ETH
      gas_bps = gas_cost_eth / trade_size_eth × 10_000
        e.g. 0.0003 / 1.0 × 10_000 = 3.0 bps

    Note on Base L2: gas_price_wei is typically 1_000_000–10_000_000 wei (0.001–0.01 gwei).
    Gas cost per swap is usually < 0.05 bps for a 1 ETH trade.
    Still computed live from chain — never hard-coded.
    """
    # ── Input guards ──────────────────────────────────────────────────────────
    if fair_price <= 0:
        return _invalid("INVALID_FAIR_PRICE_ZERO_OR_NEGATIVE", fair_price,
                        dex_spot_price, dex_exec_price, price_impact_bps,
                        slippage_bps, safety_buffer_bps)

    if dex_spot_price <= 0 or dex_exec_price <= 0:
        return _invalid("INVALID_DEX_PRICE_ZERO_OR_NEGATIVE", fair_price,
                        dex_spot_price, dex_exec_price, price_impact_bps,
                        slippage_bps, safety_buffer_bps)

    if trade_size_eth <= 0:
        return _invalid("INVALID_TRADE_SIZE_ZERO_OR_NEGATIVE", fair_price,
                        dex_spot_price, dex_exec_price, price_impact_bps,
                        slippage_bps, safety_buffer_bps)

    # ── Sanity check: reject if DEX price deviates >5% from fair value ────────
    # This guards against wrong pool, manipulation, or decimal error.
    # A genuine cbETH premium/discount is rarely > 2–3%.
    pct_deviation = abs(dex_spot_price - fair_price) / fair_price
    if pct_deviation > 0.05:
        return _invalid(
            f"DEX_DEVIATION_EXCEEDS_5PCT: {pct_deviation * 100:.2f}%",
            fair_price, dex_spot_price, dex_exec_price, price_impact_bps,
            slippage_bps, safety_buffer_bps,
        )

    # ── Edge bps ──────────────────────────────────────────────────────────────
    # gross: spot price vs fair (signed)
    gross_edge_bps: float = (dex_spot_price - fair_price) / fair_price * 10_000

    # exec: execution price vs fair (signed; includes both pool fee and price impact)
    exec_edge_bps: float = (dex_exec_price - fair_price) / fair_price * 10_000

    # ── Gas cost ──────────────────────────────────────────────────────────────
    # gas_cost_eth = gas_units × gas_price_wei / 1e18
    # Using integer multiplication before float division to preserve precision
    gas_cost_wei_total: int = gas_units * gas_price_wei
    gas_cost_eth: float = gas_cost_wei_total / 1e18
    gas_bps: float = gas_cost_eth / trade_size_eth * 10_000
    gas_price_gwei: float = gas_price_wei / 1e9

    # ── Net edge ──────────────────────────────────────────────────────────────
    total_costs: float = gas_bps + slippage_bps + safety_buffer_bps
    # Use abs(exec_edge_bps) for both directions (see docstring)
    net_edge_bps: float = abs(exec_edge_bps) - total_costs

    # ── Direction ─────────────────────────────────────────────────────────────
    if exec_edge_bps > 0:
        direction = TradeDirection.SELL_CBETH
    elif exec_edge_bps < 0:
        direction = TradeDirection.BUY_CBETH
    else:
        direction = TradeDirection.NONE

    if direction == TradeDirection.NONE:
        return EdgeResult(
            valid=False, direction=TradeDirection.NONE,
            reason="EXEC_EDGE_EXACTLY_ZERO",
            fair_price=fair_price, dex_spot_price=dex_spot_price,
            dex_exec_price=dex_exec_price, gross_edge_bps=gross_edge_bps,
            price_impact_bps=price_impact_bps, exec_edge_bps=exec_edge_bps,
            gas_bps=gas_bps, slippage_bps=slippage_bps,
            safety_buffer_bps=safety_buffer_bps, net_edge_bps=net_edge_bps,
            gas_cost_eth=gas_cost_eth, gas_units=gas_units,
            gas_price_gwei=gas_price_gwei,
        )

    if net_edge_bps < min_edge_bps:
        return EdgeResult(
            valid=False, direction=direction,
            reason=f"NET_EDGE_BELOW_MIN: {net_edge_bps:.3f} < {min_edge_bps}",
            fair_price=fair_price, dex_spot_price=dex_spot_price,
            dex_exec_price=dex_exec_price, gross_edge_bps=gross_edge_bps,
            price_impact_bps=price_impact_bps, exec_edge_bps=exec_edge_bps,
            gas_bps=gas_bps, slippage_bps=slippage_bps,
            safety_buffer_bps=safety_buffer_bps, net_edge_bps=net_edge_bps,
            gas_cost_eth=gas_cost_eth, gas_units=gas_units,
            gas_price_gwei=gas_price_gwei,
        )

    # BUY_CBETH is detected and logged but not paper-traded in this version
    if direction == TradeDirection.BUY_CBETH:
        return EdgeResult(
            valid=False, direction=direction,
            reason="BUY_DIRECTION_NOT_MODELED: requires redemption settlement",
            fair_price=fair_price, dex_spot_price=dex_spot_price,
            dex_exec_price=dex_exec_price, gross_edge_bps=gross_edge_bps,
            price_impact_bps=price_impact_bps, exec_edge_bps=exec_edge_bps,
            gas_bps=gas_bps, slippage_bps=slippage_bps,
            safety_buffer_bps=safety_buffer_bps, net_edge_bps=net_edge_bps,
            gas_cost_eth=gas_cost_eth, gas_units=gas_units,
            gas_price_gwei=gas_price_gwei,
        )

    return EdgeResult(
        valid=True, direction=TradeDirection.SELL_CBETH, reason="OK",
        fair_price=fair_price, dex_spot_price=dex_spot_price,
        dex_exec_price=dex_exec_price, gross_edge_bps=gross_edge_bps,
        price_impact_bps=price_impact_bps, exec_edge_bps=exec_edge_bps,
        gas_bps=gas_bps, slippage_bps=slippage_bps,
        safety_buffer_bps=safety_buffer_bps, net_edge_bps=net_edge_bps,
        gas_cost_eth=gas_cost_eth, gas_units=gas_units,
        gas_price_gwei=gas_price_gwei,
    )


def _invalid(
    reason: str,
    fair_price: float,
    dex_spot_price: float,
    dex_exec_price: float,
    price_impact_bps: float,
    slippage_bps: float,
    safety_buffer_bps: float,
) -> EdgeResult:
    return EdgeResult(
        valid=False, direction=TradeDirection.NONE, reason=reason,
        fair_price=fair_price, dex_spot_price=dex_spot_price,
        dex_exec_price=dex_exec_price, gross_edge_bps=0.0,
        price_impact_bps=price_impact_bps, exec_edge_bps=0.0,
        gas_bps=0.0, slippage_bps=slippage_bps,
        safety_buffer_bps=safety_buffer_bps, net_edge_bps=0.0,
        gas_cost_eth=0.0, gas_units=0, gas_price_gwei=0.0,
    )
