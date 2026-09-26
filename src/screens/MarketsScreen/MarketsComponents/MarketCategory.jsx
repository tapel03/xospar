// src/screens/MarketsScreen/MarketsComponents/MarketCategory.jsx

import {
  View,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

export default function MarketCategory({
  navigation,
}) {
  const categories = [
    "Forex",
    "Crypto",
    "Stocks",
    "Indices",
    "Commodities",
  ];

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <Pressable
          key={category}
          onPress={() =>
            navigation?.navigate(
              "MarketCategoryDetail",
              { category }
            )
          }
          style={styles.category}
        >
          <Text style={styles.categoryText}>
            {category}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000000",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  category: {
    width: "100%",
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#1C2630",
    borderRadius: 8,
    marginBottom: 6,
  },

  categoryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});