"""
atlas-cbeth-paper — cbETH fair-value paper trading on Base

DRY_RUN=true  ALLOW_LIVE=false  No keys  No signing  No broadcasting

Run:
  pip install -r requirements.txt
  cp .env.example .env        # fill in RPC URL and contract addresses
  python main.py

Halt:
  touch KILL_SWITCH            # graceful halt on next loop iteration
  Ctrl-C                       # immediate halt
"""

import signal
import sys
import time

from src.cbeth import cbETHReader, cbETHError
from src.config import load_config
from src.dedup import DedupStore, make_opportunity_hash
from src.dex import DEXQuoter, DEXError
from src.edge import calculate_edge, TradeDirection
from src.logger import JSONLLogger
from src.paper import PaperBook, PaperTrade
from src.preflight import run_preflight
from src.rpc import BaseRPCClient, RPCError

# ── Constants ────────────────────────────────────────────────────────────────

PAIR = "cbETH/WETH"

# Halt the dry run if gross_edge_bps exceeds this on any loop iteration.
# A value this high almost certainly indicates a calculation error,
# not a real market opportunity.
SANITY_EDGE_CEILING_BPS = 200.0

# Halt after this many consecutive RPC failures before giving up
MAX_CONSECUTIVE_RPC_FAILURES = 5

# ── Graceful shutdown ────────────────────────────────────────────────────────

_shutdown_requested = False


def _handle_sigint(sig, frame):  # noqa: ANN001
    global _shutdown_requested
    _shutdown_requested = True
    print("\n[MAIN] SIGINT received — shutting down after current loop.", flush=True)


signal.signal(signal.SIGINT, _handle_sigint)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _kill_switch_active(kill_switch_path) -> bool:
    return kill_switch_path.exists()


