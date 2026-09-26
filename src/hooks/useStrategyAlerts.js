import { useEffect, useRef } from "react";

import { detectPatterns } from "../utils/technicalPatterns";
import { useAlerts } from "../context/AlertsContext";

/**
 * Watches an asset's live candles for the pattern set defined in
 * technicalPatterns.js and automatically raises an alert (through
 * AlertsContext) the first time each pattern shows up on a given
 * candle. This is what lets the Strategy Coach panel "send alerts" on
 * its own once a strategy has been analyzed - e.g. "price broke
 * resistance", "bullish engulfing formed" - instead of requiring the
 * user to notice the setup themselves.
 *
 * Alerts are created already "due" (dated/timed to right now), so they
 * immediately light up the notification bell in AssetDetailModal and
 * show up in the Alerts tab, just like a manually created alert.
 */
export function useStrategyAlerts({ asset, candles = [], enabled = false }) {
  const { addAlert } = useAlerts();
  const alertedIdsRef = useRef(new Set());

  // Reset what's been alerted on whenever the asset changes, so
  // switching between assets doesn't carry over another symbol's
  // dedupe state (and doesn't silently suppress a real first alert).
  useEffect(() => {
    alertedIdsRef.current = new Set();
  }, [asset?.symbol]);

  useEffect(() => {
    if (!enabled || !asset?.symbol || candles.length < 2) {
      return;
    }

    const matches = detectPatterns(candles);

    matches.forEach((pattern) => {
      if (alertedIdsRef.current.has(pattern.id)) {
        return;
      }

      alertedIdsRef.current.add(pattern.id);

      const now = new Date();

      addAlert({
        symbol: asset.symbol,
        pair: asset.pair || asset.name || "",
        category: asset.category,

        heading: `${pattern.title} — ${pattern.description}`,
        targetPrice: pattern.price,

        alertType: "pattern",
        leadTime: 0,

        date: now.toISOString(),
        hour: now.getHours(),
        minute: now.getMinutes(),

        repeat: "once",
        repeatCount: 1,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, asset?.symbol, candles, addAlert]);
}
