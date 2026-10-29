import { useEffect, useState } from 'react';
import { marketsApi } from '../marketsApi';
import { featureFlags } from '../../../app/config';

/**
 * Real candles for the asset detail chart, in the shape CandleChart already uses ({ i, o, h, l, c }).
 * Returns null until the backend has real data, so the screen keeps showing its sample candles
 * while loading, offline, or for assets with no live source (indices).
 */
export function useAssetCandles(sym, range) {
  const [candles, setCandles] = useState(null);

  useEffect(() => {
    if (!featureFlags.useBackend) return undefined;
    const ctrl = new AbortController();
    setCandles(null);
    marketsApi.candles(sym, range, { signal: ctrl.signal })
      .then((res) => {
        if (res?.status !== 'ready') return;
        setCandles(res.candles.map((k, i) => ({ i, time: k.time, o: k.open, h: k.high, l: k.low, c: k.close })));
      })
      .catch(() => { /* offline or backend down: keep the sample candles */ });
    return () => ctrl.abort();
  }, [sym, range]);

  return candles;
}
