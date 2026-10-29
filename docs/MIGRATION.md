# Migration notes

Source projects: `Trading/` (Edgeline app, the one with all the functionality) and `SavanAi/` (the APIs). Layout follows `08-file-structure.md`.

## Edgeline app, old path -> new path (all under `mobile/src/`)

| Old | New |
|---|---|
| `store.js` | `app/store.js` (+ `app/AppProviders.js`, `app/config.js`) |
| `components/ui.js` | `components/ui/index.js` (imports of `components/ui` still work) |
| `components/{Dropdown,FilterBar,ActionMenu}.js` | `components/ui/` |
| `components/CandleChart.js` | `components/charts/CandleChart.js` |
| `components/ExportSheet.js` | `components/sheet/ExportSheet.js` |
| `components/domain.js` | `components/domain.js` |
| `components/{AlertItem,CreateAlertSheet}.js` | `features/alerts/components/` |
| `components/Composer.js` | `features/chat/components/` |
| `components/{GeoMap*,MapPreview,mapStyle}.js`, `data/regions.js` | `features/events/` |
| `data/mock.js` | `mocks/mock.js` |
| `data/risk.js` | `features/trading/risk.js` |
| `data/correlation.js` | `features/markets/data/correlation.js` |
| `screens/Splash` | `features/splash/` |
| `screens/Onboarding` | `features/onboarding/screens/` |
| `screens/Overview` | `features/home/screens/` |
| `screens/{Markets,AssetDetail,Correlation}` | `features/markets/screens/` |
| `screens/News` | `features/news/screens/` |
| `screens/Calendar` | `features/calendar/screens/` |
| `screens/{Alerts,Notifications}` | `features/alerts/screens/` |
| `screens/EventsMap` | `features/events/screens/` |
| `screens/Mentor` | `features/chat/screens/` |
| `screens/{Strategy,TradeCheck}` | `features/strategy/screens/` |
| `screens/{Journal,AddTrade,TradeDetail,Analytics}` | `features/journal/screens/` |
| `screens/AccountScreens` | `features/more/screens/` |
| `navigation/*`, `theme/tokens.js`, `utils/exporter.js` | unchanged |

Every relative import was rewritten by script. The app bundles for web and Android with Metro.

## Edgeline's old `src/_backend`

It was an empty scaffold (every file a one-line stub), so it is replaced by `backend/`. Its `docker-compose.yml` is now `infra/docker/docker-compose.yml`, its CI file is `.github/workflows/backend-ci.yml`, and its planned module list is kept as `docs/backend-plan-original.md`.

## Savanai provider code, old -> new (all under `backend/`)

| Old (`SavanAi/src/services/api/`) | New |
|---|---|
| `config.js` symbol lists | `db/seeds/assets.js` (+ generated `assets.sql`) |
| `config.js` polling and reconnect tuning | `libs/config`, `libs/http` |
| `twelveDataService.js`, Twelve Data axios client | `services/market-ingestor/src/adapters/twelvedata.js` |
| `finnhubService.js`, Finnhub axios client | `.../adapters/finnhub.js` |
| `binanceService.js` | `.../adapters/binance.js` |
| `candleRanges.js` | `services/candles/src/ranges.js` |
| `newsService.js` | `services/news/src/{ingestGdelt,dedupe,impactScore,markets,shape}.js` |
| `utils/marketMood.js` | `services/mood-events/src/moodScore.js` |
| `anthropicService.js`, `freeAiService.js` | `services/ai-gateway/src/providers/` |
| `MARKET_AI_SYSTEM_PROMPT` | `services/ai-gateway/src/prompts/marketAi.js` |
| `.env` (keys in the app bundle) | `backend/.env.example` (server only) |

## Behaviour changes

- **Symbols.** Savanai used `EURUSD` / `BTCUSDT`; Edgeline uses `EUR/USD` / `BTC/USD`. The catalogue maps between them, and the app only ever sees the Edgeline form.
- **Quota.** Twelve Data is polled only for symbols a client is watching (the old app polled all 29 pairs every 15 seconds).
- **Crypto fallback.** If the Binance stream goes quiet and Twelve Data is configured, crypto falls back to polling it, then switches back.
- **News.** One GDELT call per 2 minutes, shared by `/v1/news` and `/v1/mood`; the last good batch is served if GDELT fails.
- **AI.** Anthropic is preferred when its key is set, Free.ai otherwise. The model is `ANTHROPIC_MODEL` (the old hard-coded `claude-3-5-sonnet-20241022` is gone). Adds a message size cap and a daily quota per client.
- **Removed as dead duplicates:** `components/store.js` (a copy of the CandleIcon already inside `Frame.js`) and `data/mapStyle.js` (an older copy of `components/mapStyle.js`).

## Not done

- Screens still read most of their data from `mocks/mock.js`. Wired to the backend: News, asset-detail candles and price, Markets prices, AI mentor. The mood endpoint and the asset catalogue endpoint exist but no screen reads them yet.
- Large files were moved, not split (`ui/index.js`, `AssetDetailScreen`, `AccountScreens`), as step 2 of the doc's migration order says; splitting is step 3.
- The doc's other services (auth, users, alerts, notifications, journal, brokers, billing, admin) have no Savanai API behind them, so they are not created. `docs/admin.md` and `docs/backend-plan-original.md` cover them.
- Not wired: economic calendar and global events (no provider existed in either project).
- Dockerfile is written but I could not run Docker here.
