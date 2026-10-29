// Per-client daily message quota (in memory; move to Redis when there is more than one instance).
export function createQuota({ dailyLimit }) {
  const counts = new Map();
  const day = () => new Date().toISOString().slice(0, 10);
  return {
    /** @returns remaining messages after this one, or -1 when over quota */
    consume(clientKey) {
      const key = `${day()}|${clientKey}`;
      const used = (counts.get(key) || 0) + 1;
      if (used > dailyLimit) return -1;
      counts.set(key, used);
      if (counts.size > 5000) for (const k of counts.keys()) if (!k.startsWith(day())) counts.delete(k);
      return dailyLimit - used;
    },
    refund(clientKey) { const key = `${day()}|${clientKey}`; if (counts.has(key)) counts.set(key, Math.max(0, counts.get(key) - 1)); },
  };
}
