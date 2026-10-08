# Savanai: System Design for 1,000,000 Users

## 1. Why a redesign is needed
The current app is a good prototype but each phone does the heavy work itself: it opens its own provider connections, polls provider APIs, scores news and holds the only copy of the alerts. That works for tens of users. At 1M users the same design would make 1M connections to providers, 1M news requests per refresh cycle and no alert delivery when apps are closed. The design below moves that work to shared servers so cost and load grow far slower than user count.

## 2. Capacity assumptions
| Item | Estimate |
|---|---|
| Registered users | 1,000,000 |
| Daily active users | 200,000 (20%) |
| Peak concurrent users | 50,000 |
| Live price subscriptions at peak | 50,000 sockets, about 10 symbols each |
| Active alerts | 5,000,000 (about 5 per user) |
| API requests at peak | about 5,000 per second |
| AI messages per day | about 1,000,000 (5 per active user) |
| Distinct assets tracked | about 100 to 500 |

These are planning numbers and should be replaced with beta data.

## 3. Architecture overview
Mobile app connects through a CDN and API gateway to stateless services behind load balancers. A separate set of ingestion workers connects once to each data provider. Services communicate through a message queue and Redis; durable data sits in PostgreSQL and a time-series store.

Flow summary:
1. Provider ticks enter the ingestor once and are published to a queue.
2. The price gateway fans each tick out to subscribed sockets and writes the latest price to Redis.
3. The alert evaluator reads the same tick stream and checks indexed alert rules.
4. A triggered alert becomes a notification job; the notification service sends push messages.
5. News and mood are computed by scheduled jobs and cached; clients only read them.
6. AI requests pass through the AI gateway, which enforces quotas and caches repeat questions.

## 4. How each hotspot scales

### 4.1 Live prices
| Today | At scale |
|---|---|
| Each phone opens its own Binance or Finnhub socket and polls Twelve Data | One ingestor connection per provider; Savanai fans out to clients |

Why it works: provider load stays constant (about 3 upstream connections) regardless of users. Fan-out is horizontally scalable: gateways are stateless, each holds about 10,000 to 20,000 sockets, so 50k concurrent needs a handful of nodes plus headroom. A symbol is published once to a channel and each gateway forwards it to its local subscribers. Clients only receive the symbols on their current screen. Ticks are throttled (for example latest-value every 250 to 500 ms) and sent as compact messages to save mobile data and battery.

### 4.2 Historical candles
- Cache hot candles in Redis keyed by asset, timeframe and range; short TTL for the live bar, long TTL for closed bars.
- Persist closed candles in the time-series store; serve from there, not from the provider.
- Result: 1M users viewing the same BTC daily chart cost one provider call per cache window, not 1M.

### 4.3 Alerts (the most important server workload)
- Store alerts in PostgreSQL; load active price alerts into Redis sorted sets per asset, keyed by trigger level.
- For each tick, only check the narrow band between the previous and new price; this makes cost proportional to alerts actually crossed, not the 5M total.
- Time and event alerts are found by an indexed query on fire_at, executed by a scheduler in small batches.
- Triggering is idempotent: a unique key per alert and trigger prevents duplicate pushes after retries.
- Evaluators are sharded by asset, so adding nodes adds capacity.
- Why this is suitable: it works when apps are closed, and cost does not depend on how many users are online.

### 4.4 Notifications
- Queue-based with retry and dead-letter handling; batch to APNs and FCM.
- Respect quiet hours and per-type settings before sending.
- Back-pressure: if a news event triggers many alerts at once, the queue absorbs the burst and workers drain it.

### 4.5 News and Global Market Mood
- One scheduled job pulls from the news source, de-duplicates, scores impact and writes to the database and cache.
- Mood is computed once per cycle and stored as a snapshot; all users read the same snapshot.
- Result: instead of 1M GDELT calls per refresh, there is one.

### 4.6 AI
- All calls go through the AI gateway; no keys on devices.
- Quotas per user and plan (daily messages and tokens); rate limits per minute.
- Cache event and asset analyses (same question, same data, same answer) with a short TTL; this removes a large share of repeat cost.
- Route simple questions to a smaller, cheaper model and complex ones to a stronger model.
- Stream responses; queue overflow degrades gracefully with a friendly "busy" message.
- Safety layer: system prompt with education-only rules, input and output checks, logging for review.
- Cost control: a hard monthly budget alert and kill switch per feature.

