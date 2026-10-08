 import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

function StoryImage({ uri }) {
  if (uri) {
    return <Image source={{ uri }} style={styles.image} />;
  }

  return (
    <View style={[styles.image, styles.imagePlaceholder]}>
      <Ionicons
        name="globe-outline"
        size={34}
        color="#A1A1AA"
      />
    </View>
  );
}

export default function TopStoriesCard({
  navigation,
  stories = [],
  loading = false,
}) {
  const mainStory = stories[0];
  const secondaryStories = stories.slice(1, 3);

  const openStory = async (story) => {
    if (!story?.url) {
      return;
    }

    try {
      await Linking.openURL(story.url);
    } catch (error) {
      console.warn("Unable to open news story:", error);
    }
  };

  if (loading && !mainStory) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Stories</Text>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000000" />
          <Text style={styles.loadingText}>
            Loading latest market news...
          </Text>
        </View>
      </View>
    );
  }

  if (!mainStory) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Stories</Text>

        <Text style={styles.emptyText}>
          No market-moving stories are available right now.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Top Stories</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#71717A" />
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.mainStory,
          pressed && styles.pressed,
        ]}
        onPress={() => openStory(mainStory)}
      >
        <View style={styles.imageContainer}>
          <StoryImage uri={mainStory.image} />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {mainStory.impact} Impact
            </Text>
          </View>
        </View>

        <Text style={styles.headline} numberOfLines={3}>
          {mainStory.title}
        </Text>

        <Text style={styles.description} numberOfLines={3}>
          {mainStory.description}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta} numberOfLines={1}>
            {mainStory.source} • {mainStory.time} •{" "}
            {mainStory.markets.join(" / ")}
          </Text>

          <Ionicons
            name="bookmark-outline"
            size={18}
            color="#71717A"
          />
        </View>
      </Pressable>

      {secondaryStories.length > 0 ? (
        <View style={styles.divider} />
      ) : null}

      {secondaryStories.map((story) => (
        <Pressable
          key={story.id}
          style={styles.smallStory}
          onPress={() => openStory(story)}
        >
          {story.image ? (
            <Image
              source={{ uri: story.image }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Ionicons
                name="newspaper-outline"
                size={20}
                color="#A1A1AA"
              />
            </View>
          )}

          <View style={styles.storyContent}>
            <Text
              style={styles.storyTitle}
              numberOfLines={2}
            >
              {story.title}
            </Text>

            <Text
              style={styles.storyMeta}
              numberOfLines={1}
            >
              {story.source} • {story.time} •{" "}
              {story.markets[0]}
            </Text>
          </View>

          <View style={styles.mediumBadge}>
            <Text style={styles.mediumText}>
              {story.impact}
            </Text>
          </View>
        </Pressable>
      ))}

      <Pressable
        style={styles.footerButton}
        onPress={() => navigation.navigate("News")}
      >
        <Text style={styles.footerText}>
          View All News →
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F5F5F7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E6EA",
    padding: 14,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  mainStory: {
    width: "100%",
  },

  pressed: {
    opacity: 0.75,
  },

  imageContainer: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E4E4E7",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    position: "absolute",
    left: 10,
    top: 10,
    backgroundColor: "#FDECEC",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    color: "#E5484D",
    fontSize: 10,
    fontWeight: "700",
  },

  headline: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 12,
  },

  description: {
    color: "#52525B",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },

  meta: {
    flex: 1,
    color: "#8E8E93",
    fontSize: 10,
    marginRight: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#E4E4E7",
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
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#E4E4E7",
  },

  thumbnailPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  storyContent: {
    flex: 1,
  },

  storyTitle: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  storyMeta: {
    color: "#8E8E93",
    marginTop: 4,
    fontSize: 11,
  },

  mediumBadge: {
    backgroundColor: "#E4E4E7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },

  mediumText: {
    color: "#111111",
    fontSize: 10,
    fontWeight: "700",
  },

  footerButton: {
    paddingTop: 2,
  },

  footerText: {
    color: "#000000",
    fontWeight: "600",
  },

  loadingContainer: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  loadingText: {
    color: "#8E8E93",
    fontSize: 12,
  },

  emptyText: {
    color: "#8E8E93",
    fontSize: 13,
    lineHeight: 19,
    paddingVertical: 20,
  },
});