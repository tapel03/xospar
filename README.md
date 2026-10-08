# Savanai

**Understand the market.**

Savanai is a mobile app that helps retail traders understand the market, refine their own strategy and stay consistent. It brings live prices, news, economic events, AI explanations and risk calculators into one app, so traders stop juggling charts, calendars and chat tools in separate places.

Built for South Africa and emerging markets at launch, for English-speaking traders worldwide.

> **Status: early development.** The Expo app is built and works client-side with live market data, but sign-in is mocked, alerts live only on the device, and API keys still sit in the app bundle. A secure backend is the next milestone. See [Project status](#project-status).

## The problem

- Retail traders juggle charts, calendars, news feeds and AI tools in separate apps.
- News and events are hard to connect to the assets they move.
- Traders break their own rules, and nothing checks their trades against those rules.
- Beginners find risk maths (lot size, pip value, risk/reward) error-prone.

## What Savanai does

- **Onboard in three questions.** Experience level, markets of interest and main goal seed your watch list and home feed.
- **Watch live prices.** Crypto, forex, indices and stocks, with line and candle charts across 10 timeframes.
- **Read the market mood.** A Global Market Mood score built from news, plus a Global Events map that answers "Why is the market moving?"
- **Follow the calendar.** Economic events filtered by impact and currency, with actual, forecast and previous values.
- **Set alerts.** Price, event, news and chart-pattern alerts, with push notifications once the server-side engine ships.
- **Ask the AI.** Chat, per-asset explanations and a Strategy Coach that judges a trade against your own rules.
- **Do the risk maths.** Position size, risk/reward, pip and lot calculators.
- **Practise safely.** A simulated order ticket (buy/sell, SL/TP, slide to confirm). No real orders are placed.

## Core principle

**Savanai explains; it never advises.** Every AI and analysis screen carries an "Education only, not financial advice" notice. Scenarios are phrased as conditions ("if price closes above X"), not predictions. Your rules stay in charge: the AI checks your trades against them and never replaces them.

## Who it is for

| User | Need |
|---|---|
| Beginners | Simple explanations, safe defaults, learning built in |
| Intermediate traders | Alerts, calendar, AI help, calculators |
| Advanced traders | Strategy rules, journal, analytics, broker sync |
| Platform admins | Feature flags, moderation, dashboards |

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native with Expo, React Navigation (stack and bottom tabs) |
| State | React Context (Auth, Alerts, Watchlist), AsyncStorage |
| Charts | react-native-svg, react-native-chart-kit |
| Market data | Binance (crypto), Finnhub (stocks), Twelve Data (forex), GDELT (news) |
| AI | Provider-agnostic AI gateway (target), currently called from the client |
| Target backend | TypeScript (Node) services behind an API gateway, REST under `/v1` plus WebSocket |
| Target data stores | PostgreSQL, Redis, a time-series store (TimescaleDB or ClickHouse), object storage |
| Target infrastructure | Kubernetes, Terraform, GitHub Actions, EAS Build/Update, OpenTelemetry, Sentry |

## Documentation

| # | Document | Purpose |
|---|---|---|
| 01 | [Product Requirements](docs/01-product-requirements.md) | Vision, users, scope, requirements, risks |
| 02 | [Technical Requirements](docs/02-technical-requirements.md) | Current architecture, gaps, target architecture, security |
| 03 | [App Flow](docs/03-app-flow.md) | Launch, auth, onboarding and key user journeys |
| 04 | [Design Brief](docs/04-design-brief.md) | Brand, theme, components, accessibility |
| 05 | [Backend Schema](docs/05-backend-schema.md) | Tables, relationships, retention |
| 06 | [Implementation Plan](docs/06-implementation-plan.md) | Phases, milestones, exit criteria |
| 07 | [System Design for 1M Users](docs/07-system-design-1m-users.md) | Capacity model and scaling approach |

## Project structure

```
savanai/
├── .expo/            # Expo local settings
├── .vscode/          # Editor settings
├── assets/           # Images, icons, splash and welcome art
├── docs/             # Full documentation set (01 to 07)
├── src/              # App source: screens, components, context, hooks, services
├── App.js            # App entry point and navigation root
├── app.json          # Expo configuration
├── AGENTS.md         # Instructions for AI coding agents
├── CLAUDE.md         # Instructions for Claude Code
└── .gitignore
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm or yarn
- Expo Go on a phone, or an iOS simulator or Android emulator

### Install

```bash
git clone https://github.com/tapel03/savanai.git
cd savanai
npm install
```

### Configure environment variables

Create a `.env` file in the project root. **Never commit it.** It must be listed in `.gitignore`.

```bash
FINNHUB_API_KEY=your-key-here
TWELVE_DATA_API_KEY=your-key-here
AI_PROVIDER_API_KEY=your-key-here
```

> **Heads up:** keys read by the app are bundled into the build and can be extracted. This is acceptable for local development only. Before any public release, every third-party key must move to the server (see gap G1 in the [Technical Requirements](docs/02-technical-requirements.md)).

### Run the app

```bash
npx expo start
```

Then scan the QR code with Expo Go, or press `i` for iOS or `a` for Android.

## Project status

| Area | Status |
|---|---|
| Auth | Mocked; verification codes are not checked |
| Onboarding | Working, saved locally |
| Home, Markets, Asset detail | Working client-side; charts are real, order book is simulated |
| Trading | Simulated order ticket only, no execution |
| Alerts | Local only; fire only while the app is open |
| Calendar and Global Events | Static sample data |
| News and market mood | Working (GDELT), computed on the device |
| Calculators | Working |
| AI chat | Working, called from the client with no quotas |
| Backend | Not started; planned in [Phase 1](docs/06-implementation-plan.md) |
| Documentation | Complete |

## Roadmap

- **Secure core:** real accounts, OTP, refresh tokens, cloud-synced watch list and preferences, a server-side AI gateway with quotas.
- **Market data platform:** one upstream connection per provider, a WebSocket price gateway, cached candles.
- **Alerts and notifications:** server-side evaluation, push notifications, quiet hours.
- **News, mood and events:** one shared ingestion, a real economic calendar, cached AI analyses.
- **Launch:** load and security testing, POPIA and GDPR flows, closed beta, staged rollout.
- **After launch:** trading journal, strategy rulebook, analytics, read-only MT4/MT5 sync, paper trading, paid tier.

Target launch is about 22 weeks from kickoff. See the [Implementation Plan](docs/06-implementation-plan.md).

## Important disclaimer

Savanai is an educational tool. Nothing in the app is financial advice, a recommendation or an offer to trade. Markets carry risk and you can lose money. Prices and news may be delayed or wrong. Do your own research and speak to a licensed financial adviser before making decisions.

## Contributing

1. Fork the repo and create a feature branch.
2. Use the shared theme tokens. Do not hard-code new colours or add a new palette.
3. Never ship API keys, tokens or secrets in the app or commit them to the repo.
4. Use the shared component library rather than re-implementing pills, cards and tabs.
5. Open a pull request with a clear description.

## License

Add your license here (for example MIT), or state that the project is proprietary.

## Contact

Maintained by [@tapel03](https://github.com/tapel03).
