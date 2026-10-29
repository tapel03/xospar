// In-process price bus: latest snapshot per symbol + subscriber callbacks.
// This is the seam where Redis pub/sub or Kafka would plug in when the ingestor is split out.
export function createBus() {
  const snapshot = new Map();
  const listeners = new Set();
  const demand = new Map(); // sym -> subscriber count

  return {
    /** Merge a (possibly partial) quote into the snapshot and notify listeners. */
    publish(quote) {
      const prev = snapshot.get(quote.sym) || {};
      const next = { ...prev, ...Object.fromEntries(Object.entries(quote).filter(([, v]) => v !== null && v !== undefined)) };
      snapshot.set(quote.sym, next);
      for (const fn of listeners) fn(next);
      return next;
    },
    /** Apply a bare trade price (e.g. a Finnhub tick) on top of the last known quote. */
    publishPrice(sym, price, ts, source) {
      const prev = snapshot.get(sym);
      const base = prev?.previousClose ?? null;
      const change = base !== null ? price - base : prev?.change ?? null;
      const percentChange = base ? (change / base) * 100 : prev?.percentChange ?? null;
      return this.publish({ sym, price, change, percentChange, ts: ts || Date.now(), source });
    },
    get: (sym) => snapshot.get(sym) || null,
    getMany: (syms) => syms.map((s) => snapshot.get(s)).filter(Boolean),
    all: () => [...snapshot.values()],
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    // demand tracking lets pollers fetch only what someone is watching
    addDemand(sym) { demand.set(sym, (demand.get(sym) || 0) + 1); },
    removeDemand(sym) { const n = (demand.get(sym) || 0) - 1; if (n <= 0) demand.delete(sym); else demand.set(sym, n); },
    demanded: () => [...demand.keys()],
  };
}
