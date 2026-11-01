// User data end to end: device sign-in, journal CRUD, positions at live prices, analytics,
// price alerts firing into notifications, email upgrade, and the economic calendar.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { loadConfig } from '../libs/config/index.js';
import { createLogger } from '../libs/logger/index.js';
import { createBus } from '../services/market-ingestor/src/publish.js';
import { createProviders } from '../services/market-ingestor/src/index.js';
import { createNewsSource } from '../services/news/src/routes.js';
import { createAiRouter } from '../services/ai-gateway/src/router.js';
import { createQuota } from '../services/ai-gateway/src/quota.js';
import { createCalendarSource } from '../services/calendar/src/routes.js';
import { createAlertEngine, parseTarget, conditionMet } from '../services/alerts/src/engine.js';
import { analyticsOf, accountSummary, pnlAt } from '../services/journal/src/maths.js';
import { openDb } from '../libs/db/index.js';
import { buildApp } from '../gateway/src/app.js';

let upstream, app, base, bus, db, engine;

before(async () => {
  upstream = http.createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    if (req.url.startsWith('/ff')) return res.end(JSON.stringify([
      { title: 'CPI m/m', country: 'USD', date: '2026-10-28T08:30:00-04:00', impact: 'High', forecast: '0.3%', previous: '0.4%' },
      { title: 'ECB Main Refinancing Rate', country: 'EUR', date: '2026-10-29T08:15:00-04:00', impact: 'High', forecast: '2.00%', previous: '2.00%' },
      { title: 'Bank Holiday', country: 'JPY', date: '2026-10-27T00:00:00-04:00', impact: 'Holiday' },
    ]));
    res.statusCode = 404; res.end('{}');
  });
  await new Promise((r) => upstream.listen(0, r));
  const u = `http://127.0.0.1:${upstream.address().port}`;
  const config = loadConfig({ ENABLE_BINANCE: 'false', RATE_LIMIT_PER_MINUTE: '10000', CALENDAR_URL: `${u}/ff`, GDELT_BASE_URL: `${u}/none`, DATA_FILE: ':memory:', SEED_SAMPLE_DATA: 'true' });
  const logger = createLogger('test', 'error');
  bus = createBus();
  db = openDb(':memory:');
  engine = createAlertEngine({ db, bus, logger });
  app = await buildApp({ config, providers: createProviders(config), bus, ingestor: { health: () => ({}) }, newsSource: createNewsSource(config, logger),
    calendarSource: createCalendarSource(config, logger), db, alertEngine: engine, router: createAiRouter(config.ai), quota: createQuota({ dailyLimit: 5 }), logger });
  await app.listen({ port: 0, host: '127.0.0.1' });
  base = `http://127.0.0.1:${app.server.address().port}`;
});

after(async () => { engine.stop(); await app.close(); db.close(); upstream.close(); });

