import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

export default function AlertHeader({ dayLabel = "Today", total = 0, acknowledged = 0 }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dayLabel}</Text>

      <View style={styles.badges}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle-outline" size={14} color={colors[500]} />
          <Text style={styles.badgeText}>
            {acknowledged}/{total}
          </Text>
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
    color: colors[950],
  },

  badges: {
    flexDirection: "row",
    gap: 8,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors[100],
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors[500],
  },
});