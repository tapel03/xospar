import React, { createContext, useContext, useState } from 'react';
import * as M from '../mocks/mock';
import { vpu } from '../features/trading/risk';

const Ctx = createContext(null);

// Default Markets list. The user edits this from the pen on the Markets screen.
const DEFAULT_MARKETS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'XAU/USD'];

// Open positions shown on the Overview. Simulated: replace with the broker feed in production.
// dir: 'Long' = buy, 'Short' = sell. asset is set only when the market exists in the app (for opening its chart).
const SEED_POSITIONS = [
  { id: 'p1', asset: null, sym: 'EURCHF', dir: 'Short', size: 0.06, entry: 0.93074, price: 0.92611, dec: 5, pnl: 33.71 },
  { id: 'p2', asset: null, sym: 'CADJPY', dir: 'Long', size: 0.12, entry: 111.441, price: 111.742, dec: 3, pnl: 22.86 },
];

// Past AI Mentor chats (the welcome message is added by the screen, not stored here).
const SEED_CHATS = [
  {
    id: 'c1', title: 'What mistakes am I repeatedly making?', updated: 'Yesterday',
    msgs: [
      { role: 'user', text: 'What mistakes am I repeatedly making?', files: [] },
      { role: 'ai', text: 'Two patterns show up repeatedly in your last 25 trades.', bullets: ['Fair Value Gap entries: 4 trades, 1 win, −3.0R total. None of your strategies include FVG setups.', 'Trading after a loss: 3 trades opened within 10 minutes of a stop-out, all off-edge, −2.6R.'] },
    ],
  },
  {
    id: 'c2', title: 'Why am I losing during New York session?', updated: 'Mon',
    msgs: [
      { role: 'user', text: 'Why am I losing during New York session?', files: [] },
      { role: 'ai', text: 'Your New York results are weaker mainly because most of those trades are outside your written rules.', bullets: ['New York: 13 trades, 38% win rate, −0.31R average.', '9 of 13 were off-edge or partial.'] },
    ],
  },
];

// MetaTrader accounts. Simulated: replace with real broker connections.
// password is only ever kept in memory here. In production keep it in the device keychain (expo-secure-store) or on the server.
// mode: 'Investor' (read-only) or 'Master'.
const SEED_ACCOUNTS = [
  { id: 'acc1', platform: 'MT5', nickname: 'Main account', login: '5012345', server: 'Broker-Demo', mode: 'Investor', status: 'Connected', lastSync: '2 min ago', password: 'seeded' },
];

const DEFAULT_PROFILE = {
  markets: ['Forex', 'Commodities'], style: 'Day trading',
  name: 'Mpho', displayName: 'Mpho', email: 'mpho@example.com', phone: '', country: 'South Africa',
  timezone: 'SAST (UTC+2)', status: 'Active trader', experience: 'Intermediate',
};

export function StoreProvider({ children }) {
  const [alerts, setAlerts] = useState(M.alerts);
  const [trades, setTrades] = useState(M.trades);
  const [positions, setPositions] = useState(SEED_POSITIONS);
  const [marketList, setMarketList] = useState(DEFAULT_MARKETS);
  const [strategies, setStrategies] = useState(M.strategies);
  const [chats, setChats] = useState(SEED_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
  const [dismissed, setDismissed] = useState({}); // notification id -> true once dismissed
  const [settings, setSettings] = useState({
    hardRule: false, mentorIntensity: 'Balanced', tradeWarnings: true, preTradeChecks: true,
    marketAlerts: true, newsAlerts: true, eventAlerts: true,
    maxDailyLoss: 3, maxRisk: 1, maxPositions: 3, maxCorrelated: 2,
    language: 'English', plan: 'Pro', savePasswords: true,
  });
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  /** Notifications that have not been dismissed. The bell badge counts these. */
  const notifications = M.notifications.filter((n) => !dismissed[n.id]);

  /** A trade placed as "Today, open" also becomes a visible open position. */
  const openPositionFrom = (t) => {
    const a = M.assetBy(t.asset);
    const size = parseFloat(t.size);
    const sz = isFinite(size) ? size : 0;
    const sign = t.dir === 'Long' ? 1 : -1;
    return {
      id: 'p' + t.id, tradeId: t.id, asset: t.asset, sym: t.asset.replace('/', ''), dir: t.dir, size: sz,
      entry: t.entry, price: a.price, dec: a.dec, pnl: sign * (a.price - t.entry) * sz * vpu(a),
    };
  };

  /** mode: 'all' | 'win' | 'loss'. Closed positions that came from the journal are finished there too. */
  const closePositions = (mode) => {
    const hit = (p) => mode === 'all' || (mode === 'win' && p.pnl > 0) || (mode === 'loss' && p.pnl < 0);
    const closing = positions.filter(hit);
    if (!closing.length) return;
    const byTrade = Object.fromEntries(closing.filter((p) => p.tradeId).map((p) => [p.tradeId, p]));
    if (Object.keys(byTrade).length) {
      setTrades((prev) => prev.map((t) => {
        const p = byTrade[t.id];
        if (!p) return t;
        const risk$ = Math.abs(t.entry - t.stop) * parseFloat(t.size) * vpu(M.assetBy(t.asset));
        const pnl = Number(p.pnl.toFixed(2));
        return { ...t, date: 'Today, closed', exit: p.price, pnl, r: risk$ > 0 ? Number((pnl / risk$).toFixed(2)) : 0 };
      }));
    }
    setPositions((prev) => prev.filter((p) => !hit(p)));
  };

  const value = {
    alerts, trades, positions, closePositions, settings, profile, setProfile, marketList, strategies, chats, setChats, activeChatId, setActiveChatId,
    notifications,
    dismissNotification: (id) => setDismissed((d) => ({ ...d, [id]: true })),
    accounts,
    addAccount: (a) => setAccounts((p) => [...p, { id: 'acc' + Date.now(), status: 'Connected', lastSync: 'Just now', ...a }]),
    updateAccount: (id, patch) => setAccounts((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    removeAccount: (id) => setAccounts((p) => p.filter((a) => a.id !== id)),
    clearAllPasswords: () => setAccounts((p) => p.map((a) => ({ ...a, password: '' }))),
    /** Local clean-up for "Delete account". A real build also calls the backend to delete the server-side account. */
    deleteAccount: () => {
      setAccounts([]);
      setChats([]);
      setActiveChatId(null);
      setProfile({ ...DEFAULT_PROFILE, name: '', displayName: '', email: '', phone: '' });
    },
    setSetting: (k, v) => setSettings((s) => ({ ...s, [k]: v })),
    addAlert: (a) => setAlerts((p) => [{ id: 'a' + Date.now(), status: 'active', created: 'Just now', ...a }, ...p]),
    updateAlert: (id, patch) => setAlerts((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    removeAlert: (id) => setAlerts((p) => p.filter((a) => a.id !== id)),
    addTrade: (t) => {
      setTrades((p) => [t, ...p]);
      if (String(t.date).includes('open')) setPositions((p) => [openPositionFrom(t), ...p]);
    },
    addMarket: (sym) => setMarketList((p) => (p.includes(sym) ? p : [...p, sym])),
    removeMarket: (sym) => setMarketList((p) => p.filter((x) => x !== sym)),
    addStrategy: (s) => setStrategies((p) => [...p, s]),
    updateStrategy: (id, patch) => setStrategies((p) => p.map((s) => (s.id === id ? { ...s, ...patch } : s))),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);