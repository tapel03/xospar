import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../../theme/colors";

const CATEGORIES = [
  { name: "Crypto", icon: "folder" },
  { name: "Forex", icon: "folder" },
  { name: "Indices", icon: "folder" },
  { name: "Stocks", icon: "folder" },
];

export default function MarketOverview() {
  const navigation = useNavigation();

  const openCategory = (category) => {
    navigation.navigate("MarketCategoryDetail", {
      category,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.name}
            style={({ pressed }) => [
              styles.folderItem,
              pressed && styles.folderPressed,
            ]}
            onPress={() => openCategory(category.name)}
          >
            <View style={styles.folder}>
              <View style={styles.folderTab} />

              <View style={styles.folderBody}>
                <Text style={styles.folderSymbol}>
                  {category.name.charAt(0)}
                </Text>
              </View>
            </View>

            <Text style={styles.categoryName}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.base,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },

  folderItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 20,
  },

  folderPressed: {
    opacity: 0.55,
    transform: [{ scale: 0.96 }],
  },

  folder: {
    width: 72,
    height: 55,
    position: "relative",
  },

  folderTab: {
    position: "absolute",
    left: 3,
    top: 0,
    width: 27,
    height: 13,
    backgroundColor: colors[400],
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },

  folderBody: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 48,
    backgroundColor: colors[600],
    borderRadius: 6,

    borderTopWidth: 2,
    borderTopColor: colors[400],

    shadowColor: colors.base,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,

    elevation: 4,

    justifyContent: "center",
    alignItems: "center",
  },

  folderSymbol: {
    color: colors[200],
    fontSize: 16,
    fontWeight: "700",
    opacity: 0.8,
  },

  categoryName: {
    color: colors[950],
    fontSize: 12,
    fontWeight: "600",
    marginTop: 7,
    textAlign: "center",
  },
});
