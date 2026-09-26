import { View, Text, StyleSheet, Image, Pressable, Linking } from "react-native";

import { colors } from "../../../theme/colors";

// Replaces the old "Invite a friend" promo banner with the current top
// market story - same banner footprint/shape, real content underneath.
export default function TopStoryBanner({ story, onPress }) {
  if (!story) {
    return null;
  }

  const handlePress = async () => {
    if (onPress) {
      onPress(story);
      return;
    }

    if (story.url) {
      try {
        await Linking.openURL(story.url);
      } catch (error) {
        console.warn("Unable to open story:", error);
      }
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {story.image ? (
        <Image source={{ uri: story.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.overlay} />

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={3}>
          {story.title}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {story.source} • {story.time}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 12,
    backgroundColor: colors[100],
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    backgroundColor: colors[200],
  },

  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "62%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  textContainer: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
  },

  title: {
    color: colors[950],
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },

  meta: {
    color: colors[700],
    fontSize: 11,
    marginTop: 6,
  },
});