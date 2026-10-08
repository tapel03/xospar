import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";

// Confidence is black now (was blue) to keep the palette monochrome.
// Fear / Uncertainty / Risk keep their red / orange / green meaning.
const DEFAULT_METRICS = [
  { label: "Fear", value: 78, color: "#E5484D" },
  { label: "Uncertainty", value: 65, color: "#F29A52" },
  { label: "Risk", value: 32, color: "#22A06B" },
  { label: "Confidence", value: 18, color: "#111111" },
];

// Accent colors per mood label - drives the badge, glow and headline.
const MOOD_STYLES = {
  "RISK-OFF": { accent: "#E5484D", badge: "#C42B3A", badgeBorder: "#E5485B" },
  "RISK-ON": { accent: "#22A06B", badge: "#1B8A5A", badgeBorder: "#34D27A" },
  NEUTRAL: { accent: "#71717A", badge: "#3A3A3A", badgeBorder: "#6B6B6B" },
};

const INFO_TEXT =
  "A snapshot of overall risk sentiment across global markets. High fear and uncertainty point to risk-off conditions; high confidence points to risk-on.";

// Max height (in px) a bar reaches at 100%. Bars scale proportionally
// below that.
const MAX_BAR_HEIGHT = 92;
const MIN_BAR_HEIGHT = 6;

const clamp = (value) => Math.max(0, Math.min(100, value));

// Eight-point starburst drawn as an SVG polygon (alternating outer/inner
// radii), matching the icon inside the mood badge.
function Starburst({ size = 30, color = "#FFFFFF" }) {
  const center = size / 2;
  const spikes = 8;
  const outer = size / 2;
  const inner = size / 4.6;

  const points = Array.from({ length: spikes * 2 }, (_, index) => {
    const angle = (Math.PI / spikes) * index - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;

    return `${center + radius * Math.cos(angle)},${
      center + radius * Math.sin(angle)
    }`;
  }).join(" ");

  return (
    <Svg width={size} height={size}>
      <Polygon points={points} fill={color} />
    </Svg>
  );
}

// A single vertical bar-chart column: value above the bar, the colored
// bar itself, then the metric's label below - completely outside/apart
// from the bar rather than laid over or beside it like a progress bar.
function MoodBarColumn({ label, value, color, delay = 0 }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: clamp(value),
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // height can't use the native driver
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const barHeight = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [MIN_BAR_HEIGHT, MAX_BAR_HEIGHT],
  });

  return (
    <View style={styles.column}>
      <Text style={styles.columnValue}>{Math.round(clamp(value))}%</Text>

      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.bar,
            { height: barHeight, backgroundColor: color },
          ]}
        />
      </View>

      <Text style={styles.columnLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Layout: the mood status (e.g. "RISK-OFF") and the "View Global Events"
// button sit above/outside the rounded card, side by side. The card
// itself holds only the eyebrow/heading and the bar chart - it is never
// pressable; the button is the only way in.
export default function GlobalMarketMood({
  mood = "RISK-OFF",
  description = "Geopolitical tensions and economic uncertainty are increasing market fear.",
  metrics = DEFAULT_METRICS,
  loading = false,
  onPressDetails,
}) {
  const [infoOpen, setInfoOpen] = useState(false);

  const moodStyle = MOOD_STYLES[mood] || MOOD_STYLES.NEUTRAL;

  return (
    <View style={styles.wrapper}>
      {/* Top row - mood status on the left, "View Global Events" button
          on the right, both outside/above the card. */}
      <View style={styles.topRow}>
        <View style={styles.moodRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: moodStyle.badge,
                borderColor: moodStyle.badgeBorder,
                shadowColor: moodStyle.accent,
              },
            ]}
          >
            <Starburst size={16} />
          </View>

          <Text style={[styles.moodText, { color: moodStyle.accent }]}>
            {mood}
          </Text>
        </View>

        {onPressDetails ? (
          <Pressable
            style={({ pressed }) => [
              styles.detailsButton,
              pressed && styles.detailsButtonPressed,
            ]}
            onPress={onPressDetails}
          >
            <Text style={styles.detailsButtonText}>View Global Events</Text>
            <Ionicons name="arrow-forward" size={13} color={colors[900]} />
          </Pressable>
        ) : null}
      </View>

      {/* Card - static, not pressable. */}
      <View style={styles.card}>
        <View
          pointerEvents="none"
          style={[styles.glow, { backgroundColor: moodStyle.accent }]}
        />

        <View style={styles.headerRow}>
          <View style={styles.headingBlock}>
            <Text style={styles.eyebrow}>Live Sentiment</Text>
            <Text style={styles.heading}>Global Market Mood</Text>
          </View>

          <View style={styles.headerIcons}>
            <View
              style={[styles.liveDot, loading && styles.liveDotLoading]}
            />

            <Pressable
              onPress={() => setInfoOpen((value) => !value)}
              hitSlop={10}
              style={styles.infoButton}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors[600]}
              />
            </Pressable>
          </View>
        </View>

        {infoOpen && <Text style={styles.infoText}>{INFO_TEXT}</Text>}

        <Text style={styles.description}>{description}</Text>

        {/* Bar-chart metrics - each metric is its own column with the
            value above the bar and the label below it, outside the bar
            itself. */}
        <View style={styles.chart}>
          {metrics.map((metric, index) => (
            <MoodBarColumn
              key={metric.label}
              label={metric.label}
              value={metric.value}
              color={metric.color}
              delay={index * 90}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // No background here - this is just a layout wrapper for the
    // top row + the card beneath it.
  },

  /* Top row - outside the card */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  badge: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },

  moodText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors[200],
    backgroundColor: colors[100],
  },

  detailsButtonPressed: {
    opacity: 0.7,
  },

  detailsButtonText: {
    color: colors[900],
    fontSize: 12,
    fontWeight: "700",
  },

  /* Card */
  card: {
    backgroundColor: "#F5F5F7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E6E6EA",
    padding: 16,
    overflow: "hidden",
  },

  glow: {
    position: "absolute",
    bottom: -120,
    left: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.08,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headingBlock: {
    flex: 1,
    marginRight: 10,
  },

  eyebrow: {
    color: colors[500],
    fontSize: 12,
    fontWeight: "500",
  },

  heading: {
    color: colors[900],
    fontSize: 19,
    fontWeight: "700",
    marginTop: 4,
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22A06B",
    marginRight: 10,
  },

  liveDotLoading: {
    backgroundColor: "#A1A1AA",
  },

  infoButton: {
    marginLeft: 0,
  },

  infoText: {
    color: colors[600],
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  description: {
    color: colors[800],
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },

  /* Bar chart */
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 22,
    paddingTop: 4,
  },

  column: {
    flex: 1,
    alignItems: "center",
  },

  columnValue: {
    color: colors[700],
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },

  barTrack: {
    width: "100%",
    height: MAX_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  bar: {
    width: 26,
    borderRadius: 8,
  },

  columnLabel: {
    color: colors[600],
    fontSize: 11,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "center",
  },
});