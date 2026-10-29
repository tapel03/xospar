import { resolveIcon } from './resolve.js';

const MAX_SYMS = 20;

export function iconsRoutes(app, { config, logger }) {
  // GET /v1/icons?syms=EUR/USD,AAPL,BTC/USD
  app.get('/v1/icons', async (req, reply) => {
    const syms = [...new Set(String(req.query.syms || '').split(',').map((s) => s.trim()).filter(Boolean))].slice(0, MAX_SYMS);
    if (!syms.length) return reply.code(400).send({ error: 'missing_syms' });
    const items = [], unknown = [];
    // Sequential on purpose: Twelve Data free plans are credit-limited, and results are cached for a day.
    for (const sym of syms) {
      const rec = await resolveIcon(config, sym, logger);
      if (rec) items.push(rec); else unknown.push(sym);
    }
    reply.header('cache-control', 'public, max-age=3600');
    return { items, unknown };
  });
}