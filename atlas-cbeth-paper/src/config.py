import os
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _require(key: str) -> str:
    val = os.environ.get(key, "").strip()
    if not val:
        print(f"[FATAL] Missing required env var: {key}", flush=True)
        sys.exit(1)
    return val


@dataclass(frozen=True)
class Config:
    # Safety
    dry_run: bool
    allow_live: bool
    # Identity
    bot_id: str
    strategy_id: str
    run_id: str
    # RPC
    base_rpc_url: str
    # Contracts
    cbeth_address: str
    weth_address: str
    quoter_address: str
    pool_address: str
    # Pool
    pool_fee_tier: int       # raw: 500 = 0.05%, 100 = 0.01%, 3000 = 0.3%
    pool_fee_bps: float      # derived: pool_fee_tier / 100
    # Edge thresholds
    min_edge_bps: float
    trade_size_eth: float
    trade_size_wei: int      # derived: int(trade_size_eth * 1e18), exact integer
    slippage_bps: float
    safety_buffer_bps: float
    # Guards
    min_pool_liquidity: int
    max_price_impact_bps: float
    block_freshness_sec: int
    max_hold_blocks: int
    # Paths
    log_dir: Path
    dedup_db_path: Path
    kill_switch_path: Path
    # Timing
    poll_interval_sec: float


def load_config() -> Config:
    # ── Safety assertions — hard exit if wrong ─────────────────────────────────
    dry_run_raw = _require("DRY_RUN").lower()
    allow_live_raw = _require("ALLOW_LIVE").lower()

    if dry_run_raw != "true":
        print(
            "[FATAL] DRY_RUN must be exactly 'true'. "
            "Live execution is not permitted in this module.",
            flush=True,
        )
        sys.exit(1)

    if allow_live_raw != "false":
        print(
            "[FATAL] ALLOW_LIVE must be exactly 'false'. "
            "Live execution is not permitted in this module.",
            flush=True,
        )
        sys.exit(1)

    # ── Pool fee ───────────────────────────────────────────────────────────────
    pool_fee_tier = int(_require("POOL_FEE_TIER"))
    if pool_fee_tier not in (100, 500, 3000, 10000):
        print(
            f"[FATAL] POOL_FEE_TIER={pool_fee_tier} is not a valid Uniswap V3 fee tier. "
            "Expected one of: 100, 500, 3000, 10000.",
            flush=True,
        )
        sys.exit(1)
    # fee tier → bps: 500 → 5.0, 100 → 1.0, 3000 → 30.0, 10000 → 100.0
    pool_fee_bps = pool_fee_tier / 100.0

    # ── Trade size ─────────────────────────────────────────────────────────────
    trade_size_eth = float(_require("TRADE_SIZE_ETH"))
    if trade_size_eth <= 0:
        print("[FATAL] TRADE_SIZE_ETH must be > 0", flush=True)
        sys.exit(1)
    # Convert to integer wei: use round() to avoid floating-point truncation error
    # e.g., 1.0 ETH = 1_000_000_000_000_000_000 wei (exactly)
    trade_size_wei = round(trade_size_eth * 1e18)

    # ── Paths ──────────────────────────────────────────────────────────────────
    log_dir = Path(os.environ.get("LOG_DIR", "./logs"))
    log_dir.mkdir(parents=True, exist_ok=True)

    dedup_db_path = Path(os.environ.get("DEDUP_DB_PATH", str(log_dir / "dedup.sqlite")))

    return Config(
        dry_run=True,
        allow_live=False,
        bot_id=_require("BOT_ID"),
        strategy_id=_require("STRATEGY_ID"),
        run_id=str(uuid.uuid4()),
        base_rpc_url=_require("BASE_RPC_URL"),
        cbeth_address=_require("CBETH_ADDRESS"),
        weth_address=_require("WETH_ADDRESS"),
        quoter_address=_require("QUOTER_ADDRESS"),
        pool_address=_require("POOL_ADDRESS"),
        pool_fee_tier=pool_fee_tier,
        pool_fee_bps=pool_fee_bps,
        min_edge_bps=float(os.environ.get("MIN_EDGE_BPS", "10")),
        trade_size_eth=trade_size_eth,
        trade_size_wei=trade_size_wei,
        slippage_bps=float(os.environ.get("SLIPPAGE_BPS", "30")),
        safety_buffer_bps=float(os.environ.get("SAFETY_BUFFER_BPS", "20")),
        min_pool_liquidity=int(os.environ.get("MIN_POOL_LIQUIDITY", "1000000000000000000")),
        max_price_impact_bps=float(os.environ.get("MAX_PRICE_IMPACT_BPS", "50")),
        block_freshness_sec=int(os.environ.get("BLOCK_FRESHNESS_SEC", "15")),
        max_hold_blocks=int(os.environ.get("MAX_HOLD_BLOCKS", "10")),
        log_dir=log_dir,
        dedup_db_path=dedup_db_path,
        kill_switch_path=Path(os.environ.get("KILL_SWITCH_PATH", "./KILL_SWITCH")),
        poll_interval_sec=float(os.environ.get("POLL_INTERVAL_SEC", "2")),
    )
