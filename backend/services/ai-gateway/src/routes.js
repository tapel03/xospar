import { validateChatRequest, checkReply, AiRequestError } from './safety.js';
import { systemPromptFor } from './prompts/index.js';
import { aiCache, aiCacheKey, AI_CACHE_SECONDS } from './cache.js';

export function aiRoutes(app, { router, quota }) {
  app.post('/v1/ai/chat', async (req, reply) => {
    let input;
    try { input = validateChatRequest(req.body); } catch (err) {
      if (err instanceof AiRequestError) return reply.code(err.status).send({ error: err.code, message: err.message });
      throw err;
    }
    const key = aiCacheKey(input.persona, input.context, input.messages);
    const cached = key ? aiCache.get(key) : undefined;
    if (cached) return { ...cached, cached: true };

    const remaining = quota.consume(req.ip);
    if (remaining < 0) return reply.code(429).send({ error: 'quota_exceeded', message: 'Daily AI message limit reached' });

    try {
      const { reply: text, provider } = await router.chat({ system: systemPromptFor(input.persona, input.context), messages: input.messages });
      const body = { reply: checkReply(text), provider, remaining };
      if (key) aiCache.set(key, { reply: body.reply, provider, remaining }, AI_CACHE_SECONDS);
      return body;
    } catch (err) {
      quota.refund(req.ip);   // a failed call shouldn't cost the user a message
      return reply.code(err.status || 502).send({ error: err.code || 'ai_error', message: err.message });
    }
  });

  app.get('/v1/ai/status', async () => ({ providers: router.available() }));
}