### 4.7 Database
- PostgreSQL primary with read replicas; reads (watch lists, alert lists, profiles) go to replicas.
- Hot tables partitioned (alert_events, ai_messages by month).
- Users shard naturally by user_id if one cluster is outgrown.
- Connection pooling in front of the database.
- Indexes follow the access patterns listed in the schema document.

### 4.8 Caching layers
| Layer | What |
|---|---|
| CDN | Static assets, public news images |
| Redis | Latest prices, hot candles, sessions, rate-limit counters, alert indexes |
| App cache | Last known watch list, news and mood for instant start and offline reading |

## 5. Reliability
- Multi-zone deployment for every stateless service; managed database with automatic failover.
- Provider failover: each asset maps to primary and backup providers; the gateway marks data "delayed" instead of failing.
- Circuit breakers and timeouts on every outbound call.
- Graceful degradation order: AI first, then news, then live ticks last (core experience protected).
- Backups with point-in-time recovery; restore drills each quarter.
- Targets: 99.9% availability for APIs, RPO under 5 minutes, RTO under 1 hour.

## 6. Security at scale
- Keys only on servers; tokens in the secure store.
- Rate limiting per user, device and IP; bot protection on auth.
- WAF in front of the gateway; DDoS protection at the CDN.
- Least-privilege service identities and network segmentation.
- Broker credentials in a secret manager, read-only permissions only.
- Audit log for sensitive actions.

## 7. Observability and operations
- Tracing from phone request to provider call; dashboards for tick latency, alert latency, queue depth, cache hit rate, AI cost per user.
- Alerts on error budgets, queue backlogs and provider freshness.
- Feature flags and staged rollouts to limit blast radius.
- Runbooks for provider outage, Redis failover and notification backlog.

## 8. Autoscaling plan
| Component | Scale signal |
|---|---|
| API pods | CPU and request rate |
| Price gateway | Open socket count |
| Alert evaluators | Tick lag per shard |
| Notification workers | Queue depth |
| AI workers | Queue depth and token rate |

Load test target before launch: 2x the peak assumptions above.

## 9. Cost shape
| Cost | Driver | Control |
|---|---|---|
| Market data | Number of symbols and licence tier, not user count | One ingestor, licensed redistribution |
| Compute | Concurrent sockets and tick rate | Throttling, compact payloads |
| Database | Alerts and journal rows | Partitioning, retention |
| Notifications | Alerts triggered | Quiet hours, de-duplication, per-user caps |
| AI | Messages and tokens | Quotas, caching, model routing, paid tiers |

The key point is that the two largest variable costs, market data and news, are independent of user count, while AI is controlled with explicit quotas.

## 10. Why this design suits 1M users
1. Shared work is done once: prices, candles, news and mood are fetched and computed centrally, so provider and compute load stay nearly flat as users grow.
2. Per-user work is cheap and indexed: alerts use sorted indexes, reads use replicas and caches.
3. Everything stateful is replaceable: stateless services scale out; stores are managed with replicas and failover.
4. Failures degrade rather than break: cached data, provider failover and "delayed" labels keep the app usable.
5. Costs are bounded: AI quotas, caching and budget kill-switches stop cost from outrunning revenue.
6. It is safe to operate: keys off devices, rate limits, observability, staged rollout and privacy flows.
7. It fits the existing app: the React Native screens, navigation and component structure stay; the change is mainly swapping direct provider and local-storage calls for a small number of Savanai API calls.

## 11. Verification before launch
- Load test: 100k simulated sockets, 10M alerts, tick bursts, AI queue saturation.
- Chaos test: kill a gateway node, Redis primary, one provider.
- Pilot with a closed beta of 5k to 10k users; measure real concurrency, alerts per user and AI usage, then update the capacity assumptions.
- Re-run cost model with beta data and set final quotas and pricing.

## 12. Open decisions
| Decision | Options |
|---|---|
| Market data vendor for production | Keep Twelve Data and Finnhub with commercial licences, or move to a vendor with explicit redistribution rights |
| Economic calendar source | Licensed calendar API |
| AI model provider | One primary with a fallback |
| Hosting region | Closest region to the launch market plus a global CDN |
| Real order execution | Defer until regulatory advice is obtained |
