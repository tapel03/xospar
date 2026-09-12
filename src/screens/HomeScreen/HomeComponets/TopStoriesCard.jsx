import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TopStoriesCard() {
  return (
    <View style={styles.card}>

      <Text style={styles.sectionTitle}>Top Stories</Text>

      <View style={styles.imageContainer}>

        <Image
          source={{
            uri:
              "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=900",
          }}
          style={styles.image}
        />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>High Impact</Text>
        </View>

      </View>

      <Text style={styles.headline}>
        Fed Holds Rates Steady, Signals One Cut Later This Year
      </Text>

      <Text style={styles.description}>
        The Federal Reserve kept interest rates unchanged but indicated one rate cut could come later this year as inflation eases and growth moderates.
      </Text>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Reuters • 2m ago • USD</Text>

        <Ionicons name="bookmark-outline" size={18} color="#AAAAAA" />
      </View>

      <View style={styles.divider} />

      <Pressable style={styles.smallStory}>
        <View style={styles.thumbnail} />

        <View style={styles.storyContent}>
          <Text style={styles.storyTitle}>
            US Inflation Cools in April, Below Expectations
          </Text>

          <Text style={styles.storyMeta}>Bloomberg • 15m ago • USD</Text>
        </View>

        <View style={styles.mediumBadge}>
          <Text style={styles.mediumText}>Medium</Text>
        </View>
      </Pressable>

      <Pressable style={styles.smallStory}>
        <View style={styles.thumbnail} />

        <View style={styles.storyContent}>
          <Text style={styles.storyTitle}>
            Oil Prices Fall on Rising Inventory Concerns
          </Text>

          <Text style={styles.storyMeta}>CNBC • 25m ago • Oil</Text>
        </View>

        <View style={styles.mediumBadge}>
          <Text style={styles.mediumText}>Medium</Text>
        </View>
      </Pressable>

      <Pressable style={styles.footerButton}>
        <Text style={styles.footerText}>View All News →</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101820",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1C2630",
    padding: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  imageContainer: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 170,
    borderRadius: 12,
  },

  badge: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "#2A2F38",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  headline: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
    lineHeight: 28,
  },

  description: {
    color: "#98A2AD",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  meta: {
    color: "#777F88",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#1C2630",
    marginVertical: 15,
  },

  smallStory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  thumbnail: {
    width: 56,
    height: 56,
    backgroundColor: "#303841",
    borderRadius: 10,
    marginRight: 12,
  },

  storyContent: {
    flex: 1,
  },

  storyTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  storyMeta: {
    color: "#7D8691",
    marginTop: 4,
    fontSize: 11,
  },

  mediumBadge: {
    backgroundColor: "#2A2F38",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  mediumText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  footerButton: {
    paddingTop: 6,
  },

  footerText: {
    color: "#3A7BD5",
    fontWeight: "600",
  },
});