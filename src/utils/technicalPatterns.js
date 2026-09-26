// src/utils/technicalPatterns.js

// Lightweight, deterministic technical-pattern detection used to power
// the Strategy Coach panel's live alerts. Works off the same candle
// shape produced by useAssetCandles: { time, open, high, low, close }.
// Everything here is intentionally simple/rule-based (no AI call per
// candle) so it can run on every price update without cost or latency.

function isBullishEngulfing(prev, curr) {
  if (!prev || !curr) return false;

  const prevBearish = prev.close < prev.open;
  const currBullish = curr.close > curr.open;

  return (
    prevBearish &&
    currBullish &&
    curr.open <= prev.close &&
    curr.close >= prev.open
  );
}

function isBearishEngulfing(prev, curr) {
  if (!prev || !curr) return false;

  const prevBullish = prev.close > prev.open;
  const currBearish = curr.close < curr.open;

  return (
    prevBullish &&
    currBearish &&
    curr.open >= prev.close &&
    curr.close <= prev.open
  );
}

/**
 * Detects the most recent candle closing above resistance (the highest
 * high of the lookback window preceding it) or below support (the
 * lowest low of that same window).
 */
function detectBreakout(candles, lookback = 20) {
  if (candles.length < lookback + 2) {
    return null;
  }

  const latest = candles[candles.length - 1];
  const window = candles.slice(-(lookback + 1), -1);

  const resistance = Math.max(...window.map((c) => c.high));
  const support = Math.min(...window.map((c) => c.low));

  const decimals = latest.close < 10 ? 4 : 2;

  if (latest.close > resistance) {
    return {
      type: "resistance_break",
      title: "Resistance broken",
      description: `Price closed above the recent resistance level (${resistance.toFixed(
        decimals
      )}).`,
      price: latest.close,
      time: latest.time,
    };
  }

  if (latest.close < support) {
    return {
      type: "support_break",
      title: "Support broken",
      description: `Price closed below the recent support level (${support.toFixed(
        decimals
      )}).`,
      price: latest.close,
      time: latest.time,
    };
  }

  return null;
}

/**
 * Runs every detector against the latest candles and returns an array of
 * pattern matches found on the most recently completed candle. Each
 * match gets a stable `id` derived from its type + candle time, so
 * callers (see useStrategyAlerts) can dedupe against patterns they've
 * already alerted on and avoid re-firing the same alert every render.
 */
export function detectPatterns(candles = [], { lookback = 20 } = {}) {
  if (!Array.isArray(candles) || candles.length < 2) {
    return [];
  }

  const matches = [];
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const decimals = latest.close < 10 ? 4 : 2;

  if (isBullishEngulfing(prev, latest)) {
    matches.push({
      id: `bullish_engulfing-${latest.time}`,
      type: "bullish_engulfing",
      title: "Bullish engulfing",
      description: `A bullish engulfing candle formed near ${latest.close.toFixed(
        decimals
      )}.`,
      price: latest.close,
      time: latest.time,
    });
  }

  if (isBearishEngulfing(prev, latest)) {
    matches.push({
      id: `bearish_engulfing-${latest.time}`,
      type: "bearish_engulfing",
      title: "Bearish engulfing",
      description: `A bearish engulfing candle formed near ${latest.close.toFixed(
        decimals
      )}.`,
      price: latest.close,
      time: latest.time,
    });
  }

  const breakout = detectBreakout(candles, lookback);

  if (breakout) {
    matches.push({
      ...breakout,
      id: `${breakout.type}-${breakout.time}`,
    });
  }

  return matches;
}
