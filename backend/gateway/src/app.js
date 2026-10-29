import Fastify from 'fastify';
import cors from '@fastify/cors';
import { requestId } from './requestId.js';
import { rateLimit } from './rateLimit.js';
import { registerRoutes } from './routes.js';

/** Build the HTTP app. Kept separate from server.js so tests can inject fake providers. */
export async function buildApp(ctx) {
  const app = Fastify({ logger: false, trustProxy: true });
  await app.register(cors, { origin: ctx.config.corsOrigin === '*' ? true : ctx.config.corsOrigin.split(',') });
  requestId(app);
  rateLimit(app, { perMinute: ctx.config.rateLimitPerMinute });
  app.setErrorHandler((err, req, reply) => {
    ctx.logger.error(`${req.method} ${req.url}: ${err.message}`);
    reply.code(err.statusCode || 500).send({ error: err.code || 'internal_error', message: err.message });
  });
  registerRoutes(app, ctx);
  return app;
}
