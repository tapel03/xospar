import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ALL_TWELVE_DATA_SYMBOLS,
  FOREX_PAIR_LABELS,
} from "../../services/api/config";

const CATEGORY_SHORTCUTS = ["Crypto", "Forex", "Stocks", "Indices"];

const TOOLS = [
  { key: "position", title: "Position Size", hint: "Units to trade for a fixed risk" },
  { key: "rr", title: "Risk/Reward", hint: "Compare risk with potential reward" },
  { key: "pip", title: "Pip Calculator", hint: "Pip value for a pair and lot size" },
  { key: "lot", title: "Lot Size", hint: "Lots to trade for a fixed risk" },
];

// Mirrors the lists in MarketCategoryDetailScreen (forex comes from config).
const ASSETS = [
  { symbol: "BTC/USD", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH/USD", name: "Ethereum", category: "Crypto" },
  { symbol: "SUI/USD", name: "Sui", category: "Crypto" },
  { symbol: "SOL/USD", name: "Solana", category: "Crypto" },
  { symbol: "BNB/USD", name: "BNB", category: "Crypto" },

  ...ALL_TWELVE_DATA_SYMBOLS.map((symbol) => ({
    symbol,
    name: FOREX_PAIR_LABELS[symbol] || symbol,
    category: "Forex",
  })),

  { symbol: "S&P 500", name: "S&P 500 Index", category: "Indices" },
  { symbol: "NASDAQ", name: "Nasdaq Composite", category: "Indices" },
  { symbol: "DOW", name: "Dow Jones", category: "Indices" },
  { symbol: "FTSE 100", name: "FTSE 100", category: "Indices" },

  { symbol: "AAPL", name: "Apple", category: "Stocks" },
  { symbol: "NVDA", name: "NVIDIA", category: "Stocks" },
  { symbol: "TSLA", name: "Tesla", category: "Stocks" },
  { symbol: "MSFT", name: "Microsoft", category: "Stocks" },
];

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s/]/g, "");

const MAX_ASSET_RESULTS = 25;

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const q = normalize(query);

  const assetResults = useMemo(() => {
    if (!q) return [];

    return ASSETS.filter(
      (asset) =>
        normalize(asset.symbol).includes(q) ||
        normalize(asset.name).includes(q) ||
        normalize(asset.category).includes(q)
    ).slice(0, MAX_ASSET_RESULTS);
  }, [q]);

  const toolResults = useMemo(() => {
    if (!q) return [];

    return TOOLS.filter(
      (tool) =>
        normalize(tool.title).includes(q) ||
        normalize(tool.hint).includes(q) ||
        "tools".includes(q) ||
        "calculator".includes(q)
    );
  }, [q]);

  const openCategory = (category) => {
    Keyboard.dismiss();
    navigation.getParent()?.navigate("Markets", {
      screen: "MarketCategoryDetail",
      params: { category },
    });
  };

  const openAsset = (asset) => {
    Keyboard.dismiss();
    navigation.getParent()?.navigate("Markets", {
      screen: "MarketCategoryDetail",
      params: {
        category: asset.category,
        openSymbol: asset.symbol,
        openKey: Date.now(),
      },
    });
  };

  const openTool = (tool) => {
    Keyboard.dismiss();
    navigation.navigate("QuickTool", { tool: tool.key });
  };

  const hasQuery = q.length > 0;
  const noResults =
    hasQuery && assetResults.length === 0 && toolResults.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* SEARCH BAR */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={17} color="#8B949E" />

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search markets, pairs, tools"
            placeholderTextColor="#59636D"
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />

          {hasQuery && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#8B949E" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {!hasQuery && (
          <>
            <Text style={styles.sectionTitle}>Browse markets</Text>

            <View style={styles.chipRow}>
              {CATEGORY_SHORTCUTS.map((category) => (
                <Pressable
                  key={category}
                  style={styles.chip}
                  onPress={() => openCategory(category)}
                >
                  <Text style={styles.chipText}>{category}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.hint}>
              Try “btc”, “eurusd”, “apple” or “pip”.
            </Text>
          </>
        )}

        {assetResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Markets</Text>

            {assetResults.map((asset) => (
              <Pressable
                key={`${asset.category}-${asset.symbol}`}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => openAsset(asset)}
              >
                <View style={styles.rowIcon}>
                  <Text style={styles.rowIconText}>
                    {asset.symbol.charAt(0)}
                  </Text>
                </View>

                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{asset.symbol}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {asset.name}
                  </Text>
                </View>

                <View style={styles.tag}>
                  <Text style={styles.tagText}>{asset.category}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {toolResults.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Quick Tools</Text>

            {toolResults.map((tool) => (
              <Pressable
                key={tool.key}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => openTool(tool)}
              >
                <View style={[styles.rowIcon, styles.toolIcon]}>
                  <Ionicons name="calculator-outline" size={18} color="#9CC2FF" />
                </View>

                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{tool.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {tool.hint}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#59636D" />
              </Pressable>
            ))}
          </>
        )}

        {noResults && (
          <Text style={styles.emptyText}>
            No results for “{query.trim()}”.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050A12",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: "100%",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 10,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1F5FD0",
  },

  chipText: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "600",
  },

  hint: {
    color: "#5F6871",
    fontSize: 12,
    marginTop: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  pressed: {
    opacity: 0.65,
  },

  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1C2A3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  toolIcon: {
    backgroundColor: "#13233A",
  },

  rowIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  rowText: {
    flex: 1,
    paddingRight: 8,
  },

  rowTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  rowSub: {
    color: "#7D8691",
    fontSize: 11,
    marginTop: 3,
  },

  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#13233A",
  },

  tagText: {
    color: "#9CC2FF",
    fontSize: 10,
    fontWeight: "700",
  },

  emptyText: {
    color: "#8B949E",
    fontSize: 13,
    textAlign: "center",
    marginTop: 40,
  },
});