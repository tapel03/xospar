import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = ["Live Map", "List", "Insights"];

const CATEGORIES = {
  Conflict: { color: "#E5484D", icon: "flame" },
  Political: { color: "#F5A524", icon: "flag" },
  Economic: { color: "#E5B93C", icon: "trending-up" },
  "Central Bank": { color: "#3A7BD5", icon: "business" },
  Company: { color: "#8F7CFF", icon: "briefcase" },
  Positive: { color: "#30A46C", icon: "sparkles" },
};

// Placeholder data - swap for a real events feed later.
// x / y are percentages of the map area.
// `primaryAsset` (optional) is the asset the full analysis screen opens
// on; when omitted it falls back to the event's first affected asset.
const EVENTS = [
  {
    id: "1",
    category: "Conflict",
    title: "Middle East – Escalation",
    impact: "High Impact",
    time: "2h ago",
    description:
      "Rising tensions in the Middle East have increased the risk of wider conflict, affecting global markets.",
    primaryAsset: "Gold",
    assets: [
      { name: "Oil", change: 3.2 },
      { name: "Gold", change: 1.4 },
      { name: "USD", change: 0.6 },
      { name: "S&P 500", change: -0.8 },
    ],
    x: 60,
    y: 42,
  },
  {
    id: "2",
    category: "Conflict",
    title: "Eastern Europe – Border Tensions",
    impact: "High Impact",
    time: "4h ago",
    description:
      "Renewed border tensions are pressuring European equities and lifting energy prices.",
    assets: [
      { name: "Gas", change: 2.1 },
      { name: "EUR", change: -0.5 },
      { name: "Gold", change: 0.9 },
    ],
    x: 56,
    y: 26,
  },
  {
    id: "3",
    category: "Central Bank",
    title: "Fed Signals Cautious Path",
    impact: "Medium Impact",
    time: "5h ago",
    description:
      "Officials hinted at a slower pace of rate changes, shifting rate expectations.",
    assets: [
      { name: "USD", change: 0.4 },
      { name: "S&P 500", change: 0.3 },
    ],
    x: 20,
    y: 32,
  },
  {
    id: "4",
    category: "Economic",
    title: "China Manufacturing Data Beats",
    impact: "Medium Impact",
    time: "6h ago",
    description:
      "Stronger factory output lifted commodity demand expectations across Asia.",
    assets: [
      { name: "Copper", change: 1.8 },
      { name: "AUD", change: 0.7 },
    ],
    x: 78,
    y: 36,
  },
  {
    id: "5",
    category: "Positive",
    title: "Trade Deal Progress",
    impact: "Low Impact",
    time: "8h ago",
    description:
      "Talks moved forward, easing concerns about tariffs and supply chains.",
    assets: [
      { name: "S&P 500", change: 0.6 },
      { name: "JPY", change: -0.2 },
    ],
    x: 84,
    y: 62,
  },
  {
    id: "6",
    category: "Company",
    title: "Big Tech Earnings Surprise",
    impact: "Medium Impact",
    time: "9h ago",
    description:
      "Earnings topped estimates, lifting the broader tech sector after hours.",
    assets: [
      { name: "NASDAQ", change: 1.1 },
      { name: "NVDA", change: 2.4 },
    ],
    x: 14,
    y: 44,
  },
  {
    id: "7",
    category: "Political",
    title: "South America – Election Shock",
    impact: "Medium Impact",
    time: "10h ago",
    description:
      "An unexpected result is weighing on local currencies and bond markets.",
    assets: [
      { name: "BRL", change: -1.3 },
      { name: "Gold", change: 0.5 },
    ],
    x: 30,
    y: 68,
  },
];

// Rough dotted world map ("#" = land). Purely decorative.
const MAP_ROWS = [
  "                                    ",
  "    ####       ##   #### ######      ",
  "  #########   ###  ################  ",
  "  ##########   ##  ################# ",
  "   ########     #  ################  ",
  "    #######    #### ###############   ",
  "     #####    ########## #####  ##   ",
  "      ###      ########   ###        ",
  "       ####     #######              ",
  "       ######    #####        ###    ",
  "       #####      ###        #####   ",
  "        ####                  ###    ",
  "        ###                          ",
  "         ##                          ",
];

