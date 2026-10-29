import { TtlCache } from '../../../libs/cache/index.js';
import { fetchMarketNews } from './ingestGdelt.js';
import { toAppStory } from './shape.js';

/** Shared news loader: one GDELT call per cache window, used by /v1/news and the mood service. */
export function createNewsSource(config, logger) {
  const cache = new TtlCache({ maxEntries: 8 });
  let lastGood = [];
  return {
    async stories() {
      try {
        const stories = await cache.wrap('stories', config.news.cacheSeconds, () =>
          fetchMarketNews({ baseUrl: config.news.baseUrl, timespan: config.news.timespan, maxRecords: config.news.maxRecords }));
        lastGood = stories;
        return { stories, stale: false };
      } catch (err) {
        logger?.warn(`news: ${err.message}`);
        if (lastGood.length) return { stories: lastGood, stale: true };   // serve the last good batch rather than nothing
        throw err;
      }
    },
  };
}

export function newsRoutes(app, { newsSource }) {
  app.get('/v1/news', async (req, reply) => {
    try {
      const { stories, stale } = await newsSource.stories();
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      return { stale, items: stories.slice(0, limit).map(toAppStory) };
    } catch (err) {
      return reply.code(502).send({ error: 'news_unavailable', message: err.message });
    }
  });
}
