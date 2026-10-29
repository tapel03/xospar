// End to end: the real gateway + services against fake upstream providers.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import WebSocket from 'ws';
import { loadConfig } from '../libs/config/index.js';
import { createLogger } from '../libs/logger/index.js';
import { createBus } from '../services/market-ingestor/src/publish.js';
import { createProviders } from '../services/market-ingestor/src/index.js';
import { attachPriceGateway } from '../services/price-gateway/src/server.js';
import { createNewsSource } from '../services/news/src/routes.js';
import { createAiRouter } from '../services/ai-gateway/src/router.js';
import { createQuota } from '../services/ai-gateway/src/quota.js';
import { buildApp } from '../gateway/src/app.js';

let upstream, app, prices, base, bus;
const seen = { anthropicBody: null, anthropicKey: null, tdKeys: [] };

before(async () => {
  upstream = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const json = (o) => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); };
    if (url.pathname === '/td/time_series') { seen.tdKeys.push(url.searchParams.get('apikey'));
      return json({ values: [
        { datetime: '2026-01-01 10:15:00', open: '1.2', high: '1.3', low: '1.1', close: '1.25' },
        { datetime: '2026-01-01 10:00:00', open: '1.1', high: '1.2', low: '1.0', close: '1.2' }] }); }
    if (url.pathname === '/td/quote') { seen.tdKeys.push(url.searchParams.get('apikey'));
      return json({ symbol: 'GBP/USD', close: '1.3418', change: '-0.0012', percent_change: '-0.09', previous_close: '1.343' }); }
    if (url.pathname === '/gdelt') return json({ articles: [
      { title: 'Fed rate decision as inflation CPI surprises', url: 'https://n.test/1', domain: 'n.test', seendate: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14) },
      { title: 'Fed rate decision as inflation CPI surprises', url: 'https://n.test/dup', domain: 'n.test', seendate: '20260101000000' },
      { title: 'Missile attack raises oil supply fears', url: 'https://n.test/2', domain: 'n.test', seendate: '20260101000000' }] });
    if (url.pathname === '/anthropic/messages') {
      let body = ''; req.on('data', (c) => (body += c)); req.on('end', () => { seen.anthropicBody = JSON.parse(body); seen.anthropicKey = req.headers['x-api-key']; json({ content: [{ type: 'text', text: '  Hello from the model.  ' }] }); });
      return;
    }
    res.statusCode = 404; res.end('{}');
  });
  await new Promise((r) => upstream.listen(0, r));
  const u = `http://127.0.0.1:${upstream.address().port}`;

  const config = loadConfig({
    TWELVE_DATA_API_KEY: 'td-test-key', TWELVE_DATA_BASE_URL: `${u}/td`, FINNHUB_API_KEY: '', ENABLE_BINANCE: 'false',
    GDELT_BASE_URL: `${u}/gdelt`, ANTHROPIC_API_KEY: 'sk-test', ANTHROPIC_BASE_URL: `${u}/anthropic`, ANTHROPIC_MODEL: 'test-model',
    AI_DAILY_QUOTA: '3', RATE_LIMIT_PER_MINUTE: '1000',
  });
  const logger = createLogger('test', 'error');
  const providers = createProviders(config);
  bus = createBus();
  app = await buildApp({ config, providers, bus, ingestor: { health: () => ({ test: { status: 'connected' } }) },
    newsSource: createNewsSource(config, logger), router: createAiRouter(config.ai), quota: createQuota({ dailyLimit: config.ai.dailyQuota }), logger });
  await app.listen({ port: 0, host: '127.0.0.1' });
  prices = attachPriceGateway({ server: app.server, bus, logger, throttleMs: 20 });
  base = `http://127.0.0.1:${app.server.address().port}`;
});

after(async () => { prices.close(); await app.close(); upstream.close(); });

const get = async (p) => { const r = await fetch(base + p); return { status: r.status, body: r.status === 204 ? null : await r.json() }; };
const post = async (p, b) => { const r = await fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, body: await r.json() }; };

test('health reports feeds and AI providers', async () => {
  const { body } = await get('/health');
  assert.equal(body.ok, true); assert.deepEqual(body.ai, ['anthropic']);
});

test('asset catalogue is served', async () => {
  const { body } = await get('/v1/assets');
  assert.ok(body.items.length >= 40);
  assert.equal(body.items.find((a) => a.sym === 'US500').live, false);
});

