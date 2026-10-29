import { normaliseText } from './impactScore.js';

/** Drop articles whose URL or normalised title has already been seen. */
export function dedupeArticles(articles) {
  const urls = new Set(), titles = new Set(), out = [];
  for (const a of articles) {
    const t = normaliseText(a.title || ''), u = a.url || '';
    if ((u && urls.has(u)) || (t && titles.has(t))) continue;
    if (u) urls.add(u);
    if (t) titles.add(t);
    out.push(a);
  }
  return out;
}
