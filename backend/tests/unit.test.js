import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateImpact, scoreArticle, parseSeenDate } from '../services/news/src/impactScore.js';
import { dedupeArticles } from '../services/news/src/dedupe.js';
import { getMarkets } from '../services/news/src/markets.js';
import { toAppStory } from '../services/news/src/shape.js';
import { transformArticle } from '../services/news/src/ingestGdelt.js';
import { computeMarketMood } from '../services/mood-events/src/moodScore.js';
import { twelveParams, finnhubCryptoParams, isRange } from '../services/candles/src/ranges.js';
import { normalizeTwelveQuote } from '../services/market-ingestor/src/adapters/twelvedata.js';
import { normalizeBinanceTicker } from '../services/market-ingestor/src/adapters/binance.js';
import { candlesFromFinnhub } from '../services/market-ingestor/src/adapters/finnhub.js';
import { normalizeQuote } from '../services/market-ingestor/src/normalize.js';
import { createBus } from '../services/market-ingestor/src/publish.js';
import { createThrottler } from '../services/price-gateway/src/throttle.js';
import { validateChatRequest } from '../services/ai-gateway/src/safety.js';
import { createQuota } from '../services/ai-gateway/src/quota.js';
import { ASSETS, getAsset } from '../db/seeds/assets.js';

test('impact scoring ranks rate/inflation news high', () => {
  assert.equal(calculateImpact('Fed rate decision: inflation surprise as CPI jumps'), 'High');
  assert.equal(calculateImpact('Local bakery opens new store'), 'Low');
});

test('GDELT dates parse and fresh stories outrank stale ones', () => {
  assert.equal(parseSeenDate('20260101120000').toISOString(), '2026-01-01T12:00:00.000Z');
  const now = Date.parse('2026-01-01T12:30:00Z');
  const fresh = scoreArticle({ title: 'Oil supply shock', seendate: '20260101122500', domain: 'x.com' }, now);
  const old = scoreArticle({ title: 'Oil supply shock', seendate: '20260101000000', domain: 'x.com' }, now);
  assert.ok(fresh > old);
});

test('dedupe removes repeated urls and titles', () => {
  const out = dedupeArticles([{ title: 'A  Story', url: 'u1' }, { title: 'a story', url: 'u2' }, { title: 'Other', url: 'u1' }, { title: 'Third', url: 'u3' }]);
  assert.deepEqual(out.map((a) => a.url), ['u1', 'u3']);
});

test('markets detection, with a global fallback', () => {
  assert.deepEqual(getMarkets('OPEC cuts crude output'), ['Oil']);
  assert.deepEqual(getMarkets('Quarterly furniture sales'), ['Global Markets']);
});

test('stories map to the Edgeline news card shape', () => {
  const story = transformArticle({ title: 'ECB signals rate cut as euro slides', url: 'https://x.test/a', domain: 'x.test', seendate: '20260101120000' }, 0);
  const app = toAppStory(story);
  for (const k of ['id', 'cat', 'headline', 'source', 'time', 'tags', 'relevance', 'summary', 'why', 'affects']) assert.ok(k in app, k);
  assert.equal(app.cat, 'Central Banks');
  assert.ok(app.tags.includes('EUR'));
  assert.match(app.affects, /EUR\/USD/);
});

test('mood is null with no news and RISK-OFF with war headlines', () => {
  assert.equal(computeMarketMood([]), null);
  const stories = Array.from({ length: 10 }, (_, i) => ({ title: `Missile attack and war escalate ${i}`, description: 'sanctions and market selloff', impact: 'High' }));
  const mood = computeMarketMood(stories);
  assert.equal(mood.mood, 'RISK-OFF');
  assert.equal(mood.metrics.length, 4);
});

test('range maps cover every range code', () => {
  for (const r of ['1m', '5m', '15m', '30m', '1H', '2H', '4H', '1D', '1W', '1M']) {
    assert.ok(isRange(r)); assert.ok(twelveParams(r).interval); assert.ok(finnhubCryptoParams(r).resolution);
  }
  assert.equal(isRange('9Y'), false);
});

