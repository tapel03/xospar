import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["AI Analysis", "Related News"];

// Placeholder asset info - swap for live prices later.
const ASSET_META = {
  Gold: { title: "Gold (XAU/USD)", price: "2642.50", icon: "medal" },
  Oil: { title: "Crude Oil (WTI)", price: "78.40", icon: "water" },
  USD: { title: "US Dollar Index", price: "104.20", icon: "cash" },
  "S&P 500": { title: "S&P 500", price: "5642.18", icon: "stats-chart" },
};

// Placeholder factor breakdowns per asset (percentages sum to 100).
const ANALYSES = {
  Gold: {
    factors: [
      { label: "Geopolitical Risk\n(Middle East)", pct: 34, color: "#E5484D", icon: "flame" },
      { label: "USD Strength", pct: 24, color: "#3A7BD5", icon: "cash" },
      { label: "Safe Haven Demand", pct: 18, color: "#8F7CFF", icon: "shield-checkmark" },
      { label: "Technical Breakout", pct: 12, color: "#F5C518", icon: "trending-up" },
      { label: "Other Factors", pct: 8, color: "#8B949E", icon: "ellipsis-horizontal" },
    ],
    insight:
      "Rising tensions in the Middle East are increasing demand for safe-haven assets like gold, pushing the price higher.",
    news: [
      "Gold climbs as Middle East tensions lift safe-haven demand",
      "Dollar steadies while traders weigh geopolitical risk",
      "Analysts eye key resistance level after gold breakout",
    ],
  },
  Oil: {
    factors: [
      { label: "Supply Disruption Risk", pct: 38, color: "#E5484D", icon: "flame" },
      { label: "Geopolitical Premium", pct: 26, color: "#F5A524", icon: "flag" },
      { label: "Inventory Draw", pct: 14, color: "#8F7CFF", icon: "water" },
      { label: "Technical Breakout", pct: 12, color: "#F5C518", icon: "trending-up" },
      { label: "Other Factors", pct: 10, color: "#8B949E", icon: "ellipsis-horizontal" },
    ],
    insight:
      "Fears of supply disruption in the Middle East are adding a risk premium to crude prices, pushing oil higher.",
    news: [
      "Oil jumps as supply fears grow in the Middle East",
      "Tanker routes under review amid rising tensions",
      "OPEC watchers expect volatility in the coming sessions",
    ],
  },
};

function buildFallbackAnalysis(event, assetName) {
  return {
    factors: [
      { label: event.title, pct: 40, color: "#E5484D", icon: "flame" },
      { label: "Market Sentiment", pct: 25, color: "#3A7BD5", icon: "pulse" },
      { label: "Positioning & Flows", pct: 15, color: "#8F7CFF", icon: "swap-horizontal" },
      { label: "Technical Factors", pct: 12, color: "#F5C518", icon: "trending-up" },
      { label: "Other Factors", pct: 8, color: "#8B949E", icon: "ellipsis-horizontal" },
    ],
    insight: `${event.description} This is the main driver behind the recent move in ${assetName}.`,
    news: [
      event.title,
      `Traders reassess ${assetName} after latest developments`,
      "Analysts weigh the wider market impact",
    ],
  };
}

