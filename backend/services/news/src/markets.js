// Which markets a story touches, and the one-line "what may happen" note.
// Ported from Savanai newsService.js (MARKET_KEYWORDS, getMarkets, getMarketReport).
import { normaliseText } from './impactScore.js';

export const MARKET_KEYWORDS = {
  Oil: ['oil', 'crude', 'opec', 'oil supply', 'brent', 'wti'],
  Gold: ['gold', 'safe haven', 'geopolitical', 'war', 'conflict'],
  USD: ['federal reserve', 'fed', 'dollar', 'us inflation', 'us jobs', 'treasury', 'interest rate', 'united states'],
  EUR: ['ecb', 'euro', 'eurozone', 'germany', 'europe'],
  GBP: ['bank of england', 'boe', 'pound', 'uk inflation', 'britain', 'united kingdom'],
  JPY: ['bank of japan', 'boj', 'yen', 'japan'],
  Stocks: ['stocks', 'equities', 's&p 500', 'nasdaq', 'dow', 'wall street'],
};

export function getMarkets(title = '') {
  const text = normaliseText(title);
  const matches = Object.entries(MARKET_KEYWORDS).filter(([, kws]) => kws.some((k) => text.includes(k))).map(([m]) => m);
  return matches.length ? [...new Set(matches)].slice(0, 3) : ['Global Markets'];
}

export function getMarketReport(title = '', markets = []) {
  const t = normaliseText(title);
  const has = (...ks) => ks.some((k) => t.includes(k));
  if (has('oil', 'crude', 'opec')) return 'Oil markets may react as traders reassess supply and demand risks.';
  if (has('inflation', 'cpi', 'consumer prices')) return 'Currency and bond markets may reprice expectations for future interest rates.';
  if (has('interest rate', 'rate decision', 'rate cut', 'rate hike')) return 'The decision can quickly change rate expectations and currency valuations.';
  if (has('war', 'conflict', 'bombing', 'missile', 'military strike')) return 'Risk sentiment may shift while safe-haven and energy markets react.';
  if (has('tariff', 'trade war', 'sanction')) return 'Trade and supply concerns may affect currencies, commodities and equities.';
  if (has('stocks', 'equities', 's&p 500', 'nasdaq')) return 'Equity markets may reprice as investors reassess growth and risk.';
  return `${markets.join(' / ')} may react as traders reassess the market implications.`;
}
