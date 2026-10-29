/** Per-connection throttle: at most one tick per symbol per interval, newest value wins. */
export function createThrottler(send, intervalMs = 400) {
  const last = new Map();     // sym -> last send time
  const pending = new Map();  // sym -> latest quote waiting for its slot
  let timer = null;

  const flush = () => {
    timer = null;
    const now = Date.now();
    for (const [sym, q] of pending) {
      if (now - (last.get(sym) || 0) >= intervalMs) { send(q); last.set(sym, now); pending.delete(sym); }
    }
    if (pending.size) timer = setTimeout(flush, Math.max(50, intervalMs / 4));
  };

  return {
    push(q) {
      const now = Date.now();
      if (now - (last.get(q.sym) || 0) >= intervalMs && !pending.has(q.sym)) { send(q); last.set(q.sym, now); return; }
      pending.set(q.sym, q);
      if (!timer) timer = setTimeout(flush, Math.max(50, intervalMs / 4));
    },
    drop(sym) { pending.delete(sym); last.delete(sym); },
    dispose() { clearTimeout(timer); pending.clear(); last.clear(); },
  };
}
