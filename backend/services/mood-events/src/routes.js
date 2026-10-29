import { computeMarketMood } from './moodScore.js';

export function moodRoutes(app, { newsSource }) {
  app.get('/v1/mood', async (req, reply) => {
    try {
      const { stories, stale } = await newsSource.stories();
      const mood = computeMarketMood(stories);
      if (!mood) return reply.code(204).send();
      return { ...mood, stale };
    } catch (err) {
      return reply.code(502).send({ error: 'mood_unavailable', message: err.message });
    }
  });
}
