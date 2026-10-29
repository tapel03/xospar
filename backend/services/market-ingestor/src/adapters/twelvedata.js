// Twelve Data adapter: forex, commodities, and the candle series for stocks/crypto fallbacks.
// Ported from Savanai src/services/api/twelveDataService.js + httpClient.js. The API key is
// attached here, server-side, instead of in the app bundle.
import { fetchJson, UpstreamError } from '../../../../libs/http/index.js';

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export function normalizeTwelveQuote(providerSymbol, raw) {
  if (!raw || raw.status === 'error') return null;
  const price = num(raw.close ?? raw.price ?? raw.previous_close);
  if (price === null) return null;
  return {
    providerSymbol,
    price,
    change: num(raw.change),
    percentChange: num(raw.percent_change),
    high: num(raw.high),
    low: num(raw.low),
    open: num(raw.open),
    previousClose: num(raw.previous_close),
    ts: raw.timestamp ? raw.timestamp * 1000 : Date.now(),
  };
}

export function createTwelveData(cfg) {
  const enabled = Boolean(cfg.key);

  async function get(path, params) {
    if (!enabled) throw new UpstreamError('Twelve Data API key not configured', { provider: 'twelvedata' });
    const qs = new URLSearchParams({ ...params, apikey: cfg.key });
    const data = await fetchJson(`${cfg.baseUrl}${path}?${qs}`, { provider: 'twelvedata' });
    // Twelve Data answers HTTP 200 for logical errors (bad symbol, exhausted quota...).
    if (data && data.status === 'error') throw new UpstreamError(data.message || 'Twelve Data request failed', { provider: 'twelvedata', status: data.code });
    return data;
  }

  /** @returns {Promise<Array>} normalized quotes, each carrying its providerSymbol */
  async function fetchQuotes(symbols) {
    if (!symbols?.length) return [];
    const data = await get('/quote', { symbol: symbols.join(',') });
    // One symbol -> flat object; several -> object keyed by symbol.
    const bySymbol = data?.symbol && symbols.length === 1 ? { [symbols[0]]: data } : data || {};
    return Object.entries(bySymbol).map(([sym, raw]) => normalizeTwelveQuote(sym, raw)).filter(Boolean);
  }

  /** Candles, chronological (Twelve Data returns newest first). */
  async function fetchTimeSeries({ symbol, interval = '15min', outputsize = 60 }) {
    const data = await get('/time_series', { symbol, interval, outputsize, timezone: 'UTC' });
    const values = Array.isArray(data?.values) ? data.values : [];
    return values.slice().reverse()
      .map((p) => ({ time: new Date(p.datetime.includes(' ') ? `${p.datetime.replace(' ', 'T')}Z` : `${p.datetime}T00:00:00Z`).getTime(), open: num(p.open), high: num(p.high), low: num(p.low), close: num(p.close) }))
      .filter((p) => p.close !== null && Number.isFinite(p.time));
  }

  /**
   * Rotates through the wanted symbols in small chunks to respect the credit limit.
   * `getSymbols()` is called every cycle, so only symbols somebody is watching get polled.
   * Returns stop().
   */
  function startPolling({ getSymbols, chunkSize = cfg.chunkSize, intervalMs = cfg.pollIntervalMs, onUpdate, onError }) {
    let i = 0, stopped = false, timer = null;
    const tick = async () => {
      if (stopped) return;
      const chunks = chunk(getSymbols(), chunkSize);
      if (chunks.length) {
        const symbols = chunks[i % chunks.length]; i += 1;
        try { onUpdate?.(await fetchQuotes(symbols)); } catch (err) { onError?.(err); }
      }
      if (!stopped) timer = setTimeout(tick, intervalMs);
    };
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }

  return { name: 'twelvedata', enabled, fetchQuotes, fetchTimeSeries, startPolling };
}
