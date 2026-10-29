# Savanai: Full File Structure (JavaScript only)

Legend: [keep] stays as is, [move] same file, new location, [rename] renamed, [split] broken into smaller files, [new] to be created, [remove] delete.

The whole codebase is plain JavaScript (`.js` / `.jsx`). There are no TypeScript files. Shared contracts are expressed as zod schemas, constants and JSDoc typedefs.

The app moves from a screen-based layout to a feature-based one. Each feature owns its screens, components, hooks and API calls. Anything used by two or more features lives in `components/`, `hooks/`, `theme/` or `utils/`.

## 1. Repository root

```
savanai/
├── mobile/                          Expo / React Native app (section 2)
├── backend/                         Services (section 3)
├── packages/
│   ├── shared-types/                [new] zod schemas, constants and JSDoc typedefs shared by app and backend
│   │   ├── src/alert.js
│   │   ├── src/asset.js
│   │   ├── src/user.js
│   │   ├── src/ai.js
│   │   ├── src/ws-messages.js
│   │   └── package.json
│   └── api-client/                  [new] REST + WebSocket client generated from the API contract
│       ├── src/rest.js
│       ├── src/socket.js
│       └── package.json
├── infra/                           [new]
│   ├── terraform/
│   │   ├── modules/{network,k8s,postgres,redis,kafka,cdn,secrets}/
│   │   └── envs/{dev,staging,prod}/
│   ├── k8s/
│   │   ├── base/
│   │   └── overlays/{dev,staging,prod}/
│   └── docker/
│       └── Dockerfile.service
├── docs/                            [keep] 01 to 07, plus this file
│   ├── 01-product-requirements.md
│   ├── 02-technical-requirements.md
│   ├── 03-app-flow.md
│   ├── 04-design-brief.md
│   ├── 05-backend-schema.md
│   ├── 06-implementation-plan.md
│   ├── 07-system-design-1m-users.md
│   ├── 08-file-structure.md
│   ├── api/openapi.yaml             [new]
│   └── runbooks/                    [new] provider-outage.md, redis-failover.md, notification-backlog.md
├── .github/workflows/               [new] mobile-ci.yml, backend-ci.yml, eas-build.yml, deploy.yml
├── package.json                     [new] workspace root
├── pnpm-workspace.yaml              [new]
└── README.md                        [new]
```

## 2. Mobile app (mobile/)

