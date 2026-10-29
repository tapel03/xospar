import { TtlCache } from '../../../libs/cache/index.js';

// Short ranges move fast, long ranges barely do.
export const candleTtlSeconds = (range) => (['1m', '5m', '15m'].includes(range) ? 20 : ['30m', '1H', '2H', '4H'].includes(range) ? 60 : 300);
export const candleCache = new TtlCache({ maxEntries: 400 });
