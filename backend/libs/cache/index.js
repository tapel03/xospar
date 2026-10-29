/** Tiny in-memory TTL cache. Swap for Redis later behind the same get/set/wrap API. */
export class TtlCache {
  constructor({ maxEntries = 500 } = {}) { this.map = new Map(); this.flights = new Map(); this.maxEntries = maxEntries; }
  get(key) {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) { this.map.delete(key); return undefined; }
    return hit.value;
  }
  set(key, value, ttlSeconds) {
    if (this.map.size >= this.maxEntries) this.map.delete(this.map.keys().next().value);
    this.map.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
    return value;
  }
  /** Return cached value or compute it. Concurrent callers share one in-flight promise. */
  async wrap(key, ttlSeconds, fn) {
    const hit = this.get(key);
    if (hit !== undefined) return hit;
    if (this.flights.has(key)) return this.flights.get(key);
    const promise = (async () => { try { return this.set(key, await fn(), ttlSeconds); } finally { this.flights.delete(key); } })();
    this.flights.set(key, promise);
    return promise;
  }
}
