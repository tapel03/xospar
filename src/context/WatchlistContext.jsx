import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WATCHLIST_STORAGE_KEY = "@market_app/watchlist";

// These are the assets that used to be hard-coded on the Markets screen.
// They now seed the Watch List so the default view looks unchanged,
// but they can be un-bookmarked just like anything else. `category` is
// set so the asset detail modal's chart knows which API to use for these.
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
    category: "Crypto",
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
    category: "Crypto",
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
    category: "Crypto",
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
  const [watchlist, setWatchlist] = useState(buildInitialWatchlist());
  const [isLoading, setIsLoading] = useState(true);

  // Load watchlist from AsyncStorage on mount
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        const stored = await AsyncStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setWatchlist(parsed);
        }
      } catch (error) {
        console.warn("Failed to load watchlist from storage:", error);
        // Fall back to default if storage fails
        setWatchlist(buildInitialWatchlist());
      } finally {
        setIsLoading(false);
      }
    };

    loadWatchlist();
  }, []);

  // Persist watchlist to AsyncStorage whenever it changes
  useEffect(() => {
    const persistWatchlist = async () => {
      try {
        await AsyncStorage.setItem(
          WATCHLIST_STORAGE_KEY,
          JSON.stringify(watchlist)
        );
      } catch (error) {
        console.warn("Failed to persist watchlist to storage:", error);
      }
    };

    // Only persist if we've finished loading
    if (!isLoading) {
      persistWatchlist();
    }
  }, [watchlist, isLoading]);

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
    () => ({ watchlistAssets, isBookmarked, toggleBookmark, isLoading }),
    [watchlistAssets, isBookmarked, toggleBookmark, isLoading]
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