import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AssetPriceChart from "../../MarketsScreen/MarketsComponents/AssetPriceChart";
import { useAssetCandles } from "../../../hooks/useAssetCandles";
import { colors } from "../../../theme/colors";

// The set of pairs the chart above can switch between. Kept to crypto
// pairs since that's what the rest of the Home screen already tracks.
const PAIR_OPTIONS = [
  { symbol: "BTC/USD", label: "BTC/USD" },
  { symbol: "ETH/USD", label: "ETH/USD" },
  { symbol: "SOL/USD", label: "SOL/USD" },
  { symbol: "BNB/USD", label: "BNB/USD" },
];

// "Market price" feature chart, with a pair selector directly beneath
// it. The selector has no background/border of its own - it sits flush
// against the page until tapped, at which point the option list drops
// down (still unboxed, just text) so switching pairs never feels like a
// separate UI surface bolted onto the page.
export default function MarketChartSection() {
  const [selectedPair, setSelectedPair] = useState(PAIR_OPTIONS[0]);
  const [expanded, setExpanded] = useState(false);
  const [chartWidth, setChartWidth] = useState(0);

  const asset = useMemo(() => ({ symbol: selectedPair.symbol }), [selectedPair]);

  const { candles, status } = useAssetCandles(asset, "Crypto", "1D");

  const latestClose = candles.length ? candles[candles.length - 1].close : null;

  const handleSelect = (option) => {
    setSelectedPair(option);
    setExpanded(false);
  };

  return (
    <View style={styles.container}>
      {/* MAIN CHART CONTAINER */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{selectedPair.label}</Text>

          {Number.isFinite(latestClose) && (
            <Text style={styles.chartPrice}>
              ${latestClose.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
        </View>

        <View
          style={styles.chartBody}
          onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
        >
          {status === "loading" && (
            <ActivityIndicator size="small" color={colors[700]} />
          )}

          {status === "ready" && chartWidth > 0 && (
            <AssetPriceChart
              candles={candles}
              mode="line"
              width={chartWidth}
              showRangeLabels={false}
              showTimeLabels
            />
          )}

          {status === "unsupported" && (
            <Text style={styles.chartEmptyText}>
              Chart data isn't available for {selectedPair.label} yet.
            </Text>
          )}

          {status === "error" && (
            <Text style={styles.chartEmptyText}>Couldn't load chart data.</Text>
          )}
        </View>
      </View>

      {/* PAIR SELECTOR - invisible/blended until tapped */}
      <Pressable
        style={styles.selectorRow}
        onPress={() => setExpanded((value) => !value)}
        hitSlop={6}
      >
        <Text style={styles.selectorLabel}>Pair</Text>

        <View style={styles.selectorValueRow}>
          <Text style={styles.selectorValue}>{selectedPair.label}</Text>

          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors[600]}
          />
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.optionList}>
          {PAIR_OPTIONS.map((option) => {
            const active = option.symbol === selectedPair.symbol;

            return (
              <Pressable
                key={option.symbol}
                style={styles.optionRow}
                onPress={() => handleSelect(option)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {option.label}
                </Text>

                {active && (
                  <Ionicons name="checkmark" size={14} color={colors[950]} />
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },

  chartCard: {
    backgroundColor: colors[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors[200],
    padding: 14,
  },

  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  chartTitle: {
    color: colors[950],
    fontSize: 15,
    fontWeight: "700",
  },

  chartPrice: {
    color: colors[700],
    fontSize: 14,
    fontWeight: "600",
  },

  chartBody: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },

  chartEmptyText: {
    color: colors[500],
    fontSize: 12,
    textAlign: "center",
  },

  /* Pair selector - no background/border, blends with the page. Only
     the label + chevron are visible until tapped. */
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  selectorLabel: {
    color: colors[500],
    fontSize: 11,
  },

  selectorValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  selectorValue: {
    color: colors[950],
    fontSize: 13,
    fontWeight: "600",
  },

  /* Option list - also unboxed, just stacked text rows so it reads as
     part of the page rather than a floating menu. */
  optionList: {
    paddingHorizontal: 4,
    paddingBottom: 6,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
  },

  optionText: {
    color: colors[600],
    fontSize: 13,
    fontWeight: "500",
  },

  optionTextActive: {
    color: colors[950],
    fontWeight: "700",
  },
});