test('provider payloads normalise', () => {
  const td = normalizeTwelveQuote('EUR/USD', { close: '1.1664', change: '-0.0025', percent_change: '-0.21', previous_close: '1.1689', timestamp: 1700000000 });
  assert.equal(td.price, 1.1664);
  assert.equal(normalizeTwelveQuote('X', { status: 'error' }), null);
  const bn = normalizeBinanceTicker({ e: '24hrTicker', s: 'BTCUSDT', c: '63280.5', P: '-1.12', p: '-710', h: '64000', l: '62000', o: '63990', v: '123', E: 1700000000000 });
  assert.equal(bn.price, 63280.5);
  assert.equal(candlesFromFinnhub({ s: 'no_data' }).length, 0);
  assert.deepEqual(candlesFromFinnhub({ s: 'ok', t: [1], o: [1], h: [2], l: [0.5], c: [1.5] }), [{ time: 1000, open: 1, high: 2, low: 0.5, close: 1.5 }]);
});

test('provider symbols map back to app symbols', () => {
  assert.equal(normalizeQuote('binance', { providerSymbol: 'BTCUSDT', price: 1 }).sym, 'BTC/USD');
  assert.equal(normalizeQuote('twelvedata', { providerSymbol: 'EUR/USD', price: 1 }).sym, 'EUR/USD');
  assert.equal(normalizeQuote('finnhub', { providerSymbol: 'AAPL', price: 1 }).sym, 'AAPL');
  assert.equal(normalizeQuote('binance', { providerSymbol: 'NOPE', price: 1 }), null);
});

test('catalogue has the old Savanai lists and the Edgeline app symbols', () => {
  assert.equal(ASSETS.filter((a) => a.cat === 'Forex').length, 29);           // 28 pairs + DXY
  assert.equal(ASSETS.filter((a) => a.cat === 'Crypto').length, 5);
  assert.equal(ASSETS.filter((a) => a.cat === 'Stocks').length, 5);
  for (const s of ['EUR/USD', 'XAU/USD', 'WTI', 'US500', 'NAS100', 'GER40', 'AAPL', 'NVDA', 'BTC/USD', 'ETH/USD', 'GBP/USD', 'USD/JPY', 'USD/CAD']) assert.ok(getAsset(s), s);
  assert.equal(new Set(ASSETS.map((a) => a.sym)).size, ASSETS.length);
});

test('bus merges partial ticks and derives change from previous close', () => {
  const bus = createBus();
  bus.publish({ sym: 'AAPL', price: 100, previousClose: 98, ts: 1, source: 'finnhub' });
  const next = bus.publishPrice('AAPL', 101, 2, 'finnhub');
  assert.equal(next.price, 101); assert.equal(next.change, 3);
  assert.ok(Math.abs(next.percentChange - (3 / 98) * 100) < 1e-9);
});

test('throttler sends the first tick, coalesces the rest', async () => {
  const sent = [];
  const t = createThrottler((q) => sent.push(q.price), 80);
  t.push({ sym: 'A', price: 1 }); t.push({ sym: 'A', price: 2 }); t.push({ sym: 'A', price: 3 });
  assert.deepEqual(sent, [1]);
  await new Promise((r) => setTimeout(r, 200));
  assert.deepEqual(sent, [1, 3]);
  t.dispose();
});

test('AI request validation', () => {
  const ok = validateChatRequest({ messages: [{ role: 'assistant', text: 'welcome' }, { role: 'user', text: 'hi' }, { role: 'user', text: 'again' }], persona: 'asset', context: { symbol: 'EUR/USD' } });
  assert.equal(ok.messages.length, 1);
  assert.equal(ok.messages[0].text, 'hi\nagain');
  assert.deepEqual(ok.context, { symbol: 'EUR/USD', name: 'Euro / US Dollar' });
  assert.throws(() => validateChatRequest({ messages: [] }));
  assert.throws(() => validateChatRequest({ messages: [{ role: 'assistant', text: 'x' }] }));
  assert.throws(() => validateChatRequest({ messages: [{ role: 'user', text: 'x'.repeat(5000) }] }));
  assert.equal(validateChatRequest({ messages: [{ role: 'user', text: 'x' }], persona: 'nonsense' }).persona, 'market');
});

test('quota counts down, refuses, and refunds', () => {
  const q = createQuota({ dailyLimit: 2 });
  assert.equal(q.consume('a'), 1); assert.equal(q.consume('a'), 0); assert.equal(q.consume('a'), -1);
  q.refund('a'); assert.equal(q.consume('a'), 0);
});
