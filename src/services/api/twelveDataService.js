import { twelveDataClient } from "./httpClient";
import {
  ALL_TWELVE_DATA_SYMBOLS,
  TWELVE_DATA_CHUNK_SIZE,
  TWELVE_DATA_POLL_INTERVAL_MS,
} from "./config";

function chunkArray(items, size) {
  const chunks = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

function normalizeQuote(symbol, raw) {
  if (!raw) {
    return null;
  }

  const price = parseFloat(raw.close ?? raw.price ?? raw.previous_close);
  const change = parseFloat(raw.change ?? 0);
  const percentChange = parseFloat(raw.percent_change ?? 0);

  return {
    symbol,
    name: raw.name || symbol,
    price: Number.isFinite(price) ? price : null,
    change: Number.isFinite(change) ? change : null,
    percentChange: Number.isFinite(percentChange) ? percentChange : null,
    high: raw.high ? parseFloat(raw.high) : null,
    low: raw.low ? parseFloat(raw.low) : null,
    open: raw.open ? parseFloat(raw.open) : null,
    previousClose: raw.previous_close ? parseFloat(raw.previous_close) : null,
    positive: percentChange >= 0,
    timestamp: raw.timestamp ? raw.timestamp * 1000 : Date.now(),
  };
}

/**
 * Fetches a single batch of quotes (max ~TWELVE_DATA_CHUNK_SIZE symbols
 * per call to stay within free-tier credit limits) via Axios.
 */
export async function fetchQuotes(symbols) {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  const response = await twelveDataClient.get("/quote", {
    params: { symbol: symbols.join(",") },
  });

  const { data } = response;

  // A single-symbol request returns one flat object; multi-symbol
  // requests return an object keyed by symbol.
  const isSingleSymbolShape = Boolean(data && data.symbol);
  const rawBySymbol = isSingleSymbolShape ? { [data.symbol]: data } : data || {};

  const normalized = {};

  Object.keys(rawBySymbol).forEach((symbol) => {
    normalized[symbol] = normalizeQuote(symbol, rawBySymbol[symbol]);
  });

  return normalized;
}

/**
 * Rotates through the full symbol list in small chunks, calling
 * `onUpdate(partialQuotesBySymbol)` after every chunk resolves and
 * `onError(error)` if a chunk request fails (polling continues either way).
 *
 * Returns a `stop()` function to clear the underlying timer.
 */
export function startForexPolling({
  symbols = ALL_TWELVE_DATA_SYMBOLS,
  chunkSize = TWELVE_DATA_CHUNK_SIZE,
  intervalMs = TWELVE_DATA_POLL_INTERVAL_MS,
  onUpdate,
  onError,
} = {}) {
  const chunks = chunkArray(symbols, chunkSize);

  let chunkIndex = 0;
  let stopped = false;
  let timeoutId = null;

  const pollNextChunk = async () => {
    if (stopped || chunks.length === 0) {
      return;
    }

    const chunk = chunks[chunkIndex % chunks.length];
    chunkIndex += 1;

    try {
      const quotes = await fetchQuotes(chunk);
      onUpdate?.(quotes);
    } catch (error) {
      onError?.(error);
    } finally {
      if (!stopped) {
        timeoutId = setTimeout(pollNextChunk, intervalMs);
      }
    }
  };

  pollNextChunk();

  return function stop() {
    stopped = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Fetches historical OHLC candles for a single forex/index symbol via
 * Twelve Data's /time_series endpoint, used to power the price chart in
 * the asset detail modal. Returns points in chronological order (Twelve
 * Data returns newest-first, so we reverse it).
 */
export async function fetchTimeSeries({ symbol, interval = "15min", outputsize = 60 }) {
  const response = await twelveDataClient.get("/time_series", {
    params: { symbol, interval, outputsize },
  });

  const values = Array.isArray(response.data?.values) ? response.data.values : [];

  return values
    .slice()
    .reverse()
    .map((point) => ({
      time: new Date(point.datetime).getTime(),
      open: parseFloat(point.open),
      high: parseFloat(point.high),
      low: parseFloat(point.low),
      close: parseFloat(point.close),
    }))
    .filter((point) => Number.isFinite(point.close));
}