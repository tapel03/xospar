# Savanai: Product Requirements Document (PRD)

## 1. Vision
Savanai helps retail traders understand the market, refine their own strategy and stay consistent. It combines live prices, news and events, AI explanations and personal rule-checking in one mobile app.

Tagline (from the current splash screen): "Understand the market."

## 2. Problem
- Retail traders juggle charts, calendars, news feeds and chat tools in separate apps.
- News and events are hard to connect to the assets they move.
- Traders break their own rules, and nothing checks their trades against those rules.
- Beginners find risk maths (lot size, pip value, risk/reward) error-prone.

## 3. Target users
| Persona | Need |
|---|---|
| Beginner | Learn, simple explanations, safe defaults |
| Intermediate | Alerts, calendar, AI help, calculators |
| Advanced | Strategy rules, journal, analytics, broker sync |

Primary launch market: South Africa and emerging markets, with global English-speaking users.

## 4. Goals and success metrics
| Goal | Metric | 12-month target |
|---|---|---|
| Activation | Users finishing onboarding | 70% |
| Habit | D30 retention | 25% |
| Engagement | Alerts created per active user | 3+ |
| AI value | AI chats per weekly active user | 5+ |
| Reliability | Alert delivered within 5 s of trigger | 99% |
| Scale | Registered users | 1,000,000 |

## 5. Scope

### 5.1 Features that exist today in the codebase
| Area | Feature | State |
|---|---|---|
| Auth | Email and social sign-in, 4-digit email verification, forgot password | Mocked, no backend |
| Onboarding | Experience, markets and goal questions, plan summary | Local only |
| Home | Top stories, Global Market Mood, Quick Tools, live crypto list, AI chat button | Working, client-side |
| Markets | Categories (Crypto, Forex, Indices, Stocks), watch list, bookmarks | Working, local storage |
| Asset detail | Line/candle chart, 10 timeframes, order book, history, AI tab, Strategy Coach | Charts are real; order book is simulated |
| Trading | Order ticket (buy/sell, SL/TP, slide to confirm) | Simulated, no execution |
| Alerts | Price, event, news and chart-pattern alerts | Local only, fire only while the app is open |
| Calendar | Economic events with filters and an analysis page | Static sample data |
| Global Events | Map, list and insights; "Why is the market moving?" | Static sample data |
| News | GDELT-sourced market news with an impact score | Working |
| Tools | Position size, risk/reward, pip, lot calculators | Working |
| More | MT4/MT5 screens, portfolio, positions | Static placeholders |

### 5.2 Features to build (roadmap)
- Real accounts, secure sessions and cloud-synced data.
- Server-side alert engine with push notifications.
- Server-side AI gateway with quotas.
- Real economic calendar and event feed.
- Trading journal, strategy rulebook and trade checks (from the EDGELINE prototype).
- Analytics: win rate, expectancy, adherence, session breakdown.
- Read-only broker/MT5 connection.

### 5.3 Out of scope for launch
- Placing real orders on the user's behalf.
- Holding customer funds.
- Personalised financial advice.

## 6. Functional requirements (key items)
| ID | Requirement | Priority |
|---|---|---|
| FR-1 | A user can sign up and log in with email or Apple/Google and stay signed in across devices. | Must |
| FR-2 | Verification and reset codes are generated and checked on the server. | Must |
| FR-3 | Watch list, alerts, notes and preferences sync across devices. | Must |
| FR-4 | Alerts trigger when the server sees the condition, even if the app is closed, and arrive as push notifications. | Must |
| FR-5 | Price charts load for any supported asset and timeframe. | Must |
| FR-6 | AI answers use a server-held key, per-user limits and a safety prompt. | Must |
| FR-7 | News and mood are shared from one ingestion, not fetched per user. | Must |
| FR-8 | Every AI output and analysis shows an "education, not financial advice" notice. | Must |
| FR-9 | Users can export and delete their data. | Must |
| FR-10 | Users store strategy rules and the AI judges trades against them, never replacing them. | Should |
| FR-11 | Journal and analytics screens. | Should |
| FR-12 | Read-only MT4/MT5 sync. | Could |

## 7. Non-functional requirements
| Area | Requirement |
|---|---|
| Scale | 1M registered users, about 200k daily active, about 50k concurrent at peak |
| Latency | API p95 under 300 ms; price tick to screen under 1 s; alert trigger to push under 5 s |
| Availability | 99.9% for core APIs |
| Security | No third-party API keys in the app; encryption in transit and at rest; rate limiting |
| Privacy | POPIA and GDPR compliant; consent and deletion flows |
| Accessibility | Labels on all controls, scalable text, sufficient contrast |
| Cost | AI and market-data cost per active user stays within budget (see system design) |

## 8. Risks
| Risk | Impact | Mitigation |
|---|---|---|
| Market-data licences do not allow redistribution at scale | Legal and shutdown risk | Obtain commercial redistribution licences before public launch |
| Regulation of financial information in target regions | Fines, store rejection | Education framing, disclaimers, legal review (FSCA in South Africa) |
| AI gives harmful or wrong guidance | Trust, liability | Guardrails, disclaimers, no recommendations framed as advice |
| Third-party outage (Binance, Twelve Data, Finnhub, GDELT) | Blank screens | Caching, fallbacks, status banners |
| AI cost grows faster than revenue | Margin | Quotas, caching, tiered plans |

## 9. Monetisation (proposal)
Free tier with limited alerts and AI messages; paid tier with more alerts, unlimited AI, journal and analytics. Product changes only; no ads are assumed.