function Factor({ factor }) {
  return (
    <View style={styles.factorRow}>
      <View style={[styles.factorIcon, { backgroundColor: factor.color }]}>
        <Ionicons name={factor.icon} size={20} color="#FFFFFF" />
      </View>

      <View style={styles.factorBody}>
        <View style={styles.factorTop}>
          <Text style={styles.factorLabel}>{factor.label}</Text>
          <Text style={styles.factorPct}>{factor.pct}%</Text>
        </View>

        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${factor.pct}%`, backgroundColor: factor.color },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function RelatedMarket({ asset }) {
  const positive = asset.change >= 0;
  const color = positive ? "#4ADE80" : "#FF5A5F";

  return (
    <View style={styles.relatedCard}>
      <Text style={styles.relatedName}>{asset.name}</Text>

      <View style={styles.relatedChangeRow}>
        <Text style={[styles.relatedChange, { color }]}>
          {positive ? "+" : ""}
          {asset.change.toFixed(1)}%
        </Text>
        <Ionicons
          name={positive ? "arrow-up" : "arrow-down"}
          size={14}
          color={color}
        />
      </View>
    </View>
  );
}

export default function MarketMovingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const event = route?.params?.event;

  const [tab, setTab] = useState("AI Analysis");

  const data = useMemo(() => {
    if (!event) return null;

    const focusName = event.primaryAsset || event.assets[0]?.name;
    const focusAsset =
      event.assets.find((asset) => asset.name === focusName) || event.assets[0];

    const meta = ASSET_META[focusName] || {
      title: focusName,
      price: "--",
      icon: "analytics",
    };

    const analysis =
      ANALYSES[focusName] || buildFallbackAnalysis(event, focusName);

    const related = event.assets.filter((asset) => asset.name !== focusName);

    return { focusName, focusAsset, meta, analysis, related };
  }, [event]);

  if (!data) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.emptyText}>No event selected.</Text>
      </View>
    );
  }

  const { focusName, focusAsset, meta, analysis, related } = data;
  const positive = focusAsset.change >= 0;
  const changeColor = positive ? "#4ADE80" : "#FF5A5F";
  const direction = positive ? "up" : "down";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>Why is the Market Moving?</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {/* ASSET CARD */}
        <View style={styles.assetCard}>
          <View style={styles.assetIcon}>
            <Ionicons name={meta.icon} size={28} color="#F5C518" />
          </View>

          <View style={styles.assetInfo}>
            <Text style={styles.assetTitle}>{meta.title}</Text>
            <Text style={styles.assetPrice}>{meta.price}</Text>
          </View>

          <View style={styles.assetChangeRow}>
            <Text style={[styles.assetChange, { color: changeColor }]}>
              {positive ? "+" : ""}
              {focusAsset.change.toFixed(1)}%
            </Text>
            <Ionicons
              name={positive ? "arrow-up" : "arrow-down"}
              size={16}
              color={changeColor}
            />
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {TABS.map((item) => {
            const active = item === tab;

            return (
              <Pressable
                key={item}
                onPress={() => setTab(item)}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "AI Analysis" ? (
          <>
            <Text style={styles.question}>
              Why is {focusName} moving {direction}?
            </Text>
            <Text style={styles.basedOn}>
              Based on real-time data and market sentiment.
            </Text>

            <View style={styles.factors}>
              {analysis.factors.map((factor) => (
                <Factor key={factor.label} factor={factor} />
              ))}
            </View>

            {/* AI INSIGHT */}
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.insightIcon}>
                  <Ionicons name="sparkles" size={14} color="#4ADE80" />
                </View>
                <Text style={styles.insightTitle}>AI Insight</Text>
              </View>

              <Text style={styles.insightText}>{analysis.insight}</Text>

              <Text style={styles.disclaimer}>
                AI estimate • Not financial advice
              </Text>
            </View>

            {/* RELATED MARKETS */}
            {related.length > 0 && (
              <>
                <Text style={styles.relatedTitle}>Related Markets</Text>

                <View style={styles.relatedRow}>
                  {related.slice(0, 3).map((asset) => (
                    <RelatedMarket key={asset.name} asset={asset} />
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <View style={styles.newsList}>
            {analysis.news.map((headline) => (
              <View key={headline} style={styles.newsCard}>
                <Text style={styles.newsHeadline}>{headline}</Text>
                <Text style={styles.newsMeta}>{event.time}</Text>
              </View>
            ))}
          </View>
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

  emptyText: {
    color: "#8B949E",
    fontSize: 14,
    textAlign: "center",
    marginTop: 60,
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 6,
  },

  /* ASSET CARD */
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  assetIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#2A2110",
    borderWidth: 1,
    borderColor: "#5A4A1A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  assetInfo: {
    flex: 1,
  },

  assetTitle: {
    color: "#D8DCE1",
    fontSize: 13,
    fontWeight: "600",
  },

  assetPrice: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 2,
  },

  assetChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  assetChange: {
    fontSize: 15,
    fontWeight: "700",
  },

  /* TABS */
  tabs: {
    flexDirection: "row",
    marginTop: 14,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  tab: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  tabActive: {
    backgroundColor: "#1F5FD0",
  },

  tabText: {
    color: "#8B949E",
    fontSize: 13,
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#FFFFFF",
  },

  /* ANALYSIS */
  question: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },

  basedOn: {
    color: "#AEB5BD",
    fontSize: 13,
    marginTop: 6,
  },

  factors: {
    marginTop: 18,
    gap: 16,
  },

  factorRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  factorIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  factorBody: {
    flex: 1,
  },

  factorTop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  factorLabel: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 13,
    lineHeight: 17,
    paddingRight: 10,
  },

  factorPct: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  barTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16202D",
    overflow: "hidden",
  },

  barFill: {
    height: 7,
    borderRadius: 4,
  },

  /* INSIGHT */
  insightCard: {
    marginTop: 22,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1F3B5C",
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  insightIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#12281F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  insightText: {
    color: "#D8DCE1",
    fontSize: 14,
    lineHeight: 21,
  },

  disclaimer: {
    color: "#7D8691",
    fontSize: 11,
    marginTop: 12,
  },

  /* RELATED MARKETS */
  relatedTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 22,
    marginBottom: 10,
  },

  relatedRow: {
    flexDirection: "row",
    gap: 10,
  },

  relatedCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  relatedName: {
    color: "#D8DCE1",
    fontSize: 13,
    fontWeight: "600",
  },

  relatedChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },

  relatedChange: {
    fontSize: 14,
    fontWeight: "700",
  },

  /* NEWS TAB */
  newsList: {
    marginTop: 18,
    gap: 10,
  },

  newsCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  newsHeadline: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  newsMeta: {
    color: "#7D8691",
    fontSize: 11,
    marginTop: 6,
  },
});