
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

const GRID_ITEMS = Array.from({ length: 120 }, (_, index) => index);

export default function MarketOverview() {
  const navigation = useNavigation();

  // Opens the detail page for the selected market category.
  const openCategory = (category) => {
    navigation.navigate("MarketCategoryDetail", {
      category,
    });
  };

  return (
    <View style={styles.container}>

      {/* =========================
          TODAY / MONTH / YEAR
      ========================== */}
      <View style={styles.statsRow}>

        <View style={styles.stat}>
          <Text style={styles.label}>Today</Text>
          <Text style={styles.value}>3,585.5</Text>
          <Text style={styles.positive}>↑ 25.30%</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Month</Text>
          <Text style={styles.value}>12,005.5</Text>
          <Text style={styles.negative}>↓ 5.56%</Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.label}>Year</Text>
          <Text style={styles.value}>125,000.5</Text>
          <Text style={styles.positive}>↑ 25.56%</Text>
        </View>

      </View>


      {/* =========================
          MARKET ACTIVITY GRID
      ========================== */}
      <View style={styles.grid}>
        {GRID_ITEMS.map((item) => (
          <View
            key={item}
            style={[
              styles.gridBlock,
              item < 48 && styles.brightBlock,
              item >= 48 && item < 82 && styles.mediumBlock,
            ]}
          />
        ))}
      </View>


      {/* =========================
          ALLOCATION LEGEND
      ========================== */}
      <View style={styles.legendRow}>

        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>USDT 35%</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>ETH 32.5%</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>SUI 20.5%</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>UNI 10%</Text>
        </View>

      </View>


      {/* =========================
          MARKET CATEGORIES
      ========================== */}
      <View style={styles.categoryGrid}>

        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            pressed && styles.categoryPressed,
          ]}
          onPress={() => openCategory("Crypto")}
        >
          <Text style={styles.categoryIcon}>▣</Text>
          <Text style={styles.categoryName}>Crypto</Text>
          <Text style={styles.categoryPositive}>+20.3%</Text>
        </Pressable>


        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            pressed && styles.categoryPressed,
          ]}
          onPress={() => openCategory("Forex")}
        >
          <Text style={styles.categoryIcon}>◇</Text>
          <Text style={styles.categoryName}>Forex</Text>
          <Text style={styles.categoryPositive}>+4.1%</Text>
        </Pressable>


        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            pressed && styles.categoryPressed,
          ]}
          onPress={() => openCategory("Indices")}
        >
          <Text style={styles.categoryIcon}>▧</Text>
          <Text style={styles.categoryName}>Indices</Text>
          <Text style={styles.categoryNegative}>-14.1%</Text>
        </Pressable>


        <Pressable
          style={({ pressed }) => [
            styles.categoryCard,
            pressed && styles.categoryPressed,
          ]}
          onPress={() => openCategory("Stocks")}
        >
          <Text style={styles.categoryIcon}>♧</Text>
          <Text style={styles.categoryName}>Stocks</Text>
          <Text style={styles.categoryNegative}>-32.1%</Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#17212B",
    borderBottomWidth: 1,
    borderBottomColor: "#17212B",
    paddingVertical: 12,
  },

  stat: {
    flex: 1,
    paddingHorizontal: 7,
    borderRightWidth: 1,
    borderRightColor: "#17212B",
  },

  label: {
    color: "#A8AFB8",
    fontSize: 12,
    marginBottom: 4,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  positive: {
    color: "#39E6C0",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  negative: {
    color: "#FF4D67",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    paddingHorizontal: 3,
  },

  gridBlock: {
    width: "4%",
    height: 20,
    marginRight: "0.4%",
    marginBottom: 3,
    backgroundColor: "#35404B",
  },

  brightBlock: {
    backgroundColor: "#B9C0C7",
  },

  mediumBlock: {
    backgroundColor: "#737D87",
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 12,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: "#D6D9DD",
    marginRight: 4,
  },

  legendText: {
    color: "#AEB5BD",
    fontSize: 9,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryCard: {
    width: "48.5%",
    height: 48,
    borderWidth: 1,
    borderColor: "#263441",
    borderRadius: 9,
    backgroundColor: "#080E15",
    marginBottom: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryPressed: {
    opacity: 0.7,
  },

  categoryIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    marginRight: 9,
  },

  categoryName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },

  categoryPositive: {
    color: "#39E6C0",
    fontSize: 11,
    fontWeight: "700",
  },

  categoryNegative: {
    color: "#FF4D67",
    fontSize: 11,
    fontWeight: "700",
  },
});

