import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../theme/colors";

export default function MarketHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Markets
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    backgroundColor: colors.base,
  },

  title: {
    color: colors[950],
    fontSize: 24,
    fontWeight: "bold",
  },
});