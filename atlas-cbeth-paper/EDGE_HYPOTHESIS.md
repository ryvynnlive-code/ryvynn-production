# Edge Hypothesis — cbETH Fair-Value Divergence on Base

**Written:** before dry run begins  
**Status:** HYPOTHESIS — not validated

---

## Signal Definition

```
fair_price     = cbETH.exchangeRate() / 1e18        # ETH per cbETH, from Coinbase contract
dex_spot_price = quoteExactInputSingle(1e18 cbETH → WETH) / 1e18   # 1-cbETH spot quote
dex_exec_price = quoteExactInputSingle(TRADE_SIZE cbETH → WETH) / TRADE_SIZE  # execution price

gross_edge_bps = (dex_spot_price - fair_price) / fair_price * 10_000
exec_edge_bps  = (dex_exec_price - fair_price) / fair_price * 10_000
net_edge_bps   = exec_edge_bps - gas_bps - slippage_bps - safety_buffer_bps
```

Pool fee is **not deducted separately** — it is already embedded in `dex_exec_price`
because `quoteExactInputSingle` returns post-fee `amountOut`.

---

## Trade Direction

| Sign of exec_edge_bps | Meaning | Required position | Modeled in dry run? |
|---|---|---|---|
| Positive | cbETH at premium on DEX | Hold cbETH, sell on DEX | **YES** |
| Negative | cbETH at discount on DEX | Buy on DEX, redeem at Coinbase | Logged only — not paper-traded (redemption delay not modeled) |

---

## Cost Model

| Component | Source | Notes |
|---|---|---|
| gas_bps | gas_units (from QuoterV2) × gas_price (from eth.gas_price) / trade_size_eth × 10000 | Live-fetched each loop |
| slippage_bps | Config: SLIPPAGE_BPS=30 | Conservative allowance for execution uncertainty |
| safety_buffer_bps | Config: SAFETY_BUFFER_BPS=20 | Additional conservatism |
| protocol_fee | Embedded in exec_price | Uniswap V3 fee tier deducted by quoter |

---

## 72-Hour Dry Run Success Criteria

All of the following must be true to proceed to live engineering:

1. **Opportunity frequency:** ≥ 20 distinct `opportunity_hash` values over 72 hours
2. **Net edge:** Median net_edge_bps ≥ 10 bps after all cost deductions
3. **Persistence:** Edge persists ≥ 2 consecutive blocks on ≥ 50% of opportunities
4. **Price impact:** ≤ 15 bps on ≥ 80% of opportunities at TRADE_SIZE_ETH
5. **Signal sanity:** Edge distribution is not uniform; not all clustered at round numbers
6. **No systematic errors:** Zero instances of gross_edge_bps > 200 bps (would indicate a calculation error)

## 72-Hour Dry Run Failure Criteria (stop here, do not proceed to live)

Any one of the following halts the live engineering plan:

1. Fewer than 5 genuine opportunities in 72 hours
2. Median net_edge_bps < 5 bps after costs
3. All opportunities appear within 2 blocks of exchangeRate() update and vanish — MEV captures this
4. Price impact at TRADE_SIZE_ETH consistently > 30 bps — pool too thin
5. Gross_edge_bps > 200 bps on any opportunity — math error, not real signal

---

## Known Limitations

- This is **not** a riskless arbitrage. SELL_CBETH requires pre-existing cbETH inventory.
- BUY_CBETH (discount capture) requires Coinbase redemption tolerance (multi-day settlement).
- MEV bots compete for the same signal at sub-block latency. Live execution may not fill.
- cbETH exchangeRate() updates ~daily. The dry run may see few events if poorly timed.
- This dry run does NOT model redemption delay, Coinbase rate limits, or minting restrictions.
