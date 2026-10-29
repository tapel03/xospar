// Impact + ranking, ported from Savanai src/services/api/newsService.js.
export const normaliseText = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

export const HIGH_IMPACT_KEYWORDS = [
  'interest rate', 'central bank', 'rate decision', 'rate cut', 'rate hike', 'inflation', 'cpi', 'nfp',
  'employment', 'unemployment', 'recession', 'gdp', 'war', 'conflict', 'bombing', 'missile', 'military strike',
  'sanctions', 'tariff', 'oil supply', 'opec', 'ceasefire', 'bank failure', 'financial crisis', 'market crash', 'stock market',
];

/** @returns {'High'|'Medium'|'Low'} */
export function calculateImpact(title = '') {
  const text = normaliseText(title);
  let score = 0;
  HIGH_IMPACT_KEYWORDS.forEach((k) => { if (text.includes(k)) score += 3; });
  if (text.includes('breaking') || text.includes('urgent') || text.includes('just in')) score += 2;
  if (['attack', 'bombing', 'missile', 'war', 'military strike'].some((k) => text.includes(k))) score += 4;
  if (['rate decision', 'rate cut', 'rate hike', 'inflation', 'cpi', 'jobs report'].some((k) => text.includes(k))) score += 4;
  if (score >= 9) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
}

/** GDELT dates are usually YYYYMMDDHHMMSS. */
export function parseSeenDate(value) {
  if (!value) return null;
  if (/^\d{14}$/.test(String(value))) {
    const r = String(value);
    return new Date(`${r.slice(0, 4)}-${r.slice(4, 6)}-${r.slice(6, 8)}T${r.slice(8, 10)}:${r.slice(10, 12)}:${r.slice(12, 14)}Z`);
  }
  return new Date(value);
}

/** Impact weighted double, plus freshness, plus a small bump for a known source. */
export function scoreArticle(article, now = Date.now()) {
  const impact = calculateImpact(article.title || '');
  const impactScore = impact === 'High' ? 100 : impact === 'Medium' ? 50 : 10;
  const date = parseSeenDate(article.seendate);
  const ageMinutes = date && !Number.isNaN(date.getTime()) ? Math.max(0, (now - date.getTime()) / 60000) : 99999;
  return impactScore * 2 + Math.max(0, 100 - ageMinutes) + (article.domain ? 5 : 0);
}
