/** Fixed-window per-IP limiter. Replace with a Redis-backed one when running several instances. */
export function rateLimit(app, { perMinute }) {
  const hits = new Map();
  const timer = setInterval(() => hits.clear(), 60000);
  timer.unref?.();
  app.addHook('onClose', async () => clearInterval(timer));
  app.addHook('onRequest', async (req, reply) => {
    if (req.url === '/health') return;
    const n = (hits.get(req.ip) || 0) + 1;
    hits.set(req.ip, n);
    if (n > perMinute) {
      reply.header('retry-after', '60');
      return reply.code(429).send({ error: 'rate_limited' });
    }
  });
}
