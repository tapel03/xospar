import {
  BINANCE_WS_BASE_URL,
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
} from "./config";

function normalizeTicker(payload) {
  const price = parseFloat(payload.c);
  const percentChange = parseFloat(payload.P);

  return {
    symbol: payload.s,
    price: Number.isFinite(price) ? price : null,
    change: parseFloat(payload.p),
    percentChange: Number.isFinite(percentChange) ? percentChange : null,
    high: parseFloat(payload.h),
    low: parseFloat(payload.l),
    volume: parseFloat(payload.v),
    positive: percentChange >= 0,
    timestamp: payload.E || Date.now(),
  };
}

/**
 * Manages a single Binance combined-stream WebSocket connection for a set
 * of crypto symbols (24hr ticker), with automatic reconnect.
 *
 * Usage:
 *   const socket = new BinanceTickerSocket(["BTCUSDT", "ETHUSDT"]);
 *   socket.connect({ onUpdate, onStatusChange });
 *   ...
 *   socket.disconnect();
 */
export class BinanceTickerSocket {
  constructor(symbols = []) {
    this.symbols = symbols.map((symbol) => symbol.toLowerCase());
    this.ws = null;
    this.reconnectAttempts = 0;
    this.manuallyClosed = false;
    this.onUpdate = null;
    this.onStatusChange = null;
  }

  buildUrl() {
    const streams = this.symbols.map((symbol) => `${symbol}@ticker`).join("/");
    return `${BINANCE_WS_BASE_URL}?streams=${streams}`;
  }

  connect({ onUpdate, onStatusChange } = {}) {
    if (this.symbols.length === 0) {
      return;
    }

    this.onUpdate = onUpdate;
    this.onStatusChange = onStatusChange;
    this.manuallyClosed = false;

    this._open();
  }

  _open() {
    this.ws = new WebSocket(this.buildUrl());

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.onStatusChange?.("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const payload = parsed.data || parsed;

        if (payload && payload.e === "24hrTicker") {
          this.onUpdate?.(normalizeTicker(payload));
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
    this.ws?.close();
    this.ws = null;
  }
}