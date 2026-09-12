import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function BuySellVolume() {
  return (
    <View style={styles.card}>

      <View style={styles.header}>

        <View style={styles.titleRow}>

          <Ionicons
            name="swap-horizontal"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.title}>
            Buy/Sell • Volume
          </Text>

        </View>

        <View style={styles.periodButton}>
          <Text style={styles.periodText}>
            1M⌄
          </Text>
        </View>

      </View>


      <View style={styles.stats}>

        <View style={styles.stat}>

          <Text style={styles.label}>
            Txns
          </Text>

          <Text style={styles.value}>
            45,447
          </Text>

          <Text style={styles.change}>
            ↑ 12.4%
          </Text>

        </View>


        <View style={styles.stat}>

          <Text style={styles.label}>
            Chain Fees
          </Text>

          <Text style={styles.value}>
            2,1M$
          </Text>

          <Text style={styles.change}>
            ↑ 8.7%
          </Text>

        </View>


        <View style={styles.stat}>

          <Text style={styles.label}>
            Net Buy
          </Text>

          <Text style={styles.value}>
            +15,255$
          </Text>

          <Text style={styles.change}>
            ↑ 21.3%
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginTop: 10,
    padding: 14,
    backgroundColor: "#070C10",
    borderWidth: 1,
    borderColor: "#202A33",
    borderRadius: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },

  periodButton: {
    borderWidth: 1,
    borderColor: "#26323B",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },

  periodText: {
    color: "#FFFFFF",
    fontSize: 12,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stat: {
    flex: 1,
  },

  label: {
    color: "#8C969D",
    fontSize: 12,
    marginBottom: 5,
  },

  value: {
    color: "#E5E8EA",
    fontSize: 17,
    fontWeight: "500",
  },

  change: {
    color: "#D9E0E4",
    fontSize: 12,
    marginTop: 5,
  },
});