import { useEffect, useState } from "react";

import { fetchTimeSeries } from "../services/api/twelveDataService";
import { getCryptoCandleSeries } from "../services/api/finnhubService";
import {
  DEFAULT_CHART_RANGE,
  getFinnhubCryptoRangeParams,
  getTwelveDataRangeParams,
} from "../services/api/candleRanges";

// "AAPL" stays "AAPL"; Twelve Data uses plain tickers for US stocks, so no
// symbol translation is needed there (unlike the Binance/Finnhub crypto path).

/**
 * Fetches historical OHLC candles for whichever asset/category the asset
 * detail modal has open, so the chart there shows real data instead of a
 * placeholder. Picks the data source by category:
 *   - Crypto  -> Finnhub crypto candles (via Binance exchange symbol)
 *   - Forex   -> Twelve Data time_series
 *   - Stocks  -> Twelve Data time_series (Finnhub's /stock/candle is a
 *                paid-only endpoint on the free tier, so it's not used here)
 *   - Indices -> not backed by a real ticker in this app, so unsupported
 *
 * `range` is one of CHART_RANGES ("D" | "W" | "M" | "6M" | "Y" | "All") -
 * changing it re-fetches at the interval/lookback that range calls for
 * (see candleRanges.js), just like tapping D/W/M/6M/Y/All on the chart.
 *
 * status: "idle" | "loading" | "ready" | "unsupported" | "error"
 */
export function useAssetCandles(asset, category, range = DEFAULT_CHART_RANGE) {
  const [candles, setCandles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!asset?.symbol) {
      setCandles([]);
      setStatus("idle");
      return undefined;
    }

    if (category === "Indices") {
      setCandles([]);
      setStatus("unsupported");
      return undefined;
    }

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        let series = [];

        if (category === "Crypto") {
          // Finnhub's free tier still allows crypto candles for most
          // Binance-listed pairs, unlike its stock candle endpoint.
          const { resolution, lookbackSeconds } = getFinnhubCryptoRangeParams(range);

          series = await getCryptoCandleSeries({
            displaySymbol: asset.symbol,
            resolution,
            lookbackSeconds,
          });

          // Fall back to Twelve Data if Finnhub returns nothing (rate
          // limited, unsupported pair, etc.) - Twelve Data covers major
          // crypto pairs too.
          if (series.length === 0) {
            const fallback = getTwelveDataRangeParams(range);
            series = await fetchTimeSeries({
              symbol: asset.symbol,
              interval: fallback.interval,
              outputsize: fallback.outputsize,
            });
          }
        } else if (category === "Forex" || category === "Stocks") {
          const { interval, outputsize } = getTwelveDataRangeParams(range);
          series = await fetchTimeSeries({
            symbol: asset.symbol,
            interval,
            outputsize,
          });
        }

        if (!cancelled) {
          setCandles(series);
          setStatus(series.length > 0 ? "ready" : "unsupported");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [asset?.symbol, category, range]);

  return { candles, status, error };
}
