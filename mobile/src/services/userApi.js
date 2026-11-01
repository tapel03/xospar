import { http } from './http/client';

const enc = encodeURIComponent;

/** Everything the signed-in user owns. Collections: trades, alerts, strategies, chats, accounts, notifications, alertHistory. */
export const userApi = {
  deviceSession: () => http.post('/v1/auth/device', {}, { auth: false }),
  register: (email, password) => http.post('/v1/auth/register', { email, password }),
  login: (email, password) => http.post('/v1/auth/login', { email, password }, { auth: false }),
  logout: () => http.post('/v1/auth/logout'),

  me: () => http.get('/v1/me'),
  patchProfile: (patch) => http.patch('/v1/me/profile', patch),
  patchSettings: (patch) => http.patch('/v1/me/settings', patch),
  putWatchlist: (items) => http.put('/v1/me/watchlist', { items }),
  deleteMe: () => http.del('/v1/me'),

  positions: () => http.get('/v1/positions'),
  account: () => http.get('/v1/account'),
  analytics: (days = 30) => http.get('/v1/analytics', { days }),
  closePositions: (mode) => http.post('/v1/positions/close', { mode }),
  tradeContext: (id) => http.get(`/v1/trades/${enc(id)}/context`),
  calendar: () => http.get('/v1/calendar', undefined, { auth: false }),
  mood: () => http.get('/v1/mood', undefined, { auth: false }),

  list: (coll) => http.get(`/v1/${coll}`),
  create: (coll, doc) => http.post(`/v1/${coll}`, doc),
  update: (coll, id, patch) => http.patch(`/v1/${coll}/${enc(id)}`, patch),
  upsert: (coll, id, doc) => http.put(`/v1/${coll}/${enc(id)}`, doc),
  remove: (coll, id) => http.del(`/v1/${coll}/${enc(id)}`),
  clear: (coll, { sampleOnly = false } = {}) => http.del(`/v1/${coll}`, sampleOnly ? { sample: 'true' } : undefined),
};
