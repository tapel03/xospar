_backend/
├── apps/
│   ├── api/                         # REST API, everything under /v1
│   │   └── src/
│   │       ├── server.js
│   │       ├── plugins/             # auth, rate-limit, error handler, request id
│   │       └── modules/
│   │           ├── auth/            # signup, login, OTP, social, refresh, sessions
│   │           ├── users/           # profile, preferences, onboarding, consents
│   │           ├── watchlist/
│   │           ├── markets/         # asset list, quotes, candles
│   │           ├── alerts/          # CRUD, history
│   │           ├── news/
│   │           ├── mood/
│   │           ├── events/          # economic calendar, global events map
│   │           ├── ai/              # chat, asset explain, strategy coach, quotas
│   │           ├── journal/         # trades, reviews (Edgeline)
│   │           ├── strategies/      # rules, documents, edge check (Edgeline)
│   │           ├── analytics/       # stats, breakdowns, exports (Edgeline)
│   │           ├── risk/            # risk settings, position math, recovery plan
│   │           ├── positions/       # open positions, close all/win/loss
│   │           ├── notifications/   # in-app inbox, settings, push token register
│   │           ├── brokers/         # phase 3, MetaApi
│   │           ├── billing/         # phase 3, RevenueCat webhook
│   │           └── admin/           # flags, moderation
│   ├── ws-gateway/                  # WebSocket price fan-out, alert and mood pushes
│   │   └── src/{server.js, subscriptions.js, throttle.js}
│   └── workers/                     # background processes, run separately
│       └── src/
│           ├── ingest-crypto.js     # Binance
│           ├── ingest-stocks.js     # Finnhub
│           ├── ingest-forex.js      # Twelve Data
│           ├── candle-builder.js    # ticks to candles, writes Timescale
│           ├── alert-evaluator.js   # tick stream to Redis sorted sets to triggers
│           ├── alert-scheduler.js   # time and event alerts
│           ├── notifier.js          # Expo push, email, retries, quiet hours
│           ├── news-ingest.js       # GDELT and Finnhub news, dedupe, score
│           ├── mood-compute.js      # mood snapshot every few minutes
│           ├── events-sync.js       # economic calendar and global events
│           ├── ai-jobs.js           # trade reviews, cached analyses
│           └── retention.js         # purge codes, expire data, deletion requests
├── packages/
│   ├── db/                          # Drizzle schema and migrations (from doc 05)
│   ├── providers/                   # one adapter per external API
│   │   └── src/{types.js, binance.js, finnhub.js, twelvedata.js, gdelt.js, calendar.js, anthropic.js, expo-push.js, mailer.js}
│   ├── shared/                      # Zod schemas and types shared with the Expo app
│   ├── config/                      # env loading and validation
│   ├── queue/                       # BullMQ queue names and helpers
│   ├── cache/                       # Redis client, key builders
│   └── logger/
├── infra/
│   ├── docker/                      # Dockerfiles per app
│   ├── k8s/                         # manifests or Helm charts
│   └── terraform/
├── scripts/                         # seed assets, backfill candles
├── tests/                           # unit, contract (recorded provider responses), load (k6)
├── .github/workflows/ci.yml
├── docker-compose.yml               # local Postgres, Redis, Timescale
├── .env.example
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── README.md