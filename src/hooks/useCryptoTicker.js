import { useEffect, useRef, useState } from "react";

import { BinanceTickerSocket } from "../services/api/binanceService";
import { CRYPTO_SYMBOLS } from "../services/api/config";

/**
 * Live crypto prices streamed straight from Binance's public WebSocket -
 * no API key required.
 */
export function useCryptoTicker(symbols = CRYPTO_SYMBOLS) {
  const [tickers, setTickers] = useState({});
  const [status, setStatus] = useState("connecting");

  const socketRef = useRef(null);
  const symbolsKey = symbols.join(",");

  useEffect(() => {
    const socket = new BinanceTickerSocket(symbols);
    socketRef.current = socket;

    socket.connect({
      onUpdate: (ticker) => {
        setTickers((prev) => ({ ...prev, [ticker.symbol]: ticker }));
      },
      onStatusChange: setStatus,
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return { tickers, status };
}