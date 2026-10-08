# Savanai: App Flow

## 1. Launch and session routing
1. App opens and shows the Splash screen (animated face sequence).
2. The app checks for a saved session.
3. Routing decision:
   - No session: Auth flow.
   - Session but onboarding not done: Onboarding flow.
   - Session and onboarding done: Main app.

## 2. Authentication flow
| Step | Screen | Next |
|---|---|---|
| 1 | Welcome (hero image, Login, Get Started) | Login or Sign up |
| 2a | Login (email, password, Apple/Google) | Verify email (email path) or Main/Onboarding (social) |
| 2b | Sign up (email, password, confirm) | Verify email |
| 3 | Verify email (4-digit code, resend) | Onboarding (new) or Main (returning) |
| 4 | Forgot password (email) | Verify email in reset mode |
| 5 | Create new password | Login |

Target behaviour: codes are issued and checked by the server; failed attempts are limited; social sign-in is verified with the provider token.

## 3. Onboarding flow
1. Question 1: experience (Beginner, Intermediate, Advanced) with a live illustration.
2. Question 2: markets of interest (multi-select: Crypto, Indices, Forex, Stocks).
3. Question 3: main goal (six options).
4. Completion: plan summary and "Finish".
5. "Skip for now" is available at every step and goes straight to Main.
Answers are saved to the user profile and used to seed the watch list and home content.

## 4. Main app (bottom tabs)
| Tab | Purpose |
|---|---|
| Home | Top stories, Global Market Mood, Quick Tools, live prices, AI chat |
| Markets | Categories and watch list |
| Alerts | Day view of alerts, create and edit |
| Calendar | Economic events by day with filters |
| More | Profile, tools, trading hub, settings |

## 5. Key journeys

### 5.1 Check the market mood
Home, Global Market Mood card, "View Global Events", Global Events (Live Map, List, Insights), tap an event, "View full analysis", "Why is the market moving?" (AI Analysis and Related News tabs).

### 5.2 Research an asset
Markets (or Home search), category, asset row, Asset detail sheet. In the sheet the user can:
- Change timeframe and chart type, or expand to full screen.
- Swipe to the next or previous asset in the list.
- Read the Order Book, History, Notes, Info and AI Assistant tabs.
- Open Strategy Coach, enter rules by text, file, image or voice, and request analysis.
- Turn on Live Pattern Alerts.
- Tap the bell to create an alert, or Buy/Sell to open the order ticket.

### 5.3 Create an alert
Entry points: asset bell, Alerts tab "+", Calendar event page, news card bell.
1. The form adapts to context: symbol, event or news story.
2. User picks the alert type and optional target price or lead time.
3. Optional day/time and repeat settings.
4. Save, then a confirmation message.
5. When the condition is met the server sends a push; tapping it opens the asset or event.
6. The alert appears in the day list; the user can acknowledge, edit or delete it.

### 5.4 Economic event
Calendar, pick a date or week, filter by impact and currency, tap an event, Event Detail (actual, forecast, previous, result), "Create Alert" or "Expand Analysis".

### 5.5 Use the calculators
Home Quick Tools or More, Tools, choose a calculator (Position Size, Risk/Reward, Pip, Lot Size), enter values, see results with an education-only notice.

### 5.6 Ask the AI
Home floating button, Chat. Landing shows suggestion chips; a message switches to the conversation view. Voice capture is recorded but not yet transcribed (to be built with a speech-to-text service).

### 5.7 Place an order (simulated at launch)
Asset detail, Buy or Sell, order ticket (lot size, SL, TP), Confirm tab, slide to confirm, confirmation message. At launch this is a paper-trading simulation and must be labelled as such.

### 5.8 Sign out
More, Profile, Log Out, back to the Auth flow.

## 6. Error and empty states
| Situation | Behaviour |
|---|---|
| No internet | Cached data with an "offline" banner; retry button |
| Provider outage | "Data delayed" label on the affected asset |
| Chart data missing | "Chart data isn't available for this asset yet" |
| No alerts for a day | Empty state with a prompt to create one |
| AI quota reached | Clear message with reset time and upgrade option |
| Failed sign-in | Specific, non-revealing error and a recovery link |

## 7. Notifications
- Alert triggered, event starting soon, high-impact news on a watched asset.
- User controls per type in Settings, with quiet hours.
