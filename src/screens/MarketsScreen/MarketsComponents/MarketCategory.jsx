import {
  View,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

export default function MarketCategory() {
  return (
    <View style={styles.container}>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>Favorites</Text>
      </Pressable>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>All</Text>
      </Pressable>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>Stocks</Text>
      </Pressable>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>Commodities</Text>
      </Pressable>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>Crypto</Text>
      </Pressable>

      <Pressable style={styles.CategoryBtn}>
        <Text style={styles.text}>Global Map</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#000000",
    padding: 10,
  },

  CategoryBtn: {
    flex: 1,
    backgroundColor: "#1C2630",
    padding: 12,
    marginBottom: 5,
    borderRadius: 8,
  },

  text: {
    color: "#FFFFFF",
  },
});
