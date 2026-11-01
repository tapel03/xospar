import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as M from '../mocks/mock';
import { vpu } from '../features/trading/risk';
import { featureFlags } from './config';
import { userApi } from '../services/userApi';
import { loadToken, saveToken } from '../services/session';
import { cache } from '../services/cache';
import { setUnauthorizedHandler } from '../services/http/client';
import { useAppState } from '../hooks/useAppState';

const Ctx = createContext(null);

/*
 * App state. With the backend on (the default) everything here is loaded from and saved to the
 * user's account on the server: journal, positions, alerts, strategies, mentor chats, broker
 * accounts, notifications, profile, settings and the Markets list. Each change is applied on
 * screen at once and saved in the background.
 *
 * A copy of all of it is also kept on the device (the "snapshot"). On start the snapshot is loaded first, so the
 * app has real data before the server answers and still has it when there is no internet.
 * `ready` turns true once there is something to show (the snapshot, or the server's answer). Screens show
 * skeletons until then.
 *
 * If the backend cannot be reached the app runs on the saved snapshot (or the bundled sample data when
 * there is none), and nothing new is saved (sync.status === 'offline').
 */

// Default Markets list. The user edits this from the pen on the Markets screen.
const DEFAULT_MARKETS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'XAU/USD'];

// Offline only: simulated broker positions and past chats.
const SEED_POSITIONS = [
  { id: 'p1', asset: null, sym: 'EURCHF', dir: 'Short', size: 0.06, entry: 0.93074, price: 0.92611, dec: 5, pnl: 33.71 },
  { id: 'p2', asset: null, sym: 'CADJPY', dir: 'Long', size: 0.12, entry: 111.441, price: 111.742, dec: 3, pnl: 22.86 },
];
const SEED_CHATS = [
  {
    id: 'c1', title: 'What mistakes am I repeatedly making?', updated: 'Yesterday',
    msgs: [
      { role: 'user', text: 'What mistakes am I repeatedly making?', files: [] },
      { role: 'ai', text: 'Two patterns show up repeatedly in your last 25 trades.', bullets: ['Fair Value Gap entries: 4 trades, 1 win, −3.0R total. None of your strategies include FVG setups.', 'Trading after a loss: 3 trades opened within 10 minutes of a stop-out, all off-edge, −2.6R.'] },
    ],
  },
];
// password is only ever kept in memory on the device; the server never receives it.
const SEED_ACCOUNTS = [
  { id: 'acc1', platform: 'MT5', nickname: 'Main account', login: '5012345', server: 'Broker-Demo', mode: 'Investor', status: 'Connected', lastSync: '2 min ago', password: 'seeded' },
];
const DEFAULT_PROFILE = {
  markets: ['Forex', 'Commodities'], style: 'Day trading',
  name: 'Mpho', displayName: 'Mpho', email: 'mpho@example.com', phone: '', country: 'South Africa',
  timezone: 'SAST (UTC+2)', status: 'Active trader', experience: 'Intermediate',
};
const DEFAULT_SETTINGS = {
  hardRule: false, mentorIntensity: 'Balanced', tradeWarnings: true, preTradeChecks: true,
  marketAlerts: true, newsAlerts: true, eventAlerts: true,
  maxDailyLoss: 3, maxRisk: 1, maxPositions: 3, maxCorrelated: 2,
  language: 'English', plan: 'Pro', savePasswords: true,
};

const SNAPSHOT_KEY = 'snapshot';
const SNAPSHOT_VERSION = 1;

/* ---------------- labels made from server timestamps ---------------- */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');
const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayMon = (d) => `${pad(d.getDate())} ${MON[d.getMonth()]}`;
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** "14:02" today, "Yesterday", "Mon" this week, else "28 Sep". */
export function whenLabel(ms) {
  if (!ms) return '';
  const d = new Date(ms); const now = new Date();
  if (sameDay(d, now)) return hm(d);
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (sameDay(d, y)) return 'Yesterday';
  if (now - d < 6 * 86400000) return DOW[d.getDay()];
  return dayMon(d);
}
const createdLabel = (ms) => { const w = whenLabel(ms); return /^\d\d:\d\d$/.test(w) ? `Today ${w}` : w; };

