import { http } from '../../services/http/client';

export const newsApi = {
  /** { stale: boolean, items: [{ id, cat, headline, source, time, tags, relevance, summary, why, affects }] } */
  list: (limit = 50) => http.get('/v1/news', { limit }),
};
