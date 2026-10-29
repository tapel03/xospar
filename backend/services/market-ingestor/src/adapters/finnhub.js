// Finnhub adapter: stock quotes (REST), the live trade stream (WebSocket) and crypto candles.
// Ported from Savanai src/services/api/finnhubService.js.
import WebSocket from 'ws';
import { fetchJson, UpstreamError, backoffMs } from '../../../../libs/http/index.js';

const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };

export function candlesFromFinnhub(raw) {
  if (!raw || raw.s !== 'ok' || !Array.isArray(raw.t)) return [];
  return raw.t.map((t, i) => ({ time: t * 1000, open: raw.o[i], high: raw.h[i], low: raw.l[i], close: raw.c[i] }));
}

export function createFinnhub(cfg, wsCfg = {}) {
  const enabled = Boolean(cfg.key);

  async function get(path, params) {
    if (!enabled) throw new UpstreamError('Finnhub API key not configured', { provider: 'finnhub' });
    const qs = new URLSearchParams({ ...params, token: cfg.key });
    return fetchJson(`${cfg.baseUrl}${path}?${qs}`, { provider: 'finnhub' });
  }

  /** The free tier has no batch quote, so this is one request per symbol, in parallel. */
  async function fetchQuotes(symbols) {
    const settled = await Promise.allSettled(symbols.map((symbol) => get('/quote', { symbol })));
    const out = [];
    settled.forEach((r, i) => {
      if (r.status !== 'fulfilled') return;
      const price = num(r.value?.c);
      if (price === null || price === 0) return;
      const prev = num(r.value?.pc);
      const change = prev === null ? 0 : price - prev;
      out.push({
        providerSymbol: symbols[i], price, change,
        percentChange: prev ? (change / prev) * 100 : 0,
        high: num(r.value.h), low: num(r.value.l), open: num(r.value.o), previousClose: prev ?? price,
        ts: Date.now(),
      });
    });
    return out;
  }

  /** @param {{symbol:string, resolution:string, lookbackSeconds:number, kind?:'crypto'|'stock'}} p */
  async function fetchCandles({ symbol, resolution, lookbackSeconds, kind = 'crypto' }) {
    const to = Math.floor(Date.now() / 1000);
    const raw = await get(kind === 'stock' ? '/stock/candle' : '/crypto/candle', { symbol, resolution, from: to - lookbackSeconds, to });
    return candlesFromFinnhub(raw);
  }

  /** Live trades for a set of symbols, with reconnect. */
  function createTradeSocket(symbols) {
    let ws = null, attempts = 0, closed = false, timer = null;
    let handlers = {};
    const open = () => {
      ws = new WebSocket(`${cfg.wsUrl}?token=${cfg.key}`);
      ws.on('open', () => { attempts = 0; symbols.forEach((s) => ws.send(JSON.stringify({ type: 'subscribe', symbol: s }))); handlers.onStatus?.('connected'); });
      ws.on('message', (buf) => {
        try {
          const msg = JSON.parse(buf.toString());
          if (msg.type === 'trade' && Array.isArray(msg.data)) msg.data.forEach((t) => handlers.onTrade?.({ providerSymbol: t.s, price: t.p, volume: t.v, ts: t.t }));
        } catch { /* ignore malformed frames */ }
      });
      ws.on('error', () => handlers.onStatus?.('error'));
      ws.on('close', () => {
        handlers.onStatus?.('disconnected');
        if (!closed) { timer = setTimeout(open, backoffMs(attempts++, wsCfg.reconnectBaseMs, wsCfg.reconnectMaxMs)); }
      });
    };
    return {
      connect(h = {}) { if (!symbols.length) return; handlers = h; closed = false; open(); },
      disconnect() { closed = true; clearTimeout(timer); try { ws?.close(); } catch { /* already closed */ } },
    };
  }

  return { name: 'finnhub', enabled, fetchQuotes, fetchCandles, createTradeSocket };
}
