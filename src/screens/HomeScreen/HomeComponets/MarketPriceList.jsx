import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Sparkline from "../../MarketsScreen/MarketsComponents/AI/AIChatComponents/Sparkline";
import { useCryptoTicker } from "../../../hooks/useCryptoTicker";

// Light palette - soft grey card on the white page, black text, same
// red/green semantics for price moves.
const CARD_BG = "#F5F5F7";
const TEXT_LIGHT = "#000000";
const TEXT_GRAY = "#8E8E93";
const DIVIDER = "#E4E4E7";
const HANDLE_COLOR = "#D4D4D8";
const SORT_MENU_BG = "#FFFFFF";
const POSITIVE = "#22A06B";
const NEGATIVE = "#E5484D";

const ASSETS = [
  {
    symbol: "BTCUSDT",
    display: "BTC",
    name: "Bitcoin",
    icon: "₿",
    iconBg: "#FFF1DE",
    iconColor: "#F7931A",
    capRank: 1,
  },
  {
    symbol: "ETHUSDT",
    display: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    iconBg: "#E8ECFF",
    iconColor: "#5C6FD6",
    capRank: 2,
  },
  {
    symbol: "USDTUSDT",
    display: "USDT",
    name: "Tether",
    icon: "₮",
    iconBg: "#DDF5EC",
    iconColor: "#26A17B",
    capRank: 3,
  },
];

const SORT_OPTIONS = [
  { key: "cap", label: "Capitalization" },
  { key: "priceDesc", label: "Price: High to Low" },
  { key: "priceAsc", label: "Price: Low to High" },
  { key: "changeDesc", label: "% Change: Gainers first" },
  { key: "changeAsc", label: "% Change: Losers first" },
  { key: "name", label: "Name (A-Z)" },
];

