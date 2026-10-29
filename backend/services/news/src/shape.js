// The Edgeline app's news cards expect { id, cat, headline, source, time, tags, relevance, summary, why, affects }.
// This maps the ported story shape onto that, so the screen only swaps its data source.
import { normaliseText } from './impactScore.js';

const TAGS = { Oil: ['Oil'], Gold: ['Gold'], USD: ['USD'], EUR: ['EUR'], GBP: ['GBP'], JPY: ['JPY'], Stocks: ['Stocks', 'Indices'], 'Global Markets': [] };
const AFFECTS = {
  Oil: ['WTI', 'USD/CAD'], Gold: ['XAU/USD'], USD: ['EUR/USD', 'USD/JPY'], EUR: ['EUR/USD', 'GER40'],
  GBP: ['GBP/USD'], JPY: ['USD/JPY'], Stocks: ['US500', 'NAS100'], 'Global Markets': [],
};

export function categoryOf(title = '') {
  const t = normaliseText(title);
  const has = (...ks) => ks.some((k) => t.includes(k));
  if (has('central bank', 'rate decision', 'rate cut', 'rate hike', 'interest rate', 'ecb', 'federal reserve', 'bank of england', 'bank of japan')) return 'Central Banks';
  if (has('war', 'conflict', 'missile', 'bombing', 'military strike', 'ceasefire', 'sanction', 'attack')) return 'Geopolitics';
  if (has('bitcoin', 'crypto', 'ethereum')) return 'Crypto';
  if (has('earnings', 'chipmaker', 'shares', 'stocks')) return 'Earnings';
  return 'Economy';
}

/** @param {ReturnType<import('./ingestGdelt.js').transformArticle>} s */
export function toAppStory(s) {
  const tags = [...new Set(s.markets.flatMap((m) => TAGS[m] || []))];
  const affects = [...new Set(s.markets.flatMap((m) => AFFECTS[m] || []))];
  return {
    id: s.id,
    cat: categoryOf(s.title),
    headline: s.title,
    source: s.source,
    time: s.time,
    tags,
    relevance: s.impact,
    summary: s.description,
    why: affects.length ? `Stories like this tend to move ${affects.join(', ')}.` : 'A broad story with no single market it points to.',
    affects: affects.join(', '),
    url: s.url,
    publishedAt: s.publishedAt,
  };
}
