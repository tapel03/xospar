import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CalendarFilters() {
  return (
    <View style={styles.container}>

      <Pressable style={styles.filter}>
        <Text style={styles.filterText}>
          All Events
        </Text>

        <Ionicons
          name="chevron-down"
          size={15}
          color="#9DA4AE"
        />
      </Pressable>

      <Pressable style={styles.filter}>
        <Text style={styles.filterText}>
          High Impact
        </Text>

        <Ionicons
          name="chevron-down"
          size={15}
          color="#9DA4AE"
        />
      </Pressable>

      <Pressable style={styles.filter}>
        <Text style={styles.filterText}>
          Forex
        </Text>

        <Ionicons
          name="chevron-down"
          size={15}
          color="#9DA4AE"
        />
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },

  filter: {
    flex: 1,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0B1119",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 8,
    paddingHorizontal: 10,
  },

  filterText: {
    color: "#C8CDD3",
    fontSize: 11,
    fontWeight: "500",
  },
});