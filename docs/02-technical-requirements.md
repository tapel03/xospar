# Savanai: Technical Requirements Document (TRD)

## 1. Current architecture (from the codebase)
| Layer | Current implementation |
|---|---|
| App | React Native with Expo, React Navigation (stack and bottom tabs) |
| State | React Context (Auth, Alerts, Watchlist), local persistence in AsyncStorage |
| Prices (crypto) | Direct WebSocket from each phone to Binance |
| Prices (stocks) | REST snapshot plus direct WebSocket to Finnhub |
| Prices (forex) | Phone polls Twelve Data every 15 s in chunks of 8 symbols |
| Candles | Phone calls Finnhub or Twelve Data directly |
| News | Phone calls GDELT directly and scores articles on the device |
| Market mood | Computed on the device from news |
| AI | Phone calls Free.ai (and an Anthropic client exists) with a key in the app bundle |
| Auth | Mock; verification codes are not checked |
| Alerts | Stored locally; due-ness checked on the device |
| Charts | react-native-svg and react-native-chart-kit |

## 2. Gaps that must close before public launch
| # | Gap | Why it blocks 1M users |
|---|---|---|
| G1 | API keys (Twelve Data, Finnhub, Free.ai, Anthropic) ship in the app bundle | Anyone can extract and abuse them; costs and quotas are lost |
| G2 | Every phone connects to Binance and Finnhub and polls Twelve Data | 1M clients exhaust free-tier limits and violate terms; no shared caching |
| G3 | Alerts live only on the device | They do not fire when the app is closed and do not sync |
| G4 | Auth is mocked | No real accounts, no security, no data recovery |
| G5 | News and mood are computed per device | 1M identical GDELT calls and inconsistent results |
| G6 | AI is called from the client with no quotas | Unbounded cost, no abuse control, no safety layer |
| G7 | Calendar, global events and order book are static or simulated | Not production data |
| G8 | No analytics, crash reporting or feature flags | Cannot operate or measure |
| G9 | Data licensing for prices and news not confirmed | Legal exposure |

## 3. Target architecture

### 3.1 Client
- Keep Expo and React Native.
- One shared theme layer (currently two palettes and a colour-conversion script exist; settle on one token set).
- One data layer that talks only to the Savanai API and one WebSocket gateway.
- Local cache for offline reading; optimistic updates for watch list and alerts.
- Push notification registration (APNs and FCM through Expo notifications).

### 3.2 Backend services
| Service | Responsibility |
|---|---|
| API gateway | TLS, auth check, rate limits, routing, request IDs |
| Auth service | Sign-up, login, OTP, social sign-in, refresh tokens, device sessions |
| User service | Profile, preferences, watch list, notes, onboarding answers |
| Market data ingestor | One upstream connection per provider; normalises ticks |
| Price gateway | WebSocket fan-out of ticks to subscribed clients |
| Candle service | Historical and live candles with caching |
| Alert service | Create, edit, evaluate and trigger alerts |
| Notification service | Push, in-app and email delivery with retries |
| News service | Scheduled ingestion, scoring, de-duplication, serves the feed |
| Mood and events service | Computes Global Market Mood once; serves calendar and global events |
| AI gateway | Prompt building, safety, quotas, caching, model routing |
| Journal and strategy service (phase 2) | Trades, rules, adherence checks, analytics |
| Broker connector (phase 3) | Read-only MT4/MT5 sync |
| Admin and ops | Feature flags, moderation, dashboards |

### 3.3 Data stores
| Store | Used for |
|---|---|
| PostgreSQL (managed, with read replicas) | Users, alerts, watch lists, journal, subscriptions |
| Redis cluster | Latest prices, hot candles, rate limits, sessions, alert indexes, pub/sub |
| Time-series store (TimescaleDB or ClickHouse) | Historical candles and tick aggregates |
| Object storage | Strategy documents, screenshots, voice notes, exports |
| Message queue (Kafka, or managed equivalent) | Ticks, alert events, notifications, AI jobs |
| Search index (optional) | News and asset search at scale |

### 3.4 Interfaces
- REST (JSON) for request/response; versioned under /v1.
- WebSocket for live prices, alert triggers and mood updates.
- Webhooks inbound from store billing and push providers.
- Idempotency keys on create-alert and AI requests.

## 4. Technology decisions
| Decision | Choice | Reason |
|---|---|---|
| Backend language | TypeScript (Node) services | Shared types with the app; team familiarity |
| Hosting | Containers on Kubernetes (managed) in one cloud, with an African region for latency to the launch market and a global CDN | Horizontal scaling, regional reach |
| IaC | Terraform | Repeatable environments |
| CI/CD | GitHub Actions, EAS Build/Update for the app | Fast, reviewable releases |
| Observability | OpenTelemetry, Prometheus/Grafana, Sentry | Trace a request from phone to provider |
| Secrets | Cloud secret manager | Keys never in the app |

## 5. Security requirements
- All third-party keys move to the server (closes G1).
- Passwords hashed with a modern memory-hard algorithm; OTPs single-use with expiry and attempt limits.
- Short-lived access tokens, rotating refresh tokens, per-device revocation.
- Token storage in the device secure store, not plain AsyncStorage.
- Per-user and per-IP rate limits; bot protection on auth endpoints.
- Input validation and output encoding on every endpoint.
- Encryption at rest for databases and object storage; field-level encryption for broker credentials.
- Broker connections are read-only; no trading permission is ever requested.
- Dependency scanning, secret scanning and an external penetration test before launch.

## 6. Privacy and compliance
- POPIA and GDPR: consent records, purpose limitation, export, deletion within 30 days.
- Data retention schedule per table.
- Financial-information disclaimers on every AI and analysis surface.
- Legal review of the "alerts and scenarios" wording to keep them informational.

## 7. Testing requirements
| Level | Scope |
|---|---|
| Unit | Calculators, alert rule evaluation, mood scoring, pattern detection |
| Contract | Each provider adapter against recorded responses |
| Integration | Auth, alerts to push, AI gateway quotas |
| End-to-end | Onboarding, create alert, receive alert, AI chat |
| Load | 50k concurrent sockets, 5M active alerts, tick storms |
| Chaos | Provider outage, Redis failover, queue backlog |
| Accessibility | Screen reader pass on main flows |

## 8. Known code issues to fix during the migration
- The Anthropic and Free.ai services both define a sendChatMessage with different shapes; replace both with one call to the AI gateway.
- Alert due-ness uses the alert's creation date plus hour/minute, which is not a price condition; real price-trigger alerts need server evaluation.
- Chart-pattern alerts are created from the open screen only; move detection to the server.
- Some Finnhub calls read the key from the environment directly instead of the shared config; unify behind the server.
- Mock-data screens (calendar, global events, order book) need real feeds or an explicit "sample" label.
- Several screens hard-code a different dark palette; move to shared tokens.
