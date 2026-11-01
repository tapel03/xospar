import { useCallback, useEffect, useState } from 'react';
import { news as sampleNews } from '../../../mocks/mock';
import { newsApi } from '../newsApi';
import { featureFlags } from '../../../app/config';
import { useAppState } from '../../../hooks/useAppState';
import { cache } from '../../../services/cache';

const REFRESH_MS = 120000;

/**
 * Live market news from the backend (GDELT, scored and deduped server side).
 * The last answer is saved on the device, so the stories are still there with no internet.
 * `loading` is true only until the first answer, a saved copy, or a failure. Until then the sample stories are held back
 * by the screen, which shows a skeleton instead.
 */
export function useMarketNews() {
  const [state, setState] = useState({ news: sampleNews, source: 'sample', stale: false, fresh: false, loading: featureFlags.useBackend });
  const appState = useAppState();

  // Saved copy first, so something real shows right away.
  useEffect(() => {
    if (!featureFlags.useBackend) return undefined;
    let live = true;
    cache.get('news').then((saved) => {
      if (live && Array.isArray(saved) && saved.length) {
        setState((s) => (s.fresh ? s : { news: saved, source: 'live', stale: true, fresh: false, loading: false }));
      }
    });
    return () => { live = false; };
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await newsApi.list();
      if (res?.items?.length) {
        setState({ news: res.items, source: 'live', stale: Boolean(res.stale), fresh: true, loading: false });
        cache.set('news', res.items);
        return;
      }
    } catch { /* keep whatever we have */ }
    setState((s) => (s.loading ? { ...s, loading: false } : s));
  }, []);

  useEffect(() => {
    if (!featureFlags.useBackend || appState !== 'active') return undefined;
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load, appState]);

  return { ...state, refresh: load };
}