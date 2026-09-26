import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import BookmarkButton from "./MarketsComponents/BookmarkButton";
import AssetDetailModal from "./MarketsComponents/AssetDetailModal";
import { useWatchlist } from "../../context/WatchlistContext";

import { useForexPrices } from "../../hooks/useForexPrices";
import { useCryptoTicker } from "../../hooks/useCryptoTicker";
import { useStockTicker } from "../../hooks/useStockTicker";
import * as apiConfig from "../../services/api/config";

// Pull these out defensively - if any of these are missing/undefined from
// config.js, we log a clear warning instead of crashing the whole module
// (which is what was causing the blank screen when tapping a category).
const ALL_TWELVE_DATA_SYMBOLS = Array.isArray(apiConfig.ALL_TWELVE_DATA_SYMBOLS)
  ? apiConfig.ALL_TWELVE_DATA_SYMBOLS
  : [];

const FOREX_PAIR_LABELS = apiConfig.FOREX_PAIR_LABELS || {};
const INDEX_LABELS = apiConfig.INDEX_LABELS || {};
const CRYPTO_SYMBOLS = Array.isArray(apiConfig.CRYPTO_SYMBOLS)
  ? apiConfig.CRYPTO_SYMBOLS
  : [];
const STOCK_SYMBOLS = Array.isArray(apiConfig.STOCK_SYMBOLS)
  ? apiConfig.STOCK_SYMBOLS
  : [];

if (!Array.isArray(apiConfig.ALL_TWELVE_DATA_SYMBOLS)) {
  console.warn(
    "[MarketCategoryDetailScreen] ALL_TWELVE_DATA_SYMBOLS is missing or not an array from services/api/config. " +
      "This would previously crash the screen on navigation (blank screen). Check the export name/shape in config.js."
  );
}

// "BTC/USD" -> "BTCUSDT" so the display symbol can be looked up against
// Binance's ticker payloads.
function toBinanceSymbol(displaySymbol) {
  const compact = displaySymbol.replace("/", "");
  return compact.endsWith("USD") ? `${compact}T` : compact;
}

function formatPrice(value, category) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  const decimals = category === "Forex" ? 4 : 2;

  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// Built from the live symbol list/labels in config.js so the 29 forex
// pairs + DXY/JXY only ever need to be maintained in one place.
const FOREX_PAIRS_DISPLAY = ALL_TWELVE_DATA_SYMBOLS.map((symbol) => ({
  symbol,
  name: FOREX_PAIR_LABELS[symbol] || symbol,
  price: "--",
  change: "0.00%",
  positive: true,
}));

const CATEGORY_PAIRS = {
  Crypto: [
    {
      symbol: "BTC/USD",
      name: "Bitcoin",
      price: "104,250.20",
      change: "+2.8%",
      positive: true,
    },
    {
      symbol: "ETH/USD",
      name: "Ethereum",
      price: "2,568.20",
      change: "-5.2%",
      positive: false,
    },
    {
      symbol: "SUI/USD",
      name: "Sui",
      price: "7.55",
      change: "+2.8%",
      positive: true,
    },
    {
      symbol: "SOL/USD",
      name: "Solana",
      price: "182.40",
      change: "+4.1%",
      positive: true,
    },
    {
      symbol: "BNB/USD",
      name: "BNB",
      price: "612.35",
      change: "+1.6%",
      positive: true,
    },
  ],

  Forex: FOREX_PAIRS_DISPLAY,

  Indices: [
    {
      symbol: "S&P 500",
      name: "S&P 500 Index",
      price: "5,642.18",
      change: "+0.52%",
      positive: true,
    },
    {
      symbol: "NASDAQ",
      name: "Nasdaq Composite",
      price: "17,825.15",
      change: "+0.84%",
      positive: true,
    },
    {
      symbol: "DOW",
      name: "Dow Jones",
      price: "41,203.45",
      change: "-0.31%",
      positive: false,
    },
    {
      symbol: "FTSE 100",
      name: "FTSE 100",
      price: "8,245.60",
      change: "+0.24%",
      positive: true,
    },
  ],

  Stocks: [
    {
      symbol: "AAPL",
      name: "Apple",
      price: "226.45",
      change: "+1.24%",
      positive: true,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA",
      price: "142.68",
      change: "+2.51%",
      positive: true,
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      price: "348.92",
      change: "-1.12%",
      positive: false,
    },
    {
      symbol: "MSFT",
      name: "Microsoft",
      price: "510.25",
      change: "+0.65%",
      positive: true,
    },
  ],
};

