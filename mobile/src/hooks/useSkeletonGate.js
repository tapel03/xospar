import { useEffect, useState } from 'react';
import { useStore } from '../app/store';

/**
 * True when a screen may show its real content: the store has loaded (saved data or the server),
 * the skeleton has been on screen for at least `ms`, and `extra` (for example "chart data is ready") is true.
 */
export function useSkeletonGate(ms = 350, extra = true) {
  const { ready } = useStore();
  const [waited, setWaited] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready && waited && extra;
}