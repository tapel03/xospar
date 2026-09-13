import { finnhubClient } from "./httpClient";
import {
  FINNHUB_API_KEY,
  FINNHUB_WS_BASE_URL,
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
} from "./config";

const API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

/**
 * Fetch candlestick data (OHLCV) from Finnhub
 * @param {string} symbol - Crypto symbol (e.g., "BINANCE:BTCUSDT") or stock ticker
 * @param {string} resolution - Time resolution (1, 5, 15, 30, 60, D, W, M)
 * @param {number} from - Unix timestamp (start date)
 * @param {number} to - Unix timestamp (end date)
 * @param {string} kind - "crypto" or "stock", selects which Finnhub endpoint to hit
 * @returns {Promise<Object>} Raw Finnhub candle response { o, h, l, c, v, t, s }
 */
export async function getCandleData({ symbol, resolution, from, to, kind = "crypto" }) {
  if (!API_KEY) {
    throw new Error("Finnhub API key not found");
  }

  const path = kind === "stock" ? "/stock/candle" : "/crypto/candle";

  const response = await fetch(
    `${BASE_URL}${path}?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  return response.json(); // { o, h, l, c, v, t, s }
}

/**
 * Get candlestick data for different timeframes
 * @param {string} symbol - Crypto symbol
 * @param {string} timeframe - "1H", "4H", "1D", "1W", "1M"
 * @returns {Promise<Object>} OHLCV data
 */
export async function getCandleByTimeframe(symbol, timeframe) {
  const now = Math.floor(Date.now() / 1000);
  let resolution, from;

  switch (timeframe) {
    case "1H":
      resolution = "1";
      from = now - 3600 * 24; // Last 24 hours
      break;
    case "4H":
      resolution = "60";
      from = now - 3600 * 24 * 7; // Last 7 days
      break;
    case "1D":
      resolution = "D";
      from = now - 3600 * 24 * 30; // Last 30 days
      break;
    case "1W":
      resolution = "W";
      from = now - 3600 * 24 * 365; // Last year
      break;
    case "1M":
      resolution = "M";
      from = now - 3600 * 24 * 365 * 2; // Last 2 years
      break;
    default:
      resolution = "D";
      from = now - 3600 * 24 * 30;
  }

  return getCandleData({ symbol, resolution, from, to: now });
}

function candleResponseToPoints(raw) {
  if (!raw || raw.s !== "ok" || !Array.isArray(raw.t)) {
    return [];
  }

  return raw.t.map((timestamp, index) => ({
    time: timestamp * 1000,
    open: raw.o[index],
    high: raw.h[index],
    low: raw.l[index],
    close: raw.c[index],
  }));
}

// "BTC/USD" -> "BINANCE:BTCUSDT", matching the format Finnhub's crypto
// candle endpoint expects (EXCHANGE:SYMBOL).
function toFinnhubCryptoSymbol(displaySymbol) {
  const compact = displaySymbol.replace("/", "");
  const pair = compact.endsWith("USD") ? `${compact}T` : compact;
  return `BINANCE:${pair}`;
}

/**
 * Historical candles for a crypto asset, used by the price chart in the
 * asset detail modal. Returns [] (rather than throwing) on any failure
 * or empty result, so the UI can show a plain "not available" state.
 */
export async function getCryptoCandleSeries({
  displaySymbol,
  resolution = "60",
  lookbackSeconds = 3600 * 24 * 3,
}) {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - lookbackSeconds;
    const symbol = toFinnhubCryptoSymbol(displaySymbol);

    const raw = await getCandleData({ symbol, resolution, from, to, kind: "crypto" });
    return candleResponseToPoints(raw);
  } catch (error) {
    console.warn("[finnhubService] crypto candle fetch failed:", error?.message);
    return [];
  }
}

/**
 * Historical candles for a stock. Finnhub's free tier frequently blocks
 * /stock/candle (402/403) - this is a best-effort call that returns []
 * rather than throwing so the chart just shows "not available" instead
 * of crashing.
 */
export async function getStockCandleSeries({
  symbol,
  resolution = "5",
  lookbackSeconds = 3600 * 24,
}) {
  try {
    const to = Math.floor(Date.now() / 1000);
    const from = to - lookbackSeconds;

    const raw = await getCandleData({ symbol, resolution, from, to, kind: "stock" });
    return candleResponseToPoints(raw);
  } catch (error) {
    console.warn("[finnhubService] stock candle fetch failed:", error?.message);
    return [];
  }
}

/**
 * Fetches an initial REST snapshot (current price + previous close) for
 * each stock symbol via Finnhub's /quote endpoint, so useStockTicker has
 * something to show before the first trade arrives over the WebSocket.
 * Finnhub's free tier doesn't support batched quote requests, so this
 * fires one request per symbol in parallel.
 */
export async function fetchQuotes(symbols = []) {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  const results = await Promise.allSettled(
    symbols.map((symbol) => finnhubClient.get("/quote", { params: { symbol } }))
  );

  const quotes = {};

  results.forEach((result, index) => {
    const symbol = symbols[index];

    if (result.status !== "fulfilled") {
      return;
    }

    const raw = result.value?.data;
    const price = parseFloat(raw?.c);
    const previousClose = parseFloat(raw?.pc);

    if (!Number.isFinite(price)) {
      return;
    }

    const change = Number.isFinite(previousClose) ? price - previousClose : 0;
    const percentChange =
      Number.isFinite(previousClose) && previousClose !== 0
        ? (change / previousClose) * 100
        : 0;

    quotes[symbol] = {
      symbol,
      price,
      previousClose: Number.isFinite(previousClose) ? previousClose : price,
      change,
      percentChange,
      positive: percentChange >= 0,
      timestamp: Date.now(),
    };
  });

  return quotes;
}

/**
 * Manages a single Finnhub trade WebSocket connection for a set of stock
 * symbols, with automatic reconnect. Mirrors the shape of
 * BinanceTickerSocket in binanceService.js so the two hooks
 * (useStockTicker / useCryptoTicker) can follow the same pattern.
 *
 * Usage:
 *   const socket = new FinnhubTradeSocket(["AAPL", "NVDA"]);
 *   socket.connect({ onTrade, onStatusChange });
 *   ...
 *   socket.disconnect();
 */
export class FinnhubTradeSocket {
  constructor(symbols = []) {
    this.symbols = symbols;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.manuallyClosed = false;
    this.onTrade = null;
    this.onStatusChange = null;
  }

  buildUrl() {
    return `${FINNHUB_WS_BASE_URL}?token=${FINNHUB_API_KEY}`;
  }

  connect({ onTrade, onStatusChange } = {}) {
    if (this.symbols.length === 0) {
      return;
    }

    this.onTrade = onTrade;
    this.onStatusChange = onStatusChange;
    this.manuallyClosed = false;

    this._open();
  }

  _subscribeAll() {
    this.symbols.forEach((symbol) => {
      this.ws?.send(JSON.stringify({ type: "subscribe", symbol }));
    });
  }

  _unsubscribeAll() {
    this.symbols.forEach((symbol) => {
      try {
        this.ws?.send(JSON.stringify({ type: "unsubscribe", symbol }));
      } catch (error) {
        // Socket may already be closed - ignore.
      }
    });
  }

  _open() {
    this.ws = new WebSocket(this.buildUrl());

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this._subscribeAll();
      this.onStatusChange?.("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "trade" && Array.isArray(parsed.data)) {
          parsed.data.forEach((trade) => {
            this.onTrade?.({
              symbol: trade.s,
              price: trade.p,
              volume: trade.v,
              timestamp: trade.t,
            });
          });
        }
      } catch (error) {
        // Ignore malformed frames rather than crashing the socket.
      }
    };

    this.ws.onerror = () => {
      this.onStatusChange?.("error");
    };

    this.ws.onclose = () => {
      this.onStatusChange?.("disconnected");

      if (!this.manuallyClosed) {
        this._scheduleReconnect();
      }
    };
  }

  _scheduleReconnect() {
    const delay = Math.min(
      WS_RECONNECT_BASE_DELAY_MS * 2 ** this.reconnectAttempts,
      WS_RECONNECT_MAX_DELAY_MS
    );

    this.reconnectAttempts += 1;

    setTimeout(() => {
      if (!this.manuallyClosed) {
        this._open();
      }
    }, delay);
  }

  disconnect() {
    this.manuallyClosed = true;
    this._unsubscribeAll();
    this.ws?.close();
    this.ws = null;
  }
}