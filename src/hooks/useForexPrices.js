import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { startForexPolling } from "../services/api/twelveDataService";
import { ALL_TWELVE_DATA_SYMBOLS } from "../services/api/config";

/**
 * Streams (via polling, since Twelve Data's free tier is REST-only) live
 * quotes for the given forex/index symbols. Automatically pauses polling
 * while the app is backgrounded to save API credits, and resumes when it
 * comes back to the foreground.
 */
export function useForexPrices(symbols = ALL_TWELVE_DATA_SYMBOLS) {
  const [quotes, setQuotes] = useState({});
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const stopRef = useRef(null);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    function startPolling() {
      stopRef.current = startForexPolling({
        symbols,
        onUpdate: (partial) => {
          setQuotes((prev) => ({ ...prev, ...partial }));
          setLastUpdated(Date.now());
          setError(null);
        },
        onError: (err) => setError(err),
      });
    }

    function stopPolling() {
      stopRef.current?.();
      stopRef.current = null;
    }

    startPolling();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (!stopRef.current) {
          startPolling();
        }
      } else {
        stopPolling();
      }
    });

    return () => {
      stopPolling();
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return { quotes, error, lastUpdated };
}