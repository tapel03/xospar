import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AlertHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>today</Text>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#8e8e93" />
          <Text style={styles.badgeText}>24</Text>
        </View>

        <View style={styles.badge}>
          <Ionicons name="time-outline" size={14} color="#8e8e93" />
          <Text style={styles.badgeText}>1.5 of 7.5 hrs</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#FFFFFF",
  },

  badges: {
    flexDirection: "row",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#1c1c1e",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8e8e93",
  },
});