test('candles come back chronological, with the key added server side', async () => {
  const { status, body } = await get('/v1/candles?sym=' + encodeURIComponent('EUR/USD') + '&range=15m');
  assert.equal(status, 200);
  assert.equal(body.status, 'ready'); assert.equal(body.source, 'twelvedata');
  assert.equal(body.candles.length, 2);
  assert.ok(body.candles[0].time < body.candles[1].time);
  assert.equal(body.candles[1].close, 1.25);
  assert.ok(seen.tdKeys.every((k) => k === 'td-test-key'));
});

test('candles: unsupported index, unknown symbol, bad range', async () => {
  assert.equal((await get('/v1/candles?sym=US500&range=1H')).body.status, 'unsupported');
  assert.equal((await get('/v1/candles?sym=NOPE&range=1H')).status, 404);
  assert.equal((await get('/v1/candles?sym=' + encodeURIComponent('EUR/USD') + '&range=7Y')).status, 400);
});

test('quotes snapshot falls back to a one-off provider fetch', async () => {
  const { body } = await get('/v1/quotes?syms=' + encodeURIComponent('GBP/USD,US500'));
  assert.equal(body.quotes[0].sym, 'GBP/USD'); assert.equal(body.quotes[0].price, 1.3418);
  assert.deepEqual(body.missing, ['US500']);
});

test('news is deduped, scored and shaped for the app', async () => {
  const { body } = await get('/v1/news');
  assert.equal(body.items.length, 2);
  assert.equal(body.items[0].relevance, 'High');
  assert.ok(body.items[0].headline && Array.isArray(body.items[0].tags));
});

test('mood is computed from the same news', async () => {
  const { body } = await get('/v1/mood');
  assert.ok(['RISK-ON', 'RISK-OFF', 'NEUTRAL'].includes(body.mood));
  assert.equal(body.metrics.length, 4);
});

test('AI chat: server-side key, model from env, system prompt by persona, quota', async () => {
  const first = await post('/v1/ai/chat', { messages: [{ role: 'user', text: 'Why is gold up?' }], persona: 'asset', context: { symbol: 'XAU/USD' } });
  assert.equal(first.status, 200);
  assert.equal(first.body.reply, 'Hello from the model.');
  assert.equal(first.body.provider, 'anthropic');
  assert.equal(seen.anthropicKey, 'sk-test');
  assert.equal(seen.anthropicBody.model, 'test-model');
  assert.match(seen.anthropicBody.system, /XAU\/USD/);
  assert.deepEqual(seen.anthropicBody.messages, [{ role: 'user', content: 'Why is gold up?' }]);

  assert.equal((await post('/v1/ai/chat', { messages: [] })).status, 400);
  // same single-turn question is served from cache and doesn't spend quota
  assert.equal((await post('/v1/ai/chat', { messages: [{ role: 'user', text: 'Why is gold up?' }], persona: 'asset', context: { symbol: 'XAU/USD' } })).body.cached, true);
  await post('/v1/ai/chat', { messages: [{ role: 'user', text: 'one' }] });
  await post('/v1/ai/chat', { messages: [{ role: 'user', text: 'two' }] });
  assert.equal((await post('/v1/ai/chat', { messages: [{ role: 'user', text: 'three' }] })).status, 429);
});

test('websocket: subscribe, snapshot, live ticks, unknown symbols rejected', async () => {
  bus.publish({ sym: 'BTC/USD', price: 60000, change: 1, percentChange: 0.1, ts: 1, source: 'binance' });
  const ws = new WebSocket(base.replace('http', 'ws') + '/ws');
  const msgs = [];
  ws.on('message', (b) => msgs.push(JSON.parse(b.toString())));
  await new Promise((r) => ws.on('open', r));
  ws.send(JSON.stringify({ type: 'subscribe', syms: ['BTC/USD', 'FAKE/XXX'] }));
  await new Promise((r) => setTimeout(r, 80));
  assert.equal(msgs[0].type, 'hello');
  assert.ok(msgs.find((m) => m.type === 'error' && m.syms.includes('FAKE/XXX')));
  assert.equal(msgs.find((m) => m.type === 'snapshot').data[0].price, 60000);
  assert.deepEqual(bus.demanded(), ['BTC/USD']);

  bus.publish({ sym: 'BTC/USD', price: 60100, ts: 2, source: 'binance' });
  bus.publish({ sym: 'ETH/USD', price: 3000, ts: 2, source: 'binance' });   // not subscribed
  await new Promise((r) => setTimeout(r, 120));
  const ticks = msgs.filter((m) => m.type === 'tick');
  assert.ok(ticks.some((t) => t.data.price === 60100));
  assert.ok(ticks.every((t) => t.data.sym === 'BTC/USD'));

  ws.close();
  await new Promise((r) => setTimeout(r, 80));
  assert.deepEqual(bus.demanded(), []);   // demand released on disconnect
});
