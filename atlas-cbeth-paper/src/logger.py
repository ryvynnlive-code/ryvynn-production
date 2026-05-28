import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


class LoggerError(Exception):
    pass


class JSONLLogger:
    """
    Append-only JSONL logger. Each event is written as a single JSON line.

    Thread-safety: one logger instance per bot process. Each bot writes to
    its own file (named by bot_id + run_id). No cross-process file locking needed.

    Write atomicity: each os.write() call with a complete line + newline is
    atomic on Linux for writes < PIPE_BUF (4096 bytes). Our events are typically
    200–400 bytes, well within this limit.
    """

    def __init__(self, log_dir: Path, bot_id: str, run_id: str):
        self._bot_id = bot_id
        self._run_id = run_id
        fname = f"run_{bot_id}_{run_id}.jsonl"
        self._path = log_dir / fname
        self._fd: int | None = None

    def open(self) -> None:
        self._fd = os.open(
            str(self._path),
            os.O_WRONLY | os.O_CREAT | os.O_APPEND,
            mode=0o644,
        )

    def close(self) -> None:
        if self._fd is not None:
            os.close(self._fd)
            self._fd = None

    def _write(self, record: dict[str, Any]) -> None:
        if self._fd is None:
            raise LoggerError("Logger is not open. Call open() first.")
        line = json.dumps(record, separators=(",", ":")) + "\n"
        encoded = line.encode("utf-8")
        os.write(self._fd, encoded)

    def log(
        self,
        event_type: str,
        block_number: int,
        block_timestamp: int,
        block_age_sec: float,
        strategy_id: str,
        opportunity_hash: str,
        action: str,
        reason: str,
        loop_duration_ms: float,
        **extra: Any,
    ) -> None:
        now = time.time()
        record: dict[str, Any] = {
            "ts_unix": round(now, 3),
            "ts_iso": datetime.fromtimestamp(now, tz=timezone.utc).isoformat(),
            "bot_id": self._bot_id,
            "strategy_id": strategy_id,
            "run_id": self._run_id,
            "event_type": event_type,
            "block_number": block_number,
            "block_timestamp": block_timestamp,
            "block_age_sec": round(block_age_sec, 2),
            "opportunity_hash": opportunity_hash,
            "action": action,
            "reason": reason,
            "loop_duration_ms": round(loop_duration_ms, 1),
        }
        # Merge extra fields (prices, bps, etc.)
        record.update(extra)
        self._write(record)

    def smoke_test(self) -> None:
        """
        Write a test event, read it back, verify it parses.
        Call before the main loop to confirm the logger is functional.
        Raises LoggerError if anything fails.
        """
        test_record = {
            "ts_unix": time.time(),
            "event_type": "SMOKE_TEST",
            "bot_id": self._bot_id,
            "run_id": self._run_id,
        }
        line = json.dumps(test_record) + "\n"
        encoded = line.encode("utf-8")
        if self._fd is None:
            raise LoggerError("Logger is not open.")
        os.write(self._fd, encoded)

        # Read back the last line to verify write succeeded
        try:
            with open(self._path, "r", encoding="utf-8") as f:
                lines = f.readlines()
            if not lines:
                raise LoggerError("Log file is empty after smoke test write.")
            last = json.loads(lines[-1].strip())
            if last.get("event_type") != "SMOKE_TEST":
                raise LoggerError(
                    f"Smoke test read back unexpected event: {last.get('event_type')}"
                )
        except json.JSONDecodeError as exc:
            raise LoggerError(f"Smoke test: last line is not valid JSON: {exc}") from exc
