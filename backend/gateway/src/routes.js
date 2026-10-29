// Routes that belong to the gateway itself (health, catalogue, quote snapshots) plus
// registration of every service's routes.
import { ASSETS } from '../../db/seeds/assets.js';
import { normalizeQuote } from '../../services/market-ingestor/src/normalize.js';
import { candlesRoutes } from '../../services/candles/src/routes.js';
import { newsRoutes } from '../../services/news/src/routes.js';
import { moodRoutes } from '../../services/mood-events/src/routes.js';
import { aiRoutes } from '../../services/ai-gateway/src/routes.js';
import { iconsRoutes } from '../../services/icons/src/routes.js';

export function registerRoutes(app, ctx) {
  const { config, providers, bus, ingestor, router, quota, newsSource, logger } = ctx;

  app.get('/health', async () => ({
    ok: true,
    uptimeSeconds: Math.round(process.uptime()),
    feeds: ingestor?.health?.() ?? {},
    ai: router.available(),
  }));

  app.get('/v1/assets', async () => ({
    items: ASSETS.map((a) => ({ sym: a.sym, name: a.name, cat: a.cat, dec: a.dec, live: Boolean(a.quote), candles: a.candles.length > 0 })),
  }));

  // Latest known quotes. Anything not yet on the bus is fetched once from its REST provider.
  app.get('/v1/quotes', async (req) => {
    const syms = String(req.query.syms || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 60);
    let quotes = bus.getMany(syms);
    const have = new Set(quotes.map((q) => q.sym));
    const missing = ASSETS.filter((a) => syms.includes(a.sym) && !have.has(a.sym) && a.quote && providers[a.quote.provider]?.fetchQuotes && providers[a.quote.provider].enabled);
    const byProvider = {};
    for (const a of missing) (byProvider[a.quote.provider] ||= []).push(a.quote.symbol);
    await Promise.all(Object.entries(byProvider).map(async ([provider, list]) => {
      try { for (const q of await providers[provider].fetchQuotes(list)) { const n = normalizeQuote(provider, q); if (n) bus.publish(n); } }
      catch (err) { logger.warn(`quotes ${provider}: ${err.message}`); }
    }));
    quotes = bus.getMany(syms);
    return { quotes, missing: syms.filter((s) => !bus.get(s)) };
  });

  candlesRoutes(app, { providers, logger });
  newsRoutes(app, { newsSource });
  moodRoutes(app, { newsSource });
  aiRoutes(app, { router, quota });
  iconsRoutes(app, { config, logger });
}