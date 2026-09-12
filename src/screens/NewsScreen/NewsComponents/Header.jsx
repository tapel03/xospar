import { View, Text, StyleSheet } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Market News</Text>
      <Text style={styles.subtitle}>AI-powered market intelligence</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 4,
  },
});
