import axios from "axios";

import {
  TWELVE_DATA_API_KEY,
  TWELVE_DATA_BASE_URL,
  FINNHUB_API_KEY,
  FINNHUB_REST_BASE_URL,
  ANTHROPIC_API_KEY,
  ANTHROPIC_BASE_URL,
  ANTHROPIC_API_VERSION,
} from "./config";

/**
 * Axios instance for Twelve Data's REST API. All forex/index price data
 * flows through this client instead of the global fetch().
 */
export const twelveDataClient = axios.create({
  baseURL: TWELVE_DATA_BASE_URL,
  timeout: 10000,
});

// Attach the API key to every outgoing request automatically so call
// sites never have to remember to pass it themselves.
twelveDataClient.interceptors.request.use((requestConfig) => {
  requestConfig.params = {
    ...requestConfig.params,
    apikey: TWELVE_DATA_API_KEY,
  };

  return requestConfig;
});

// Twelve Data returns HTTP 200 even for logical errors (bad symbol,
// exhausted quota, etc.) - it just puts `"status": "error"` in the body.
// Normalise that into a real rejected promise so callers can use a single
// try/catch instead of checking `response.data.status` everywhere.
twelveDataClient.interceptors.response.use((response) => {
  const { data } = response;

  if (data && data.status === "error") {
    return Promise.reject(new Error(data.message || "Twelve Data request failed"));
  }

  return response;
});

/**
 * Axios instance for Finnhub's REST API - used to grab an initial
 * snapshot (price, previous close) before the WebSocket trade stream
 * takes over.
 */
export const finnhubClient = axios.create({
  baseURL: FINNHUB_REST_BASE_URL,
  timeout: 10000,
});

finnhubClient.interceptors.request.use((requestConfig) => {
  requestConfig.params = {
    ...requestConfig.params,
    token: FINNHUB_API_KEY,
  };

  return requestConfig;
});

/**
 * Axios instance for Anthropic's Messages API - powers the in-app
 * "MARKET AI" chat assistant. See the security note in config.js before
 * shipping this to production as-is.
 */
export const anthropicClient = axios.create({
  baseURL: ANTHROPIC_BASE_URL,
  timeout: 30000,
  headers: {
    "content-type": "application/json",
    "x-api-key": ANTHROPIC_API_KEY,
    "anthropic-version": ANTHROPIC_API_VERSION,
  },
});

export default twelveDataClient;