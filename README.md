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
npm run backend:test              # 30 tests

# 2. app
cd mobile
npm install
npx expo start                    # or: npx expo start --web
```

Every key is optional. A provider with no key is switched off, and the app falls back to its sample data for whatever the backend cannot serve. Binance crypto prices, GDELT news and the Forex Factory calendar need no key. Keys named the old way (`EXPO_PUBLIC_TWELVE_DATA_API_KEY` etc.) are accepted too.

User data (accounts, journal, alerts, strategies, chats, settings) is stored in `backend/data/edgeline.db` (SQLite, built into Node 22, nothing to install). On first launch the app gets an anonymous device account automatically, so there is no sign-in wall; `POST /v1/auth/register` turns it into an email account without losing anything. New accounts start with the sample journal while `SEED_SAMPLE_DATA=true`; Settings, Privacy & security has a button to remove it.

If the backend cannot be reached the app runs entirely on its bundled sample data, as before, and says so in Settings.

## What the app gets from the backend

| Endpoint | Replaces (old Savanai file) | Used by |
|---|---|---|
| `GET /v1/candles?sym=EUR/USD&range=1H` | `twelveDataService.fetchTimeSeries`, `finnhubService` candles, `candleRanges.js` | Asset detail chart |
| `ws /ws` (subscribe/tick/snapshot) | `binanceService`, `finnhubService` trade socket, `twelveDataService` polling, `useForexPrices/useCryptoTicker/useStockTicker` | Markets list, asset detail price |
| `GET /v1/quotes` | `fetchQuotes` in both services | one-off snapshots |
| `GET /v1/news` | `newsService.js` | News screen |
| `GET /v1/mood` | `utils/marketMood.js` | Overview, "Today's focus" |
| `POST /v1/ai/chat` | `anthropicService.js`, `freeAiService.js` | AI mentor |
| `GET /v1/assets` | symbol lists in `config.js` | catalogue, not wired into a screen yet |
| `GET /v1/calendar` | (new) Forex Factory weekly feed | Calendar, Overview, asset detail |
| `POST /v1/auth/device` · `register` · `login` · `logout` | (new) | app start-up (`app/store.js`) |
| `GET /v1/me`, `PATCH /v1/me/profile`, `PATCH /v1/me/settings`, `PUT /v1/me/watchlist`, `DELETE /v1/me` | (new) | onboarding, profile, settings, Markets list, delete account |
| `GET/POST/PUT/PATCH/DELETE /v1/{trades,alerts,strategies,chats,accounts,notifications,alertHistory}` | (new) | journal, alerts, strategies, mentor history, broker accounts, notifications |
| `GET /v1/positions`, `POST /v1/positions/close`, `GET /v1/account` | (new) | open P&L at live prices, balance, day/week/month |
| `GET /v1/analytics?days=30` | (new) | Analytics, computed from the journal |

Price alerts are evaluated on the server against the live price stream (`services/alerts`), so they fire even when the app is closed; a fired alert becomes a notification and an alert-history row. Broker passwords never leave the device.

See `docs/api/openapi.yaml` and `docs/runbooks/provider-outage.md`.
