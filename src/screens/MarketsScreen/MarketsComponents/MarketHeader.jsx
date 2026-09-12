import { View, Text, StyleSheet } from "react-native";

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
    backgroundColor: "#000000",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
});