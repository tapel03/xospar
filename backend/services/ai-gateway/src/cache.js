import { createHash } from 'node:crypto';
import { TtlCache } from '../../../libs/cache/index.js';

// Identical first-turn questions (the suggestion chips) are common; answer them once.
const cache = new TtlCache({ maxEntries: 200 });
export const aiCacheKey = (persona, context, messages) =>
  messages.length === 1 ? createHash('sha1').update(`${persona}|${context.symbol || ''}|${messages[0].text}`).digest('hex') : null;
export const aiCache = cache;
export const AI_CACHE_SECONDS = 300;
