# Savanai: Backend Schema

Notation: PK is the primary key, FK a foreign key, UQ unique. All tables carry created_at; mutable tables also carry updated_at. IDs are UUIDs. Timestamps are stored in UTC.

## 1. Identity and users
### users
| Column | Notes |
|---|---|
| id | PK |
| email | UQ, nullable for some social accounts |
| email_verified_at | |
| password_hash | null for social-only accounts |
| status | active, suspended, deleted |
| locale, timezone | |
| plan | free, pro |
| last_login_at | |

### auth_identities
Social sign-in links. Columns: id, user_id (FK), provider (apple, google), provider_user_id; UQ on provider and provider_user_id.

### device_sessions
Columns: id, user_id (FK), device_id, platform, push_token, refresh_token_hash, last_seen_at, revoked_at. One user has many devices.

### verification_codes
Columns: id, user_id or email, purpose (signup, signin, reset), code_hash, expires_at, attempts, used_at. Rows expire and are purged.

### user_profiles
Columns: user_id (PK, FK), display_name, avatar_url, experience (beginner, intermediate, advanced), goal, onboarding_completed_at.

### user_markets
Columns: user_id (FK), market (crypto, forex, indices, stocks); PK on both. Holds the multi-select onboarding answer.

### user_preferences
Columns: user_id (PK, FK), theme, show_percent_change, haptics, quiet_hours_start, quiet_hours_end.

### notification_settings
Columns: user_id (FK), type (price, news, event), channel (push, email, in_app), enabled; PK on user_id, type, channel.

### consents
Columns: id, user_id, type (terms, privacy, marketing, ai_processing), version, granted_at, revoked_at.

## 2. Market reference and data
### assets
| Column | Notes |
|---|---|
| id | PK |
| symbol | UQ per category, e.g. EURUSD, BTCUSDT, AAPL |
| display_symbol | e.g. EUR/USD |
| name | |
| category | forex, crypto, indices, stocks |
| provider_symbol | per-provider mapping stored in asset_provider_map |
| decimals | price precision |
| active | |

### asset_provider_map
Columns: asset_id (FK), provider (binance, finnhub, twelvedata), provider_symbol, priority. Allows failover between providers.

### candles (time-series store)
Columns: asset_id, timeframe (1m, 5m, 15m, 30m, 1H, 2H, 4H, 1D, 1W, 1M), open_time, open, high, low, close, volume. PK on asset_id, timeframe, open_time. Partitioned by time; older fine-grained data rolled up and expired by retention policy.

### latest_prices (Redis, mirrored to Postgres every minute)
Per asset: last, bid, ask, day_change, day_change_pct, updated_at.

### watchlist_items
Columns: user_id (FK), asset_id (FK), position, added_at; PK on user_id and asset_id.

## 3. Alerts
### alerts
| Column | Notes |
|---|---|
| id | PK |
| user_id | FK, indexed |
| kind | price, event, news, pattern |
| asset_id | FK, nullable |
| event_id | FK to economic_events, nullable |
| story_id | FK to news_articles, nullable |
| alert_type | price_cross, price_touch, price_reverse, pattern, event_start, before_event, high_impact, news |
| heading | user message |
| target_price | numeric, nullable |
| direction | above, below, either (derived at create time from the current price) |
| lead_minutes | for "before event" |
| has_time | false means "as soon as condition is met" |
| fire_at | UTC timestamp, indexed, null for price alerts |
| repeat | once, daily, weekly |
| repeat_remaining | |
| status | active, triggered, paused, expired, deleted |
| acknowledged_at | |
| expires_at | |

Indexes: (asset_id, status, target_price) for price evaluation; (fire_at) where status is active for time alerts.

### alert_events
Every firing. Columns: id, alert_id (FK), triggered_at, trigger_price, delivery_status (queued, sent, failed), channel_results.

### strategy_alert_subscriptions
Columns: user_id, asset_id, enabled, strategy_id (nullable). Controls Live Pattern Alerts.

