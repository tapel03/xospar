// Timeframe -> provider parameters. Ported from Savanai src/services/api/candleRanges.js.
// The app only sends a range code; fetch parameters live here, on the server.
import { CHART_RANGES, DEFAULT_CHART_RANGE } from '@edgeline/shared-types';

export { CHART_RANGES, DEFAULT_CHART_RANGE };

// Twelve Data (forex, commodities, stocks, crypto fallback): { interval, outputsize }
const TWELVE = {
  '1m': { interval: '1min', outputsize: 120 }, '5m': { interval: '5min', outputsize: 120 },
  '15m': { interval: '15min', outputsize: 120 }, '30m': { interval: '30min', outputsize: 120 },
  '1H': { interval: '1h', outputsize: 120 }, '2H': { interval: '2h', outputsize: 120 },
  '4H': { interval: '4h', outputsize: 120 }, '1D': { interval: '1day', outputsize: 90 },
  '1W': { interval: '1week', outputsize: 104 }, '1M': { interval: '1month', outputsize: 120 },
};

// Finnhub crypto candles: { resolution, lookbackSeconds }
const H = 3600;
const FINNHUB_CRYPTO = {
  '1m': { resolution: '1', lookbackSeconds: H * 4 }, '5m': { resolution: '5', lookbackSeconds: H * 12 },
  '15m': { resolution: '15', lookbackSeconds: H * 24 }, '30m': { resolution: '30', lookbackSeconds: H * 24 * 2 },
  '1H': { resolution: '60', lookbackSeconds: H * 24 * 5 }, '2H': { resolution: '60', lookbackSeconds: H * 24 * 10 },
  '4H': { resolution: '60', lookbackSeconds: H * 24 * 20 }, '1D': { resolution: 'D', lookbackSeconds: H * 24 * 90 },
  '1W': { resolution: 'W', lookbackSeconds: H * 24 * 365 * 2 }, '1M': { resolution: 'M', lookbackSeconds: H * 24 * 365 * 5 },
};

export const isRange = (r) => CHART_RANGES.includes(r);
export const twelveParams = (range) => TWELVE[range] || TWELVE[DEFAULT_CHART_RANGE];
export const finnhubCryptoParams = (range) => FINNHUB_CRYPTO[range] || FINNHUB_CRYPTO[DEFAULT_CHART_RANGE];
