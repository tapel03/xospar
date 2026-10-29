// Market ingestor: one connection per provider, normalised ticks onto the bus.
import { createTwelveData } from './adapters/twelvedata.js';
import { createFinnhub } from './adapters/finnhub.js';
import { createBinance } from './adapters/binance.js';
import { normalizeQuote, assetForProviderSymbol } from './normalize.js';
import { createFailover } from './failover.js';
import { ASSETS, assetsByProvider } from '../../../db/seeds/assets.js';

/** Build provider clients once; candles and the ingestor share them. */
export function createProviders(config) {
  return {
    twelvedata: createTwelveData(config.twelveData),
    finnhub: createFinnhub(config.finnhub, config.ws),
    binance: createBinance(config.binance, config.ws),
  };
}

export function startIngestor({ config, providers, bus, logger }) {
  const failover = createFailover({ logger });
  const stops = [];

  const publishQuotes = (provider) => (quotes) => {
    for (const q of quotes) { const n = normalizeQuote(provider, q); if (n) bus.publish(n); }
    if (quotes.length) failover.tick(provider);
  };

  // ---- Twelve Data: forex + commodities, polled, only for symbols someone is watching
  const td = providers.twelvedata;
  if (td.enabled) {
    const tdSyms = new Map(assetsByProvider('twelvedata').map((a) => [a.sym, a.quote.symbol]));
    stops.push(td.startPolling({
      getSymbols: () => bus.demanded().filter((s) => tdSyms.has(s)).map((s) => tdSyms.get(s)),
      onUpdate: publishQuotes('twelvedata'),
      onError: (err) => { failover.status('twelvedata', 'error', err.message); logger.warn(`twelvedata: ${err.message}`); },
    }));
    failover.status('twelvedata', 'connected');
  } else failover.disabled('twelvedata', 'TWELVE_DATA_API_KEY not set');

  // ---- Finnhub: stocks (REST snapshot, then live trades)
  const fh = providers.finnhub;
  const stockAssets = assetsByProvider('finnhub');
  if (fh.enabled && stockAssets.length) {
    const symbols = stockAssets.map((a) => a.quote.symbol);
    fh.fetchQuotes(symbols).then(publishQuotes('finnhub')).catch((e) => logger.warn(`finnhub snapshot: ${e.message}`));
    const sock = fh.createTradeSocket(symbols);
    sock.connect({
      onStatus: (s) => failover.status('finnhub', s),
      onTrade: (t) => {
        const a = assetForProviderSymbol('finnhub', t.providerSymbol);
        if (!a) return;
        bus.publishPrice(a.sym, t.price, t.ts, 'finnhub');
        failover.tick('finnhub');
      },
    });
    stops.push(() => sock.disconnect());
  } else failover.disabled('finnhub', 'FINNHUB_API_KEY not set');

  // ---- Binance: crypto ticker stream
  const bn = providers.binance;
  const cryptoAssets = assetsByProvider('binance');
  if (bn.enabled && cryptoAssets.length) {
    const sock = bn.createTickerSocket(cryptoAssets.map((a) => a.quote.symbol));
    sock.connect({
      onStatus: (s) => failover.status('binance', s),
      onTicker: (t) => { const n = normalizeQuote('binance', t); if (n) { bus.publish(n); failover.tick('binance'); } },
    });
    stops.push(() => sock.disconnect());

    // Fallback: while Binance is stale, poll crypto from Twelve Data.
    if (td.enabled) {
      stops.push(failover.watch({
        primary: 'binance',
        start: () => td.startPolling({
          getSymbols: () => cryptoAssets.map((a) => a.sym),
          onUpdate: (qs) => qs.forEach((q) => { const a = ASSETS.find((x) => x.sym === q.providerSymbol); if (a) bus.publish({ sym: a.sym, price: q.price, change: q.change, percentChange: q.percentChange, ts: q.ts, source: 'twelvedata' }); }),
          onError: (e) => logger.warn(`crypto fallback: ${e.message}`),
        }),
        stop: (stopFn) => stopFn(),
      }));
    }
  } else failover.disabled('binance', 'disabled');

  return { health: () => failover.health(), stop: () => stops.forEach((s) => s()) };
}
