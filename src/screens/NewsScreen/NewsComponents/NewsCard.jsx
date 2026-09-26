import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NewsCard({
  headline = "Fed signals cautious approach to next rate decision",
  source = "MarketPulse Wire",
  timeAgo = "12m ago",
  onCreateAlert,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.headline}>{headline}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.source}>{source}</Text>

        <View style={styles.metaRight}>
          <Text style={styles.time}>{timeAgo}</Text>

          {onCreateAlert ? (
            <Pressable
              onPress={onCreateAlert}
              hitSlop={8}
              style={styles.alertButton}
            >
              <Ionicons
                name="notifications-outline"
                size={16}
                color="#3A7BD5"
              />
            </Pressable>
          ) : null}
        </View>
      </View>
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

  headline: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  source: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  time: {
    color: "#666666",
    fontSize: 12,
  },

  alertButton: {
    padding: 4,
  },
});
