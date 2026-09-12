import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FilterBar() {
  return (
    <View style={styles.container}>

      {/* =========================
          TOP ROW
      ========================== */}
      <View style={styles.topRow}>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={17} color="#8a8f98" />
          <TextInput
            placeholder="Search alerts..."
            placeholderTextColor="#8a8f98"
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={18} color="#b5bbc4" />
        </TouchableOpacity>

      </View>


      {/* =========================
          BOTTOM ROW
      ========================== */}
      <View style={styles.filtersRow}>

        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>All Severities</Text>
          <Ionicons name="chevron-down" size={14} color="#9da4ae" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>All Statuses</Text>
          <Ionicons name="chevron-down" size={14} color="#9da4ae" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>This Month</Text>
          <Ionicons name="chevron-down" size={14} color="#9da4ae" />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchBox: {
    flex: 1,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },

  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 14,
  },

  filterButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 10,
  },

  filtersRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  dropdown: {
    height: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 8,
    paddingHorizontal: 10,
    flex: 1,
  },

  dropdownText: {
    color: "#d5d9df",
    fontSize: 12,
    fontWeight: "500",
  },
});