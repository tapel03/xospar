import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ACCENT = "#0A7AFF";
const IDLE = "#3A3A3D";
const CARD = "#17171A";
const TEXT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";

const WICK_HEIGHT = 10;
const CAPTION_BLOCK = 44;
const VERTICAL_PADDING = 14;

// One entry per experience level, in ascending order. `barRatio` is how
// tall that level's bar is relative to the tallest one.
const LEVELS = [
  {
    key: "Beginner",
    icon: "leaf-outline",
    barRatio: 0.42,
    caption: "Just getting started - we'll keep things simple.",
  },
  {
    key: "Intermediate",
    icon: "trending-up-outline",
    barRatio: 0.72,
    caption: "You know the basics and want sharper tools.",
  },
  {
    key: "Advanced",
    icon: "trophy-outline",
    barRatio: 1,
    caption: "You trade with a plan and want an edge.",
  },
];

const DEFAULT_CAPTION = "Pick the level that fits you best.";

// Candlestick-style "growth ladder" for the experience question. Bars
// fill in (grey -> blue) up to and including the selected level, so
// choosing "Advanced" lights up all three and "Beginner" only the first.
export default function ExperienceIllustration({ level, height = 176, style }) {
  const activeIndex = LEVELS.findIndex((item) => item.key === level);

  const progress = useRef(
    LEVELS.map((_, index) => new Animated.Value(index <= activeIndex ? 1 : 0))
  ).current;

  useEffect(() => {
    progress.forEach((value, index) => {
      Animated.timing(value, {
        toValue: index <= activeIndex ? 1 : 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // backgroundColor can't use the native driver
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const barAreaHeight = Math.max(
    height - CAPTION_BLOCK - VERTICAL_PADDING * 2 - WICK_HEIGHT,
    60
  );

  const caption =
    activeIndex >= 0 ? LEVELS[activeIndex].caption : DEFAULT_CAPTION;

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={styles.bars}>
        {LEVELS.map((item, index) => {
          const color = progress[index].interpolate({
            inputRange: [0, 1],
            outputRange: [IDLE, ACCENT],
          });

          const isCurrent = index === activeIndex;

          return (
            <View key={item.key} style={styles.column}>
              <Animated.View style={[styles.wick, { backgroundColor: color }]} />

              <Animated.View
                style={[
                  styles.bar,
                  {
                    height: Math.round(barAreaHeight * item.barRatio),
                    backgroundColor: color,
                    opacity: isCurrent || activeIndex < 0 ? 1 : 0.85,
                  },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={TEXT} />
              </Animated.View>

              <Text style={[styles.label, isCurrent && styles.labelActive]}>
                {item.key}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: CARD,
    paddingTop: VERTICAL_PADDING,
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },

  bars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 18,
  },

  column: {
    alignItems: "center",
  },

  wick: {
    width: 2,
    height: WICK_HEIGHT,
    borderRadius: 1,
  },

  bar: {
    width: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },

  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  labelActive: {
    color: TEXT,
  },

  caption: {
    minHeight: 30,
    paddingBottom: 10,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: TEXT_MUTED,
  },
});