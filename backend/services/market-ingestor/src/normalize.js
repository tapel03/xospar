// Turns provider-shaped quotes ({ providerSymbol, ... }) into app quotes ({ sym, ... }).
import { ASSETS } from '../../../db/seeds/assets.js';

const index = new Map();
for (const a of ASSETS) if (a.quote) index.set(`${a.quote.provider}:${a.quote.symbol.toUpperCase()}`, a);

export const assetForProviderSymbol = (provider, providerSymbol) => index.get(`${provider}:${String(providerSymbol).toUpperCase()}`) || null;

/** @returns {import('@edgeline/shared-types').Quote | null} */
export function normalizeQuote(provider, q) {
  const asset = assetForProviderSymbol(provider, q.providerSymbol);
  if (!asset || q.price === null || q.price === undefined) return null;
  return {
    sym: asset.sym,
    price: q.price,
    change: q.change ?? null,
    percentChange: q.percentChange ?? null,
    high: q.high ?? null, low: q.low ?? null, open: q.open ?? null,
    previousClose: q.previousClose ?? null,
    volume: q.volume ?? null,
    ts: q.ts || Date.now(),
    source: provider,
  };
}
