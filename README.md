# Scalp City V1

Serverless iPhone-first PWA prototype.

## What works

- Installable PWA
- Neon "trading control room" UI
- QQQ / SPY / IWM chart panels
- Training starts when you press **ENTER**
- Training runs locally in Web Workers while the page is active
- Evolutionary mutation of a VWAP + EMA strategy family
- Synthetic market data built in so V1 works immediately
- CSV import for real OHLCV data
- Local IndexedDB checkpoints
- **SAVE + EXIT** stops workers and saves a session
- Optional GitHub persistence using the GitHub Contents API
- Session files accumulate under `knowledge/sessions/`
- Per-symbol champion files are updated in `knowledge/champions/`

## Deploy to GitHub Pages

1. Create a repository, e.g. `ScalpCity`.
2. Upload the contents of this package to the repository root.
3. GitHub → **Settings → Pages**.
4. Set **Deploy from a branch**, `main`, `/ (root)`.
5. Open the Pages URL on your iPhone.
6. Safari → Share → **Add to Home Screen**.

## GitHub memory setup

In the app, open **GITHUB** and enter:

- Owner
- Repository
- Branch (`main`)
- Knowledge folder (`knowledge`)
- A **fine-grained GitHub personal access token** restricted to this repository with **Contents: Read and write**

The token is held in memory for the current page/session only. Repository metadata is remembered locally.

When you press **SAVE + EXIT**, V1 writes:

- `knowledge/sessions/<session-id>.json`
- `knowledge-champions-QQQ.json` / `SPY.json` / `IWM.json` when applicable
- `knowledge-manifest.json`

If GitHub is not configured, V1 downloads the session JSON instead.

## CSV format

Header:

```csv
time,open,high,low,close,volume
2026-10-01T14:30:00Z,560.12,560.40,559.90,560.31,1200345
```

Minimum 100 rows.

## Important V1 constraints

- Training pauses/stops when iOS suspends the PWA or Safari tab.
- No broker connection.
- No real-money execution.
- Synthetic data is only for testing the app architecture, not measuring real profitability.
- Browser backtesting is deliberately lightweight. More realistic slippage, fees, spread, order-fill simulation, walk-forward partitions and larger datasets should be added before interpreting strategy performance.
