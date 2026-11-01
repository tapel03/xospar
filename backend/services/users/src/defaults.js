import { SAMPLE } from './sampleData.js';

export const COLLECTIONS = ['trades', 'alerts', 'strategies', 'chats', 'accounts', 'notifications', 'alertHistory'];
export const MAX_DOCS_PER_COLLECTION = 5000;

export const DEFAULT_WATCHLIST = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'XAU/USD'];

export const DEFAULT_SETTINGS = {
  hardRule: false, mentorIntensity: 'Balanced', tradeWarnings: true, preTradeChecks: true,
  marketAlerts: true, newsAlerts: true, eventAlerts: true,
  maxDailyLoss: 3, maxRisk: 1, maxPositions: 3, maxCorrelated: 2,
  language: 'English', plan: 'Pro', savePasswords: true,
  startingBalance: 10000,   // account balance before the first journal trade; equity curves start here
};

export const DEFAULT_PROFILE = {
  markets: [], styles: [], style: '', experience: '', struggles: [],
  name: '', displayName: '', email: '', phone: '', country: '', timezone: '', status: 'Active trader',
  onboarded: false,
};

/** Fills a new account. With sample data the app looks exactly as it did on mock data, but every record is real and editable. */
export function seedUser(db, userId, { sample }) {
  db.kv.set(userId, 'settings', { ...DEFAULT_SETTINGS, ...(sample ? { startingBalance: 47380.04 } : {}) });
  db.kv.set(userId, 'profile', DEFAULT_PROFILE);
  db.kv.set(userId, 'watchlist', DEFAULT_WATCHLIST);
  // Strategies are useful templates even without the sample journal.
  SAMPLE.strategies.forEach((s, i) => db.docs.put(userId, 'strategies', s, Date.now() - i));
  if (!sample) return;

  const now = Date.now();
  const ref = now - 24 * 3600_000;   // newest sample trade closed yesterday
  SAMPLE.trades.forEach((t) => {
    const { ageMin, ...rest } = t;
    const closedAt = ref - ageMin * 60_000;
    db.docs.put(userId, 'trades', { ...rest, openedAt: closedAt - 90 * 60_000, closedAt, sample: true }, closedAt);
  });
  SAMPLE.alerts.forEach((a, i) => db.docs.put(userId, 'alerts', { ...a, createdAt: now - (i + 1) * 3600_000, sample: true }, now - i));
  SAMPLE.alertHistory.forEach((h, i) => db.docs.put(userId, 'alertHistory', { id: `h${i + 1}`, ...h, sample: true }, now - i * 86400_000));
  db.docs.put(userId, 'notifications', {
    id: 'welcome', sev: 'Medium', icon: 'info', cat: 'Events', title: 'Your journal is live',
    text: 'Trades, alerts and strategies now save to your account. The sample trades can be deleted any time.',
    createdAt: now, cta: { label: 'Open journal', go: ['Main', { tab: 'journal' }] },
  }, now);
}

export const TRADE_CONTEXT = SAMPLE.tradeContext;
