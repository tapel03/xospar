// Shared timeframe options for every price chart in the app (asset detail
// modal, alert chart preview, etc.). Codes match TimeframeStack's
// TIMEFRAME_OPTIONS values exactly, so the same value drives both the UI
// selector and the data-fetch params below.
export const CHART_RANGES = [
  "1m", "5m", "15m", "30m", "1H", "2H", "4H", "1D", "1W", "1M",
];

export const CHART_RANGE_LABELS = {
  "1m": "1 minute",
  "5m": "5 minutes",
  "15m": "15 minutes",
  "30m": "30 minutes",
  "1H": "1 hour",
  "2H": "2 hours",
  "4H": "4 hours",
  "1D": "1 day",
  "1W": "1 week",
  "1M": "1 month",
};

export const DEFAULT_CHART_RANGE = "1D";

// Twelve Data (Forex + Stocks) - { interval, outputsize } per range.
const TWELVE_DATA_RANGE_PARAMS = {
  "1m": { interval: "1min", outputsize: 120 },
  "5m": { interval: "5min", outputsize: 120 },
  "15m": { interval: "15min", outputsize: 120 },
  "30m": { interval: "30min", outputsize: 120 },
  "1H": { interval: "1h", outputsize: 120 },
  "2H": { interval: "2h", outputsize: 120 },
  "4H": { interval: "4h", outputsize: 120 },
  "1D": { interval: "1day", outputsize: 90 },
  "1W": { interval: "1week", outputsize: 104 },
  "1M": { interval: "1month", outputsize: 120 },
};

// Finnhub crypto candles - { resolution, lookbackSeconds } per range.
const FINNHUB_CRYPTO_RANGE_PARAMS = {
  "1m": { resolution: "1", lookbackSeconds: 3600 * 4 },
  "5m": { resolution: "5", lookbackSeconds: 3600 * 12 },
  "15m": { resolution: "15", lookbackSeconds: 3600 * 24 },
  "30m": { resolution: "30", lookbackSeconds: 3600 * 24 * 2 },
  "1H": { resolution: "60", lookbackSeconds: 3600 * 24 * 5 },
  "2H": { resolution: "60", lookbackSeconds: 3600 * 24 * 10 },
  "4H": { resolution: "60", lookbackSeconds: 3600 * 24 * 20 },
  "1D": { resolution: "D", lookbackSeconds: 3600 * 24 * 90 },
  "1W": { resolution: "W", lookbackSeconds: 3600 * 24 * 365 * 2 },
  "1M": { resolution: "M", lookbackSeconds: 3600 * 24 * 365 * 5 },
};

export function getTwelveDataRangeParams(range) {
  return TWELVE_DATA_RANGE_PARAMS[range] || TWELVE_DATA_RANGE_PARAMS[DEFAULT_CHART_RANGE];
}

export function getFinnhubCryptoRangeParams(range) {
  return (
    FINNHUB_CRYPTO_RANGE_PARAMS[range] || FINNHUB_CRYPTO_RANGE_PARAMS[DEFAULT_CHART_RANGE]
  );
}