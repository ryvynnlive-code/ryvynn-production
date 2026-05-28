import hashlib
import json
import sqlite3
import time
from pathlib import Path


class DedupStore:
    """
    SQLite-backed opportunity deduplication store.

    Uses a PRIMARY KEY constraint on `hash` for atomicity: exactly one bot
    process will succeed on INSERT; all others get IntegrityError.

    WAL mode allows concurrent readers + one writer without blocking.

    Each bot uses the same database file but its own run_id, so opportunities
    are scoped per-run in the record but globally deduped by hash.
    """

    def __init__(self, db_path: Path, run_id: str):
        self._db_path = db_path
        self._run_id = run_id
        self._conn: sqlite3.Connection | None = None

    def connect(self) -> None:
        self._conn = sqlite3.connect(
            str(self._db_path),
            check_same_thread=False,
            timeout=5.0,
        )
        # WAL mode: concurrent readers don't block the writer
        self._conn.execute("PRAGMA journal_mode=WAL")
        # NORMAL sync: safe on crash (WAL provides durability), faster than FULL
        self._conn.execute("PRAGMA synchronous=NORMAL")
        self._conn.execute("""
            CREATE TABLE IF NOT EXISTS opportunities (
                hash     TEXT NOT NULL,
                bot_id   TEXT NOT NULL,
                run_id   TEXT NOT NULL,
                ts       REAL NOT NULL,
                PRIMARY KEY (hash)
            )
        """)
        self._conn.commit()

    def claim(self, opp_hash: str, bot_id: str) -> bool:
        """
        Attempt to claim an opportunity by hash.

        Returns True if this bot successfully claimed it (INSERT succeeded).
        Returns False if already claimed by any bot (PRIMARY KEY violation).

        This is atomic: SQLite guarantees that at most one concurrent INSERT
        with the same PRIMARY KEY will succeed, even with multiple processes
        using WAL mode on the same file.
        """
        assert self._conn is not None, "Must call connect() first"
        try:
            self._conn.execute(
                "INSERT INTO opportunities (hash, bot_id, run_id, ts) VALUES (?, ?, ?, ?)",
                (opp_hash, bot_id, self._run_id, time.time()),
            )
            self._conn.commit()
            return True
        except sqlite3.IntegrityError:
            # PRIMARY KEY violation = already claimed
            return False

    def close(self) -> None:
        if self._conn is not None:
            self._conn.close()
            self._conn = None


def make_opportunity_hash(
    pair: str,
    direction: str,
    block_number: int,
    size_bucket: int,
) -> str:
    """
    Deterministic, collision-resistant hash for an opportunity.

    Inputs must be deterministic from block state — do NOT include prices,
    bps values, or timestamps, since two bots may compute slightly different
    values for those due to timing or gas price differences.

    size_bucket = int(trade_size_eth * 10)
      e.g. 1.0 ETH → bucket 10, 0.5 ETH → bucket 5
      Buckets prevent hash collisions between runs with different trade sizes
      while keeping hashes comparable across bots with the same size.

    Returns first 16 hex chars of SHA-256 (64 bits).
    64-bit hash space = 1.8 × 10^19 — collision probability negligible for
    the volume a solo operator will see in 72 hours.
    """
    payload = json.dumps(
        {
            "pair": pair,
            "direction": direction,
            "block": block_number,
            "size_bucket": size_bucket,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
