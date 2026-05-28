import sys
import time

from .cbeth import cbETHReader, cbETHError
from .config import Config
from .dedup import DedupStore
from .dex import DEXQuoter, DEXError
from .logger import JSONLLogger, LoggerError
from .rpc import BaseRPCClient, RPCError


def run_preflight(
    cfg: Config,
    rpc: BaseRPCClient,
    cbeth_reader: cbETHReader,
    dex_quoter: DEXQuoter,
    logger: JSONLLogger,
    dedup: DedupStore,
) -> None:
    """
    Run all preflight checks. Calls sys.exit(1) on any failure.
    Must complete before the main loop starts.

    Checks (in order — each failure aborts remaining checks):
     1. Safety flags (DRY_RUN / ALLOW_LIVE) — already enforced in config.py but re-verified
     2. Chain ID must be BASE_CHAIN_ID (8453)
     3. Block freshness
     4. cbETH contract: symbol + decimals
     5. cbETH exchangeRate() in valid range
     6. DEX pool: fee tier + token addresses
     7. DEX quoter: test quote for 1 cbETH returns nonzero
     8. Logger: smoke test (write + read back)
     9. DedupStore: connection and write test
    10. Kill switch path is writable (so we can create it to halt)
    """
    print("[PREFLIGHT] Starting preflight checks...", flush=True)
    _step = 0

    def ok(label: str) -> None:
        nonlocal _step
        _step += 1
        print(f"[PREFLIGHT] [{_step:02d}] OK  {label}", flush=True)

    def fail(label: str, detail: str) -> None:
        nonlocal _step
        _step += 1
        print(f"[PREFLIGHT] [{_step:02d}] FAIL {label}: {detail}", flush=True)
        sys.exit(1)

    # ── 1. Safety flags ───────────────────────────────────────────────────────
    # Already enforced in load_config(), but belt-and-suspenders check
    assert cfg.dry_run is True, "DRY_RUN must be True"
    assert cfg.allow_live is False, "ALLOW_LIVE must be False"
    ok("DRY_RUN=true, ALLOW_LIVE=false confirmed")

    # ── 2. Chain ID ───────────────────────────────────────────────────────────
    try:
        rpc.validate_chain_id()
        ok("Chain ID == 8453 (Base mainnet)")
    except RPCError as exc:
        fail("Chain ID validation", str(exc))

    # ── 3. Block freshness ────────────────────────────────────────────────────
    try:
        block = rpc.get_latest_block()
        rpc.check_block_freshness(block)
        ok(f"Block freshness: block #{block.number}, age {block.age_sec:.1f}s")
    except RPCError as exc:
        fail("Block freshness", str(exc))

    # ── 4. cbETH contract: symbol + decimals ──────────────────────────────────
    try:
        cbeth_reader.validate_contract()
        ok("cbETH contract: symbol='cbETH', decimals=18")
    except cbETHError as exc:
        fail("cbETH contract validation", str(exc))

    # ── 5. cbETH exchangeRate() ───────────────────────────────────────────────
    try:
        rate = cbeth_reader.get_exchange_rate(block_number=block.number)
        ok(
            f"cbETH exchangeRate: {rate.normalized:.8f} ETH/cbETH "
            f"(raw={rate.raw})"
        )
    except cbETHError as exc:
        fail("cbETH exchangeRate()", str(exc))

    # ── 6. DEX pool: fee tier + tokens ────────────────────────────────────────
    try:
        dex_quoter.validate_pool()
        ok(f"DEX pool: fee_tier={cfg.pool_fee_tier}, tokens match config")
    except DEXError as exc:
        fail("DEX pool validation", str(exc))

    # ── 7. DEX quoter: test quote ─────────────────────────────────────────────
    try:
        quote = dex_quoter.get_quote(trade_size_wei=cfg.trade_size_wei)
        if not quote.ok:
            fail("DEX test quote", f"quote rejected: {quote.reason}")
        ok(
            f"DEX test quote: spot={quote.spot_price:.8f}, "
            f"exec={quote.exec_price:.8f}, impact={quote.price_impact_bps:.2f} bps"
        )
    except Exception as exc:
        fail("DEX test quote", str(exc))

    # ── 8. Logger smoke test ──────────────────────────────────────────────────
    try:
        logger.open()
        logger.smoke_test()
        ok(f"Logger: smoke test passed, writing to {logger._path}")
    except LoggerError as exc:
        fail("Logger smoke test", str(exc))

    # ── 9. DedupStore connection test ─────────────────────────────────────────
    try:
        dedup.connect()
        # Write and immediately check a test hash; clean up after
        test_hash = "preflight_test_0000"
        claimed = dedup.claim(test_hash, cfg.bot_id)
        if not claimed:
            # Already exists from a previous preflight run — that is fine
            pass
        ok(f"DedupStore: connected at {cfg.dedup_db_path}")
    except Exception as exc:
        fail("DedupStore connection", str(exc))

    # ── 10. Kill switch path ─────────────────────────────────────────────────
    try:
        parent = cfg.kill_switch_path.parent
        parent.mkdir(parents=True, exist_ok=True)
        # Verify we can write to the parent directory
        test_file = parent / ".preflight_write_test"
        test_file.touch()
        test_file.unlink()
        ok(f"Kill switch path writable: {cfg.kill_switch_path}")
    except Exception as exc:
        fail("Kill switch path writable", str(exc))

    print(
        f"[PREFLIGHT] All {_step} checks passed. "
        f"BOT_ID={cfg.bot_id} RUN_ID={cfg.run_id}",
        flush=True,
    )
