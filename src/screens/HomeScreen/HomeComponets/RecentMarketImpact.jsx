import { View, Text, StyleSheet } from "react-native";

const EVENTS = [
  {
    title: "Fed Rate Decision",
    date: "May 19, 2024 2:00 PM",
    impact: "High Impact",
    markets: [
      { symbol: "EUR/USD", change: "+0.42%" },
      { symbol: "Gold (XAU/USD)", change: "+0.91%" },
      { symbol: "S&P 500", change: "+1.24%" },
    ],
  },
  {
    title: "US CPI Report",
    date: "May 15, 2024 8:30 AM",
    impact: "High Impact",
    markets: [
      { symbol: "EUR/USD", change: "-0.38%" },
      { symbol: "USD/JPY", change: "-0.65%" },
      { symbol: "Gold (XAU/USD)", change: "+0.31%" },
    ],
  },
  {
    title: "Retail Sales Data",
    date: "May 14, 2024 8:30 AM",
    impact: "Medium Impact",
    markets: [
      { symbol: "GBP/USD", change: "+0.21%" },
      { symbol: "USD/JPY", change: "+0.18%" },
      { symbol: "S&P 500", change: "+0.35%" },
    ],
  },
];

export default function RecentMarketImpact() {
  return (
    <View style={styles.card}>

      <Text style={styles.sectionTitle}>Recent Market Impact</Text>

      {EVENTS.map((event) => (
        <View key={event.title} style={styles.eventCard}>

          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.date}>{event.date}</Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    event.impact === "High Impact"
                      ? "#3B1F20"
                      : "#2E2A18",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      event.impact === "High Impact"
                        ? "#FF5A5F"
                        : "#FFC857",
                  },
                ]}
              >
                {event.impact}
              </Text>
            </View>
          </View>

          {event.markets.map((market) => (
            <View key={market.symbol} style={styles.marketRow}>
              <Text style={styles.symbol}>{market.symbol}</Text>

              <Text style={styles.change}>{market.change}</Text>
            </View>
          ))}

        </View>
      ))}

      <Text style={styles.viewAll}>View All Events →</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101820",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C2630",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  eventCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  date: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },

  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  symbol: {
    color: "#CFCFCF",
    fontSize: 13,
  },

  change: {
    color: "#4ADE80",
    fontWeight: "700",
    fontSize: 13,
  },

  viewAll: {
    color: "#3A7BD5",
    marginTop: 18,
    fontWeight: "600",
  },
});