function formatPrice(value) {
  if (!Number.isFinite(value)) return "--";
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatChangeAbs(value) {
  if (!Number.isFinite(value)) return null;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function buildSparkline(seedPositive) {
  const points = [];
  let value = 10;

  for (let i = 0; i < 10; i += 1) {
    const drift = seedPositive ? 0.6 : -0.6;
    value += drift + (Math.random() - 0.5) * 1.4;
    points.push(Math.max(1, value));
  }

  return points;
}

export default function MarketPriceList() {
  const { tickers } = useCryptoTicker();

  const [sortMode, setSortMode] = useState("cap");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.key === sortMode)?.label || "Capitalization";

  const rows = useMemo(() => {
    const built = ASSETS.map((asset) => {
      const live = tickers[asset.symbol];
      const positive = live ? live.positive : asset.symbol !== "USDTUSDT";

      const priceValue = live
        ? live.price
        : asset.symbol === "USDTUSDT"
        ? 1
        : null;

      const percentValue = live
        ? live.percentChange
        : asset.symbol === "USDTUSDT"
        ? -0.1
        : null;

      const changeValue = live
        ? live.change
        : asset.symbol === "USDTUSDT"
        ? -0.1
        : null;

      return {
        ...asset,
        priceValue,
        percentValue,
        price: Number.isFinite(priceValue) ? formatPrice(priceValue) : "--",
        changeAbs: formatChangeAbs(changeValue),
        changePercent: Number.isFinite(percentValue)
          ? `${percentValue >= 0 ? "+" : ""}${percentValue.toFixed(2)}%`
          : "--",
        positive,
        spark: buildSparkline(positive),
      };
    });

    const sorted = built.slice();

    switch (sortMode) {
      case "priceDesc":
        sorted.sort((a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity));
        break;
      case "priceAsc":
        sorted.sort((a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity));
        break;
      case "changeDesc":
        sorted.sort(
          (a, b) => (b.percentValue ?? -Infinity) - (a.percentValue ?? -Infinity)
        );
        break;
      case "changeAsc":
        sorted.sort(
          (a, b) => (a.percentValue ?? Infinity) - (b.percentValue ?? Infinity)
        );
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "cap":
      default:
        sorted.sort((a, b) => a.capRank - b.capRank);
        break;
    }

    return sorted;
  }, [tickers, sortMode]);

  const handleSelectSort = (key) => {
    setSortMode(key);
    setSortMenuOpen(false);
  };

  return (
    <View style={styles.card}>
      {/* Drag handle - purely decorative, matches the reference sheet */}
      <View style={styles.handle} />

      <View style={styles.headerRow}>
        <Text style={styles.title}>Market</Text>

        <Pressable
          style={styles.filterButton}
          onPress={() => setSortMenuOpen((value) => !value)}
          hitSlop={8}
        >
          <Ionicons name="options-outline" size={20} color={TEXT_LIGHT} />
        </Pressable>
      </View>

      <Text style={styles.sortLine}>
        Sort by: <Text style={styles.sortLineActive}>{activeSortLabel}</Text>
      </Text>

      {sortMenuOpen && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((option) => {
            const active = option.key === sortMode;

            return (
              <Pressable
                key={option.key}
                style={styles.sortMenuRow}
                onPress={() => handleSelectSort(option.key)}
              >
                <Text
                  style={[
                    styles.sortMenuText,
                    active && styles.sortMenuTextActive,
                  ]}
                >
                  {option.label}
                </Text>

                {active && (
                  <Ionicons name="checkmark" size={14} color={TEXT_LIGHT} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.rows}>
        {rows.map((row, index) => (
          <View
            key={row.symbol}
            style={[
              styles.row,
              index === rows.length - 1 && styles.rowLast,
            ]}
          >
            <View style={styles.left}>
              <View style={[styles.icon, { backgroundColor: row.iconBg }]}>
                <Text style={[styles.iconText, { color: row.iconColor }]}>
                  {row.icon}
                </Text>
              </View>

              <View>
                <Text style={styles.name}>{row.name}</Text>
                <Text style={styles.symbol}>{row.display}</Text>
              </View>
            </View>

            <View style={styles.sparkWrapper}>
              <Sparkline
                data={row.spark}
                width={72}
                height={30}
                color={row.positive ? POSITIVE : NEGATIVE}
              />
            </View>

            <View style={styles.right}>
              <Text style={styles.price}>{row.price}</Text>

              <Text style={styles.changeRow}>
                {row.changeAbs ? (
                  <Text style={styles.changeAbs}>{row.changeAbs} </Text>
                ) : null}

                <Text
                  style={[
                    styles.changePercent,
                    { color: row.positive ? POSITIVE : NEGATIVE },
                  ]}
                >
                  {row.changePercent}
                </Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E6E6EA",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 6,
  },

  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: HANDLE_COLOR,
    alignSelf: "center",
    marginBottom: 14,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: TEXT_LIGHT,
    fontSize: 24,
    fontWeight: "800",
  },

  filterButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  sortLine: {
    color: TEXT_GRAY,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 14,
  },

  sortLineActive: {
    color: TEXT_LIGHT,
    fontWeight: "700",
  },

  sortMenu: {
    backgroundColor: SORT_MENU_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },

  sortMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },

  sortMenuText: {
    color: TEXT_GRAY,
    fontSize: 13,
    fontWeight: "500",
  },

  sortMenuTextActive: {
    color: TEXT_LIGHT,
    fontWeight: "700",
  },

  rows: {
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1.3,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 18,
    fontWeight: "700",
  },

  name: {
    color: TEXT_LIGHT,
    fontSize: 15,
    fontWeight: "700",
  },

  symbol: {
    color: TEXT_GRAY,
    fontSize: 12,
    marginTop: 2,
  },

  sparkWrapper: {
    flex: 1,
    alignItems: "center",
  },

  right: {
    flex: 1.1,
    alignItems: "flex-end",
  },

  price: {
    color: TEXT_LIGHT,
    fontSize: 16,
    fontWeight: "700",
  },

  changeRow: {
    marginTop: 4,
    fontSize: 12,
  },

  changeAbs: {
    color: TEXT_GRAY,
    fontSize: 12,
  },

  changePercent: {
    fontSize: 12,
    fontWeight: "700",
  },
});