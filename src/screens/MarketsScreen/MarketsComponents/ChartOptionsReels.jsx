import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { CHART_RANGES } from "../../../services/api/candleRanges";

const CHART_TYPES = [
  { value: "line", label: "Line" },
  { value: "candle", label: "Candle" },
];

const RANGE_OPTIONS = CHART_RANGES.map((range) => ({
  value: range,
  label: range,
}));

// Height of a single row in the full-size wheel (non-compact). Also the
// scroll-snap interval, so each flick/drag lands exactly one option at
// a time.
const ROW_HEIGHT = 40;

// How many rows tall the open (non-compact) wheel is. Odd number so
// there's a true center row - that's the selected option.
const VISIBLE_ROWS = 3;
const WHEEL_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const CENTER_OFFSET = ROW_HEIGHT * Math.floor(VISIBLE_ROWS / 2);

// Compact wheel (used in the fullscreen chart controls row) - smaller
// row height, and a container shorter than a full row count so the
// row above/below the selected one peeks in cropped, exactly like a
// classic iOS-style picker. This is what makes it read as "directly
// scrollable" rather than a dropdown you have to tap open first.
const COMPACT_ROW_HEIGHT = 26;
const COMPACT_WHEEL_HEIGHT = Math.round(COMPACT_ROW_HEIGHT * 1.7);
const COMPACT_CENTER_OFFSET = (COMPACT_WHEEL_HEIGHT - COMPACT_ROW_HEIGHT) / 2;

const TITLE_BLOCK_HEIGHT = 19;

/**
 * Slot-machine style pickers for the chart: left reel = chart type
 * (Line / Candle), right reel = timeframe.
 *
 * These are real scroll reels - you drag/flick vertically and whatever
 * option comes to rest in the center becomes the selected value, the
 * same interaction as an iOS-style picker wheel. There is no tap-to-select
 * row; scrolling IS the selection, in BOTH the full and compact sizes -
 * the compact size (used in the fullscreen chart view) is just a shorter
 * window onto the same scrollable list, with the neighboring options
 * peeking in above/below, cropped, so it's obviously scrollable at a
 * glance instead of looking like a dropdown you have to tap first.
 */
