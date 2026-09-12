import { View, Text, ScrollView, StyleSheet } from "react-native";

import Sparkline from "./Sparkline";

const CATEGORIES = [
  {
    id: "memes",
    name: "Memes",
    subtitle: null,
    change: "+256.48%",
    icons: ["🐶", "🐸", "🐦"],
    data: [3, 4, 3.5, 6, 5, 9, 8, 14, 12, 20],
  },
  {
    id: "solana",
    name: "Solana",
    subtitle: "Ecosystem",
    change: "+112.18%",
    icons: ["◎", "🪐"],
    data: [5, 6, 5.5, 7, 6.5, 9, 8.5, 11, 10, 13],
  },
  {
    id: "bnb",
    name: "BNB",
    subtitle: "Chain",
    change: "+64.02%",
    icons: ["🔶"],
    data: [4, 4.5, 4, 5, 5.5, 6, 6.5, 7, 7.5, 8],
  },
];

function IconStack({ icons }) {
  return (
    <View style={styles.iconStack}>
      {icons.map((icon, index) => (
        <View
          key={index}
          style={[styles.iconCircle, { marginLeft: index === 0 ? 0 : -8 }]}
        >
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CategoryCardRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((item) => (
        <View key={item.id} style={styles.card}>
          <IconStack icons={item.icons} />

          <Sparkline data={item.data} color="#4ADE80" />

          <Text style={styles.name}>{item.name}</Text>
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}

          <Text style={styles.change}>{item.change}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },

  card: {
    width: 130,
    backgroundColor: "#1C2630",
    borderRadius: 14,
    padding: 12,
  },

  iconStack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#101820",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A3540",
  },

  iconText: {
    fontSize: 11,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  subtitle: {
    color: "#8C949E",
    fontSize: 11,
    marginTop: 1,
  },

  change: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
});