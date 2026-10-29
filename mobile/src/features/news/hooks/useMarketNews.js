import { useCallback, useEffect, useState } from 'react';
import { news as sampleNews } from '../../../mocks/mock';
import { newsApi } from '../newsApi';
import { featureFlags } from '../../../app/config';
import { useAppState } from '../../../hooks/useAppState';

const REFRESH_MS = 120000;

/**
 * Live market news from the backend (GDELT, scored and deduped server side).
 * Falls back to the sample stories until the first response, or when the backend is unreachable.
 */
export function useMarketNews() {
  const [state, setState] = useState({ news: sampleNews, source: 'sample', stale: false });
  const appState = useAppState();

  const load = useCallback(async () => {
    try {
      const res = await newsApi.list();
      if (res?.items?.length) setState({ news: res.items, source: 'live', stale: Boolean(res.stale) });
    } catch { /* keep whatever we have */ }
  }, []);

  useEffect(() => {
    if (!featureFlags.useBackend || appState !== 'active') return undefined;
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load, appState]);

  return { ...state, refresh: load };
}
