// Tracks per-provider health. If the crypto socket goes quiet, crypto quotes fall back
// to Twelve Data polling until Binance recovers.
export function createFailover({ logger, staleAfterMs = 30000 }) {
  const state = new Map();
  const set = (provider, patch) => state.set(provider, { status: 'idle', lastTickAt: null, error: null, ...state.get(provider), ...patch });

  return {
    status(provider, status, error = null) { set(provider, { status, error }); },
    tick(provider) { set(provider, { lastTickAt: Date.now(), status: 'connected', error: null }); },
    disabled(provider, reason) { set(provider, { status: 'disabled', error: reason }); },
    isStale(provider) {
      const s = state.get(provider);
      if (!s || s.status === 'disabled') return false;
      return s.status !== 'connected' || (s.lastTickAt !== null && Date.now() - s.lastTickAt > staleAfterMs);
    },
    health() { return Object.fromEntries(state); },
    /** Start `fallback` while `isStale(primary)`, stop it when the primary is healthy again. */
    watch({ primary, start, stop, everyMs = 10000 }) {
      let running = null;
      const timer = setInterval(() => {
        const stale = this.isStale(primary);
        if (stale && !running) { logger.warn(`${primary} stale, starting fallback`); running = start(); }
        else if (!stale && running) { logger.info(`${primary} recovered, stopping fallback`); stop?.(running); running = null; }
      }, everyMs);
      timer.unref?.();
      return () => { clearInterval(timer); if (running) stop?.(running); };
    },
  };
}