export default function ChartOptionsReels({
  chartType,
  onChangeChartType,
  range,
  onChangeRange,
  compact = false,
  onCollapse,
}) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
      ]}
    >
      <Wheel
        title="Chart"
        options={CHART_TYPES}
        value={chartType}
        onChange={onChangeChartType}
        compact={compact}
      />

      <View
        style={[
          styles.divider,
          compact && styles.dividerCompact,
        ]}
      />

      <Wheel
        title="Timeframe"
        options={RANGE_OPTIONS}
        value={range}
        onChange={onChangeRange}
        compact={compact}
      />

      {onCollapse ? (
        <>
          <View
            style={[
              styles.divider,
              compact && styles.dividerCompact,
            ]}
          />

          <View style={styles.collapseColumn}>
            {!compact && <View style={styles.titleSpacer} />}

            <Pressable
              style={[
                styles.collapseButton,
                compact && styles.collapseButtonCompact,
              ]}
              onPress={onCollapse}
              hitSlop={8}
            >
              <Ionicons
                name="contract-outline"
                size={compact ? 16 : 20}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

function Wheel({
  title,
  options,
  value,
  onChange,
  compact,
}) {
  const scrollRef = useRef(null);

  const rowHeight = compact ? COMPACT_ROW_HEIGHT : ROW_HEIGHT;
  const wheelHeight = compact ? COMPACT_WHEEL_HEIGHT : WHEEL_HEIGHT;
  const centerOffset = compact ? COMPACT_CENTER_OFFSET : CENTER_OFFSET;

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index >= 0 ? index : 0;
  }, [options, value]);

  const [liveIndex, setLiveIndex] = useState(selectedIndex);

  // Keep the wheel's scroll position in sync whenever the selected value
  // changes from outside this component (or on first mount).
  useEffect(() => {
    setLiveIndex(selectedIndex);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * rowHeight,
        animated: false,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, compact]);

  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / rowHeight);
    const clamped = Math.max(0, Math.min(options.length - 1, index));

    if (clamped !== liveIndex) {
      setLiveIndex(clamped);
    }
  };

  const commitScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / rowHeight);
    const clamped = Math.max(0, Math.min(options.length - 1, index));

    const nextOption = options[clamped];

    if (nextOption && nextOption.value !== value) {
      onChange?.(nextOption.value);
    }
  };

  return (
    <View style={styles.reel}>
      {!compact && (
        <Text style={styles.reelTitle}>
          {title.toUpperCase()}
        </Text>
      )}

      <View
        style={[
          styles.wheelWrapper,
          { height: wheelHeight },
          compact && styles.wheelWrapperCompact,
        ]}
      >
        {/* Center highlight band - purely visual, shows where the
            selected row rests. Sits under the scroll content. No
            border - just a slightly lighter fill than the reel's
            background. */}
        <View
          pointerEvents="none"
          style={[
            styles.wheelHighlight,
            {
              top: centerOffset,
              height: rowHeight,
            },
          ]}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={rowHeight}
          decelerationRate="fast"
          nestedScrollEnabled
          contentContainerStyle={{
            paddingVertical: centerOffset,
          }}
          style={{ height: wheelHeight }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={commitScroll}
          onScrollEndDrag={(event) => {
            // Covers the case where the drag stops without momentum
            // (a short, deliberate flick to the very next row).
            if (event.nativeEvent.velocity?.y === 0) {
              commitScroll(event);
            }
          }}
        >
          {options.map((option, index) => {
            const isCentered = index === liveIndex;

            return (
              <View
                key={option.value}
                style={[
                  styles.wheelRow,
                  { height: rowHeight },
                ]}
              >
                <Text
                  style={[
                    styles.wheelRowText,
                    compact && styles.wheelRowTextCompact,
                    isCentered && styles.wheelRowTextActive,
                    isCentered && compact && styles.wheelRowTextActiveCompact,
                  ]}
                >
                  {option.label}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0D151D",
    borderWidth: 1,
    borderColor: "#1C2A35",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  containerCompact: {
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  divider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#1C2A35",
    marginHorizontal: 8,
  },

  dividerCompact: {
    height: COMPACT_WHEEL_HEIGHT - 6,
    alignSelf: "center",
  },

  reel: {
    flex: 1,
  },

  reelTitle: {
    color: "#7E8994",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
  },

  /* Scrollable wheel */
  wheelWrapper: {
    justifyContent: "center",
    overflow: "hidden",
  },

  wheelWrapperCompact: {
    minWidth: 64,
  },

  wheelHighlight: {
    position: "absolute",
    left: 2,
    right: 2,
    borderRadius: 8,
    backgroundColor: "#16202B",
  },

  wheelRow: {
    alignItems: "center",
    justifyContent: "center",
  },

  wheelRowText: {
    color: "#4C5762",
    fontSize: 14,
    fontWeight: "600",
  },

  wheelRowTextCompact: {
    fontSize: 12,
  },

  wheelRowTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  wheelRowTextActiveCompact: {
    fontSize: 13,
  },

  /* Collapse control - third item in the picker row */
  collapseColumn: {
    width: ROW_HEIGHT,
    alignItems: "center",
  },

  titleSpacer: {
    height: TITLE_BLOCK_HEIGHT,
  },

  collapseButton: {
    width: ROW_HEIGHT,
    height: ROW_HEIGHT,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#101A24",
    borderWidth: 1,
    borderColor: "#263543",
  },

  collapseButtonCompact: {
    width: COMPACT_WHEEL_HEIGHT,
    height: COMPACT_WHEEL_HEIGHT,
    borderRadius: 8,
  },
});