```
mobile/
├── App.js                           [keep] only renders <AppProviders><RootNavigator/></AppProviders>
├── app.json                         [keep]
├── eas.json                         [new]
├── babel.config.js                  [keep]
├── package.json                     [keep]
├── .env.example                     [new] API_BASE_URL, WS_URL only (no third-party keys)
├── assets/
│   ├── first_page_login_started.png [keep]
│   ├── completion_illustration.png  [keep]
│   ├── allset_illustration.png      [keep]
│   ├── goal_illustration.png        [keep]
│   ├── splash-face-1.jpeg           [keep]
│   ├── splash-face-2.jpeg           [keep]
│   ├── splash-face-3.jpeg           [keep]
│   ├── icon.png / adaptive-icon.png / favicon.png   [keep]
│   └── fonts/                       [new] tabular-figure font for prices
└── src/
    │
    ├── app/                         [new] app-wide wiring
    │   ├── AppProviders.jsx         Auth, Theme, Query, Alerts, Watchlist, Toast providers in one place
    │   ├── bootstrap.js             Sentry, analytics, push registration, feature flags
    │   └── config.js                Reads env; exports API_BASE_URL, WS_URL, feature flags
    │
    ├── navigation/
    │   ├── RootNavigator.jsx        [keep]
    │   ├── AuthNavigator.jsx        [keep]
    │   ├── OnboardingNavigator.jsx  [keep]
    │   ├── BottomTabNavigator.jsx   [keep]
    │   ├── HomeNavigator.jsx        [keep]
    │   ├── MarketsNavigator.jsx     [keep] WatchlistProvider moves up to AppProviders
    │   ├── CalendarNavigator.jsx    [keep]
    │   ├── MoreNavigator.jsx        [keep]
    │   ├── linking.js               [new] deep links (alert push opens asset or event)
    │   └── routes.js                [new] route-name constants
    │
    ├── theme/
    │   ├── colors.js                [keep] light tokens
    │   ├── colors.dark.js           [new] dark tokens
    │   ├── typography.js            [new]
    │   ├── spacing.js               [new] 8 px grid, radii
    │   ├── semantic.js              [new] gain, loss, warning, link (always paired with a glyph)
    │   ├── ThemeProvider.jsx        [new] light/dark switch, honours Preferences screen
    │   └── useTheme.js              [new]
    │
    ├── components/                  shared UI only
    │   ├── ui/                      [new] design-system primitives
    │   │   ├── Button.jsx
    │   │   ├── Chip.jsx
    │   │   ├── SegmentedControl.jsx
    │   │   ├── Card.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Field.jsx            replaces AuthField and the repeated TextInput styles
    │   │   ├── Toggle.jsx
    │   │   ├── ListRow.jsx          replaces SettingsItem, MarketRow base styles
    │   │   ├── EmptyState.jsx
    │   │   ├── Skeleton.jsx
    │   │   ├── ErrorBanner.jsx      "Data delayed" / offline
    │   │   ├── Disclaimer.jsx       "Education only, not financial advice"
    │   │   └── Toast.jsx
    │   ├── sheet/
    │   │   └── BottomSheet.jsx      [rename] from InAppModalOverlay.jsx
    │   ├── brand/
    │   │   ├── BrandMark.jsx        [keep] one copy only
    │   │   ├── LogoLockup.jsx       [new] extracted from AuthWelcomeScreen and ChatScreen (MiniLogoMark)
    │   │   └── OnboardingBackdrop.jsx  [keep] one copy only
    │   ├── charts/
    │   │   ├── AssetPriceChart.jsx  [move] from MarketsComponents
    │   │   ├── CurrencyPriceChart.jsx  [move]
    │   │   ├── Sparkline.jsx        [move] from MarketsComponents/AI/AIChatComponents
    │   │   └── PriceLadder.jsx      [split] out of OrderTicketModal
    │   ├── PageIndicator.jsx        [keep]
    │   └── BookmarkButton.jsx       [move]
    │
    ├── features/
    │   │
    │   ├── splash/
    │   │   ├── SplashScreen.jsx     [move]
    │   │   └── SplashScreen.styles.js  [move]
    │   │
    │   ├── auth/
    │   │   ├── screens/
    │   │   │   ├── AuthWelcomeScreen.jsx
    │   │   │   ├── LoginScreen.jsx
    │   │   │   ├── SignUpScreen.jsx
    │   │   │   ├── VerifyEmailScreen.jsx
    │   │   │   ├── ForgotPasswordScreen.jsx
    │   │   │   └── CreateNewPasswordScreen.jsx
    │   │   ├── components/
    │   │   │   ├── AuthScreenLayout.jsx
    │   │   │   ├── AuthBackButton.jsx
    │   │   │   ├── AuthHeading.jsx
    │   │   │   ├── AuthPrimaryButton.jsx
    │   │   │   ├── AuthSwitchLink.jsx
    │   │   │   ├── OrDivider.jsx
    │   │   │   ├── OtpInputRow.jsx
    │   │   │   ├── SocialButton.jsx
    │   │   │   └── GradientScrim.jsx   [split] from AuthWelcomeScreen
    │   │   ├── AuthContext.jsx      [move] from context/, calls real auth API
    │   │   ├── authApi.js           [new] signUp, login, verifyOtp, resendOtp, forgot, reset, social
    │   │   └── secureStorage.js     [new] tokens in expo-secure-store
    │   │
    │   ├── onboarding/
    │   │   ├── screens/
    │   │   │   ├── OnboardingQuestionsScreen.jsx
    │   │   │   └── CompletionScreen.jsx
    │   │   ├── components/
    │   │   │   ├── ExperienceIllustration.jsx
    │   │   │   ├── QuestionOption.jsx     [split] option, market card, goal row
    │   │   │   └── PlanSummaryRow.jsx     [split] SummaryRow from CompletionScreen
    │   │   ├── questions.js         [split] QUESTIONS array out of the screen
    │   │   └── onboardingApi.js     [new] saves answers to profile
    │   │
    │   ├── home/
    │   │   ├── HomeScreen.jsx
    │   │   ├── components/          [rename] from HomeComponets
    │   │   │   ├── HomeHeader.jsx
    │   │   │   ├── TopStoriesCard.jsx
    │   │   │   ├── GlobalMarketMood.jsx
    │   │   │   ├── QuickTools.jsx
    │   │   │   ├── MarketPriceList.jsx
    │   │   │   ├── MarketChartSection.jsx
    │   │   │   ├── RecentMarketImpact.jsx
    │   │   │   ├── AIChatFAB.jsx
    │   │   │   ├── TopStoryBanner.jsx
    │   │   │   ├── PortfolioCard.jsx
    │   │   │   └── PortfolioHeader.jsx
    │   │   └── hooks/useHomeFeed.js [new] one call for stories + mood
    │   │
    │   ├── markets/
    │   │   ├── screens/
    │   │   │   ├── MarketsScreen.jsx
    │   │   │   └── MarketCategoryDetailScreen.jsx
    │   │   ├── components/
    │   │   │   ├── MarketHeader.jsx
    │   │   │   ├── MarketOverview.jsx
    │   │   │   ├── MarketRow.jsx
    │   │   │   └── asset-detail/
    │   │   │       ├── AssetDetailModal.jsx      [split] shell only
    │   │   │       ├── AssetDetailHeader.jsx     [split]
    │   │   │       ├── AssetPriceBlock.jsx       [split]
    │   │   │       ├── TimeframeRow.jsx          [split]
    │   │   │       ├── FullscreenChart.jsx       [split]
    │   │   │       ├── BuySellRow.jsx            [split]
    │   │   │       ├── ChartOptionsReels.jsx     [move]
    │   │   │       ├── MarketInfoTabs.jsx        [split] tab shell + swipe logic
    │   │   │       ├── tabs/
    │   │   │       │   ├── OrderBookTab.jsx
    │   │   │       │   ├── HistoryTab.jsx
    │   │   │       │   ├── NotesTab.jsx          becomes real, synced notes
    │   │   │       │   ├── InfoTab.jsx           becomes real asset info
    │   │   │       │   └── AIAssistantTab.jsx
    │   │   │       └── useSwipeBetweenAssets.js  [split] PanResponder logic
    │   │   ├── hooks/
    │   │   │   ├── useAssetCandles.js    [move] now calls Savanai candle API
    │   │   │   ├── useCryptoTicker.js    [move] reads from price gateway
    │   │   │   ├── useStockTicker.js     [move]
    │   │   │   ├── useForexPrices.js     [move]
    │   │   │   └── usePriceStream.js     [new] one hook replacing the three above
    │   │   ├── WatchlistContext.jsx      [move] syncs with API
    │   │   ├── marketsApi.js             [new]
    │   │   └── assetCatalog.js           [new] replaces hard-coded CATEGORY_PAIRS and SearchScreen ASSETS
    │   │
    │   ├── trading/
    │   │   ├── OrderTicketModal.jsx      [move] labelled "Paper trade"
    │   │   ├── components/
    │   │   │   ├── PriceStepper.jsx      [split]
    │   │   │   ├── ConfirmSlider.jsx     [split]
    │   │   │   └── LotStepper.jsx        [split]
    │   │   └── tradingApi.js             [new] paper orders (phase 6)
    │   │
    │   ├── alerts/
    │   │   ├── screens/AlertsScreen.jsx
    │   │   ├── components/
    │   │   │   ├── AlertHeader.jsx
    │   │   │   ├── DaySelector.jsx
    │   │   │   ├── TaskSection.jsx
    │   │   │   ├── TaskItem.jsx
    │   │   │   ├── BottomToolbar.jsx
    │   │   │   └── form/
    │   │   │       ├── AlertFormModal.jsx    [split] shell and save logic
    │   │   │       ├── EventContextCard.jsx  [split]
    │   │   │       ├── StoryContextCard.jsx  [split]
    │   │   │       ├── AlertTypeList.jsx     [split]
    │   │   │       ├── DateTimeFields.jsx    [split]
    │   │   │       ├── RepeatFields.jsx      [split]
    │   │   │       └── alertFormOptions.js   [split] type, lead time, repeat constants
    │   │   ├── AlertsContext.jsx         [move] cache layer over the alerts API
    │   │   ├── alertsApi.js              [new]
    │   │   └── useNotifications.js       [new] permission, token registration, tap handling
    │   │
    │   ├── calendar/
    │   │   ├── screens/
    │   │   │   ├── CalendarScreen.jsx
    │   │   │   └── EventDetailScreen.jsx
    │   │   ├── components/
    │   │   │   ├── CalendarHeader.jsx
    │   │   │   ├── DateSelector.jsx
    │   │   │   ├── MonthCalendarModal.jsx
    │   │   │   ├── CalendarFilters.jsx
    │   │   │   ├── EventList.jsx         EVENTS array removed; data from API
    │   │   │   ├── EconomicEvent.jsx
    │   │   │   └── EventAnalysis.jsx     [split] analysis section from EventDetailScreen
    │   │   ├── eventAnalysisCopy.js      [split] getAnalysis text templates (or server-generated)
    │   │   └── calendarApi.js            [new]
    │   │
    │   ├── events/                       global events
    │   │   ├── screens/
    │   │   │   ├── GlobalEventsScreen.jsx
    │   │   │   └── MarketMovingScreen.jsx
    │   │   ├── components/
    │   │   │   ├── DotMap.jsx            [split]
    │   │   │   ├── Legend.jsx            [split]
    │   │   │   ├── EventCard.jsx         [split]
    │   │   │   ├── ListTab.jsx           [split]
    │   │   │   ├── InsightsTab.jsx       [split]
    │   │   │   ├── Factor.jsx            [split]
    │   │   │   └── RelatedMarket.jsx     [split]
    │   │   ├── categories.js             [split] CATEGORIES constant
    │   │   └── eventsApi.js              [new]
    │   │
    │   ├── news/
    │   │   ├── screens/NewsScreen.jsx
    │   │   ├── components/
    │   │   │   ├── Header.jsx
    │   │   │   ├── Tabs.jsx
    │   │   │   ├── NewsCard.jsx
    │   │   │   ├── SentimentCard.jsx
    │   │   │   ├── MarketImpactCard.jsx
    │   │   │   ├── InsightCard.jsx
    │   │   │   └── PricePredictionCard.jsx   relabel as scenario, not prediction
    │   │   ├── hooks/useMarketNews.js    [move] calls Savanai news API
    │   │   ├── hooks/useMarketMood.js    [new] reads the shared mood snapshot
    │   │   └── newsApi.js                [new]
    │   │
    │   ├── chat/
    │   │   ├── screens/ChatScreen.jsx
    │   │   ├── components/
    │   │   │   ├── ChatHeader.jsx
    │   │   │   ├── MessageBubble.jsx
    │   │   │   ├── ChatInputBar.jsx
    │   │   │   ├── SuggestionChips.jsx   [split] from ChatScreen
    │   │   │   ├── VoiceOverlay.jsx      [split] orb and recorder UI
    │   │   │   └── CategoryCardRow.jsx   [remove] demo data
    │   │   ├── hooks/
    │   │   │   ├── useAIChat.js          [move] calls the AI gateway
    │   │   │   └── useVoiceRecorder.js   [split] shared by ChatScreen and StrategyCoachPanel
    │   │   └── aiApi.js                  [new] replaces freeAiService.js and anthropicService.js
    │   │
    │   ├── strategy/
    │   │   ├── StrategyCoachPanel.jsx    [move]
    │   │   ├── components/
    │   │   │   ├── AttachmentCard.jsx    [split]
    │   │   │   ├── LiveAlertsToggle.jsx  [split]
    │   │   │   └── AnalysisCard.jsx      [split]
    │   │   ├── hooks/useStrategyAlerts.js   [move] becomes a subscription toggle only
    │   │   ├── strategyApi.js            [new] rules, documents, transcription
    │   │   └── (phase 2) screens/RulebookScreen.jsx, TradeCheckScreen.jsx   [new]
    │   │
    │   ├── journal/                      [new] phase 2
    │   │   ├── screens/{JournalScreen,TradeDetailScreen,AnalyticsScreen}.jsx
    │   │   ├── components/{TradeRow,EquityCurve,AdherenceRing,SessionBreakdown}.jsx
    │   │   └── journalApi.js
    │   │
    │   ├── search/
    │   │   ├── SearchScreen.jsx          [move] queries search API instead of local arrays
    │   │   └── searchApi.js              [new]
    │   │
    │   ├── tools/
    │   │   ├── QuickToolScreen.jsx       [move] from HomeComponets, used by Home and More
    │   │   ├── toolDefinitions.js        [split] TOOLS object (fields and compute)
    │   │   └── toolDefinitions.test.js   [new] unit tests for the four calculators
    │   │
    │   └── more/
    │       ├── MoreScreen.jsx
    │       ├── settings/
    │       │   ├── Profile.jsx
    │       │   ├── Preferences.jsx       wired to theme and user_preferences
    │       │   ├── Notifications.jsx     wired to notification_settings
    │       │   ├── DataPrivacy.jsx       [new] export and delete account
    │       │   └── Subscription.jsx      [new] phase 6
    │       └── brokers/
    │           ├── ConnectMTScreen.jsx
    │           ├── ConnectedAccountsScreen.jsx
    │           ├── TradingPortfolioScreen.jsx
    │           ├── OpenPositionsScreen.jsx
    │           └── brokersApi.js         [new] read-only (phase 3)
    │
    ├── hooks/                            cross-feature hooks
    │   ├── useResponsive.js              [keep]
    │   ├── useNetworkStatus.js           [new] offline banner
    │   ├── useAppState.js                [new] pause streams in background (replaces logic in useForexPrices)
    │   └── useDebounce.js                [new]
    │
    ├── services/
    │   ├── http/
    │   │   ├── client.js                 [rename] from httpClient.js, one axios instance, auth header, refresh
    │   │   ├── errors.js                 [new]
    │   │   └── interceptors.js           [new] token refresh, request IDs
    │   ├── socket/
    │   │   ├── PriceSocket.js            [new] one reconnecting socket to the price gateway
    │   │   └── subscriptions.js          [new] subscribe and unsubscribe per screen
    │   ├── storage/
    │   │   ├── cache.js                  [new] AsyncStorage cache with TTL
    │   │   └── secure.js                 [new]
    │   ├── analytics.js                  [new]
    │   └── push.js                       [new]
    │
    ├── utils/
    │   ├── weekDates.js                  [keep]
    │   ├── formatters.js                 [new] price, percent, time (replaces repeated formatPrice and formatTime)
    │   ├── technicalPatterns.js          [keep] client preview only until the server owns detection
    │   └── marketMood.js                 [remove] moves to backend mood service
    │
    └── __tests__/                        [new] mirrors src/, e.g. tools, alerts, formatters
```

