
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

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
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