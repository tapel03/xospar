import { http } from '../../services/http/client';

export const marketsApi = {
  /** Asset catalogue: [{ sym, name, cat, dec, live, candles }] */
  assets: () => http.get('/v1/assets').then((r) => r.items),
  /** Latest quotes for app symbols: { quotes: [...], missing: [...] } */
  quotes: (syms) => http.get('/v1/quotes', { syms: syms.join(',') }),
  /** Candles: { status: 'ready'|'unsupported'|'unavailable', candles: [{time, open, high, low, close}] } */
  candles: (sym, range, opts) => http.get('/v1/candles', { sym, range }, opts),
  mood: () => http.get('/v1/mood'),
};