### Files removed from the app (dead code or replaced)

| File | Reason |
|---|---|
| src/services/api/anthropicService.js | Replaced by aiApi.js (key was in the bundle) |
| src/services/api/freeAiService.js | Replaced by aiApi.js |
| src/services/api/finnhubService.js, twelveDataService.js, binanceService.js, newsService.js | Move to backend ingestors (section 3) |
| src/services/api/config.js | Keys removed; symbol lists move to the assets table |
| src/services/api/candleRanges.js | Keep only the range codes in features/markets; fetch params move to the server |
| src/services/api/axios.js, src/services/mt5/mt5Service.js | Empty files |
| src/components/Charts/CandlestickChart.jsx | Unused; imports a chart library not used elsewhere |
| src/screens/DashboardScreen | Unused |
| src/screens/OnboardingScreen/WelcomeScreen.jsx | Unused since Welcome moved pre-auth |
| src/screens/OnboardingScreen/OnboardingComponents/* | Duplicates of components/brand |
| src/screens/MarketsScreen/MarketsComponents/MarketDetail/* | Unused prototype screens |
| .../MarketPerformance.jsx, MarketCategory.jsx, MarketSearch.jsx, LongShortRatio.jsx, TimeframeStack.jsx, TimeRangeTabs.jsx | Unused |
| .../AI/AIAnalysisScreen.jsx and AIChatComponents/AIChatScreen.jsx | Unused or superseded by ChatScreen (route "AIAnalysis" removed from MarketsNavigator) |
| src/screens/HomeScreen/HomeComponets/MarketMapCard.jsx, MarketPressureGrid.jsx, MarketSentimentOverview.jsx | Not rendered on Home; keep only if the design brief adopts them |
| src/scripts/apply-bw-theme.js | One-time codemod; replaced by theme tokens |

## 3. Backend (backend/)

```
backend/
├── gateway/                         API gateway (auth check, rate limits, routing)
│   ├── src/{server.js,routes.js,rateLimit.js,requestId.js}
│   └── Dockerfile
├── services/
│   ├── auth/
│   │   ├── src/{routes,otp,password,social,tokens,sessions}.js
│   │   ├── migrations/
│   │   └── test/
│   ├── users/                       profile, preferences, watchlist, notes, consents, data export/delete
│   │   └── src/{profile,preferences,watchlist,notes,privacy}.js
│   ├── market-ingestor/             one connection per provider
│   │   └── src/
│   │       ├── adapters/{binance,finnhub,twelvedata}.js
│   │       ├── normalize.js
│   │       ├── publish.js           ticks to Kafka and Redis
│   │       └── failover.js
│   ├── price-gateway/               WebSocket fan-out
│   │   └── src/{server,subscriptions,throttle,auth}.js
│   ├── candles/
│   │   └── src/{routes,cache,rollup,backfill}.js
│   ├── alerts/
│   │   └── src/
│   │       ├── routes.js
│   │       ├── evaluator/{priceIndex,onTick,patterns}.js
│   │       ├── scheduler/{timeAlerts,eventAlerts}.js
│   │       └── idempotency.js
│   ├── notifications/
│   │   └── src/{queue,apns,fcm,email,quietHours,retry}.js
│   ├── news/
│   │   └── src/{ingestGdelt,dedupe,impactScore,markets,routes}.js
│   ├── mood-events/
│   │   └── src/{moodScore,calendarProvider,globalEvents,eventAnalysis,routes}.js
│   ├── ai-gateway/
│   │   └── src/
│   │       ├── routes.js            chat, event analysis, strategy analysis, speech-to-text
│   │       ├── prompts/{marketAi,assetAi,strategyCoach,eventAnalysis}.js
│   │       ├── safety.js            education-only rules, input/output checks
│   │       ├── quota.js
│   │       ├── cache.js
│   │       └── router.js            model selection
│   ├── journal/                     phase 2: strategies, rules, trades, reviews, stats
│   ├── brokers/                     phase 3: read-only MT4/MT5 connector
│   ├── billing/                     phase 6: store receipts, subscriptions
│   └── admin/                       flags, moderation, dashboards
├── libs/
│   ├── db/                          Postgres client, pooling, migration runner
│   ├── redis/
│   ├── queue/
│   ├── logger/
│   ├── tracing/
│   └── config/
├── db/
│   ├── migrations/                  one folder per table group in docs/05-backend-schema.md
│   └── seeds/assets.sql             the 29 forex pairs, crypto, stocks, indices from config.js
├── load-tests/                      [new] k6 scripts: sockets, alerts, AI saturation
└── package.json
```

## 4. How the current files map to the new structure

| Current location | New location |
|---|---|
| src/screens/AuthScreen/* | src/features/auth/ |
| src/screens/OnboardingScreen/* | src/features/onboarding/ |
| src/screens/HomeScreen/* | src/features/home/ |
| src/screens/MarketsScreen/* | src/features/markets/ (alert form to features/alerts, order ticket to features/trading, strategy panel to features/strategy) |
| src/screens/AlertsScreen/* | src/features/alerts/ |
| src/screens/CalendarScreen/* | src/features/calendar/ |
| src/screens/GlobalEventsScreen/* | src/features/events/ |
| src/screens/NewsScreen/* | src/features/news/ |
| src/screens/ChatScreen/* | src/features/chat/ |
| src/screens/SearchScreen/* | src/features/search/ |
| src/screens/MoreScreen/* | src/features/more/ |
| src/context/* | feature folders (Auth, Alerts, Watchlist) |
| src/services/api/* (providers) | backend/services/* |
| src/utils/marketMood.js | backend/services/mood-events |

## 5. Suggested migration order

1. Phase 0: create `theme/`, `components/ui/`, `components/brand/`; delete the duplicates and unused files listed above.
2. Move screens into `features/` with no logic changes (pure moves; verify the app still runs).
3. Split the large files (AssetDetailModal, AlertFormModal, MarketInfoTabs, GlobalEventsScreen, OnboardingQuestionsScreen).
4. Introduce `services/http` and `aiApi.js`; delete the provider and AI services as the backend endpoints go live.
5. Replace the three price hooks with `usePriceStream` when the price gateway is ready.
6. Add `__tests__/` alongside each move, starting with tools, alert rules and formatters.
