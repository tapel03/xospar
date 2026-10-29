// Fetches icon records for a list of app symbols from the Savanai backend (GET /v1/icons).
// `baseUrl` is the same backend address the rest of the app already uses.
import { useEffect, useState } from 'react';

const store = new Map(); // sym -> icon record, shared for the life of the app
const BATCH = 20;

export function useAssetIcons(baseUrl, syms) {
  const [, bump] = useState(0);
  const key = (syms || []).join('|');

  useEffect(() => {
    if (!baseUrl) return undefined;
    const wanted = (syms || []).filter((s) => !store.has(s));
    if (!wanted.length) return undefined;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < wanted.length; i += BATCH) {
        const chunk = wanted.slice(i, i + BATCH);
        try {
          const res = await fetch(`${baseUrl}/v1/icons?syms=${encodeURIComponent(chunk.join(','))}`);
          if (!res.ok) continue;
          const data = await res.json();
          (data.items || []).forEach((r) => store.set(r.symbol, r));
        } catch { /* icons are cosmetic: keep local fallbacks */ }
      }
      if (!cancelled) bump((n) => n + 1);
    })();
    return () => { cancelled = true; };
  }, [baseUrl, key]);

  return Object.fromEntries((syms || []).map((s) => [s, store.get(s) || null]));
}