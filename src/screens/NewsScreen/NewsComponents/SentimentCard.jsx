import { View, Text, StyleSheet } from "react-native";

export default function SentimentCard({ bullish = 62, bearish = 38 }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market Sentiment</Text>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${bullish}%` }]} />
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.bullish}>Bullish {bullish}%</Text>
        <Text style={styles.bearish}>Bearish {bearish}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C2630",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },

  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    overflow: "hidden",
  },

  barFill: {
    height: 8,
    backgroundColor: "#8FCB8F",
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  bullish: {
    color: "#8FCB8F",
    fontSize: 13,
    fontWeight: "600",
  },

  bearish: {
    color: "#FF5A5F",
    fontSize: 13,
    fontWeight: "600",
  },
});