def _gas_bps_from_trade(gas_units: int, gas_price_wei: int, trade_size_eth: float) -> float:
    """Standalone gas bps for use in paper close (not from EdgeResult)."""
    if trade_size_eth <= 0:
        return 0.0
    gas_cost_eth = gas_units * gas_price_wei / 1e18
    return gas_cost_eth / trade_size_eth * 10_000


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    cfg = load_config()

    print(
        f"[MAIN] atlas-cbeth-paper starting\n"
        f"       BOT_ID={cfg.bot_id}  STRATEGY_ID={cfg.strategy_id}  RUN_ID={cfg.run_id}\n"
        f"       DRY_RUN={cfg.dry_run}  ALLOW_LIVE={cfg.allow_live}\n"
        f"       TRADE_SIZE={cfg.trade_size_eth} ETH  MIN_EDGE={cfg.min_edge_bps} bps",
        flush=True,
    )

    # ── Construct components ──────────────────────────────────────────────────
    rpc = BaseRPCClient(
        rpc_url=cfg.base_rpc_url,
        block_freshness_sec=cfg.block_freshness_sec,
    )
    cbeth_reader = cbETHReader(w3=rpc.w3, address=cfg.cbeth_address)
    dex_quoter = DEXQuoter(
        w3=rpc.w3,
        quoter_address=cfg.quoter_address,
        pool_address=cfg.pool_address,
        cbeth_address=cfg.cbeth_address,
        weth_address=cfg.weth_address,
        fee_tier=cfg.pool_fee_tier,
        min_pool_liquidity=cfg.min_pool_liquidity,
        max_price_impact_bps=cfg.max_price_impact_bps,
    )
    logger = JSONLLogger(
        log_dir=cfg.log_dir,
        bot_id=cfg.bot_id,
        run_id=cfg.run_id,
    )
    dedup = DedupStore(db_path=cfg.dedup_db_path, run_id=cfg.run_id)
    paper = PaperBook()

    # ── Preflight ─────────────────────────────────────────────────────────────
    run_preflight(
        cfg=cfg,
        rpc=rpc,
        cbeth_reader=cbeth_reader,
        dex_quoter=dex_quoter,
        logger=logger,
        dedup=dedup,
    )

    print("[MAIN] Preflight complete. Entering main loop. Touch KILL_SWITCH to halt.",
          flush=True)

    # ── State ─────────────────────────────────────────────────────────────────
    consecutive_rpc_failures = 0
    loop_count = 0
    last_block_number = -1

    # ── Main loop ─────────────────────────────────────────────────────────────
    try:
        while True:
            loop_start = time.time()
            loop_count += 1

            # ── Kill switch check ─────────────────────────────────────────────
            if _shutdown_requested or _kill_switch_active(cfg.kill_switch_path):
                reason = "SIGINT" if _shutdown_requested else "KILL_SWITCH_FILE_DETECTED"
                print(f"[MAIN] Halt: {reason}", flush=True)
                logger.log(
                    event_type="HALTED",
                    block_number=last_block_number,
                    block_timestamp=0,
                    block_age_sec=0.0,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="HALT",
                    reason=reason,
                    loop_duration_ms=0.0,
                )
                break

            # ── Read latest block ─────────────────────────────────────────────
            try:
                block = rpc.get_latest_block()
                rpc.check_block_freshness(block)
                consecutive_rpc_failures = 0
            except RPCError as exc:
                consecutive_rpc_failures += 1
                print(
                    f"[MAIN] RPC failure #{consecutive_rpc_failures}: {exc}",
                    flush=True,
                )
                logger.log(
                    event_type="RPC_FAILURE",
                    block_number=last_block_number,
                    block_timestamp=0,
                    block_age_sec=0.0,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="SKIP",
                    reason=str(exc),
                    loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                )
                if consecutive_rpc_failures >= MAX_CONSECUTIVE_RPC_FAILURES:
                    print(
                        f"[MAIN] HALT: {MAX_CONSECUTIVE_RPC_FAILURES} consecutive "
                        "RPC failures",
                        flush=True,
                    )
                    sys.exit(1)
                time.sleep(cfg.poll_interval_sec)
                continue

            # Skip if same block as last iteration (no new data)
            if block.number == last_block_number:
                time.sleep(cfg.poll_interval_sec)
                continue
            last_block_number = block.number

            # ── Auto-close stale paper trades ──────────────────────────────────
            for open_trade in list(paper.get_open_trades()):
                if block.number - open_trade.entry_block >= cfg.max_hold_blocks:
                    # Re-quote for the exit price (must use a real executable quote)
                    try:
                        exit_quote = dex_quoter.get_quote(trade_size_wei=cfg.trade_size_wei)
                        exit_gas_price = rpc.get_gas_price_wei()
                    except (DEXError, RPCError) as exc:
                        # Cannot close without a fresh quote — log and skip this iteration
                        logger.log(
                            event_type="PAPER_CLOSE_FAILED",
                            block_number=block.number,
                            block_timestamp=block.timestamp,
                            block_age_sec=block.age_sec,
                            strategy_id=cfg.strategy_id,
                            opportunity_hash=open_trade.opportunity_hash,
                            action="SKIP",
                            reason=f"EXIT_QUOTE_FAILED: {exc}",
                            loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                        )
                        continue

                    if not exit_quote.ok:
                        logger.log(
                            event_type="PAPER_CLOSE_FAILED",
                            block_number=block.number,
                            block_timestamp=block.timestamp,
                            block_age_sec=block.age_sec,
                            strategy_id=cfg.strategy_id,
                            opportunity_hash=open_trade.opportunity_hash,
                            action="SKIP",
                            reason=f"EXIT_QUOTE_REJECTED: {exit_quote.reason}",
                            loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                        )
                        continue

                    try:
                        exit_rate = cbeth_reader.get_exchange_rate(block.number)
                    except cbETHError as exc:
                        logger.log(
                            event_type="PAPER_CLOSE_FAILED",
                            block_number=block.number,
                            block_timestamp=block.timestamp,
                            block_age_sec=block.age_sec,
                            strategy_id=cfg.strategy_id,
                            opportunity_hash=open_trade.opportunity_hash,
                            action="SKIP",
                            reason=f"EXIT_RATE_FAILED: {exc}",
                            loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                        )
                        continue

                    exit_gas_bps = _gas_bps_from_trade(
                        exit_quote.gas_estimate_units,
                        exit_gas_price,
                        cfg.trade_size_eth,
                    )

                    closed = paper.close_trade(
                        opportunity_hash=open_trade.opportunity_hash,
                        exit_block=block.number,
                        exit_fair_price=exit_rate.normalized,
                        exit_exec_price=exit_quote.exec_price,
                        exit_gas_bps=exit_gas_bps,
                    )

                    if closed is not None:
                        logger.log(
                            event_type="PAPER_CLOSE",
                            block_number=block.number,
                            block_timestamp=block.timestamp,
                            block_age_sec=block.age_sec,
                            strategy_id=cfg.strategy_id,
                            opportunity_hash=closed.opportunity_hash,
                            action="CLOSE",
                            reason="MAX_HOLD_BLOCKS_REACHED",
                            loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                            entry_block=closed.entry_block,
                            exit_block=closed.exit_block,
                            hold_blocks=closed.hold_blocks,
                            direction=closed.direction,
                            entry_exec_price=round(closed.entry_exec_price, 10),
                            exit_exec_price=round(exit_quote.exec_price, 10),
                            entry_fair_price=round(closed.entry_fair_price, 10),
                            exit_fair_price=round(exit_rate.normalized, 10),
                            entry_net_edge_bps=round(closed.entry_net_edge_bps, 4),
                            exit_gas_bps=round(exit_gas_bps, 4),
                            realized_pnl_bps=round(closed.realized_pnl_bps, 4)
                            if closed.realized_pnl_bps is not None else None,
                            trade_size_eth=cfg.trade_size_eth,
                        )

            # ── Read fair value ───────────────────────────────────────────────
            try:
                rate = cbeth_reader.get_exchange_rate(block.number)
            except cbETHError as exc:
                logger.log(
                    event_type="FAIR_VALUE_UNAVAILABLE",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="SKIP",
                    reason=str(exc),
                    loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                )
                time.sleep(cfg.poll_interval_sec)
                continue

            # ── Get DEX quote ─────────────────────────────────────────────────
            quote = dex_quoter.get_quote(trade_size_wei=cfg.trade_size_wei)

            if not quote.ok:
                logger.log(
                    event_type="QUOTE_REJECTED",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="REJECTED",
                    reason=quote.reason,
                    loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                    fair_price=round(rate.normalized, 10),
                    pool_liquidity=quote.pool_liquidity,
                    dex_spot_price=round(quote.spot_price, 10),
                    dex_exec_price=round(quote.exec_price, 10),
                    price_impact_bps=round(quote.price_impact_bps, 4),
                )
                time.sleep(cfg.poll_interval_sec)
                continue

            # ── Get live gas price ────────────────────────────────────────────
            try:
                gas_price_wei = rpc.get_gas_price_wei()
            except RPCError as exc:
                logger.log(
                    event_type="GAS_PRICE_UNAVAILABLE",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="SKIP",
                    reason=str(exc),
                    loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                )
                time.sleep(cfg.poll_interval_sec)
                continue

            # ── Calculate edge ────────────────────────────────────────────────
            edge = calculate_edge(
                fair_price=rate.normalized,
                dex_spot_price=quote.spot_price,
                dex_exec_price=quote.exec_price,
                price_impact_bps=quote.price_impact_bps,
                gas_units=quote.gas_estimate_units,
                gas_price_wei=gas_price_wei,
                trade_size_eth=cfg.trade_size_eth,
                slippage_bps=cfg.slippage_bps,
                safety_buffer_bps=cfg.safety_buffer_bps,
                min_edge_bps=cfg.min_edge_bps,
            )

            # ── Sanity check: halt if edge looks impossibly large ─────────────
            if abs(edge.gross_edge_bps) > SANITY_EDGE_CEILING_BPS:
                print(
                    f"[MAIN] HALT: gross_edge_bps={edge.gross_edge_bps:.2f} "
                    f"exceeds sanity ceiling {SANITY_EDGE_CEILING_BPS} bps. "
                    "Likely a calculation error — investigate before continuing.",
                    flush=True,
                )
                logger.log(
                    event_type="HALTED",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="HALT",
                    reason=f"GROSS_EDGE_EXCEEDS_SANITY_CEILING: {edge.gross_edge_bps:.2f} bps",
                    loop_duration_ms=round((time.time() - loop_start) * 1000, 1),
                    gross_edge_bps=round(edge.gross_edge_bps, 4),
                    fair_price=round(rate.normalized, 10),
                    dex_spot_price=round(quote.spot_price, 10),
                )
                sys.exit(1)

            loop_ms = round((time.time() - loop_start) * 1000, 1)

            # ── Log this iteration (always — even rejections) ─────────────────
            common_fields = dict(
                fair_price=round(rate.normalized, 10),
                fair_price_raw=rate.raw,
                dex_spot_price=round(quote.spot_price, 10),
                dex_exec_price=round(quote.exec_price, 10),
                gross_edge_bps=round(edge.gross_edge_bps, 4),
                exec_edge_bps=round(edge.exec_edge_bps, 4),
                net_edge_bps=round(edge.net_edge_bps, 4),
                price_impact_bps=round(quote.price_impact_bps, 4),
                gas_units=quote.gas_estimate_units,
                gas_price_gwei=round(edge.gas_price_gwei, 6),
                gas_cost_eth=round(edge.gas_cost_eth, 10),
                gas_bps=round(edge.gas_bps, 6),
                slippage_bps=cfg.slippage_bps,
                safety_buffer_bps=cfg.safety_buffer_bps,
                pool_liquidity=quote.pool_liquidity,
                pool_fee_bps=cfg.pool_fee_bps,
                direction=edge.direction.value,
                trade_size_eth=cfg.trade_size_eth,
                open_positions=paper.count_open(),
            )

            if not edge.valid:
                logger.log(
                    event_type="OPPORTUNITY_REJECTED",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash="",
                    action="REJECTED",
                    reason=edge.reason,
                    loop_duration_ms=loop_ms,
                    **common_fields,
                )
                time.sleep(cfg.poll_interval_sec)
                continue

            # ── Valid SELL_CBETH opportunity ──────────────────────────────────

            # Compute opportunity hash
            size_bucket = int(cfg.trade_size_eth * 10)
            opp_hash = make_opportunity_hash(
                pair=PAIR,
                direction=edge.direction.value,
                block_number=block.number,
                size_bucket=size_bucket,
            )

            # Dedup check
            claimed = dedup.claim(opp_hash=opp_hash, bot_id=cfg.bot_id)
            if not claimed:
                logger.log(
                    event_type="OPPORTUNITY_DUPLICATE",
                    block_number=block.number,
                    block_timestamp=block.timestamp,
                    block_age_sec=block.age_sec,
                    strategy_id=cfg.strategy_id,
                    opportunity_hash=opp_hash,
                    action="SKIP",
                    reason="OPPORTUNITY_LOCKED_BY_ANOTHER_BOT",
                    loop_duration_ms=loop_ms,
                    **common_fields,
                )
                time.sleep(cfg.poll_interval_sec)
                continue

            # ── Open paper trade ──────────────────────────────────────────────
            trade = PaperTrade(
                opportunity_hash=opp_hash,
                bot_id=cfg.bot_id,
                run_id=cfg.run_id,
                strategy_id=cfg.strategy_id,
                direction=edge.direction.value,
                entry_block=block.number,
                entry_ts=time.time(),
                entry_fair_price=rate.normalized,
                entry_exec_price=quote.exec_price,
                entry_net_edge_bps=edge.net_edge_bps,
                entry_gross_edge_bps=edge.gross_edge_bps,
                trade_size_eth=cfg.trade_size_eth,
                entry_gas_bps=edge.gas_bps,
                entry_slippage_bps=cfg.slippage_bps,
                entry_safety_buffer_bps=cfg.safety_buffer_bps,
            )
            paper.open_trade(trade)

            logger.log(
                event_type="PAPER_OPEN",
                block_number=block.number,
                block_timestamp=block.timestamp,
                block_age_sec=block.age_sec,
                strategy_id=cfg.strategy_id,
                opportunity_hash=opp_hash,
                action="PAPER_OPEN",
                reason="OK",
                loop_duration_ms=loop_ms,
                **common_fields,
            )

            time.sleep(cfg.poll_interval_sec)

    except KeyboardInterrupt:
        print("[MAIN] KeyboardInterrupt — shutting down.", flush=True)
    finally:
        # ── Teardown ──────────────────────────────────────────────────────────
        # Log final summary
        all_trades = paper.all_trades()
        closed_trades = [t for t in all_trades if not t.is_open]
        pnls = [
            t.realized_pnl_bps
            for t in closed_trades
            if t.realized_pnl_bps is not None
        ]
        avg_pnl = sum(pnls) / len(pnls) if pnls else None

        print(
            f"\n[MAIN] Run complete.\n"
            f"       Loops: {loop_count}\n"
            f"       Paper trades opened:  {paper.count_open() + paper.count_closed()}\n"
            f"       Paper trades closed:  {paper.count_closed()}\n"
            f"       Paper trades open:    {paper.count_open()}\n"
            f"       Avg realized PnL:     "
            + (f"{avg_pnl:.4f} bps" if avg_pnl is not None else "N/A (no closed trades)"),
            flush=True,
        )

        logger.log(
            event_type="RUN_COMPLETE",
            block_number=last_block_number,
            block_timestamp=0,
            block_age_sec=0.0,
            strategy_id=cfg.strategy_id,
            opportunity_hash="",
            action="SHUTDOWN",
            reason="NORMAL",
            loop_duration_ms=0.0,
            total_loops=loop_count,
            trades_opened=paper.count_open() + paper.count_closed(),
            trades_closed=paper.count_closed(),
            trades_open=paper.count_open(),
            avg_realized_pnl_bps=round(avg_pnl, 4) if avg_pnl is not None else None,
        )

        logger.close()
        dedup.close()
        print(f"[MAIN] Log: {logger._path}", flush=True)


if __name__ == "__main__":
    main()
