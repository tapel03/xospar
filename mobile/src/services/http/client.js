import { API_BASE_URL } from '../../app/config';
import { ApiError } from './errors';

/** One place for base URL, timeout, JSON and error shape. Uses fetch, so no extra dependency. */
async function request(path, { method = 'GET', query, body, timeoutMs = 12000, signal } = {}) {
  const qs = query ? `?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null)).toString()}` : '';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener('abort', () => ctrl.abort());
  try {
    const res = await fetch(`${API_BASE_URL}${path}${qs}`, {
      method,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.message || `Request failed (${res.status})`, { status: res.status, code: data?.error || 'http_error', body: data });
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.name === 'AbortError' ? 'Request timed out' : err.message, { code: err.name === 'AbortError' ? 'timeout' : 'network_error' });
  } finally {
    clearTimeout(timer);
  }
}

export const http = {
  get: (path, query, opts) => request(path, { ...opts, query }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
};