/** Journal screens read t.date ("01 Oct 09:42", "Today, open"). Made from the server's timestamps. */
function withTradeLabel(t) {
  if (t.status === 'open') {
    const d = new Date(t.openedAt || Date.now());
    return { ...t, date: sameDay(d, new Date()) ? 'Today, open' : `${dayMon(d)}, open` };
  }
  const d = new Date(t.closedAt || t.openedAt || t.createdAt || Date.now());
  return { ...t, date: `${dayMon(d)} ${hm(d)}` };
}
const fmtCurrent = (sym) => { try { return M.fmtPrice(sym, M.assetBy(sym).price); } catch { return '—'; } };
const withAlertLabels = (a) => ({ ...a, current: fmtCurrent(a.asset), created: a.created || createdLabel(a.createdAt) });
const withNoteLabel = (n) => ({ ...n, time: whenLabel(n.createdAt) || n.time || '' });
const withChatLabel = (ch) => ({ ...ch, updated: ch.updatedAt ? (whenLabel(ch.updatedAt).includes(':') ? 'Today' : whenLabel(ch.updatedAt)) : ch.updated || 'Just now' });
const withHistoryLabel = (h) => ({ ...h, date: h.ts ? `${dayMon(new Date(h.ts))} ${hm(new Date(h.ts))}` : h.date });