export default function MarketCategoryDetailScreen({ navigation, route }) {
  const category = route?.params?.category || "Crypto";

  // Set by the Home search screen so a picked asset opens its detail
  // sheet straight away. `openKey` changes on every search pick, so
  // choosing the same asset twice still re-opens it.
  const openSymbol = route?.params?.openSymbol;
  const openKey = route?.params?.openKey;

  const [selectedAsset, setSelectedAsset] = useState(null);

  // Only the hook matching the active category actually opens a
  // connection/starts polling - the others are called with an empty
  // symbol list so they stay idle (keeps this compliant with the rules
  // of hooks while avoiding wasted network/API usage).
  const liveForex = useForexPrices(category === "Forex" ? ALL_TWELVE_DATA_SYMBOLS : []);
  const liveCrypto = useCryptoTicker(category === "Crypto" ? CRYPTO_SYMBOLS : []);
  const liveStocks = useStockTicker(category === "Stocks" ? STOCK_SYMBOLS : []);

  const pairs = useMemo(() => {
    const basePairs = CATEGORY_PAIRS[category] || [];

    return basePairs.map((pair) => {
      let live = null;

      try {
        if (category === "Forex") {
          live = liveForex?.quotes?.[pair.symbol];
        } else if (category === "Crypto") {
          live = liveCrypto?.tickers?.[toBinanceSymbol(pair.symbol)];
        } else if (category === "Stocks") {
          live = liveStocks?.quotes?.[pair.symbol];
        }
      } catch (err) {
        console.warn("[MarketCategoryDetailScreen] Error reading live quote for", pair.symbol, err);
      }

      if (!live) {
        return pair;
      }

      return {
        ...pair,
        price: formatPrice(live.price, category),
        change: formatPercent(live.percentChange),
        positive: live.positive,
      };
    });
  }, [category, liveForex?.quotes, liveCrypto?.tickers, liveStocks?.quotes]);

  // The same list, but reshaped into the asset shape AssetDetailModal
  // expects - lets swiping inside the modal cycle through only this
  // category's pairs (never mixing in the Watch List or another category).
  const categoryAssets = useMemo(
    () =>
      pairs.map((pair) => ({
        symbol: pair.symbol,
        name: pair.name,
        pair: pair.name,
        price: pair.price,
        change: pair.change,
        positive: pair.positive,
        icon: pair.symbol.charAt(0),
        category,
      })),
    [pairs, category]
  );

  const selectedIndex = useMemo(
    () =>
      selectedAsset
        ? categoryAssets.findIndex(
            (item) => item.symbol === selectedAsset.symbol
          )
        : -1,
    [selectedAsset, categoryAssets]
  );

  // Bookmarking any currency, pair, index, or stock here syncs it straight
  // into the Watch List on the Markets home screen.
  const { isBookmarked, toggleBookmark } = useWatchlist();

  const statusLabel =
    category === "Crypto"
      ? liveCrypto?.status === "connected"
        ? "Live"
        : "Connecting..."
      : category === "Stocks"
      ? liveStocks?.status === "connected"
        ? "Live"
        : "Connecting..."
      : category === "Forex"
      ? liveForex?.lastUpdated
        ? "Live"
        : "Loading..."
      : null;

  const handlePressAsset = (pair) => {
    // Create watchlist asset shape. `category` is carried along so the
    // asset detail modal knows which price-history API to call for the
    // chart (Twelve Data for Forex, Finnhub for Crypto/Stocks, etc).
    const watchlistAsset = {
      symbol: pair.symbol,
      name: pair.name,
      pair: pair.name,
      price: pair.price,
      change: pair.change,
      positive: pair.positive,
      icon: pair.symbol.charAt(0),
      category,
    };

    // Set selected asset to open modal
    setSelectedAsset(watchlistAsset);
  };

  // Open the asset picked from Home search (runs once per search pick).
  useEffect(() => {
    if (!openSymbol) {
      return;
    }

    const match = pairs.find((pair) => pair.symbol === openSymbol);

    if (match) {
      handlePressAsset(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSymbol, openKey]);

  const handleCloseModal = () => {
    setSelectedAsset(null);
  };

  const handleToggleBookmark = () => {
    if (selectedAsset) {
      toggleBookmark(selectedAsset);
    }
  };

  return (
    <View style={styles.container}>
      {/* =========================
          HEADER
      ========================== */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.title}>
          {category}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* =========================
          TRADING PAIRS
      ========================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>
            Trading Pairs
          </Text>

          {statusLabel && (
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusLabel === "Live" ? "#4ADE80" : "#8B949E" },
                ]}
              />
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          )}
        </View>

        {pairs.length === 0 && (
          <Text style={styles.emptyText}>
            No trading pairs available for {category} right now.
          </Text>
        )}

        {pairs.map((pair, index) => {
          // Shared shape so this asset renders correctly in the Watch List,
          // no matter which category (currency, pair, index, stock) it came from.
          const watchlistAsset = {
            symbol: pair.symbol,
            name: pair.name,
            pair: pair.name,
            price: pair.price,
            change: pair.change,
            positive: pair.positive,
            icon: pair.symbol.charAt(0),
            category,
          };

          return (
            <Pressable
              key={pair.symbol || index}
              style={({ pressed }) => [
                styles.pairRow,
                pressed && styles.pairPressed,
              ]}
              onPress={() => handlePressAsset(pair)}
            >
              <View style={styles.pairLeft}>
                <BookmarkButton
                  bookmarked={isBookmarked(pair.symbol)}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleBookmark(watchlistAsset);
                  }}
                />

                <View style={styles.icon}>
                  <Text style={styles.iconText}>
                    {pair.symbol.charAt(0)}
                  </Text>
                </View>

                <View>
                  <Text style={styles.symbol}>
                    {pair.symbol}
                  </Text>

                  <Text style={styles.name}>
                    {pair.name}
                  </Text>
                </View>
              </View>

              <View style={styles.pairRight}>
                <Text style={styles.price}>
                  {pair.price}
                </Text>

                <Text
                  style={[
                    styles.change,
                    {
                      color: pair.positive
                        ? "#39E6C0"
                        : "#FF4D67",
                    },
                  ]}
                >
                  {pair.positive ? "↑ " : "↓ "}
                  {pair.change}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={17}
                color="#59636D"
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Modal for asset details */}
      <AssetDetailModal
        asset={selectedAsset}
        visible={selectedAsset !== null}
        onClose={handleCloseModal}
        bookmarked={selectedAsset ? isBookmarked(selectedAsset.symbol) : false}
        onToggleBookmark={handleToggleBookmark}
        assets={categoryAssets}
        currentIndex={selectedIndex}
        onNavigate={(index) => setSelectedAsset(categoryAssets[index])}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },

  headerSpacer: {
    flex: 1,
  },

  content: {
    paddingBottom: 30,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    color: "#AAAAAA",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyText: {
    color: "#8B949E",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  pairRow: {
    minHeight: 72,
    marginHorizontal: 12,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  pairPressed: {
    opacity: 0.55,
  },

  pairLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#27313B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  iconText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  symbol: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  name: {
    color: "#777F84",
    fontSize: 10,
    marginTop: 3,
  },

  pairRight: {
    alignItems: "flex-end",
    marginRight: 10,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  change: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
});