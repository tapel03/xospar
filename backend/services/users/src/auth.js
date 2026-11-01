// Sessions and passwords. Tokens are random and only their SHA-256 is stored, so a leaked
// database does not leak working sessions. Passwords use scrypt from node:crypto.
import { randomBytes, createHash, scryptSync, timingSafeEqual, randomUUID } from 'node:crypto';

export const newId = () => randomUUID();
export const newToken = () => randomBytes(32).toString('base64url');
export const hashToken = (t) => createHash('sha256').update(t).digest('hex');

export function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function checkPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, s, k] = stored.split('$');
  const expected = Buffer.from(k, 'base64');
  const got = scryptSync(password, Buffer.from(s, 'base64'), expected.length);
  return timingSafeEqual(got, expected);
}

export const normEmail = (e) => String(e || '').trim().toLowerCase();
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 200;

/** Fastify preHandler: resolves `Authorization: Bearer <token>` to req.user, or answers 401. */
export function requireUser(db) {
  return async (req, reply) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7).trim() : '';
    if (!token) return reply.code(401).send({ error: 'unauthorized', message: 'Sign-in required' });
    const th = hashToken(token);
    const session = db.sessions.byHash(th);
    const user = session && db.users.byId(session.user_id);
    if (!user) return reply.code(401).send({ error: 'unauthorized', message: 'Session expired' });
    if (Date.now() - session.last_seen > 60_000) db.sessions.touch(th);
    req.user = user;
    req.tokenHash = th;
  };
}
