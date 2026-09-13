import { useEffect, useRef, useState } from "react";

import { FinnhubTradeSocket, fetchQuotes } from "../services/api/finnhubService";
import { STOCK_SYMBOLS } from "../services/api/config";

/**
 * Live stock prices: an initial snapshot fetched over REST (via Axios,
 * for previous-close/percent-change context), then kept fresh in real
 * time over Finnhub's trade WebSocket.
 */
export function useStockTicker(symbols = STOCK_SYMBOLS) {
  const [quotes, setQuotes] = useState({});
  const [status, setStatus] = useState("connecting");

  const socketRef = useRef(null);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    let cancelled = false;

    if (symbols.length > 0) {
      fetchQuotes(symbols).then((initial) => {
        if (!cancelled) {
          setQuotes((prev) => ({ ...initial, ...prev }));
        }
      });
    }

    const socket = new FinnhubTradeSocket(symbols);
    socketRef.current = socket;

    socket.connect({
      onTrade: (trade) => {
        setQuotes((prev) => {
          const existing = prev[trade.symbol] || {};
          const previousClose = existing.previousClose ?? trade.price;
          const change = trade.price - previousClose;
          const percentChange = previousClose ? (change / previousClose) * 100 : 0;

          return {
            ...prev,
            [trade.symbol]: {
              ...existing,
              symbol: trade.symbol,
              price: trade.price,
              previousClose,
              change,
              percentChange,
              positive: percentChange >= 0,
              timestamp: trade.timestamp,
            },
          };
        });
      },
      onStatusChange: setStatus,
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return { quotes, status };
}