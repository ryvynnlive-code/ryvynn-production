import time
from dataclasses import dataclass, field
from typing import Optional

from .edge import TradeDirection


@dataclass
class PaperTrade:
    # Identity
    opportunity_hash: str
    bot_id: str
    run_id: str
    strategy_id: str
    direction: str              # TradeDirection.value
    # Entry state
    entry_block: int
    entry_ts: float             # wall clock at open
    entry_fair_price: float     # ETH per cbETH from exchangeRate()
    entry_exec_price: float     # ETH per cbETH from quoteExactInputSingle at trade_size
    entry_net_edge_bps: float
    entry_gross_edge_bps: float
    trade_size_eth: float
    # Costs at entry
    entry_gas_bps: float
    entry_slippage_bps: float
    entry_safety_buffer_bps: float
    # Status
    is_open: bool = True
    # Exit state (None until closed)
    exit_block: Optional[int] = None
    exit_ts: Optional[float] = None
    exit_fair_price: Optional[float] = None
    exit_exec_price: Optional[float] = None
    exit_gas_bps: Optional[float] = None
    hold_blocks: Optional[int] = None
    realized_pnl_bps: Optional[float] = None


class PaperBook:
    """
    In-memory paper trade ledger.

    SELL_CBETH lifecycle:
      OPEN:  Recorded at entry_exec_price (execution quote, not mid-price).
             Represents selling cbETH at this price, receiving WETH.

      CLOSE: Recorded at exit_exec_price (fresh execution quote at close time).
             Represents buying cbETH back at this price with WETH.

      PnL:   gross_pnl = (entry_exec_price - exit_exec_price) / entry_exec_price × 10_000
             A positive gross_pnl means cbETH price fell → we sold high, bought back lower.
             This is the desirable outcome for SELL_CBETH when the premium reverts.

             realized_pnl_bps = gross_pnl - entry_gas_bps - entry_slippage_bps
                                 - entry_safety_buffer_bps - exit_gas_bps

    Math triple-check:
      entry_exec_price = 1.070 ETH/cbETH  (sold cbETH at this price)
      exit_exec_price  = 1.065 ETH/cbETH  (bought cbETH back at this price)
      gross_pnl = (1.070 - 1.065) / 1.070 × 10_000 = 0.005 / 1.070 × 10_000 = 46.7 bps
      If entry_gas_bps=0.01, entry_slippage_bps=30, entry_safety_buffer_bps=20, exit_gas_bps=0.01:
        realized_pnl_bps = 46.7 - 0.01 - 30 - 20 - 0.01 = -3.32 bps  (net loss after costs)

      This illustrates that a ~47 bps gross PnL is consumed by slippage + safety buffer.
      The dry run's job is to find opportunities where the gross edge is large enough
      that realized_pnl_bps is consistently positive after all costs.
    """

    def __init__(self) -> None:
        self._trades: dict[str, PaperTrade] = {}

    def open_trade(self, trade: PaperTrade) -> None:
        self._trades[trade.opportunity_hash] = trade

    def close_trade(
        self,
        opportunity_hash: str,
        exit_block: int,
        exit_fair_price: float,
        exit_exec_price: float,
        exit_gas_bps: float,
    ) -> Optional[PaperTrade]:
        """
        Close a paper trade and compute realized PnL.
        Returns the closed trade, or None if hash not found or already closed.
        """
        trade = self._trades.get(opportunity_hash)
        if trade is None or not trade.is_open:
            return None

        trade.exit_block = exit_block
        trade.exit_ts = time.time()
        trade.exit_fair_price = exit_fair_price
        trade.exit_exec_price = exit_exec_price
        trade.exit_gas_bps = exit_gas_bps
        trade.hold_blocks = exit_block - trade.entry_block
        trade.is_open = False

        if trade.direction == TradeDirection.SELL_CBETH.value:
            # Gross PnL: sold at entry, bought back at exit
            # Positive when cbETH premium reverted (entry_price > exit_price)
            gross_pnl = (
                (trade.entry_exec_price - exit_exec_price)
                / trade.entry_exec_price
                * 10_000
            )
            total_costs = (
                trade.entry_gas_bps
                + trade.entry_slippage_bps
                + trade.entry_safety_buffer_bps
                + exit_gas_bps
            )
            trade.realized_pnl_bps = gross_pnl - total_costs

        return trade

    def get_open_trades(self) -> list[PaperTrade]:
        return [t for t in self._trades.values() if t.is_open]

    def all_trades(self) -> list[PaperTrade]:
        return list(self._trades.values())

    def count_open(self) -> int:
        return sum(1 for t in self._trades.values() if t.is_open)

    def count_closed(self) -> int:
        return sum(1 for t in self._trades.values() if not t.is_open)
