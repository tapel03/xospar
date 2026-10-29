/**
 * @typedef {'Forex'|'Commodities'|'Indices'|'Stocks'|'Crypto'} AssetCategory
 * @typedef {'twelvedata'|'finnhub'|'binance'|null} ProviderName
 * @typedef {{ provider: Exclude<ProviderName, null>, symbol: string }} ProviderRoute
 * @typedef {Object} Asset
 * @property {string} sym            App symbol, e.g. "EUR/USD" (what the mobile app uses everywhere)
 * @property {string} name
 * @property {AssetCategory} cat
 * @property {number} dec            Display decimals
 * @property {ProviderRoute|null} quote     Who supplies live prices (null = no live source)
 * @property {ProviderRoute[]} candles      Candle sources, tried in order
 * @typedef {Object} Quote
 * @property {string} sym
 * @property {number} price
 * @property {number|null} change
 * @property {number|null} percentChange
 * @property {number|null} high
 * @property {number|null} low
 * @property {number|null} open
 * @property {number|null} previousClose
 * @property {number} ts
 * @property {string} source
 * @typedef {Object} Candle
 * @property {number} time  ms epoch
 * @property {number} open
 * @property {number} high
 * @property {number} low
 * @property {number} close
 */
export const ASSET_CATEGORIES = ['Forex', 'Commodities', 'Indices', 'Stocks', 'Crypto'];

/** Chart range codes. Same codes the app's timeframe selector uses. */
export const CHART_RANGES = ['1m', '5m', '15m', '30m', '1H', '2H', '4H', '1D', '1W', '1M'];
export const DEFAULT_CHART_RANGE = '1D';
