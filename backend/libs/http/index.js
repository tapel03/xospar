export class UpstreamError extends Error {
  constructor(message, { status, provider } = {}) { super(message); this.name = 'UpstreamError'; this.status = status; this.provider = provider; }
}

/** fetch + timeout + JSON. Throws UpstreamError on non-2xx. */
export async function fetchJson(url, { provider = 'upstream', timeoutMs = 10000, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new UpstreamError(`${provider} responded ${res.status}`, { status: res.status, provider });
    return await res.json();
  } catch (err) {
    if (err instanceof UpstreamError) throw err;
    throw new UpstreamError(`${provider} request failed: ${err.name === 'AbortError' ? 'timeout' : err.message}`, { provider });
  } finally { clearTimeout(timer); }
}

/** Reconnect delay used by every provider socket (the curve the app used: 1s doubling up to 30s). */
export const backoffMs = (attempt, base = 1000, max = 30000) => Math.min(base * 2 ** attempt, max);
