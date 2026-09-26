import { View, Text, StyleSheet } from "react-native";

export default function TradingPortfolioScreen() {

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Portfolio Overview
      </Text>

      <View style={styles.balanceCard}>

        <Text style={styles.label}>
          Total Equity
        </Text>

        <Text style={styles.balance}>
          $15,842.32
        </Text>

        <Text style={styles.gain}>
          +$426.80 Today
        </Text>

      </View>

      <View style={styles.grid}>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Balance</Text>
          <Text style={styles.metricValue}>$15,100</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Free Margin</Text>
          <Text style={styles.metricValue}>$8,420</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Margin Level</Text>
          <Text style={styles.metricValue}>425%</Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Floating P/L</Text>
          <Text style={styles.metricValue}>+$742</Text>
        </View>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000000",
    padding: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },

  balanceCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    padding: 22,
    marginBottom: 20,
  },

  label: {
    color: "#8B949E",
  },

  balance: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
    marginVertical: 10,
  },

  gain: {
    color: "#F5F5F5",
    fontSize: 16,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  metric: {
    width: "48%",
    backgroundColor: "#0A0A0A",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },

  metricLabel: {
    color: "#7B8794",
    fontSize: 12,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

});