const call = async (method, p, { token, body } = {}) => {
  const headers = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const r = await fetch(base + p, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  return { status: r.status, body: r.status === 204 ? null : await r.json() };
};

test('user routes need a session', async () => {
  assert.equal((await call('GET', '/v1/me')).status, 401);
  assert.equal((await call('GET', '/v1/trades', { token: 'nope' })).status, 401);
});

test('device account is seeded and journal records persist', async () => {
  const { body: s } = await call('POST', '/v1/auth/device');
  assert.ok(s.token && s.user.kind === 'device');
  const t = s.token;

  const me = (await call('GET', '/v1/me', { token: t })).body;
  assert.equal(me.trades.length, 8);
  assert.equal(me.strategies.length, 3);
  assert.equal(me.strategies.find((x) => x.name === 'London Reversal').stats.trades, 2);   // computed from the journal
  assert.ok(me.trades.every((x) => x.closedAt && !x.date));
  assert.equal(me.account.balance, 48250.12);
  assert.deepEqual(me.watchlist, ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD', 'XAU/USD']);

  // settings, profile, watchlist
  assert.equal((await call('PATCH', '/v1/me/settings', { token: t, body: { maxRisk: 0.5 } })).body.maxRisk, 0.5);
  assert.equal((await call('PATCH', '/v1/me/profile', { token: t, body: { name: 'Mpho' } })).body.name, 'Mpho');
  assert.deepEqual((await call('PUT', '/v1/me/watchlist', { token: t, body: { items: ['BTC/USD', 'BTC/USD', 'EUR/USD'] } })).body.items, ['BTC/USD', 'EUR/USD']);

  // open a trade, value it at a live price, close it
  bus.publish({ sym: 'EUR/USD', price: 1.1700, ts: Date.now() });
  const created = await call('POST', '/v1/trades', { token: t, body: { id: 'T-9001', date: 'Today, open', asset: 'EUR/USD', dir: 'Long', entry: 1.1650, stop: 1.1630, target: 1.1700, size: '1 lots', strategy: 'London Reversal', edge: 'yes', risk: 1 } });
  assert.equal(created.status, 201);
  assert.equal(created.body.status, 'open');
  const pos = (await call('GET', '/v1/positions', { token: t })).body.items;
  assert.equal(pos.length, 1); assert.equal(pos[0].live, true);
  assert.ok(Math.abs(pos[0].pnl - 500) < 0.01);   // 0.0050 * 1 lot * 100000
  const closed = (await call('POST', '/v1/positions/close', { token: t, body: { mode: 'all' } })).body.closed;
  assert.equal(closed[0].status, 'closed'); assert.equal(closed[0].r, 2.5);
  assert.equal((await call('GET', '/v1/positions', { token: t })).body.items.length, 0);

  // patch and delete
  assert.equal((await call('PATCH', '/v1/trades/T-9001', { token: t, body: { review: 'reviewed' } })).body.review, 'reviewed');
  assert.equal((await call('DELETE', '/v1/trades/T-9001', { token: t })).status, 204);
  assert.equal((await call('GET', '/v1/trades/T-9001/context', { token: t })).body.items.length, 3);

  // broker passwords never stored
  const acc = (await call('POST', '/v1/accounts', { token: t, body: { platform: 'MT5', login: '1', server: 'x', password: 'secret' } })).body;
  assert.equal(acc.password, undefined);

  // sample data can be cleared on its own
  await call('DELETE', '/v1/trades?sample=true', { token: t });
  assert.equal((await call('GET', '/v1/account', { token: t })).body.balance, 10000);
  assert.equal((await call('GET', '/v1/trades', { token: t })).body.items.length, 0);

  // another user cannot see any of it
  const other = (await call('POST', '/v1/auth/device')).body.token;
  assert.equal((await call('GET', '/v1/accounts', { token: other })).body.items.length, 0);
  assert.equal((await call('GET', '/v1/nope', { token: other })).status, 404);
});

test('analytics come from the journal in the old mock shape', async () => {
  const t = (await call('POST', '/v1/auth/device')).body.token;
  const a = (await call('GET', '/v1/analytics?days=30', { token: t })).body;
  assert.equal(a.sampleSize, 8);
  assert.equal(a.metrics.winRate, 50);
  assert.equal(a.equity.length, 30); assert.equal(a.equityDates.length, 30);
  assert.equal(a.onEdge.trades + a.offEdge.trades, 8);
  for (const k of ['Strategy', 'Session', 'Asset', 'Day', 'Direction', 'Risk %']) assert.ok(Array.isArray(a.breakdowns[k]), k);
  assert.equal(a.equity.at(-1), 48250.12);
});

test('a price alert fires into notifications and history', async () => {
  const t = (await call('POST', '/v1/auth/device')).body.token;
  bus.publish({ sym: 'GBP/USD', price: 1.3420, ts: Date.now() });
  const a = (await call('POST', '/v1/alerts', { token: t, body: { asset: 'GBP/USD', label: 'Range low', condition: 'Crosses below', target: '1.3400', expires: 'This week' } })).body;
  assert.equal(a.status, 'active'); assert.ok(a.expiresAt > Date.now());
  const before = (await call('GET', '/v1/notifications', { token: t })).body.items.length;
  bus.publish({ sym: 'GBP/USD', price: 1.3410, ts: Date.now() });
  bus.publish({ sym: 'GBP/USD', price: 1.3398, ts: Date.now() });
  const after = (await call('GET', '/v1/notifications', { token: t })).body.items;
  assert.equal(after.length, before + 1);
  assert.match(after[0].text, /GBP\/USD crosses below 1.3400/);
  const fired = (await call('GET', '/v1/alerts', { token: t })).body.items.find((x) => x.id === a.id);
  assert.equal(fired.status, 'triggered'); assert.equal(fired.triggeredAt, '1.3398');
  assert.ok((await call('GET', '/v1/alertHistory', { token: t })).body.items.some((h) => h.price === '1.3398'));
});

test('email upgrade keeps the journal; login and logout', async () => {
  const t = (await call('POST', '/v1/auth/device')).body.token;
  await call('POST', '/v1/strategies', { token: t, body: { id: 'mine', name: 'My setup', setups: [], markets: [] } });
  assert.equal((await call('POST', '/v1/auth/register', { token: t, body: { email: 'a@b.co', password: 'short' } })).status, 400);
  const reg = await call('POST', '/v1/auth/register', { token: t, body: { email: 'Trader@Example.com', password: 'longenough' } });
  assert.equal(reg.status, 200); assert.equal(reg.body.user.kind, 'email');
  assert.equal((await call('POST', '/v1/auth/register', { body: { email: 'trader@example.com', password: 'longenough' } })).status, 409);
  assert.equal((await call('POST', '/v1/auth/login', { body: { email: 'trader@example.com', password: 'wrong-pass' } })).status, 401);
  const login = (await call('POST', '/v1/auth/login', { body: { email: 'trader@example.com', password: 'longenough' } })).body;
  assert.ok((await call('GET', '/v1/strategies', { token: login.token })).body.items.some((s) => s.id === 'mine'));
  await call('POST', '/v1/auth/logout', { token: login.token });
  assert.equal((await call('GET', '/v1/me', { token: login.token })).status, 401);
  assert.equal((await call('DELETE', '/v1/me', { token: reg.body.token })).status, 200);
  assert.equal((await call('POST', '/v1/auth/login', { body: { email: 'trader@example.com', password: 'longenough' } })).status, 401);
});

test('economic calendar is shaped and holidays dropped', async () => {
  const { body } = await call('GET', '/v1/calendar');
  assert.equal(body.items.length, 2);
  assert.equal(body.items[0].type, 'Inflation'); assert.equal(body.items[1].type, 'Central Bank');
  assert.equal(body.items[0].ccy, 'USD'); assert.match(body.items[0].note, /forecast 0.3%/);
  assert.equal((await call('GET', '/v1/calendar?ccy=eur')).body.items.length, 1);
});

test('alert conditions and journal maths', () => {
  assert.deepEqual(parseTarget('1.1650–1.1660'), { lo: 1.165, hi: 1.166 });
  assert.deepEqual(parseTarget('2,700.00'), { level: 2700 });
  assert.equal(parseTarget('—'), null);
  const zone = { lo: 1, hi: 2 };
  assert.equal(conditionMet('Enters zone', zone, 0.5, 1.5), true);
  assert.equal(conditionMet('Enters zone', zone, null, 1.5), false);
  assert.equal(conditionMet('Exits zone', zone, 1.5, 2.5), true);
  assert.equal(conditionMet('Crosses above', { level: 10 }, 9, 10), true);
  assert.equal(conditionMet('Crosses above', { level: 10 }, 11, 9), false);
  assert.equal(conditionMet('Reaches level', { level: 10 }, 11, 9.5), true);
  assert.equal(pnlAt({ dir: 'Short', entry: 150, size: '1 lots', asset: 'USD/JPY' }, 149), 100000 / 149);
  const a = analyticsOf([], { startingBalance: 1000 });
  assert.equal(a.sampleSize, 0); assert.equal(a.equity.at(-1), 1000);
  assert.equal(accountSummary([], { startingBalance: 1000 }, () => undefined).equity, 1000);
});
