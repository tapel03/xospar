Here's an admin feature list based on what Edgeline does and the backend plan (`admin/` is already listed there for flags and moderation). I've grouped it by area and marked what I'd build first.

## Must have for launch

**Users and accounts**
- Search and filter users by email, name, plan, signup date and status
- User profile view: plan, connected brokers, settings, last active, device and platform
- Suspend, reactivate and delete accounts, and handle data-deletion requests
- Force logout and session management
- Impersonate a user in read-only mode to reproduce their problem, with every use logged

**Events map content**
- Create, edit and archive map events (title, location, severity, category, time window)
- Edit the transmission chain, affected assets, latest updates and historical comparisons
- Draw or upload region shapes for the shaded areas (your `regions.js` is hand-drawn today)
- Review and approve events before they go live, and pin or expire them

**Market and data health**
- Asset catalogue: add, edit or disable symbols, set decimals, category and trading hours
- Status of the data feeds (Binance, Finnhub, Twelve Data, GDELT) with last tick time, latency and errors
- Manual override or pause for a bad feed

**Feature flags and app config**
- Turn features on or off, globally or per plan, for example Hard rule, the map or the AI mentor
- Gradual rollouts by percentage of users
- Maintenance mode banner and a minimum app version prompt

**Audit log**
- A record of every admin action: who, what, when and before/after values

## Should have soon after

**AI mentor controls**
- Usage and quota per user and per plan, with cost tracking
- Edit the system prompt and mentor presets with versioning and rollback
- Flag or review reported answers, and browse anonymised conversations only where users have consented
- Blocklist and safety rules, plus the disclaimer text

**News and calendar**
- Review ingested news, hide or re-score stories, and edit relevance and tags
- Manage the economic calendar, correcting or adding events and impact levels

**Alerts and notifications**
- Alert evaluator health: queue size, triggers per hour, failed deliveries
- Send broadcast or targeted push notifications and in-app announcements
- Templates, quiet-hours rules and a delivery log

**Billing**
- Subscriptions and plan changes from RevenueCat, with refunds, trials, comps and promo codes
- Revenue dashboard covering MRR, churn and trial conversion

**Support**
- Ticket inbox linked to the user profile
- Canned replies and a bug-report inbox with attached logs

## Later

**Analytics**
- Active users, retention, onboarding drop-off by step, and feature usage
- Which strategies, setups and markets users pick, in aggregate only
- Funnel from signup to first trade logged

**Moderation and compliance**
- Consent records, privacy requests and data exports
- Abuse detection, rate-limit overrides and IP or device blocks
- Terms and disclaimer version tracking

**Brokers**
- Connection status, failed syncs and a re-sync trigger per user

**Team and permissions**
- Admin roles: Super admin, Support, Content editor and Analyst
- Two-factor authentication required for admins, plus an IP allowlist
- Approval for sensitive actions such as deletions and bulk notifications

## Suggestions
- Put the admin in a separate web dashboard rather than inside the Expo app. It's mostly tables, forms and charts, and a web app suits that better.
- Give admins the least access they need. Support shouldn't see trade data unless the user opens a ticket and allows it.
- Show journals and chats in aggregate wherever you can. They're personal financial data.

I can turn this into a screen-by-screen spec or the `admin` API modules, or mock up the dashboard in the app's current style. Which would you like?