## 4. News, events and mood
### news_articles
Columns: id, url (UQ), title_hash (UQ), title, source_domain, published_at, image_url, impact (high, medium, low), impact_score, summary, region. Written by the ingestion job only.

### news_article_markets
Columns: article_id (FK), market_tag (Oil, Gold, USD, EUR, GBP, JPY, Stocks, Global Markets).

### economic_events
Columns: id, provider_event_id (UQ), starts_at, currency, title, impact, forecast, previous, actual, revised_at.

### global_events
Columns: id, category (conflict, political, economic, central_bank, company, positive), title, location_name, lat, lng, impact, description, started_at, source_urls.

### global_event_assets
Columns: event_id (FK), asset_label, expected_direction, reference_change_pct.

### market_mood_snapshots
Columns: id, computed_at, mood (risk_on, risk_off, neutral), fear, uncertainty, risk, confidence, description, input_article_count. One new row every few minutes, served to all users.

### event_analyses
Cached AI analyses. Columns: id, event_id, asset_id, factors (structured list), insight, model, prompt_version, generated_at, expires_at.

## 5. AI
### ai_conversations
Columns: id, user_id (FK), surface (home, markets, asset, analysis), asset_id (nullable), title, created_at.

### ai_messages
Columns: id, conversation_id (FK), role (user, assistant, system), content, token_count, model, latency_ms, safety_flags, created_at.

### ai_usage
Columns: user_id, period (day), requests, tokens_in, tokens_out; PK on user_id and period. Drives quotas.

## 6. Strategy, journal and analytics (phase 2)
### strategies
Columns: id, user_id, name, status, markets, timeframes, sessions, risk_percent, version, source (typed, file, image, voice).

### strategy_rules
Columns: id, strategy_id, kind (entry, exit, risk, forbidden, psychological, confirmation), text, weight (required, preferred, optional, forbidden), position.

### strategy_documents
Columns: id, strategy_id, object_key, mime_type, transcription_text, extracted_at.

### strategy_analyses
Columns: id, strategy_id, summary, rules_json, model, created_at.

### trades
Columns: id, user_id, asset_id, strategy_id, direction, opened_at, closed_at, entry, exit, stop, target, lots, risk_percent, pnl, r_multiple, setup, session, emotion, thesis, source (manual, mt5, paper), edge_status (on, partial, off), review_status.

### trade_reviews
Columns: id, trade_id, verdict, checks_json, model, created_at.

### user_stats_daily
Columns: user_id, date, trades, pnl, win_rate, adherence_score. Pre-aggregated for analytics screens.

## 7. Brokers (phase 3)
### broker_connections
Columns: id, user_id, platform (mt4, mt5), broker, server, account_login_masked, credentials_ref (secret-manager pointer, never plaintext), status, last_sync_at, permission (read_only).

### broker_snapshots
Columns: connection_id, captured_at, balance, equity, free_margin, margin_level, floating_pl.

### broker_positions
Columns: id, connection_id, symbol, side, lots, entry, profit, opened_at, closed_at.

## 8. Billing and operations
### subscriptions
Columns: id, user_id, store (apple, google), product, status, current_period_end, original_transaction_id.

### feature_flags
Columns: key, rollout_percent, rules.

### audit_log
Columns: id, actor, action, entity, entity_id, at, metadata. Append-only.

### data_requests
Columns: id, user_id, type (export, delete), status, requested_at, completed_at.

## 9. Relationships
- A user has one profile, one preferences row, many sessions, watch list items, alerts, conversations, strategies, trades and broker connections.
- An alert may reference one asset, one economic event or one news article.
- A strategy has many rules and documents; a trade may reference one strategy.
- News, events, mood snapshots and candles are global, not per user.

## 10. Data lifecycle
| Data | Retention |
|---|---|
| Ticks | Hours (Redis only) |
| 1m candles | 90 days |
| Hourly and daily candles | Indefinite |
| Verification codes | Purged after expiry |
| AI messages | 12 months, user-deletable |
| Alert events | 12 months |
| Deleted accounts | Personal data removed within 30 days; billing records kept as required by law |
