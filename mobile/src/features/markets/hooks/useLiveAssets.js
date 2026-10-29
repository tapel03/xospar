import { useEffect, useState } from 'react';
import { assets } from '../../../mocks/mock';
import { priceSocket } from '../../../services/socket/PriceSocket';
import { useAppState } from '../../../hooks/useAppState';
import { featureFlags } from '../../../app/config';

/**
 * Streams live prices from the backend into the app's asset list.
 * mocks/mock.js still provides names, decimals and the fallback prices (until the app reads
 * /v1/assets through an assetCatalog), so a live quote just overwrites price and change in place
 * and bumps a counter to re-render. If the backend is unreachable nothing changes.
 */
export function useLiveAssets(syms) {
  const [, bump] = useState(0);
  const appState = useAppState();
  const key = syms.join('|');

  useEffect(() => {
    if (!featureFlags.useBackend || appState !== 'active' || syms.length === 0) return undefined;
    let raf = null;
    const off = priceSocket.subscribe(syms, (q) => {
      const a = assets.find((x) => x.sym === q.sym);
      if (!a || !Number.isFinite(q.price)) return;
      a.price = q.price;
      if (Number.isFinite(q.percentChange)) a.chg = q.percentChange;
      a.live = true;
      if (!raf) raf = setTimeout(() => { raf = null; bump((n) => n + 1); }, 150);   // coalesce bursts
    });
    return () => { off(); clearTimeout(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, appState]);
}
