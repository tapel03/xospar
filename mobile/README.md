# Edgeline

Trading intelligence, journal and AI mentor. React Native (Expo SDK 57), strictly monochrome.

> Understand your market. Follow your edge. Learn from every trade.

## Run

```bash
npm install
npx expo install --fix     # aligns native package versions with your Expo CLI
npx expo start             # press i / a for simulators, or scan with Expo Go
npx expo start --web       # desktop layout: widen the window past 1024px for the sidebar
```

Layouts: ≥1024px shows the persistent sidebar (12 items); below that, a bottom bar (Home, Markets, Journal, AI, More) with the rest under More. Tablet (700–1023px) uses wider multi-column cards with the bottom bar.

## Prototype flow

Splash → Onboarding (5 pages) → Overview → Markets → EUR/USD chart → pick the Rectangle tool, drag a zone → Create alert → Events Map → open an event → Ask mentor → Check trade (8 checks) → Add trade with setup "Fair Value Gap" → edge conflict → Journal → trade detail (valid loss vs bad trade) → Analytics → Alerts center. Turn on Settings → AI settings → Hard rule to see the 10-second cooldown and written override reason.

## Structure

```
App.js                              renders <AppProviders><RootNavigator/></AppProviders>
src/app/                            AppProviders, store (in-memory state), config (API_BASE_URL, WS_URL, flags)
src/navigation/                     stack + shell, sidebar / bottom nav / top bar
src/theme/tokens.js                 greyscale tokens, radius, 8px spacing, motion, mono font
src/components/ui/                  design system (index.js) + Dropdown, FilterBar, ActionMenu
src/components/charts/CandleChart.js  SVG candles, zones, lines, crosshair, magnet, event markers
src/components/sheet/ExportSheet.js
src/components/domain.js            trade rows, insight cards, scenario cards, event rows
src/features/<feature>/             each feature owns its screens, components, hooks and API file
  splash  onboarding  home  markets  trading  alerts  calendar  events  news  chat  strategy  journal  more
src/features/markets/               marketsApi, hooks/useAssetCandles, hooks/useLiveAssets
src/features/news/                  newsApi, hooks/useMarketNews
src/features/chat/                  aiApi (mentor), Composer
src/services/http/                  one client for our backend (base URL, timeout, errors)
src/services/socket/PriceSocket.js  one reconnecting socket to the price gateway
src/hooks/                          useAppState, useDebounce
src/mocks/mock.js                   realistic seeded mock data (fallback when the backend is offline)
```

## Backend

Market data, news, mood and AI now come from `../backend`. The app holds no provider keys; set `EXPO_PUBLIC_API_BASE_URL` (see `.env.example`) or leave it empty in development. With the backend off, every screen falls back to the sample data. `EXPO_PUBLIC_USE_BACKEND=false` forces sample data.

## What is mocked

Live now (when the backend runs): prices, candles, news and the AI mentor. Still simulated: events, calendar, broker sync, journal and strategy data, document parsing and screenshot analysis. Rectangle, horizontal line and crosshair are interactive on the chart; other drawing tools are selectable but not yet drawn. Inter is not bundled; system fonts are used.

Analysis and scenarios are for education, not financial advice.

## UI refresh — October 2026
The interface has been refreshed to the approved Edgeline direction without removing application features. The shared design system now uses a premium charcoal/black base, larger rounded surfaces, compact pill controls, pastel gradient primary actions, subtle pastel status accents, and updated mobile/desktop navigation styling. The Overview equity card and onboarding selection states were refined to match the approved mockups while retaining the existing trading workflows and data model.

## UI aesthetic update
This build uses the approved premium Edgeline visual direction: charcoal/black canvas, rounded elevated cards, soft pastel glow accents, gradient highlight panels, pill controls, low-contrast borders and compact navigation. No product features were removed for this visual pass.
