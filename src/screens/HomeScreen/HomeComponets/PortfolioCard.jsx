import { View, Text, StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";

// "My head container" - the portfolio balance block from the reference
// design. Layout/styling is meant to stay fixed once in place; only the
// values passed in should ever change.
export default function PortfolioCard({
  balance = "$5,271.39",
  changePercent = "+130.62%",
  changeAmount = "+$2,979.23",
  positive = true,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Portfolio</Text>

      <Text style={styles.balance}>{balance}</Text>

      <Text
        style={[
          styles.change,
          { color: positive ? "#4ADE80" : "#FF5A5F" },
        ]}
      >
        {changePercent} {changeAmount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },

  label: {
    color: colors[500],
    fontSize: 12,
    marginBottom: 6,
  },

  balance: {
    color: colors[950],
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  change: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
});