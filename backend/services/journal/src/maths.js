// Journal maths: positions, account summary and analytics, all computed from the user's own trades.
// Pure functions so they can be unit tested; prices come in through priceOf(sym).
import { getAsset } from '../../../db/seeds/assets.js';

const DAY = 86400_000;
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
const sizeOf = (t) => { const n = parseFloat(String(t.size ?? '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? n : 0; };

/** Dollars per 1.0 of price move per 1 unit of size. Same rule as mobile/src/features/trading/risk.js. */
export function vpu(sym, price) {
  const a = getAsset(sym);
  const cat = a?.cat;
  if (cat === 'Forex') return sym.startsWith('USD/') ? 100000 / (price || 1) : 100000;
  if (sym === 'XAU/USD') return 100;
  if (sym === 'WTI') return 1000;
  return 1;
}

export const isOpen = (t) => t.status === 'open' || (!t.status && String(t.date || '').includes('open'));
export const tradeTime = (t) => t.closedAt || t.openedAt || t.createdAt || 0;

export function pnlAt(t, price) {
  const sign = t.dir === 'Short' ? -1 : 1;
  return sign * (price - Number(t.entry)) * sizeOf(t) * vpu(t.asset, price);
}

export function riskDollars(t) {
  return Math.abs(Number(t.entry) - Number(t.stop)) * sizeOf(t) * vpu(t.asset, Number(t.entry));
}

/** Open trades valued at the latest price. */
export function positionsOf(trades, priceOf) {
  return trades.filter(isOpen).map((t) => {
    const q = priceOf(t.asset);
    const price = Number.isFinite(q) ? q : Number(t.entry);
    const a = getAsset(t.asset);
    return {
      id: 'p' + t.id, tradeId: t.id, asset: t.asset, sym: t.asset.replace('/', ''), dir: t.dir, size: sizeOf(t),
      entry: Number(t.entry), price, dec: a?.dec ?? 4, pnl: round(pnlAt(t, price)), live: Number.isFinite(q),
    };
  });
}

/** Closes a trade at `price`: exit, P&L and R multiple. */
export function closeTrade(t, price, now = Date.now()) {
  const pnl = round(pnlAt(t, price));
  const risk = riskDollars(t);
  return { ...t, status: 'closed', exit: price, pnl, r: risk > 0 ? round(pnl / risk) : 0, closedAt: now };
}

function stats(list) {
  const n = list.length;
  const wins = list.filter((t) => t.pnl > 0);
  const gross = wins.reduce((s, t) => s + t.pnl, 0);
  const loss = -list.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0);
  const avgR = n ? list.reduce((s, t) => s + (Number(t.r) || 0), 0) / n : 0;
  return {
    trades: n, winRate: n ? Math.round((wins.length / n) * 100) : 0, avgR: round(avgR),
    pnl: round(list.reduce((s, t) => s + (Number(t.pnl) || 0), 0)),
    profitFactor: loss > 0 ? round(gross / loss) : gross > 0 ? 99 : 0,
  };
}

const signedR = (v) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)}R`;
const dollars = (v) => `$${Math.round(Math.abs(v)).toLocaleString('en-US')}`;

/** Balance at the end of each of the last `days` days, oldest first. */
function equitySeries(closed, start, days, now) {
  const end = new Date(now); end.setUTCHours(23, 59, 59, 999);
  const out = []; const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const cut = end.getTime() - i * DAY;
    out.push(round(start + closed.filter((t) => tradeTime(t) <= cut).reduce((s, t) => s + (Number(t.pnl) || 0), 0)));
    dates.push(new Date(cut).toISOString().slice(0, 10));
  }
  return { equity: out, dates };
}

function maxDrawdownPct(series) {
  let peak = series[0] || 0; let worst = 0;
  for (const v of series) { peak = Math.max(peak, v); if (peak > 0) worst = Math.min(worst, ((v - peak) / peak) * 100); }
  return round(worst, 1);
}

export function accountSummary(trades, settings, priceOf, now = Date.now()) {
  const start = Number(settings?.startingBalance) || 0;
  const closed = trades.filter((t) => !isOpen(t));
  const floating = positionsOf(trades, priceOf).reduce((s, p) => s + p.pnl, 0);
  const balance = start + closed.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const since = (ms) => closed.filter((t) => tradeTime(t) >= ms).reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
  const w0 = new Date(d0); w0.setDate(w0.getDate() - ((w0.getDay() + 6) % 7));
  const m0 = new Date(d0.getFullYear(), d0.getMonth(), 1);
  const s = stats(closed);
  const { equity } = equitySeries(closed, start, 90, now);
  return {
    equity: round(balance + floating), balance: round(balance), floating: round(floating),
    day: round(since(d0.getTime()) + floating), week: round(since(w0.getTime())), month: round(since(m0.getTime())),
    drawdown: maxDrawdownPct([...equity, balance + floating]), winRate: s.winRate, profitFactor: s.profitFactor,
    openPositions: trades.filter(isOpen).length,
  };
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function groupBy(list, keyFn, order) {
  const m = new Map();
  for (const t of list) { const k = keyFn(t); if (k == null || k === '') continue; if (!m.has(k)) m.set(k, []); m.get(k).push(t); }
  const rows = [...m.entries()].map(([label, ts]) => { const s = stats(ts); return { label, trades: s.trades, winRate: s.winRate, avgR: s.avgR }; });
  return order ? rows.sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label)) : rows.sort((a, b) => b.trades - a.trades);
}
const riskBucket = (t) => { const r = Number(t.risk); if (!Number.isFinite(r)) return null; return r <= 0.75 ? '≤ 0.75%' : r <= 1 ? '1%' : '> 1%'; };

/** Same shape as the old mocks.analytics, so the Analytics screen needs no layout change. */
export function analyticsOf(trades, settings, { days = 30, now = Date.now() } = {}) {
  const start = Number(settings?.startingBalance) || 0;
  const closed = trades.filter((t) => !isOpen(t)).sort((a, b) => tradeTime(a) - tradeTime(b));
  const s = stats(closed);
  const wins = closed.filter((t) => t.pnl > 0); const losses = closed.filter((t) => t.pnl < 0);
  const maxRisk = Number(settings?.maxRisk) || 1;
  const withRisk = closed.filter((t) => Number.isFinite(Number(t.risk)));
  const on = closed.filter((t) => t.edge === 'yes'); const off = closed.filter((t) => t.edge !== 'yes');
  const edge = (list) => { const x = stats(list); return { trades: x.trades, winRate: x.winRate, avgR: x.avgR, expectancy: signedR(x.avgR), pnl: x.pnl }; };
  const { equity, dates } = equitySeries(closed, start, Math.max(2, days), now);
  return {
    sampleSize: closed.length,
    metrics: {
      winRate: s.winRate, expectancy: signedR(s.avgR), profitFactor: s.profitFactor, avgR: s.avgR,
      avgWin: dollars(wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0),
      avgLoss: dollars(losses.length ? losses.reduce((a, t) => a + t.pnl, 0) / losses.length : 0),
      maxDD: `${maxDrawdownPct(equitySeries(closed, start, 365, now).equity).toFixed(1).replace('-', '−')}%`,
      riskConsistency: `${withRisk.length ? Math.round((withRisk.filter((t) => Number(t.risk) <= maxRisk + 1e-9).length / withRisk.length) * 100) : 100}%`,
      adherence: `${closed.length ? Math.round((on.length / closed.length) * 100) : 0}%`,
    },
    equity, equityDates: dates,
    onEdge: edge(on), offEdge: edge(off),
    breakdowns: {
      Strategy: groupBy(closed, (t) => t.strategy),
      Session: groupBy(closed, (t) => t.session),
      Asset: groupBy(closed, (t) => t.asset),
      Day: groupBy(closed, (t) => DOW[new Date(tradeTime(t)).getDay()], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
      Direction: groupBy(closed, (t) => t.dir, ['Long', 'Short']),
      'Risk %': groupBy(closed, riskBucket, ['≤ 0.75%', '1%', '> 1%']),
    },
  };
}

/** Per-strategy stats, written back onto the strategies list. */
export function strategyStats(trades, strategies) {
  const closed = trades.filter((t) => !isOpen(t));
  return strategies.map((st) => {
    const s = stats(closed.filter((t) => t.strategy === st.name));
    return { ...st, stats: { trades: s.trades, winRate: s.winRate, avgR: s.avgR } };
  });
}
