import { useEffect, useState } from "react";

import { fetchTimeSeries } from "../services/api/twelveDataService";
import { getCryptoCandleSeries } from "../services/api/finnhubService";

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
 * status: "idle" | "loading" | "ready" | "unsupported" | "error"
 */
export function useAssetCandles(asset, category) {
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
          series = await getCryptoCandleSeries({
            displaySymbol: asset.symbol,
            resolution: "60",
            lookbackSeconds: 3600 * 24 * 3,
          });

          // Fall back to Twelve Data if Finnhub returns nothing (rate
          // limited, unsupported pair, etc.) - Twelve Data covers major
          // crypto pairs too.
          if (series.length === 0) {
            series = await fetchTimeSeries({
              symbol: asset.symbol,
              interval: "1h",
              outputsize: 72,
            });
          }
        } else if (category === "Forex") {
          series = await fetchTimeSeries({
            symbol: asset.symbol,
            interval: "15min",
            outputsize: 60,
          });
        } else if (category === "Stocks") {
          series = await fetchTimeSeries({
            symbol: asset.symbol,
            interval: "5min",
            outputsize: 78, // ~1 trading day at 5-min bars
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
  }, [asset?.symbol, category]);

  return { candles, status, error };
}