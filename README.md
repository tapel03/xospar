# xospar

Trading intelligence, journal and AI mentor. The Edgeline app (`mobile/`) with the Savanai market-data, news and AI APIs moved behind its own backend (`backend/`).

```
mobile/      Expo / React Native app, feature-based (src/features/*)
backend/     Node 22 API + price WebSocket (gateway, services/*, libs/*, db/*)
packages/    shared-types (asset, websocket and AI contracts)
infra/       Docker
docs/        08-file-structure.md is the layout this repo follows; MIGRATION.md says what moved where
```

## Run it

```bash
# 1. backend
npm install                       # at the repo root, installs backend + packages
cp backend/.env.example backend/.env
#   fill in TWELVE_DATA_API_KEY, FINNHUB_API_KEY, and ANTHROPIC_API_KEY or FREE_AI_API_KEY
npm run backend                   # http://localhost:4000  (ws at /ws, health at /health)
npm run backend:test              # 23 tests

# 2. app
cd mobile
npm install
npx expo start                    # or: npx expo start --web
```

Every key is optional. A provider with no key is switched off, and the app falls back to its sample data for whatever the backend cannot serve. Binance crypto prices and GDELT news need no key.

## What the app gets from the backend

| Endpoint | Replaces (old Savanai file) | Used by |
|---|---|---|
| `GET /v1/candles?sym=EUR/USD&range=1H` | `twelveDataService.fetchTimeSeries`, `finnhubService` candles, `candleRanges.js` | Asset detail chart |
| `ws /ws` (subscribe/tick/snapshot) | `binanceService`, `finnhubService` trade socket, `twelveDataService` polling, `useForexPrices/useCryptoTicker/useStockTicker` | Markets list, asset detail price |
| `GET /v1/quotes` | `fetchQuotes` in both services | one-off snapshots |
| `GET /v1/news` | `newsService.js` | News screen |
| `GET /v1/mood` | `utils/marketMood.js` | not wired into a screen yet |
| `POST /v1/ai/chat` | `anthropicService.js`, `freeAiService.js` | AI mentor |
| `GET /v1/assets` | symbol lists in `config.js` | catalogue, not wired into a screen yet |

See `docs/api/openapi.yaml` and `docs/runbooks/provider-outage.md`.
