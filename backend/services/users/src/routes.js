// Accounts and everything a user owns: profile, settings, watchlist, journal, alerts, strategies,
// mentor chats, broker accounts and notifications. Also the journal maths (positions, account
// summary, analytics) because those are computed from the same records.
import { requireUser, newId, newToken, hashToken, hashPassword, checkPassword, normEmail, validEmail } from './auth.js';
import { COLLECTIONS, MAX_DOCS_PER_COLLECTION, DEFAULT_SETTINGS, DEFAULT_PROFILE, DEFAULT_WATCHLIST, seedUser, TRADE_CONTEXT } from './defaults.js';
import { positionsOf, accountSummary, analyticsOf, closeTrade, strategyStats, isOpen } from '../../journal/src/maths.js';
import { expiryFor } from '../../alerts/src/engine.js';
import { getAsset } from '../../../db/seeds/assets.js';

const pick = (o, keys) => Object.fromEntries(Object.entries(o || {}).filter(([k]) => keys.includes(k)));
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const bad = (reply, message) => reply.code(400).send({ error: 'bad_request', message });

/** Broker passwords never reach the server: the app keeps them on the device. */
const scrub = (coll, doc) => {
  if (coll !== 'accounts') return doc;
  const { password, ...rest } = doc;
  return rest;
};