const COLS = 36;

function DotMap({ selectedId, onSelect }) {
  return (
    <View style={styles.map}>
      {MAP_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.mapRow}>
          {row
            .padEnd(COLS, " ")
            .slice(0, COLS)
            .split("")
            .map((cell, colIndex) => (
              <View key={colIndex} style={styles.mapCell}>
                {cell === "#" && <View style={styles.mapDot} />}
              </View>
            ))}
        </View>
      ))}

      {EVENTS.map((event) => {
        const cat = CATEGORIES[event.category];
        const selected = event.id === selectedId;

        return (
          <Pressable
            key={event.id}
            onPress={() => onSelect(event.id)}
            hitSlop={8}
            style={[
              styles.marker,
              {
                left: `${event.x}%`,
                top: `${event.y}%`,
                backgroundColor: cat.color,
                borderColor: selected ? "#FFFFFF" : "rgba(255,255,255,0.25)",
                transform: [{ scale: selected ? 1.2 : 1 }],
              },
            ]}
          >
            <Ionicons name={cat.icon} size={12} color="#FFFFFF" />
          </Pressable>
        );
      })}
    </View>
  );
}

function Legend() {
  return (
    <View style={styles.legend}>
      {Object.entries(CATEGORIES).map(([name, cat]) => (
        <View key={name} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
          <Text style={styles.legendText}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

function AssetRow({ asset }) {
  const positive = asset.change >= 0;

  return (
    <View style={styles.assetRow}>
      <View style={styles.assetIcon}>
        <Text style={styles.assetIconText}>{asset.name.charAt(0)}</Text>
      </View>

      <Text style={styles.assetName}>{asset.name}</Text>

      <Text
        style={[styles.assetChange, { color: positive ? "#4ADE80" : "#FF5A5F" }]}
      >
        {positive ? "+" : ""}
        {asset.change.toFixed(1)}%
      </Text>

      <Ionicons
        name={positive ? "arrow-up" : "arrow-down"}
        size={14}
        color={positive ? "#4ADE80" : "#FF5A5F"}
      />
    </View>
  );
}

function EventCard({ event, onViewAnalysis }) {
  const cat = CATEGORIES[event.category];

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventTop}>
        <View style={styles.eventLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: cat.color }]}>
            <Ionicons name={cat.icon} size={13} color="#FFFFFF" />
            <Text style={styles.categoryBadgeText}>{event.category}</Text>
          </View>

          <View style={styles.eventImage}>
            <Ionicons name={cat.icon} size={38} color={cat.color} />
          </View>
        </View>

        <View style={styles.eventRight}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.impactPill}>
              <Text style={styles.impactPillText}>{event.impact}</Text>
            </View>
            <Text style={styles.metaTime}>{event.time}</Text>
          </View>

          <Text style={styles.eventDescription}>{event.description}</Text>

          <Text style={styles.assetsLabel}>Affected Assets</Text>

          {event.assets.map((asset) => (
            <AssetRow key={asset.name} asset={asset} />
          ))}
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.analysisButton,
          pressed && styles.analysisButtonPressed,
        ]}
        onPress={() => onViewAnalysis(event)}
      >
        <Text style={styles.analysisText}>View full analysis</Text>
        <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function ListTab({ onSelect }) {
  return (
    <View>
      {EVENTS.map((event) => {
        const cat = CATEGORIES[event.category];

        return (
          <Pressable
            key={event.id}
            style={styles.listRow}
            onPress={() => onSelect(event.id)}
          >
            <View style={[styles.listIcon, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon} size={16} color="#FFFFFF" />
            </View>

            <View style={styles.listText}>
              <Text style={styles.listTitle} numberOfLines={1}>
                {event.title}
              </Text>
              <Text style={styles.listMeta}>
                {event.category} • {event.impact} • {event.time}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#59636D" />
          </Pressable>
        );
      })}
    </View>
  );
}

function InsightsTab() {
  const counts = Object.keys(CATEGORIES).map((name) => ({
    name,
    count: EVENTS.filter((event) => event.category === name).length,
  }));

  const highImpact = EVENTS.filter((e) => e.impact === "High Impact").length;

  return (
    <View>
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Market Mood</Text>
        <Text style={styles.insightText}>
          {highImpact} high-impact events are active. Conflict-driven moves are
          supporting Oil, Gold and the USD while pressuring equities.
        </Text>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>Events by Type</Text>

        {counts.map((item) => (
          <View key={item.name} style={styles.countRow}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: CATEGORIES[item.name].color },
              ]}
            />
            <Text style={styles.countName}>{item.name}</Text>
            <Text style={styles.countValue}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function GlobalEventsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState("Live Map");
  const [selectedId, setSelectedId] = useState(EVENTS[0].id);

  const selectedEvent =
    EVENTS.find((event) => event.id === selectedId) || EVENTS[0];

  const otherCount = EVENTS.length - 1;

  const handleSelectFromList = (id) => {
    setSelectedId(id);
    setTab("Live Map");
  };

  // "View full analysis" -> "Why is the Market Moving?" screen
  const handleViewAnalysis = (event) => {
    navigation.navigate("MarketMoving", { event });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.title}>Global Events</Text>

        <View style={styles.backButton} />
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        {tab === "Live Map" && (
          <>
            <DotMap selectedId={selectedId} onSelect={setSelectedId} />

            <Legend />

            <EventCard
              event={selectedEvent}
              onViewAnalysis={handleViewAnalysis}
            />

            <Pressable style={styles.otherRow} onPress={() => setTab("List")}>
              <Ionicons name="radio-button-on" size={16} color="#3A7BD5" />
              <Text style={styles.otherText}>
                Other live events ({otherCount})
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#59636D" />
            </Pressable>
          </>
        )}

        {tab === "List" && <ListTab onSelect={handleSelectFromList} />}

        {tab === "Insights" && <InsightsTab />}
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
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
  },

  tabs: {
    flexDirection: "row",
    marginHorizontal: 14,
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

  content: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  /* MAP */
  map: {
    width: "100%",
    aspectRatio: 36 / 15,
    position: "relative",
  },

  mapRow: {
    flex: 1,
    flexDirection: "row",
  },

  mapCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  mapDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#2A4A75",
  },

  marker: {
    position: "absolute",
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  /* LEGEND */
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
    marginBottom: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  legendText: {
    color: "#C8CDD3",
    fontSize: 11,
  },

  /* EVENT CARD */
  eventCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  eventTop: {
    flexDirection: "row",
    gap: 12,
  },

  eventLeft: {
    width: 104,
  },

  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    height: 30,
    borderRadius: 10,
  },

  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  eventImage: {
    height: 104,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#1A1410",
    alignItems: "center",
    justifyContent: "center",
  },

  eventRight: {
    flex: 1,
  },

  eventTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  impactPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#3B1F20",
  },

  impactPillText: {
    color: "#FF5A5F",
    fontSize: 10,
    fontWeight: "700",
  },

  metaTime: {
    color: "#7D8691",
    fontSize: 11,
  },

  eventDescription: {
    color: "#AEB5BD",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  assetsLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },

  assetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  assetIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#1C2A3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  assetIconText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  assetName: {
    flex: 1,
    color: "#D8DCE1",
    fontSize: 13,
  },

  assetChange: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 6,
  },

  analysisButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A4A75",
    backgroundColor: "#0F1B2B",
  },

  analysisButtonPressed: {
    opacity: 0.7,
  },

  analysisText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  otherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  otherText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  /* LIST TAB */
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  listIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  listText: {
    flex: 1,
  },

  listTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  listMeta: {
    color: "#7D8691",
    fontSize: 11,
    marginTop: 3,
  },

  /* INSIGHTS TAB */
  insightCard: {
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: "#0B1420",
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },

  insightText: {
    color: "#AEB5BD",
    fontSize: 13,
    lineHeight: 19,
  },

  countRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  countName: {
    flex: 1,
    color: "#D8DCE1",
    fontSize: 13,
    marginLeft: 8,
  },

  countValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});