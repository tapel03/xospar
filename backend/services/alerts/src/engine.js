// Price-alert engine. Watches the price bus and fires the user's own alerts ("Enters zone",
// "Crosses above" ...). A fired alert becomes a notification and an alert-history row.
// Active alerts also register demand on the bus, so Twelve Data polls their symbols even when
// no app has that market open.
import { getAsset } from '../../../db/seeds/assets.js';

const DASH = /\s*[–—-]\s*/;
const num = (s) => Number(String(s).replace(/,/g, '').trim());

/** "1.1650–1.1660" -> {lo, hi}; "2,700.00" -> {level}. Null when the target is not a price. */
export function parseTarget(target) {
  const s = String(target ?? '').trim();
  if (!s || s === '—') return null;
  const parts = s.split(DASH).filter(Boolean);
  if (parts.length === 2) {
    const [a, b] = parts.map(num);
    if (Number.isFinite(a) && Number.isFinite(b)) return { lo: Math.min(a, b), hi: Math.max(a, b) };
  }
  const v = num(s);
  return Number.isFinite(v) ? { level: v } : null;
}

/** Did the move from prev to price satisfy the condition? prev may be null on the first tick. */
export function conditionMet(condition, t, prev, price) {
  const c = String(condition || '').toLowerCase();
  if (t.lo !== undefined) {
    const inside = (p) => p >= t.lo && p <= t.hi;
    if (c.startsWith('exits')) return prev !== null && inside(prev) && !inside(price);
    // enters / returns to zone / range
    return prev !== null ? !inside(prev) && inside(price) : false;
  }
  const L = t.level;
  if (prev === null) return false;
  if (c.includes('above')) return prev < L && price >= L;
  if (c.includes('below')) return prev > L && price <= L;
  // reaches / breaks / returns to level: touched from either side
  return (prev < L && price >= L) || (prev > L && price <= L) || price === L;
}

const fmt = (sym, p) => { const d = getAsset(sym)?.dec ?? 4; return Number(p).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
const REPEAT_COOLDOWN_MS = 15 * 60_000;

/** End of the alert's life as a timestamp, from the sheet's "Today" / "This week" / "Until cancelled". */
export function expiryFor(expires, from = Date.now()) {
  const d = new Date(from);
  if (expires === 'Today') { d.setHours(23, 59, 59, 999); return d.getTime(); }
  if (expires === 'This week') { d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); d.setHours(17, 0, 0, 0); return d.getTime() < from ? d.getTime() + 7 * 86400_000 : d.getTime(); }
  return null;
}

export function createAlertEngine({ db, bus, logger, onFire }) {
  const watched = new Map();   // alertKey -> { userId, alert, target, prev }
  const key = (userId, id) => `${userId}|${id}`;
  const demand = new Map();    // sym -> count we added

  const addDemand = (sym) => { demand.set(sym, (demand.get(sym) || 0) + 1); bus.addDemand(sym); };
  const dropDemand = (sym) => { const n = demand.get(sym) || 0; if (n > 0) { bus.removeDemand(sym); if (n === 1) demand.delete(sym); else demand.set(sym, n - 1); } };

  function track(userId, alert) {
    untrack(userId, alert.id);
    if (alert.type !== 'my' || alert.status !== 'active') return;
    const target = parseTarget(alert.target);
    if (!target || !getAsset(alert.asset)) return;
    const last = bus.get(alert.asset)?.price;
    watched.set(key(userId, alert.id), { userId, alert, target, prev: Number.isFinite(last) ? last : null });
    addDemand(alert.asset);
  }
  function untrack(userId, id) {
    const k = key(userId, id); const w = watched.get(k);
    if (w) { watched.delete(k); dropDemand(w.alert.asset); }
  }

  function fire(w, price, now) {
    const { userId, alert } = w;
    const at = fmt(alert.asset, price);
    const next = alert.repeat
      ? { ...alert, lastFiredAt: now, triggeredAt: at, fired: (alert.fired || 0) + 1 }
      : { ...alert, status: 'triggered', triggeredAt: at, triggeredTs: now };
    db.docs.put(userId, 'alerts', next);
    const zone = w.target.lo !== undefined;
    const note = {
      id: `n${now}${Math.floor(Math.random() * 1000)}`, sev: alert.priority === 'High' ? 'High' : 'Medium', icon: 'bell', cat: 'Market',
      title: `${alert.asset}: ${alert.label || 'price alert'}`,
      text: alert.strategy ? `${alert.asset} has entered your ${alert.strategy} ${zone ? 'zone' : 'level'} at ${at}.` : `${alert.asset} ${String(alert.condition).toLowerCase()} ${alert.target} (now ${at}).`,
      createdAt: now, alertId: alert.id, cta: { label: 'Open chart', go: ['AssetDetail', { sym: alert.asset }] },
    };
    db.docs.put(userId, 'notifications', note, now);
    db.docs.put(userId, 'alertHistory', {
      id: `h${now}`, date: new Date(now).toISOString(), ts: now, asset: alert.asset, type: 'My alert',
      condition: `${alert.condition} ${alert.target}`, price: at, after: 'Pending', trade: '—',
    }, now);
    if (alert.repeat) w.alert = next; else untrack(userId, alert.id);
    onFire?.(userId, note, next);
    logger?.info(`alert fired: ${alert.asset} ${alert.condition} ${alert.target} @ ${at}`);
  }

  function onTick(q) {
    if (!Number.isFinite(q.price)) return;
    const now = Date.now();
    for (const w of [...watched.values()]) {
      if (w.alert.asset !== q.sym) continue;
      const exp = w.alert.expiresAt;
      if (exp && now > exp) {
        db.docs.put(w.userId, 'alerts', { ...w.alert, status: 'expired' });
        untrack(w.userId, w.alert.id);
        continue;
      }
      const cooling = w.alert.repeat && w.alert.lastFiredAt && now - w.alert.lastFiredAt < REPEAT_COOLDOWN_MS;
      if (!cooling && conditionMet(w.alert.condition, w.target, w.prev, q.price)) fire(w, q.price, now);
      w.prev = q.price;
    }
  }

  // Load everyone's active alerts once at start-up.
  for (const { userId, doc } of db.docs.everyUser('alerts')) track(userId, doc);
  const off = bus.subscribe(onTick);

  return {
    track, untrack,
    untrackUser(userId) { for (const w of [...watched.values()]) if (w.userId === userId) untrack(userId, w.alert.id); },
    size: () => watched.size,
    stop() { off(); for (const w of [...watched.values()]) untrack(w.userId, w.alert.id); },
  };
}
