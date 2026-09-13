import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MarketSentimentOverview() {
  return (
    <View style={styles.card}>

      <Text style={styles.sectionTitle}>Market Sentiment Overview</Text>

      <View style={styles.gaugeContainer}>

        <View style={styles.circle}>
          <Text style={styles.bullish}>BULLISH</Text>
          <Text style={styles.score}>62</Text>
          <Text style={styles.total}>/100</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.row}>
            <View style={styles.greenDot} />
            <Text style={styles.label}>Positive</Text>
            <Text style={styles.value}>62%</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.grayDot} />
            <Text style={styles.label}>Neutral</Text>
            <Text style={styles.value}>23%</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.redDot} />
            <Text style={styles.label}>Negative</Text>
            <Text style={styles.value}>15%</Text>
          </View>
        </View>

      </View>

      <View style={styles.divider} />

      <View style={styles.headerRow}>
        <Text style={styles.subHeading}>Sentiment Over Time</Text>

        <View style={styles.days}>
          <Text style={styles.daysText}>7 Days</Text>
        </View>
      </View>

      <View style={styles.chart}>
        <Ionicons name="trending-up" size={120} color="#FFFFFF22" />
      </View>

      <View style={styles.divider} />

      <Text style={styles.subHeading}>News Impact Heatmap</Text>

      <View style={styles.mapContainer}>
        <Ionicons name="earth" size={120} color="#777777" />
      </View>

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
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 16,
  },

  gaugeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 7,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  bullish: {
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 1,
  },

  score: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },

  total: {
    color: "#AAAAAA",
  },

  stats: {
    flex: 1,
    marginLeft: 20,
    gap: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
  },

  value: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5DE38B",
  },

  grayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#999999",
  },

  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6464",
  },

  divider: {
    height: 1,
    backgroundColor: "#1C2630",
    marginVertical: 18,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subHeading: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  days: {
    backgroundColor: "#1C2630",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },

  daysText: {
    color: "#FFFFFF",
    fontSize: 12,
  },

  chart: {
    height: 120,
    marginTop: 12,
    backgroundColor: "#090E14",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  mapContainer: {
    height: 450,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#090E14",
    justifyContent: "center",
    alignItems: "center",
  },
});