import { randomUUID } from 'node:crypto';

/** Reuse the caller's x-request-id or mint one, and echo it back. */
export function requestId(app) {
  app.addHook('onRequest', async (req, reply) => {
    const id = req.headers['x-request-id'] || randomUUID();
    req.id = id;
    reply.header('x-request-id', id);
  });
}
