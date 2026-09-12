import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

// These are the assets that used to be hard-coded on the Markets screen.
// They now seed the Watch List so the default view looks unchanged,
// but they can be un-bookmarked just like anything else.
const DEFAULT_WATCHLIST_ASSETS = [
  {
    symbol: "USDT",
    name: "Tether",
    pair: "USDT / USD",
    price: "1.000",
    allocation: "1.5%",
    change: "-0.3%",
    positive: false,
    icon: "₮",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    pair: "ETH / USD",
    price: "2,568.20",
    allocation: "2.8%",
    change: "-5.2%",
    positive: false,
    icon: "Ξ",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    pair: "UNI / USD",
    price: "5,234.68",
    allocation: "10%",
    change: "+8.4%",
    positive: true,
    icon: "U",
  },
];

const WatchlistContext = createContext(null);

function buildInitialWatchlist() {
  const initial = {};

  DEFAULT_WATCHLIST_ASSETS.forEach((asset) => {
    initial[asset.symbol] = asset;
  });

  return initial;
}

export function WatchlistProvider({ children }) {
  // Keyed by symbol so any asset - crypto, forex pair, index, or stock -
  // can be bookmarked from anywhere in the app and it will sync here.
  const [watchlist, setWatchlist] = useState(buildInitialWatchlist);

  const isBookmarked = useCallback(
    (symbol) => Boolean(watchlist[symbol]),
    [watchlist]
  );

  const toggleBookmark = useCallback((asset) => {
    if (!asset?.symbol) {
      return;
    }

    setWatchlist((prev) => {
      const next = { ...prev };

      if (next[asset.symbol]) {
        delete next[asset.symbol];
      } else {
        next[asset.symbol] = asset;
      }

      return next;
    });
  }, []);

  const watchlistAssets = useMemo(
    () => Object.values(watchlist),
    [watchlist]
  );

  const value = useMemo(
    () => ({ watchlistAssets, isBookmarked, toggleBookmark }),
    [watchlistAssets, isBookmarked, toggleBookmark]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);

  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return context;
}