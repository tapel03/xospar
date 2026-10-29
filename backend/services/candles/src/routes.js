import { getAsset } from '../../../db/seeds/assets.js';
import { candleCache, candleTtlSeconds } from './cache.js';
import { isRange, twelveParams, finnhubCryptoParams, DEFAULT_CHART_RANGE } from './ranges.js';

/**
 * Try each candle source for an asset in order (the old hook tried Finnhub, then Twelve Data
 * for crypto). First non-empty series wins.
 * @returns {Promise<{ sym: string, range: string, status: 'ready'|'unsupported'|'unavailable', source: string|null, candles: any[] }>}
 */
export async function loadCandles({ providers, sym, range, logger }) {
  const asset = getAsset(sym);
  if (!asset || asset.candles.length === 0) return { sym, range, status: 'unsupported', source: null, candles: [] };

  let lastError = null;
  for (const route of asset.candles) {
    const provider = providers[route.provider];
    if (!provider?.enabled) continue;
    try {
      let candles = [];
      if (route.provider === 'twelvedata') {
        const { interval, outputsize } = twelveParams(range);
        candles = await provider.fetchTimeSeries({ symbol: route.symbol, interval, outputsize });
      } else if (route.provider === 'finnhub') {
        const { resolution, lookbackSeconds } = finnhubCryptoParams(range);
        candles = await provider.fetchCandles({ symbol: route.symbol, resolution, lookbackSeconds, kind: 'crypto' });
      }
      if (candles.length) return { sym, range, status: 'ready', source: route.provider, candles };
    } catch (err) { lastError = err; logger?.warn(`candles ${sym} via ${route.provider}: ${err.message}`); }
  }
  return { sym, range, status: lastError ? 'unavailable' : 'unsupported', source: null, candles: [] };
}

export function candlesRoutes(app, { providers, logger }) {
  app.get('/v1/candles', async (req, reply) => {
    const sym = String(req.query.sym || '');
    const range = String(req.query.range || DEFAULT_CHART_RANGE);
    if (!getAsset(sym)) return reply.code(404).send({ error: 'unknown_symbol', sym });
    if (!isRange(range)) return reply.code(400).send({ error: 'bad_range', range });
    const key = `${sym}|${range}`;
    const hit = candleCache.get(key);
    if (hit) return hit;
    const result = await loadCandles({ providers, sym, range, logger });
    // Only cache real data; don't pin an outage for minutes.
    if (result.status === 'ready') candleCache.set(key, result, candleTtlSeconds(range));
    return result;
  });
}
