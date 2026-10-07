# Scalp City V1 — 3D Research Floor

Static/serverless PWA rebuilt around a cinematic WebGL research-room scene rather than a flat dashboard.

## Run
Serve this directory over HTTPS (GitHub Pages is fine). `index.html` is the entry point.

## 3D layer
`scene3d.js` dynamically imports Three.js from jsDelivr. If that network import fails, `app.js` falls back to a lightweight 2D city background while all training/data/GitHub functions continue to work.

## Preserved functions
- QQQ / SPY / IWM synthetic data and CSV import
- Main candlestick chart with VWAP / EMA
- Web Worker training sessions
- IndexedDB checkpoints
- Optional GitHub knowledge sync on save + exit
- PWA manifest and service worker

## Primary UI change
The skyline, floor grid, lighting, physical monitor bank, desk, robot and neon floor rings are actual WebGL geometry. DOM charts and controls are positioned as surfaces/controls inside that scene and retain their existing IDs for application logic.
