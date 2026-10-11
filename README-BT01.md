# Scalp City — BT-01 Backtester Agent

**Purpose:** Create a **separate on-demand backtester agent**, not another trading bot or another mode of the existing evolutionary training worker.

BT-01 is an **algorithmic software agent** (not an LLM). It receives structured tasks, independently runs historical simulations, applies cost scenarios, publishes an audit-friendly report, and keeps short local job history. **It has zero live-order capability.**

## Agent workflow

```text
RESEARCHER ──(strategy ID / dataset / hypothesis)──► BT-01 BACKTESTER
                                                │
                                        Dedicated Web Worker
                                                │
                    Signals → fills → CFD cost ledger → equity curve
                                                │
                         Base + optional double-cost stress tests
                                                │
                           Report + warnings + local task history
                                                ▼
                            VALIDATOR / RISK MANAGER / RANKER
                                                │
                                          Human sign-off
                                                │
                                     [Future execution agent]
```

**Separation from existing Scalp City:** The PWA's original `app.js`, `training-worker.js`, `scene3d.js`, training algorithms, and 3D assets do not need to be edited. BT-01 uses its own `backtester-agent-worker.js`, agent coordinator (`backtester-agent.js`), strategy simulation (`cfd-engine.js`) and UI overlay. It appears as **BT-01 · BACKTESTER** in the HUD, distinct from the original training controls.

## Installation

**Target:** https://github.com/tristanpeto123-eng/Scalp-City-1, branch `main`.

Upload these eight **individual files into the repository root** (same folder as existing `app.js`; do not nest them):

1. `index.html` — **replace** existing (only adds a CSS link and a module import)
2. `sw.js` — **replace** existing (increments cache ID and adds BT-01 files)
3. `backtester-agent.json` — new machine-readable agent manifest
4. `backtester-agent.js` — new coordinator, task API, status events, short report history
5. `backtester-agent-worker.js` — new isolated backtesting worker
6. `backtester-agent-ui.js` — new BT-01 console, historical CSV import and result export
7. `backtester-agent.css` — new separate agent interface styling
8. `cfd-engine.js` — new six-strategy cost-aware simulation engine

**Optional:** `README-BT01.md` for the repository documentation. This package intentionally does **not** replace `app.js`, `scene3d.js`, `training-worker.js` or `styles.css`. If you previously uploaded `cfd-ui.js`, `cfd-worker.js` or `cfd-ui.css`, BT-01 stops referencing them; the unused files can be left untouched.

The connected GitHub tool previously returned **403 Resource not accessible by integration** when attempting to write to this repository, so **these changes have not been committed or published**. Use GitHub's **Add file → Upload files** or grant the connected GitHub app repository Contents write permission. After commit, refresh/reinstall the PWA at https://tristanpeto123-eng.github.io/Scalp-City-1/.

## Agent input/output API

Agent identity: `BT-01` (`scalp-city.agent.v1`). The front-end already instantiates the agent, so other future agents can send tasks using DOM events; these events are **local to the PWA tab**. Example from a Researcher agent:

```js
window.dispatchEvent(new CustomEvent('scalp-city:agent-task', {
  detail: {
    target: 'BT-01',
    action: 'run',
    dataset: alignedDailyPanel,
    strategyIds: ['CFD-003'], // or ['ALL']
    config: {
      capital: 10000, grossExposure: 1,
      spreadBps: 6, commissionBps: 2, slippageBps: 2,
      longApr: 0.07, shortApr: 0.03, borrowApr: 0.01,
      marginRate: 0.20, maxMarginUtil: 0.60
    },
    stress: true
  }
}));
```

The Validator or Risk Manager subscribes to completed reports:

```js
window.addEventListener('scalp-city:agent-report', ({detail}) => {
  if (detail?.agentId !== 'BT-01' || detail?.type !== 'backtest') return;
  // detail.report: id, timestamp, dataset lineage, tested strategies,
  // simulation metrics, cost breakdown, equity curves, 2x cost stresses,
  // quality flags, and explicit research-only verdict.
  // Do not authorize live trading without separate external validation.
  console.log(detail.report.robustness);
});
```

Live progress is published as `scalp-city:agent-status` with `agentId`, `state`, `type`, `jobId`, optional `completed` and `total`. State transitions: `IDLE → QUEUED → RUNNING → COMPLETED`, with `FAILED/CANCELLED` branches. `BT-01` will reject a second job while one is running. It never accepts or publishes credentials. Small report summaries are saved to localStorage under `scalp-city:BT-01:report-history:v1`; full report JSON/curves can be exported from the interface and are not automatically sent to a server.

## Six supported backtest strategies

| ID | Strategy | Model |
|---|---|---|
| CFD-001 | Cross-sectional equity momentum | 6-month ranking / recent-month skip / sector tails |
| CFD-002 | Sector residual statistical arbitrage | Sector-demeaned return z-score proxy, *not* PCA |
| CFD-003 | Distance pairs | Same-sector pair formation, rolling beta and z-score |
| CFD-004 | MA trend | Daily fast/slow moving-average direction |
| CFD-005 | Short-term reversal | Sector-relative recent winner/loser reversal |
| CFD-006 | Donchian breakout | Prior-range and ATR breakout with channel exits |

`cfd-engine.js` uses next-session OPEN fills, daily raw OHLC, split-adjusted signal closes, notional spread/slippage/commission, funding/short borrow, optional dividend adjustments, approximate daily-close risk liquidation, gross exposure cap, and a chronological fixed-parameter last-30% segment. **No intraday broker execution, dividend withholding/FX, corporate split quantity normalization, comprehensive delisting, point-in-time constituents, historically verified broker availability/fees, or full walk-forward selection controls yet.**

## Historical data requirements

CSV import schema (one row **per symbol, per date**):

```csv
date,security_id,sector,open,high,low,close,volume,split_adjusted_close,cash_dividend,spread_bps,borrow_available
2024-01-02,AAA,TECH,100,102,99,101,2000000,101,0,6,1
2024-01-02,BBB,TECH,50,51,49,50,3500000,50,0,6,1
```

All rows in a dataset must be aligned across dates with no missing symbols, at least 75 daily sessions and 2 securities. At least 4 securities per sector are needed for meaningful sector-neutral comparisons. Data size capped at 25 MB / 150,000 rows, 250 securities. Real tests require accurate split history and historical constituents (including delisted names). Use `cash_dividend` as **CFD dividend adjustment per unit**, not a double-counted total-return dividend. Spreads use full bid–ask spread in basis points. The demo's 16 stocks and 460 days are **synthetic**.

## Validation run

From the working source folder (not required to deploy on GitHub):

```bash
node --experimental-default-type=module tests/test-agent.mjs
```

Tests exercise all six strategies, cost ledger reconciliation, daily CSV ingest, isolated worker task protocol, 2× cost stress, task cancellation and PWA file references. They do **not** prove any CFD strategy is profitable or validate broker fill accuracy. No live trading integration is present.
