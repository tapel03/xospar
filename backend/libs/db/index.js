// Persistent storage for user data, on Node's built-in SQLite (no extra dependency, one file on disk).
// Journal records are kept as JSON documents per user and collection, so the app's shapes can grow
// without a migration for every new field. Swap for Postgres behind the same functions when needed.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    pass_hash TEXT,
    kind TEXT NOT NULL DEFAULT 'device',      -- 'device' (anonymous, created on first launch) or 'email'
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
  -- profile, settings, watchlist
  CREATE TABLE IF NOT EXISTS kv (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
  );
  -- trades, alerts, strategies, chats, accounts, notifications, alertHistory
  CREATE TABLE IF NOT EXISTS docs (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coll TEXT NOT NULL,
    id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, coll, id)
  );
  CREATE INDEX IF NOT EXISTS docs_coll ON docs(coll);
`;

export function openDb(file = ':memory:') {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);

  const q = {
    insertUser: db.prepare('INSERT INTO users (id, email, pass_hash, kind, created_at) VALUES (?, ?, ?, ?, ?)'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    userByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    upgradeUser: db.prepare("UPDATE users SET email = ?, pass_hash = ?, kind = 'email' WHERE id = ?"),
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
    insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, last_seen) VALUES (?, ?, ?, ?)'),
    sessionByHash: db.prepare('SELECT * FROM sessions WHERE token_hash = ?'),
    touchSession: db.prepare('UPDATE sessions SET last_seen = ? WHERE token_hash = ?'),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    getKv: db.prepare('SELECT value FROM kv WHERE user_id = ? AND key = ?'),
    setKv: db.prepare('INSERT INTO kv (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value'),
    listDocs: db.prepare('SELECT data FROM docs WHERE user_id = ? AND coll = ? ORDER BY created_at DESC, rowid DESC'),
    getDoc: db.prepare('SELECT data FROM docs WHERE user_id = ? AND coll = ? AND id = ?'),
    putDoc: db.prepare(`INSERT INTO docs (user_id, coll, id, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, coll, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`),
    deleteDoc: db.prepare('DELETE FROM docs WHERE user_id = ? AND coll = ? AND id = ?'),
    clearColl: db.prepare('DELETE FROM docs WHERE user_id = ? AND coll = ?'),
    allInColl: db.prepare('SELECT user_id, data FROM docs WHERE coll = ?'),
  };

  const parse = (row) => (row ? JSON.parse(row.data ?? row.value) : null);

  return {
    raw: db,
    close: () => db.close(),
    tx(fn) {
      db.exec('BEGIN');
      try { const out = fn(); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    users: {
      create: ({ id, email = null, passHash = null, kind = 'device' }) => { q.insertUser.run(id, email, passHash, kind, Date.now()); return q.userById.get(id); },
      byId: (id) => q.userById.get(id) || null,
      byEmail: (email) => q.userByEmail.get(email) || null,
      upgrade: (id, email, passHash) => q.upgradeUser.run(email, passHash, id),
      remove: (id) => q.deleteUser.run(id),
    },
    sessions: {
      create: (tokenHash, userId) => { const t = Date.now(); q.insertSession.run(tokenHash, userId, t, t); },
      byHash: (h) => q.sessionByHash.get(h) || null,
      touch: (h) => q.touchSession.run(Date.now(), h),
      remove: (h) => q.deleteSession.run(h),
    },
    kv: {
      get: (userId, key) => parse(q.getKv.get(userId, key)),
      set: (userId, key, value) => { q.setKv.run(userId, key, JSON.stringify(value)); return value; },
    },
    docs: {
      list: (userId, coll) => q.listDocs.all(userId, coll).map(parse),
      get: (userId, coll, id) => parse(q.getDoc.get(userId, coll, id)),
      put: (userId, coll, doc, createdAt = Date.now()) => { q.putDoc.run(userId, coll, String(doc.id), JSON.stringify(doc), createdAt, Date.now()); return doc; },
      remove: (userId, coll, id) => q.deleteDoc.run(userId, coll, id).changes > 0,
      clear: (userId, coll) => q.clearColl.run(userId, coll),
      /** Every document in a collection across users (the alert engine uses this on start-up). */
      everyUser: (coll) => q.allInColl.all(coll).map((r) => ({ userId: r.user_id, doc: JSON.parse(r.data) })),
    },
  };
}
