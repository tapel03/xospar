import { useEffect, useState } from 'react';
import { marketsApi } from '../marketsApi';
import { featureFlags } from '../../../app/config';
import { cache } from '../../../services/cache';

// Candles already fetched this session, so opening a pair again (or opening it right after the loading
// skeleton fetched them) shows the chart straight away. Entries older than FRESH_MS are refreshed.
const FRESH_MS = 30000;
const memory = new Map(); // `${sym}|${range}` -> { at, list }
const inflight = new Map(); // key -> Promise
const keyOf = (sym, range) => `${sym}|${range}`;
const diskKey = (sym, range) => `candles.${String(sym).replace(/[^A-Za-z0-9]/g, '')}.${range}`;

/** Fetches candles once even if two parts of the app ask at the same time. Falls back to the copy saved on the device. */
function load(sym, range) {
  const key = keyOf(sym, range);
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const res = await marketsApi.candles(sym, range);
      if (res?.status === 'ready') {
        const list = res.candles.map((k, i) => ({ i, time: k.time, o: k.open, h: k.high, l: k.low, c: k.close }));
        memory.set(key, { at: Date.now(), list });
        cache.set(diskKey(sym, range), list);
        return list;
      }
      return null;
    } catch {
      // Offline or backend down: use the last copy saved on the device (marked old, so it is retried next time).
      const saved = await cache.get(diskKey(sym, range));
      if (Array.isArray(saved) && saved.length) {
        memory.set(key, { at: 0, list: saved });
        return saved;
      }
      return null;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/**
 * Real candles for the asset detail chart, in the shape CandleChart already uses ({ i, o, h, l, c }).
 * Returns null until the backend (or the saved copy) has data, so the screen keeps showing its sample candles
 * for assets with no live source (indices).
 */
export function useAssetCandles(sym, range) {
  const [candles, setCandles] = useState(() => memory.get(keyOf(sym, range))?.list || null);

  useEffect(() => {
    if (!featureFlags.useBackend) return undefined;
    let live = true;
    const hit = memory.get(keyOf(sym, range));
    setCandles(hit ? hit.list : null);
    if (hit && Date.now() - hit.at < FRESH_MS) return undefined;
    load(sym, range).then((list) => { if (live && list) setCandles(list); });
    return () => { live = false; };
  }, [sym, range]);

  return candles;
}

/**
 * True once the candles for this pair are ready (or definitely will not come: unsupported asset, offline with
 * nothing saved, backend off). Used by the asset screen's loading skeleton. Never waits longer than 4 seconds.
 */
export function useCandlesReady(sym, range) {
  const [done, setDone] = useState(() => !featureFlags.useBackend || memory.has(keyOf(sym, range)));

  useEffect(() => {
    if (done) return undefined;
    let live = true;
    const finish = () => { if (live) setDone(true); };
    const cap = setTimeout(finish, 4000);
    load(sym, range).then(finish, finish);
    return () => { live = false; clearTimeout(cap); };
  }, [sym, range, done]);

  return done;
}