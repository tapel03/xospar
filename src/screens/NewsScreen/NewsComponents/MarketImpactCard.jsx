import { View, Text, StyleSheet } from "react-native";

const IMPACTED = [
  { symbol: "EUR/USD", change: "+0.42%", positive: true },
  { symbol: "S&P 500", change: "-0.18%", positive: false },
  { symbol: "Gold", change: "+0.65%", positive: true },
];

export default function MarketImpactCard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Markets Affected</Text>

      {IMPACTED.map((item) => (
        <View style={styles.row} key={item.symbol}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={[styles.change, { color: item.positive ? "#8FCB8F" : "#FF5A5F" }]}>
            {item.change}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#171717",
    marginHorizontal: 16,
    marginBottom: 10,
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
    paddingVertical: 6,
  },

  symbol: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  change: {
    fontSize: 14,
    fontWeight: "600",
  },
});