export function usersRoutes(app, { db, bus, alertEngine, config }) {
  const auth = requireUser(db);
  const priceOf = (sym) => bus.get(sym)?.price;
  const userView = (u) => ({ id: u.id, email: u.email, kind: u.kind });
  const settingsOf = (uid) => ({ ...DEFAULT_SETTINGS, ...(db.kv.get(uid, 'settings') || {}) });

  const startSession = (user) => { const token = newToken(); db.sessions.create(hashToken(token), user.id); return { token, user: userView(user) }; };

  /* ---------------- auth ---------------- */

  // First launch: an anonymous account tied to this device. It can be upgraded to email later.
  app.post('/v1/auth/device', async () => {
    const user = db.tx(() => { const u = db.users.create({ id: newId() }); seedUser(db, u.id, { sample: config.data.seedSample }); return u; });
    return startSession(user);
  });

  // With a device session this upgrades that account in place, so its journal is kept.
  app.post('/v1/auth/register', async (req, reply) => {
    const email = normEmail(req.body?.email); const password = String(req.body?.password || '');
    if (!validEmail(email)) return bad(reply, 'Enter a valid email address.');
    if (password.length < 8) return bad(reply, 'Use at least 8 characters for the password.');
    if (db.users.byEmail(email)) return reply.code(409).send({ error: 'email_taken', message: 'An account with that email already exists. Sign in instead.' });
    const h = req.headers.authorization || '';
    const s = h.startsWith('Bearer ') ? db.sessions.byHash(hashToken(h.slice(7).trim())) : null;
    const current = s && db.users.byId(s.user_id);
    if (current && current.kind === 'device') {
      db.users.upgrade(current.id, email, hashPassword(password));
      db.kv.set(current.id, 'profile', { ...(db.kv.get(current.id, 'profile') || {}), email });
      return startSession(db.users.byId(current.id));
    }
    const user = db.tx(() => { const u = db.users.create({ id: newId(), email, passHash: hashPassword(password), kind: 'email' }); seedUser(db, u.id, { sample: false }); db.kv.set(u.id, 'profile', { ...DEFAULT_PROFILE, email }); return u; });
    return startSession(user);
  });

  app.post('/v1/auth/login', async (req, reply) => {
    const email = normEmail(req.body?.email);
    const user = db.users.byEmail(email);
    if (!user || !checkPassword(String(req.body?.password || ''), user.pass_hash)) return reply.code(401).send({ error: 'bad_credentials', message: 'Email or password is wrong.' });
    return startSession(user);
  });

  app.post('/v1/auth/logout', { preHandler: auth }, async (req) => { db.sessions.remove(req.tokenHash); return { ok: true }; });

  /* ---------------- me ---------------- */

  const bootstrap = (uid) => {
    const trades = db.docs.list(uid, 'trades');
    const settings = settingsOf(uid);
    const out = {
      profile: { ...DEFAULT_PROFILE, ...(db.kv.get(uid, 'profile') || {}) },
      settings,
      watchlist: db.kv.get(uid, 'watchlist') || DEFAULT_WATCHLIST,
      positions: positionsOf(trades, priceOf),
      account: accountSummary(trades, settings, priceOf),
    };
    for (const c of COLLECTIONS) out[c] = c === 'trades' ? trades : db.docs.list(uid, c);
    out.strategies = strategyStats(trades, out.strategies);
    return out;
  };

  app.get('/v1/me', { preHandler: auth }, async (req) => ({ user: userView(req.user), ...bootstrap(req.user.id) }));

  app.patch('/v1/me/profile', { preHandler: auth }, async (req, reply) => {
    if (!isObj(req.body)) return bad(reply, 'Send the profile fields as an object.');
    const next = { ...DEFAULT_PROFILE, ...(db.kv.get(req.user.id, 'profile') || {}), ...req.body };
    return db.kv.set(req.user.id, 'profile', next);
  });

  app.patch('/v1/me/settings', { preHandler: auth }, async (req, reply) => {
    if (!isObj(req.body)) return bad(reply, 'Send the settings as an object.');
    return db.kv.set(req.user.id, 'settings', { ...settingsOf(req.user.id), ...req.body });
  });

  app.put('/v1/me/watchlist', { preHandler: auth }, async (req, reply) => {
    const items = Array.isArray(req.body?.items) ? [...new Set(req.body.items.map(String))].slice(0, 100) : null;
    if (!items) return bad(reply, 'Send { items: [symbols] }.');
    return { items: db.kv.set(req.user.id, 'watchlist', items) };
  });

  app.delete('/v1/me', { preHandler: auth }, async (req) => {
    alertEngine?.untrackUser(req.user.id);
    db.users.remove(req.user.id);   // sessions, settings and every document cascade
    return { ok: true };
  });

  /* ---------------- journal maths ---------------- */

  app.get('/v1/positions', { preHandler: auth }, async (req) => ({ items: positionsOf(db.docs.list(req.user.id, 'trades'), priceOf) }));

  app.get('/v1/account', { preHandler: auth }, async (req) => accountSummary(db.docs.list(req.user.id, 'trades'), settingsOf(req.user.id), priceOf));

  app.get('/v1/analytics', { preHandler: auth }, async (req) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 2), 365);
    return analyticsOf(db.docs.list(req.user.id, 'trades'), settingsOf(req.user.id), { days });
  });

  app.get('/v1/trades/:id/context', { preHandler: auth }, async (req) => ({ items: TRADE_CONTEXT[req.params.id] || TRADE_CONTEXT.default }));

  // Close open positions at the live price. mode: all | win | loss | a single trade id.
  app.post('/v1/positions/close', { preHandler: auth }, async (req, reply) => {
    const uid = req.user.id;
    const mode = String(req.body?.mode || 'all');
    const trades = db.docs.list(uid, 'trades');
    const positions = positionsOf(trades, priceOf);
    const hit = (p) => mode === 'all' || (mode === 'win' && p.pnl > 0) || (mode === 'loss' && p.pnl < 0) || p.tradeId === mode;
    const closing = positions.filter(hit);
    if (!closing.length) return { closed: [] };
    const missing = closing.filter((p) => !p.live);
    if (missing.length && req.body?.allowEntryPrice !== true) {
      return reply.code(409).send({ error: 'no_live_price', message: `No live price for ${missing.map((p) => p.asset).join(', ')} yet. Try again in a moment.` });
    }
    const now = Date.now();
    const closed = db.tx(() => closing.map((p) => db.docs.put(uid, 'trades', closeTrade(trades.find((t) => t.id === p.tradeId), p.price, now))));
    return { closed };
  });

  /* ---------------- collections ---------------- */

  const collOf = (req, reply) => {
    const c = req.params.coll;
    if (!COLLECTIONS.includes(c)) { reply.code(404).send({ error: 'not_found', message: `Unknown collection ${c}` }); return null; }
    return c;
  };

  /** Server-side rules per collection, applied on create and update. */
  const prepare = (coll, doc, prev) => {
    const now = Date.now();
    const out = { ...scrub(coll, doc), updatedAt: now };
    if (!prev) out.createdAt = doc.createdAt || now;
    if (coll === 'trades') {
      if (out.asset && !getAsset(out.asset)) throw Object.assign(new Error(`Unknown market ${out.asset}`), { statusCode: 400, code: 'bad_request' });
      if (!out.status) out.status = String(out.date || '').includes('open') ? 'open' : 'closed';
      if (out.status === 'open' && !out.openedAt) out.openedAt = now;
      if (out.status === 'closed' && !out.closedAt) out.closedAt = prev?.closedAt || now;
      delete out.date;   // display label; the app makes it from openedAt/closedAt
    }
    if (coll === 'alerts') {
      if (!out.status) out.status = 'active';
      if (!out.type) out.type = 'my';
      if (doc.expires !== undefined && doc.expires !== prev?.expires) out.expiresAt = expiryFor(doc.expires, now);
      if (prev?.status === 'triggered' && out.status === 'active') { delete out.triggeredAt; delete out.triggeredTs; }
    }
    return out;
  };

  app.get('/v1/:coll', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    const items = db.docs.list(req.user.id, coll);
    return { items: coll === 'strategies' ? strategyStats(db.docs.list(req.user.id, 'trades'), items) : items };
  });

  app.post('/v1/:coll', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    if (!isObj(req.body)) return bad(reply, 'Send the record as an object.');
    if (db.docs.list(req.user.id, coll).length >= MAX_DOCS_PER_COLLECTION) return reply.code(413).send({ error: 'limit', message: 'Too many records.' });
    const id = String(req.body.id || newId());
    if (db.docs.get(req.user.id, coll, id)) return reply.code(409).send({ error: 'exists', message: `${id} already exists` });
    const doc = db.docs.put(req.user.id, coll, prepare(coll, { ...req.body, id }));
    if (coll === 'alerts') alertEngine?.track(req.user.id, doc);
    return reply.code(201).send(doc);
  });

  app.patch('/v1/:coll/:id', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    if (!isObj(req.body)) return bad(reply, 'Send the changes as an object.');
    const prev = db.docs.get(req.user.id, coll, req.params.id);
    if (!prev) return reply.code(404).send({ error: 'not_found' });
    const doc = db.docs.put(req.user.id, coll, prepare(coll, { ...prev, ...req.body, id: prev.id }, prev));
    if (coll === 'alerts') alertEngine?.track(req.user.id, doc);
    return doc;
  });

  // Create-or-replace by id (the mentor chats save this way after every message).
  app.put('/v1/:coll/:id', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    if (!isObj(req.body)) return bad(reply, 'Send the record as an object.');
    const prev = db.docs.get(req.user.id, coll, req.params.id);
    if (!prev && db.docs.list(req.user.id, coll).length >= MAX_DOCS_PER_COLLECTION) return reply.code(413).send({ error: 'limit', message: 'Too many records.' });
    const doc = db.docs.put(req.user.id, coll, prepare(coll, { ...req.body, id: req.params.id, ...(prev ? { createdAt: prev.createdAt } : {}) }, prev));
    if (coll === 'alerts') alertEngine?.track(req.user.id, doc);
    return doc;
  });

  app.delete('/v1/:coll/:id', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    if (!db.docs.remove(req.user.id, coll, req.params.id)) return reply.code(404).send({ error: 'not_found' });
    if (coll === 'alerts') alertEngine?.untrack(req.user.id, req.params.id);
    return reply.code(204).send();
  });

  // Bulk clear, e.g. "dismiss all notifications" or "delete the sample trades".
  app.delete('/v1/:coll', { preHandler: auth }, async (req, reply) => {
    const coll = collOf(req, reply); if (!coll) return reply;
    if (req.query.sample === 'true') {
      for (const d of db.docs.list(req.user.id, coll)) if (d.sample) { db.docs.remove(req.user.id, coll, d.id); if (coll === 'alerts') alertEngine?.untrack(req.user.id, d.id); }
      // The sample journal came with its own starting balance; go back to the user's own.
      if (coll === 'trades') { const st = settingsOf(req.user.id); db.kv.set(req.user.id, 'settings', { ...st, startingBalance: Number(st.riskBase) || DEFAULT_SETTINGS.startingBalance }); }
    } else {
      if (coll === 'alerts') for (const d of db.docs.list(req.user.id, coll)) alertEngine?.untrack(req.user.id, d.id);
      db.docs.clear(req.user.id, coll);
    }
    return reply.code(204).send();
  });
}

export { isOpen };