export function StoreProvider({ children }) {
  const [alerts, setAlerts] = useState(M.alerts);
  const [alertHistory, setAlertHistory] = useState(M.alertHistory);
  const [trades, setTradesState] = useState(M.trades);
  const [positions, setPositions] = useState(SEED_POSITIONS);
  const [account, setAccount] = useState(M.account);
  const [analytics, setAnalytics] = useState(null);   // null = use the sample analytics
  const [marketList, setMarketList] = useState(DEFAULT_MARKETS);
  const [strategies, setStrategies] = useState(M.strategies);
  const [chats, setChatsState] = useState(SEED_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);
  const [accounts, setAccounts] = useState(SEED_ACCOUNTS);
  const [notes, setNotes] = useState(M.notifications);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [profile, setProfileState] = useState(DEFAULT_PROFILE);
  const [user, setUser] = useState(null);
  const [sync, setSync] = useState({ status: featureFlags.useBackend ? 'loading' : 'offline', error: null });
  const [hydrated, setHydrated] = useState(false);   // the saved copy on the device has been read
  const [hasSaved, setHasSaved] = useState(false);   // ...and there was one

  const online = sync.status === 'live';
  // Something real (or deliberately sample) can be shown: saved data, or the server has answered.
  const ready = hydrated && (hasSaved || sync.status !== 'loading');
  const onlineRef = useRef(false);
  onlineRef.current = online;
  const chatsRef = useRef(chats);
  const tradesRef = useRef(trades);
  const passwords = useRef({});   // broker account id -> password, device memory only

  /** Runs a save in the background. Failures are reported in sync.error, the screen keeps the change. */
  const save = useCallback((fn) => {
    if (!onlineRef.current) return Promise.resolve(null);
    return fn().catch((err) => { setSync((s) => ({ ...s, error: err.message })); return null; });
  }, []);

  /* ---------------- the copy saved on the device ---------------- */

  // Read it once, before anything else, so the app has data to show while the server is still answering.
  useEffect(() => {
    let live = true;
    (async () => {
      const s = await cache.get(SNAPSHOT_KEY);
      if (!live) return;
      // If the server already answered first, its data is newer: leave it alone.
      if (s && s.v === SNAPSHOT_VERSION && !onlineRef.current) {
        if (s.user) setUser(s.user);
        if (s.profile) setProfileState(s.profile);
        if (s.settings) setSettings({ ...DEFAULT_SETTINGS, ...s.settings });
        if (s.marketList && s.marketList.length) setMarketList(s.marketList);
        if (s.trades) { tradesRef.current = s.trades; setTradesState(s.trades); }
        if (s.positions) setPositions(s.positions);
        if (s.account) setAccount(s.account);
        if (s.analytics !== undefined) setAnalytics(s.analytics);
        if (s.strategies) setStrategies(s.strategies);
        if (s.alerts) setAlerts(s.alerts);
        if (s.alertHistory) setAlertHistory(s.alertHistory);
        if (s.notes) setNotes(s.notes);
        if (s.chats) { chatsRef.current = s.chats; setChatsState(s.chats); }
        if (s.accounts) setAccounts(s.accounts.map((a) => ({ ...a, password: passwords.current[a.id] || '' })));
        setHasSaved(true);
      }
      setHydrated(true);
    })();
    return () => { live = false; };
  }, []);

  // Keep the saved copy up to date while online. Only real server data is saved, never the offline sample data.
  useEffect(() => {
    if (!online) return undefined;
    const t = setTimeout(() => {
      cache.set(SNAPSHOT_KEY, {
        v: SNAPSHOT_VERSION, user, profile, settings, marketList, trades, positions, account, analytics, strategies, alerts, alertHistory, notes, chats,
        accounts: accounts.map(({ password, ...rest }) => rest),   // passwords never leave memory
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [online, user, profile, settings, marketList, trades, positions, account, analytics, strategies, alerts, alertHistory, notes, chats, accounts]);

  /* ---------------- loading from the server ---------------- */

  const apply = useCallback((me) => {
    setUser(me.user || null);
    setProfileState({ ...me.profile });
    setSettings({ ...DEFAULT_SETTINGS, ...me.settings });
    setMarketList(me.watchlist?.length ? me.watchlist : DEFAULT_MARKETS);
    const t = (me.trades || []).map(withTradeLabel);
    tradesRef.current = t; setTradesState(t);
    setPositions(me.positions || []);
    setAccount(me.account || M.account);
    setStrategies(me.strategies || []);
    setAlerts((me.alerts || []).map(withAlertLabels));
    setAlertHistory((me.alertHistory || []).map(withHistoryLabel));
    setNotes((me.notifications || []).map(withNoteLabel));
    const ch = (me.chats || []).map(withChatLabel);
    chatsRef.current = ch; setChatsState(ch);
    setAccounts((me.accounts || []).map((a) => ({ ...a, password: passwords.current[a.id] || '' })));
  }, []);

  const newDeviceSession = useCallback(async () => {
    try { const s = await userApi.deviceSession(); await saveToken(s.token); return true; } catch { return false; }
  }, []);

  const refreshAnalytics = useCallback(() => save(async () => setAnalytics(await userApi.analytics(30))), [save]);

  const boot = useCallback(async () => {
    if (!featureFlags.useBackend) return;
    try {
      if (!(await loadToken()) && !(await newDeviceSession())) throw new Error('Could not reach the server');
      const me = await userApi.me();
      apply(me);
      onlineRef.current = true;
      setSync({ status: 'live', error: null });
      userApi.analytics(30).then(setAnalytics).catch(() => {});
    } catch (err) {
      setSync({ status: 'offline', error: err.message });
    }
  }, [apply, newDeviceSession]);

  useEffect(() => {
    setUnauthorizedHandler(newDeviceSession);
    boot();
  }, [boot, newDeviceSession]);

  // Live parts: open P&L, balance, alerts that fired and their notifications.
  const appState = useAppState();
  useEffect(() => {
    if (!online || appState !== 'active') return undefined;
    const tick = async () => {
      try {
        const [pos, acc, al, nt] = await Promise.all([userApi.positions(), userApi.account(), userApi.list('alerts'), userApi.list('notifications')]);
        setPositions(pos.items); setAccount(acc);
        setAlerts(al.items.map(withAlertLabels)); setNotes(nt.items.map(withNoteLabel));
      } catch { /* next tick */ }
    };
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, [online, appState]);

  const refreshMoney = useCallback(() => save(async () => {
    const [pos, acc] = await Promise.all([userApi.positions(), userApi.account()]);
    setPositions(pos.items); setAccount(acc);
  }), [save]);

  /* ---------------- trades and positions ---------------- */

  const setTrades = (next) => { tradesRef.current = next; setTradesState(next); };

  /** Offline: a trade placed as "Today, open" also becomes a visible open position. */
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

  const addTrade = (t) => {
    const local = online ? withTradeLabel({ ...t, status: String(t.date).includes('open') ? 'open' : 'closed', openedAt: Date.now() }) : t;
    setTrades([local, ...tradesRef.current]);
    if (!online) {
      if (String(t.date).includes('open')) setPositions((p) => [openPositionFrom(t), ...p]);
      return;
    }
    save(async () => {
      const saved = withTradeLabel(await userApi.create('trades', t));
      setTrades(tradesRef.current.map((x) => (x.id === saved.id ? saved : x)));
      await refreshMoney();
      refreshAnalytics();
    });
  };

  const updateTrade = (id, patch) => {
    setTrades(tradesRef.current.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    save(async () => {
      const saved = withTradeLabel(await userApi.update('trades', id, patch));
      setTrades(tradesRef.current.map((x) => (x.id === id ? saved : x)));
      refreshAnalytics();
    });
  };

  const removeTrade = (id) => {
    setTrades(tradesRef.current.filter((t) => t.id !== id));
    setPositions((p) => p.filter((x) => x.tradeId !== id));
    save(async () => { await userApi.remove('trades', id); await refreshMoney(); refreshAnalytics(); });
  };

  /** mode: 'all' | 'win' | 'loss'. Closed positions that came from the journal are finished there too. */
  const closePositions = (mode) => {
    if (online) {
      return save(async () => {
        const { closed } = await userApi.closePositions(mode);
        if (!closed.length) return;
        const byId = Object.fromEntries(closed.map((t) => [t.id, withTradeLabel(t)]));
        setTrades(tradesRef.current.map((t) => byId[t.id] || t));
        await refreshMoney();
        refreshAnalytics();
      });
    }
    const hit = (p) => mode === 'all' || (mode === 'win' && p.pnl > 0) || (mode === 'loss' && p.pnl < 0);
    const closing = positions.filter(hit);
    if (!closing.length) return undefined;
    const byTrade = Object.fromEntries(closing.filter((p) => p.tradeId).map((p) => [p.tradeId, p]));
    if (Object.keys(byTrade).length) {
      setTrades(tradesRef.current.map((t) => {
        const p = byTrade[t.id];
        if (!p) return t;
        const risk$ = Math.abs(t.entry - t.stop) * parseFloat(t.size) * vpu(M.assetBy(t.asset));
        const pnl = Number(p.pnl.toFixed(2));
        return { ...t, date: 'Today, closed', exit: p.price, pnl, r: risk$ > 0 ? Number((pnl / risk$).toFixed(2)) : 0 };
      }));
    }
    setPositions((prev) => prev.filter((p) => !hit(p)));
    return undefined;
  };

  /* ---------------- chats: saved whole after each change ---------------- */

  const setChats = (u) => {
    const prev = chatsRef.current;
    const next = typeof u === 'function' ? u(prev) : u;
    chatsRef.current = next;
    setChatsState(next);
    if (!online) return;
    const before = new Map(prev.map((c) => [c.id, c]));
    const ids = new Set(next.map((c) => c.id));
    for (const ch of next) if (before.get(ch.id) !== ch) save(() => userApi.upsert('chats', ch.id, ch));
    for (const ch of prev) if (!ids.has(ch.id)) save(() => userApi.remove('chats', ch.id));
  };

  /* ---------------- profile and settings ---------------- */

  const profileTimer = useRef(null);
  const setProfile = (p) => {
    const next = typeof p === 'function' ? p(profile) : p;
    setProfileState(next);
    clearTimeout(profileTimer.current);   // onboarding taps change it quickly; save once they pause
    profileTimer.current = setTimeout(() => save(() => userApi.patchProfile(next)), 600);
  };

  const setSetting = (k, v) => {
    setSettings((s) => ({ ...s, [k]: v }));
    save(async () => {
      await userApi.patchSettings({ [k]: v });
      if (k === 'startingBalance' || k === 'maxRisk') { refreshMoney(); refreshAnalytics(); }
    });
  };

  /* ---------------- generic collection helpers ---------------- */

  const crud = (coll, setter, label = (x) => x) => ({
    add: (doc) => {
      const local = label({ createdAt: Date.now(), ...doc });
      setter((p) => [local, ...p]);
      save(async () => { const saved = label(await userApi.create(coll, doc)); setter((p) => p.map((x) => (x.id === saved.id ? saved : x))); });
    },
    update: (id, patch) => {
      setter((p) => p.map((x) => (x.id === id ? label({ ...x, ...patch }) : x)));
      save(async () => { const saved = label(await userApi.update(coll, id, patch)); setter((p) => p.map((x) => (x.id === id ? saved : x))); });
    },
    remove: (id) => { setter((p) => p.filter((x) => x.id !== id)); save(() => userApi.remove(coll, id)); },
  });
  const alertOps = crud('alerts', setAlerts, withAlertLabels);
  const strategyOps = crud('strategies', setStrategies);

  const notifications = notes;

  const value = {
    // state
    user, sync, ready, alerts, alertHistory, trades, positions, account, analytics, settings, profile, marketList, strategies,
    chats, activeChatId, accounts, notifications,
    // session
    reload: boot,
    // journal
    addTrade, updateTrade, removeTrade, closePositions,
    clearSampleData: () => {
      setTrades(tradesRef.current.filter((t) => !t.sample));
      setAlerts((p) => p.filter((a) => !a.sample));
      setAlertHistory((p) => p.filter((h) => !h.sample));
      save(async () => {
        await Promise.all(['trades', 'alerts', 'alertHistory'].map((c) => userApi.clear(c, { sampleOnly: true })));
        const me = await userApi.me();
        setSettings({ ...DEFAULT_SETTINGS, ...me.settings });
        await refreshMoney(); refreshAnalytics();
      });
    },
    // profile, settings, watchlist
    setProfile, setSetting,
    addMarket: (sym) => setMarketList((p) => { if (p.includes(sym)) return p; const n = [...p, sym]; save(() => userApi.putWatchlist(n)); return n; }),
    removeMarket: (sym) => setMarketList((p) => { const n = p.filter((x) => x !== sym); save(() => userApi.putWatchlist(n)); return n; }),
    // mentor
    setChats, setActiveChatId,
    // notifications
    dismissNotification: (id) => { setNotes((p) => p.filter((n) => n.id !== id)); save(() => userApi.remove('notifications', id)); },
    dismissAllNotifications: () => { setNotes([]); save(() => userApi.clear('notifications')); },
    // broker accounts (password stays on the device)
    addAccount: (a) => {
      const id = 'acc' + Date.now();
      if (a.password) passwords.current[id] = a.password;
      const doc = { id, status: 'Connected', lastSync: 'Just now', ...a };
      setAccounts((p) => [...p, doc]);
      save(() => userApi.create('accounts', doc));
    },
    updateAccount: (id, patch) => {
      if (patch.password !== undefined) passwords.current[id] = patch.password;
      setAccounts((p) => p.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      save(() => userApi.update('accounts', id, patch));
    },
    removeAccount: (id) => { delete passwords.current[id]; setAccounts((p) => p.filter((a) => a.id !== id)); save(() => userApi.remove('accounts', id)); },
    clearAllPasswords: () => { passwords.current = {}; setAccounts((p) => p.map((a) => ({ ...a, password: '' }))); },
    /** Deletes the account on the server too, then starts a fresh one. */
    deleteAccount: async () => {
      passwords.current = {};
      setAccounts([]);
      setChats([]);
      setActiveChatId(null);
      setProfileState({ ...DEFAULT_PROFILE, name: '', displayName: '', email: '', phone: '' });
      cache.remove(SNAPSHOT_KEY);
      cache.remove('news');
      cache.remove('calendar');
      if (!onlineRef.current) return;
      try { await userApi.deleteMe(); } catch { /* the server may already have dropped it */ }
      await saveToken(null);
      await boot();
    },
    // alerts and strategies
    addAlert: (a) => alertOps.add({ id: 'a' + Date.now(), status: 'active', ...a }),
    updateAlert: alertOps.update,
    removeAlert: alertOps.remove,
    addStrategy: (s) => { setStrategies((p) => [...p, s]); save(() => userApi.create('strategies', s)); },
    updateStrategy: strategyOps.update,
    removeStrategy: strategyOps.remove,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);