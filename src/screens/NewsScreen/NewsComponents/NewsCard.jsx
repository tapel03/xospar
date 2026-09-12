import { View, Text, StyleSheet } from "react-native";

export default function NewsCard({
  headline = "Fed signals cautious approach to next rate decision",
  source = "MarketPulse Wire",
  timeAgo = "12m ago",
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.source}>{source}</Text>
        <Text style={styles.time}>{timeAgo}</Text>
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

  headline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  source: {
    color: "#3A7BD5",
    fontSize: 12,
    fontWeight: "600",
  },

  time: {
    color: "#666666",
    fontSize: 12,
  },
});
