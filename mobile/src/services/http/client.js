import { API_BASE_URL } from '../../app/config';
import { currentToken } from '../session';
import { ApiError } from './errors';
import { ERRORS } from '../../utils/errorMessages';

let onUnauthorized = null;
/** The store registers this to start a fresh session when the server forgets ours. */
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

/** One place for base URL, timeout, JSON, auth and error shape. Uses fetch, so no extra dependency. */
async function request(path, { method = 'GET', query, body, timeoutMs = 12000, signal, auth = true, retried = false } = {}) {
  const qs = query ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null)).toString()}` : '';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => ctrl.abort());
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  const token = auth ? currentToken() : null;
  if (token) headers.authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE_URL}${path}${qs}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (res.status === 401 && auth && !retried && onUnauthorized) {
      clearTimeout(timer);
      if (await onUnauthorized()) return request(path, { method, query, body, timeoutMs, signal, auth, retried: true });
    }
    if (!res.ok) {
      // Plain message for the user. The technical detail stays in body.detail for debugging.
      const message = res.status >= 500 ? ERRORS.server : res.status === 429 ? ERRORS.tooMany : data?.message || ERRORS.generic;
      throw new ApiError(message, {
        status: res.status,
        code: data?.error || 'http_error',
        body: { ...(data || {}), detail: `HTTP ${res.status} at ${path}` },
      });
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const timedOut = err.name === 'AbortError';
    throw new ApiError(
      timedOut ? ERRORS.timeout : ERRORS.network,
      { code: timedOut ? 'timeout' : 'network_error', body: { detail: `${API_BASE_URL}: ${err.message}` } },
    );
  } finally {
    clearTimeout(timer);
  }
}

export const http = {
  get: (path, query, opts) => request(path, { ...opts, query }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body: body ?? {} }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  del: (path, query, opts) => request(path, { ...opts, method: 'DELETE', query }),
};