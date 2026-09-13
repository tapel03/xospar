// Forex pairs - all 29 listed
export const ALL_TWELVE_DATA_SYMBOLS = [
  "AUDUSD",
  "AUDJPY",
  "AUDCAD",
  "CADJPY",
  "AUDNZD",
  "CADCHF",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCAD",
  "GBPJPY",
  "USDCHF",
  "NZDUSD",
  "EURJPY",
  "GBPAUD",
  "EURAUD",
  "EURGBP",
  "GBPCAD",
  "EURCAD",
  "NZDJPY",
  "GBPNZD",
  "GBPCHF",
  "CHFJPY",
  "EURNZD",
  "AUDCHF",
  "NZDCAD",
  "EURCHF",
  "NZDCHF",
  "DXY",
];

export const FOREX_PAIR_LABELS = {
  AUDUSD: "Australian Dollar / US Dollar",
  AUDJPY: "Australian Dollar / Japanese Yen",
  AUDCAD: "Australian Dollar / Canadian Dollar",
  CADJPY: "Canadian Dollar / Japanese Yen",
  AUDNZD: "Australian Dollar / New Zealand Dollar",
  CADCHF: "Canadian Dollar / Swiss Franc",
  EURUSD: "Euro / US Dollar",
  GBPUSD: "British Pound / US Dollar",
  USDJPY: "US Dollar / Japanese Yen",
  USDCAD: "US Dollar / Canadian Dollar",
  GBPJPY: "British Pound / Japanese Yen",
  USDCHF: "US Dollar / Swiss Franc",
  NZDUSD: "New Zealand Dollar / US Dollar",
  EURJPY: "Euro / Japanese Yen",
  GBPAUD: "British Pound / Australian Dollar",
  EURAUD: "Euro / Australian Dollar",
  EURGBP: "Euro / British Pound",
  GBPCAD: "British Pound / Canadian Dollar",
  EURCAD: "Euro / Canadian Dollar",
  NZDJPY: "New Zealand Dollar / Japanese Yen",
  GBPNZD: "British Pound / New Zealand Dollar",
  GBPCHF: "British Pound / Swiss Franc",
  CHFJPY: "Swiss Franc / Japanese Yen",
  EURNZD: "Euro / New Zealand Dollar",
  AUDCHF: "Australian Dollar / Swiss Franc",
  NZDCAD: "New Zealand Dollar / Canadian Dollar",
  EURCHF: "Euro / Swiss Franc",
  NZDCHF: "New Zealand Dollar / Swiss Franc",
  DXY: "US Dollar Index",
};

export const CRYPTO_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "UNIUSDT",
];

export const STOCK_SYMBOLS = [
  "AAPL",
  "NVDA",
  "TSLA",
  "MSFT",
  "GOOGL",
];

export const INDEX_LABELS = {
  "S&P 500": "S&P 500 Index",
  NASDAQ: "Nasdaq Composite",
  DOW: "Dow Jones Industrial Average",
  "FTSE 100": "FTSE 100 Index",
};

// =============================================================
// API KEYS
// Pulled from EXPO_PUBLIC_* env vars (see src/services/api/.env).
// NOTE: EXPO_PUBLIC_ variables are bundled into the client and are
// visible to anyone who inspects the app/web bundle. This is fine for
// prototyping, but before shipping to production, move calls that use
// FINNHUB_API_KEY / TWELVE_DATA_API_KEY / ANTHROPIC_API_KEY behind your
// own backend so the real keys never ship to the client.
// =============================================================
export const TWELVE_DATA_API_KEY = process.env.EXPO_PUBLIC_TWELVE_DATA_API_KEY;
export const FINNHUB_API_KEY = process.env.EXPO_PUBLIC_FINNHUB_API_KEY;
export const MARKETAUX_API_KEY = process.env.EXPO_PUBLIC_MARKETAUX_API_KEY;
export const EXPO_PUBLIC_FREE_AI_API_KEY = process.env.EXPO_PUBLIC_FREE_AI_API_KEY;

// Anthropic key is not currently in the .env file - add
// EXPO_PUBLIC_ANTHROPIC_API_KEY there if/when the in-app AI chat is
// wired up to call Anthropic directly from the client.
export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

// =============================================================
// BASE URLS
// =============================================================
export const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";
export const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
export const FINNHUB_REST_BASE_URL = FINNHUB_BASE_URL;
export const FINNHUB_WS_BASE_URL = "wss://ws.finnhub.io";
export const MARKETAUX_BASE_URL = "https://api.marketaux.com/v1";

export const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
export const ANTHROPIC_API_VERSION = "2023-06-01";
export const ANTHROPIC_MODEL = "claude-3-5-sonnet-20241022";
export const ANTHROPIC_MAX_TOKENS = 1024;
export const MARKET_AI_SYSTEM_PROMPT =
  "You are MARKET AI, embedded in a trading app. Answer questions about " +
  "markets, forex, stocks, commodities and crypto concisely. You do not " +
  "have live market data unless the user includes specific prices or " +
  "levels in their message. Never present responses as personalized " +
  "financial advice.";

export const BINANCE_WS_BASE_URL = "wss://stream.binance.com:9443/stream";

// =============================================================
// POLLING / RECONNECT TUNING
// =============================================================

// Twelve Data's free tier allows a limited number of symbols per
// request and a limited number of API credits per minute - keep chunks
// small so polling stays within quota.
export const TWELVE_DATA_CHUNK_SIZE = 8;
export const TWELVE_DATA_POLL_INTERVAL_MS = 15000;

// Shared WebSocket reconnect backoff (used by both the Binance and
// Finnhub live-price sockets).
export const WS_RECONNECT_BASE_DELAY_MS = 1000;
export const WS_RECONNECT_MAX_DELAY_MS = 30000;