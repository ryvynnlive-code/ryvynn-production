import time
from dataclasses import dataclass

from web3 import Web3
from web3.exceptions import Web3Exception

BASE_CHAIN_ID = 8453


class RPCError(Exception):
    pass


@dataclass
class BlockInfo:
    number: int
    timestamp: int       # Unix seconds, from block header
    age_sec: float       # wall_clock_now - block.timestamp
    block_hash: str


class BaseRPCClient:
    def __init__(self, rpc_url: str, block_freshness_sec: int):
        self._w3 = Web3(Web3.HTTPProvider(rpc_url))
        self._freshness_sec = block_freshness_sec

    # ── Startup validation ────────────────────────────────────────────────────

    def validate_chain_id(self) -> None:
        try:
            chain_id = self._w3.eth.chain_id
        except Web3Exception as exc:
            raise RPCError(f"Cannot read chain ID from RPC: {exc}") from exc

        if chain_id != BASE_CHAIN_ID:
            raise RPCError(
                f"Wrong chain: expected {BASE_CHAIN_ID} (Base mainnet, hex 0x2105), "
                f"got {chain_id} (hex {hex(chain_id)}). Check BASE_RPC_URL."
            )

    # ── Per-loop reads ────────────────────────────────────────────────────────

    def get_latest_block(self) -> BlockInfo:
        try:
            block = self._w3.eth.get_block("latest")
        except Web3Exception as exc:
            raise RPCError(f"get_block('latest') failed: {exc}") from exc

        wall_now = time.time()
        age_sec = wall_now - block["timestamp"]

        return BlockInfo(
            number=int(block["number"]),
            timestamp=int(block["timestamp"]),
            age_sec=age_sec,
            block_hash=block["hash"].hex(),
        )

    def check_block_freshness(self, block: BlockInfo) -> None:
        if block.age_sec > self._freshness_sec:
            raise RPCError(
                f"Stale block #{block.number}: age {block.age_sec:.1f}s "
                f"exceeds limit {self._freshness_sec}s — RPC may be lagging"
            )

    def get_gas_price_wei(self) -> int:
        try:
            return int(self._w3.eth.gas_price)
        except Web3Exception as exc:
            raise RPCError(f"eth_gasPrice failed: {exc}") from exc

    @property
    def w3(self) -> Web3:
        return self._w3
