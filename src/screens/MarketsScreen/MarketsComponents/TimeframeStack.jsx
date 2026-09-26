import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Matches the codes used in services/api/candleRanges.js (CHART_RANGES).
export const TIMEFRAME_OPTIONS = [
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1H", label: "1 hour" },
  { value: "2H", label: "2 hours" },
  { value: "4H", label: "4 hours" },
  { value: "1D", label: "1 day" },
  { value: "1W", label: "1 week" },
  { value: "1M", label: "1 month" },
];

// Vertical, collapsible timeframe picker - replaces the old horizontal
// scroll row. Collapsed, it shows only the active timeframe as a small
// pill with a couple of faint "cards" peeking out behind it (hinting
// there's a stack underneath). Tapping it expands a vertical menu with
// every other timeframe stacked on top of each other.
export default function TimeframeStack({
  value,
  onChange,
  options = TIMEFRAME_OPTIONS,
  align = "left",
}) {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const activeOption =
    options.find((option) => option.value === value) || options[0];

  const animateTo = (toValue, onDone) => {
    Animated.timing(animation, {
      toValue,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(onDone);
  };

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    animateTo(next ? 1 : 0);
  };

  const selectOption = (option) => {
    onChange?.(option.value);
    setExpanded(false);
    animateTo(0);
  };

  return (
    <View style={[styles.container, align === "right" && styles.alignRight]}>

      {/* Expanded vertical menu - anchored above the collapsed pill so
          it never gets clipped by the bottom of the screen. */}
      {expanded && (
        <Animated.View
          style={[
            styles.menu,
            align === "right" && styles.menuAlignRight,
            {
              opacity: animation,
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {options.map((option) => {
            const isActive = option.value === value;

            return (
              <Pressable
                key={option.value}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => selectOption(option)}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    isActive && styles.menuItemTextActive,
                  ]}
                >
                  {option.label}
                </Text>

                {isActive && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Collapsed stack */}
      <Pressable style={styles.stackWrapper} onPress={toggle} hitSlop={6}>
        <View style={[styles.peekCard, styles.peekCardBack]} />
        <View style={[styles.peekCard, styles.peekCardMid]} />

        <View style={styles.activePill}>
          <Ionicons name="time-outline" size={13} color="#FFFFFF" />

          <Text style={styles.activePillText}>{activeOption.label}</Text>

          <Ionicons
            name={expanded ? "chevron-down" : "chevron-up"}
            size={14}
            color="#8B949E"
          />
        </View>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },

  alignRight: {
    alignItems: "flex-end",
  },

  stackWrapper: {
    position: "relative",
  },

  peekCard: {
    position: "absolute",
    left: 6,
    right: -6,
    borderRadius: 14,
    backgroundColor: "#101A24",
    borderWidth: 1,
    borderColor: "#263543",
  },

  peekCardBack: {
    bottom: -8,
    height: 40,
    opacity: 0.45,
  },

  peekCardMid: {
    bottom: -4,
    height: 40,
    opacity: 0.7,
  },

  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#151F29",
    borderWidth: 1,
    borderColor: "#2C3A48",
  },

  activePillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  menu: {
    position: "absolute",
    bottom: 52,
    left: 0,
    minWidth: 170,
    borderRadius: 14,
    paddingVertical: 6,
    backgroundColor: "#101A24",
    borderWidth: 1,
    borderColor: "#263543",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },

  menuAlignRight: {
    left: undefined,
    right: 0,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  menuItemActive: {
    backgroundColor: "#1C2A38",
  },

  menuItemText: {
    color: "#8B949E",
    fontSize: 13,
    fontWeight: "600",
  },

  menuItemTextActive: {
    color: "#FFFFFF",
  },
});