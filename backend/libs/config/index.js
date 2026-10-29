const num = (v, d) => (v === undefined || v === '' || Number.isNaN(Number(v)) ? d : Number(v));
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));

/** Read config lazily so tests can set process.env first. */
export function loadConfig(env = process.env) {
  return {
    port: num(env.PORT, 4000),
    host: env.HOST || '0.0.0.0',
    logLevel: env.LOG_LEVEL || 'info',
    corsOrigin: env.CORS_ORIGIN || '*',
    rateLimitPerMinute: num(env.RATE_LIMIT_PER_MINUTE, 120),
    twelveData: {
      key: env.TWELVE_DATA_API_KEY || '',
      baseUrl: env.TWELVE_DATA_BASE_URL || 'https://api.twelvedata.com',
      chunkSize: num(env.TWELVE_DATA_CHUNK_SIZE, 8),
      pollIntervalMs: num(env.TWELVE_DATA_POLL_INTERVAL_MS, 15000),
    },
    finnhub: {
      key: env.FINNHUB_API_KEY || '',
      baseUrl: env.FINNHUB_BASE_URL || 'https://finnhub.io/api/v1',
      wsUrl: env.FINNHUB_WS_URL || 'wss://ws.finnhub.io',
    },
    binance: {
      enabled: bool(env.ENABLE_BINANCE, true),
      wsUrl: env.BINANCE_WS_URL || 'wss://stream.binance.com:9443/stream',
    },
    ws: { reconnectBaseMs: num(env.WS_RECONNECT_BASE_MS, 1000), reconnectMaxMs: num(env.WS_RECONNECT_MAX_MS, 30000) },
    news: {
      baseUrl: env.GDELT_BASE_URL || 'https://api.gdeltproject.org/api/v2/doc/doc',
      timespan: env.NEWS_TIMESPAN || '6h',
      cacheSeconds: num(env.NEWS_CACHE_SECONDS, 120),
      maxRecords: num(env.NEWS_MAX_RECORDS, 50),
    },
    icons: {
      coingeckoBaseUrl: env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
      coingeckoKey: env.COINGECKO_API_KEY || '',   // optional demo key; works without one at low limits
      cacheSeconds: num(env.ICON_CACHE_SECONDS, 86400),
    },
    ai: {
      anthropicKey: env.ANTHROPIC_API_KEY || '',
      anthropicBaseUrl: env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
      anthropicVersion: env.ANTHROPIC_API_VERSION || '2023-06-01',
      model: env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      maxTokens: num(env.ANTHROPIC_MAX_TOKENS, 1024),
      freeAiKey: env.FREE_AI_API_KEY || '',
      freeAiBaseUrl: env.FREE_AI_BASE_URL || 'https://api.free.ai',
      freeAiModel: env.FREE_AI_MODEL || 'qwen7b',
      dailyQuota: num(env.AI_DAILY_QUOTA, 60),
    },
  };
}