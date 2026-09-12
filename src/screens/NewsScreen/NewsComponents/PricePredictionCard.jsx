import { View, Text, StyleSheet } from "react-native";

export default function PricePredictionCard({
  symbol = "EUR/USD",
  direction = "up",
  confidence = 68,
  target = "1.0920",
}) {
  const isUp = direction === "up";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Prediction</Text>

      <View style={styles.row}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={[styles.direction, { color: isUp ? "#8FCB8F" : "#FF5A5F" }]}>
          {isUp ? "▲" : "▼"} Target {target}
        </Text>
      </View>

      <View style={styles.confidenceTrack}>
        <View style={[styles.confidenceFill, { width: `${confidence}%` }]} />
      </View>
      <Text style={styles.confidenceLabel}>{confidence}% model confidence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C2630",
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  symbol: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  direction: {
    fontSize: 13,
    fontWeight: "600",
  },

  confidenceTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#0A1016",
    overflow: "hidden",
  },

  confidenceFill: {
    height: 6,
    backgroundColor: "#3A7BD5",
  },

  confidenceLabel: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 6,
  },
});
