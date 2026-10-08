# Savanai: Implementation Plan

Team assumption: 2 mobile, 3 backend, 1 data/ML, 1 designer, 1 QA, 1 DevOps, 1 product lead. Dates are relative; adjust to actual start.

## Phase 0: Foundations (weeks 1 to 3)
| Task | Outcome |
|---|---|
| Decide the product name and brand | Savanai replaces MARKET and EDGELINE everywhere |
| Pick one theme system | Shared tokens, retire the colour-conversion script |
| Legal review of data licences and financial wording | Written go/no-go per provider |
| Set up cloud accounts, environments, CI/CD, secrets | Dev, staging, production |
| Create the API contract | Versioned REST and WebSocket specification |
| Remove all third-party keys from the app | Closes gaps G1 and G6 as soon as the gateway exists |

## Phase 1: Secure core (weeks 4 to 9)
| Task | Outcome |
|---|---|
| Auth service with real OTP, social sign-in, refresh tokens | Replaces mock auth (G4) |
| User, profile, preferences, watch list endpoints | Cloud-synced data |
| Migrate AuthContext, WatchlistContext, AlertsContext to the API with local cache | Offline-friendly, synced |
| AI gateway with quotas and safety prompt | One chat path for Home, Markets, asset tab and Strategy Coach |
| Observability: logs, traces, crash reporting, analytics | Operability (G8) |

Exit criteria: a user can sign up, onboard, build a watch list and chat with AI on two devices with no keys in the app.

## Phase 2: Market data platform (weeks 7 to 13, overlaps Phase 1)
| Task | Outcome |
|---|---|
| Ingestors for Binance, Finnhub, Twelve Data (or licensed replacements) | One upstream connection per provider (G2) |
| Price gateway with WebSocket fan-out and subscription management | Phones connect only to Savanai |
| Candle service with Redis cache and time-series storage | Charts load quickly for all timeframes |
| Provider failover and "data delayed" signalling | Resilience |
| App migrates hooks (crypto, stocks, forex, candles) to the gateway | Removes direct provider calls |

Exit criteria: load test sustains 50k concurrent sockets with p95 tick latency under 1 s.

## Phase 3: Alerts and notifications (weeks 11 to 16)
| Task | Outcome |
|---|---|
| Alert service and indexed rule evaluator fed by the tick stream | Server-side triggers (G3) |
| Time and event alert scheduler | Fires when the app is closed |
| Notification service (push, in-app, email) with retries and quiet hours | Reliable delivery |
| Server-side chart-pattern detection | Moves Strategy Coach alerts off the device |
| App: push registration, deep links from notifications | End-to-end flow |

Exit criteria: 99% of test alerts delivered within 5 s at 5M active alerts in the load test.

## Phase 4: News, mood and events (weeks 13 to 18)
| Task | Outcome |
|---|---|
| News ingestion job with de-duplication and impact scoring | One shared feed (G5) |
| Mood service producing snapshots | Same mood for every user |
| Real economic calendar provider integration | Replaces static events (G7) |
| Global events feed and cached AI analyses | Replaces static map events |
| App migrates Home, News, Calendar and Global Events | Production data |

## Phase 5: Hardening and launch (weeks 17 to 22)
| Task | Outcome |
|---|---|
| Load, soak and chaos tests | Verified capacity |
| Security review and external penetration test | Findings fixed |
| Privacy flows: consent, export, delete | POPIA and GDPR ready |
| Store assets, review submissions, TestFlight and closed beta | Release candidates |
| Staged rollout: 1%, 10%, 50%, 100% with feature flags | Controlled launch |

## Phase 6: Differentiators (after launch)
1. Journal and trades, strategy rulebook, trade checks (from EDGELINE).
2. Analytics: expectancy, adherence, session breakdown, review screens.
3. Read-only MT4/MT5 sync.
4. Paper-trading mode so the order ticket does real simulated fills.
5. Subscriptions and paid tier.

## Milestones
| Milestone | Target |
|---|---|
| M1: Secure core live in staging | End of week 9 |
| M2: Market data platform live | End of week 13 |
| M3: Server-side alerts live | End of week 16 |
| M4: Closed beta | Week 19 |
| M5: Public launch | Week 22 |

## Team working rules
- Trunk-based development, feature flags, mandatory reviews.
- Definition of done includes tests, telemetry and documentation.
- Every provider integration sits behind an adapter so it can be swapped.

## Capacity and cost checkpoints
Review at M2 and M4: cost per daily active user for data, AI and notifications against budget; adjust quotas, caching and tiers.
