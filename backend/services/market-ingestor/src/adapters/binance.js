// Binance adapter: one combined-stream WebSocket for 24h tickers, with reconnect.
// Ported from Savanai src/services/api/binanceService.js. Public stream, no key needed.
import WebSocket from 'ws';
import { backoffMs } from '../../../../libs/http/index.js';

export function normalizeBinanceTicker(p) {
  const price = parseFloat(p.c);
  const percentChange = parseFloat(p.P);
  const f = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);
  return {
    providerSymbol: p.s,
    price: Number.isFinite(price) ? price : null,
    change: f(p.p), percentChange: Number.isFinite(percentChange) ? percentChange : null,
    high: f(p.h), low: f(p.l), open: f(p.o), volume: f(p.v),
    ts: p.E || Date.now(),
  };
}

export function createBinance(cfg, wsCfg = {}) {
  const enabled = cfg.enabled;

  function createTickerSocket(symbols) {
    const streams = symbols.map((s) => `${s.toLowerCase()}@ticker`).join('/');
    let ws = null, attempts = 0, closed = false, timer = null, handlers = {};
    const open = () => {
      ws = new WebSocket(`${cfg.wsUrl}?streams=${streams}`);
      ws.on('open', () => { attempts = 0; handlers.onStatus?.('connected'); });
      ws.on('message', (buf) => {
        try {
          const parsed = JSON.parse(buf.toString());
          const payload = parsed.data || parsed;
          if (payload?.e === '24hrTicker') handlers.onTicker?.(normalizeBinanceTicker(payload));
        } catch { /* ignore malformed frames */ }
      });
      ws.on('error', () => handlers.onStatus?.('error'));
      ws.on('close', () => {
        handlers.onStatus?.('disconnected');
        if (!closed) timer = setTimeout(open, backoffMs(attempts++, wsCfg.reconnectBaseMs, wsCfg.reconnectMaxMs));
      });
    };
    return {
      connect(h = {}) { if (!symbols.length) return; handlers = h; closed = false; open(); },
      disconnect() { closed = true; clearTimeout(timer); try { ws?.close(); } catch { /* already closed */ } },
    };
  }

  return { name: 'binance', enabled, createTickerSocket };
}
