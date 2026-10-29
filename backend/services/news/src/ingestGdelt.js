// GDELT fetch + transform. Ported from Savanai newsService.js (fetchMarketNews / transformArticle).
import { fetchJson } from '../../../libs/http/index.js';
import { dedupeArticles } from './dedupe.js';
import { calculateImpact, normaliseText, parseSeenDate, scoreArticle } from './impactScore.js';
import { getMarkets, getMarketReport } from './markets.js';

export const MARKET_QUERY = `(
  "central bank" OR "interest rate" OR inflation OR "consumer prices" OR "jobs report" OR employment
  OR "unemployment rate" OR GDP OR recession OR "economic growth" OR sanctions OR tariff OR tariffs
  OR war OR conflict OR missile OR bombing OR attack OR ceasefire OR "military strike" OR oil OR crude
  OR "oil supply" OR OPEC OR gold OR "stock market" OR stocks OR forex OR currency OR dollar OR euro
  OR yen OR pound OR "US dollar" OR "trade war" OR "market selloff"
)`;

export function timeAgo(date, now = Date.now()) {
  if (!date) return 'Just now';
  if (Number.isNaN(date.getTime())) return 'Recently';
  const s = Math.floor((now - date.getTime()) / 1000);
  if (s < 60) return 'Just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function transformArticle(article, index) {
  const title = article.title || 'Market news update';
  const markets = getMarkets(title);
  const published = parseSeenDate(article.seendate);
  const valid = published && !Number.isNaN(published.getTime());
  return {
    id: article.url || `${article.title || 'story'}-${index}-${article.seendate || ''}`,
    title,
    description: getMarketReport(title, markets),
    source: article.domain || 'Global News',
    time: timeAgo(valid ? published : null),
    impact: calculateImpact(title),
    markets,
    image: article.socialimage || null,
    url: article.url || null,
    publishedAt: valid ? published.toISOString() : new Date().toISOString(),
  };
}

export async function fetchMarketNews({ baseUrl, timespan = '6h', maxRecords = 50 }) {
  const params = new URLSearchParams({
    query: MARKET_QUERY.replace(/\s+/g, ' ').trim(), mode: 'artlist', maxrecords: String(maxRecords),
    timespan, sort: 'datedesc', format: 'json',
  });
  const data = await fetchJson(`${baseUrl}?${params}`, { provider: 'gdelt', timeoutMs: 15000 });
  const articles = Array.isArray(data?.articles) ? data.articles : [];
  return dedupeArticles(articles).sort((a, b) => scoreArticle(b) - scoreArticle(a)).map(transformArticle);
}
