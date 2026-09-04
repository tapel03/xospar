import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function FilterBar() {
  return (
    <View style={styles.container}>
      

      {/* =========================
          TOP ROW
      ========================== */}
      <View style={styles.topRow}>

        {/* Search Box */}
        <View style={styles.searchBox}>

          {/* Search Icon */}
          <Text style={styles.searchIcon}>⌕</Text>

          {/* Input */}
          <TextInput
            placeholder="Search alerts..."
            placeholderTextColor="#8a8f98"
            style={styles.input}
          />

        </View>

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>▽</Text>
        </TouchableOpacity>

      </View>


      {/* =========================
          BOTTOM ROW
      ========================== */}
      <View style={styles.filtersRow}>

        {/* Severity */}
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>
            All Severities
          </Text>

          <Text style={styles.arrow}>⌄</Text>
        </TouchableOpacity>


        {/* Status */}
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>
            All Statuses
          </Text>

          <Text style={styles.arrow}>⌄</Text>
        </TouchableOpacity>


        {/* Date */}
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>
            This Month
          </Text>

          <Text style={styles.arrow}>⌄</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  /* =========================
     MAIN CONTAINER
  ========================== */

  container: {
    backgroundColor: "#080d14",

    // IMPORTANT:
    // Do NOT use flex: 1 here.
    // This allows the container to wrap its content.
    paddingVertical: 12,
    paddingHorizontal: 6,

    borderWidth: 3,
    borderColor: "#1b2735",

    borderRadius: 0,
     width: "100%",
  },


  /* =========================
     TOP ROW
  ========================== */

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },


  /* =========================
     SEARCH BOX
  ========================== */

  searchBox: {
    flex: 1,

    height: 44,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#0b1119",

    borderWidth: 3,
    borderColor: "#1b2735",
    borderRadius: 9,

    paddingHorizontal: 12,
  },


  searchIcon: {
    fontSize: 25,
    color: "#b5bbc4",
    marginRight: 8,
  },


  input: {
    flex: 1,

    color: "#ffffff",
    fontSize: 14,
  },


  /* =========================
     FILTER BUTTON
  ========================== */

  filterButton: {
    width: 44,
    height: 44,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#0b1119",

    borderWidth: 3,
    borderColor: "#1b2735",
    borderRadius: 9,
  },


  filterIcon: {
    color: "#b5bbc4",
    fontSize: 22,
  },


  /* =========================
     BOTTOM FILTERS
  ========================== */

  filtersRow: {
    flexDirection: "row",

    marginTop: 10,

    gap: 8,
  },


  /* =========================
     DROPDOWN
  ========================== */

  dropdown: {
    height: 40,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#0b1119",

    borderWidth: 3,
    borderColor: "#1b2735",
    borderRadius: 8,

    paddingHorizontal: 11,

    flex: 1,
  },


  dropdownText: {
    color: "#d5d9df",

    fontSize: 12,
    fontWeight: "500",
  },


  arrow: {
    color: "#9da4ae",

    fontSize: 18,

    marginLeft: 5,
  },

});