import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function InsightCard({
  insight = "Historically, rate-hold decisions like this have led to modest USD strength over the following week.",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={16} color="#3A7BD5" />
        <Text style={styles.title}>AI Insight</Text>
      </View>
      <Text style={styles.text}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#16202B",
    borderWidth: 1,
    borderColor: "#3A7BD5",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  title: {
    color: "#3A7BD5",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  text: {
    color: "#DDDDDD",
    fontSize: 14,
    lineHeight: 20,
  },
});
