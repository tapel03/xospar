// Resolves an icon record for an app symbol. Network sources are tried in order and the
// result is cached; indices, commodities and misses fall back to a local icon in the app.
import { TtlCache } from '../../../libs/cache/index.js';
import { fetchJson } from '../../../libs/http/index.js';
import { getAsset } from '../../../db/seeds/assets.js';

const COINGECKO_IDS = {
  'BTC/USD': 'bitcoin', 'ETH/USD': 'ethereum', 'BNB/USD': 'binancecoin',
  'SOL/USD': 'solana', 'UNI/USD': 'uniswap',
};
const TYPE = { Forex: 'forex', Commodities: 'commodity', Indices: 'index', Stocks: 'stock', Crypto: 'crypto' };

const cache = new TtlCache({ maxEntries: 300 });
const inflight = new Map();
const MISS_TTL_SECONDS = 600; // retry misses sooner than hits

const httpsUrl = (u) => (typeof u === 'string' && u.startsWith('https://') ? u : null);

const base = (asset, patch = {}) => ({
  symbol: asset.sym, type: TYPE[asset.cat] || 'other',
  iconUrl: null, baseIconUrl: null, quoteIconUrl: null,
  source: 'local', fallback: true, ...patch,
});

/** Twelve Data /logo. Stocks return `url`; crypto and forex return `logo_base` / `logo_quote`. */
async function twelveLogo(config, symbol) {
  if (!config.twelveData.key) return null;
  const qs = new URLSearchParams({ symbol, apikey: config.twelveData.key });
  const data = await fetchJson(`${config.twelveData.baseUrl}/logo?${qs}`, { provider: 'twelvedata' });
  if (!data || data.status === 'error') return null;
  return { url: httpsUrl(data.url), base: httpsUrl(data.logo_base), quote: httpsUrl(data.logo_quote) };
}

/** One CoinGecko call covers every crypto asset we list. */
function coingeckoImages(config) {
  return cache.wrap('coingecko', config.icons.cacheSeconds, async () => {
    const ids = Object.values(COINGECKO_IDS).join(',');
    const qs = new URLSearchParams({ vs_currency: 'usd', ids, per_page: '50' });
    const headers = config.icons.coingeckoKey ? { 'x-cg-demo-api-key': config.icons.coingeckoKey } : {};
    const rows = await fetchJson(`${config.icons.coingeckoBaseUrl}/coins/markets?${qs}`, { provider: 'coingecko', headers });
    return Object.fromEntries((Array.isArray(rows) ? rows : []).map((r) => [r.id, httpsUrl(r.image)]));
  });
}

async function resolveUncached(config, asset, logger) {
  const attempt = async (label, fn) => { try { return await fn(); } catch (err) { logger?.warn(`icon ${asset.sym} via ${label}: ${err.message}`); return null; } };

  if (asset.cat === 'Crypto') {
    const images = await attempt('coingecko', () => coingeckoImages(config));
    const url = images?.[COINGECKO_IDS[asset.sym]];
    if (url) return base(asset, { iconUrl: url, source: 'coingecko', fallback: false });
    const td = await attempt('twelvedata', () => twelveLogo(config, asset.sym));
    if (td?.base) return base(asset, { iconUrl: td.base, source: 'twelveData', fallback: false });
    return base(asset);
  }

  if (asset.cat === 'Stocks') {
    const td = await attempt('twelvedata', () => twelveLogo(config, asset.sym));
    if (td?.url) return base(asset, { iconUrl: td.url, source: 'twelveData', fallback: false });
    return base(asset);
  }

  if (asset.cat === 'Forex' && asset.sym.includes('/')) {
    const td = await attempt('twelvedata', () => twelveLogo(config, asset.sym));
    if (td?.base || td?.quote) {
      return base(asset, { baseIconUrl: td.base, quoteIconUrl: td.quote, source: 'twelveData', fallback: false });
    }
    return base(asset); // the app draws local currency flags
  }

  return base(asset); // indices, commodities, DXY: local icon
}

export async function resolveIcon(config, sym, logger) {
  const asset = getAsset(sym);
  if (!asset) return null;
  const hit = cache.get(`icon|${sym}`);
  if (hit) return hit;
  if (inflight.has(sym)) return inflight.get(sym);
  const p = (async () => {
    try {
      const rec = await resolveUncached(config, asset, logger);
      cache.set(`icon|${sym}`, rec, rec.fallback && ['Crypto', 'Stocks', 'Forex'].includes(asset.cat) ? MISS_TTL_SECONDS : config.icons.cacheSeconds);
      return rec;
    } finally { inflight.delete(sym); }
  })();
  inflight.set(sym, p);
  return p;
}