import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const DOT_SIZE = 8;
const ACTIVE_WIDTH = 24;

// Pill + dots pager: the current step is a wide colored pill, every other
// step is a small gray dot. Moving between steps animates the pill's
// width and color so the "active" state slides along the row.
//
// `total` is expected to stay constant for the life of the component.
export default function PageIndicator({
  total = 4,
  current = 0,
  activeColor = "#0A7AFF",
  inactiveColor = "#D9DCE1",
  style,
}) {
  const progress = useRef(
    Array.from({ length: total }, (_, index) => new Animated.Value(index === current ? 1 : 0))
  ).current;

  useEffect(() => {
    progress.forEach((value, index) => {
      Animated.timing(value, {
        toValue: index === current ? 1 : 0,
        duration: 220,
        useNativeDriver: false, // width + backgroundColor can't use the native driver
      }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  return (
    <View style={[styles.row, style]}>
      {progress.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              width: value.interpolate({
                inputRange: [0, 1],
                outputRange: [DOT_SIZE, ACTIVE_WIDTH],
              }),
              backgroundColor: value.interpolate({
                inputRange: [0, 1],
                outputRange: [inactiveColor, activeColor],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});