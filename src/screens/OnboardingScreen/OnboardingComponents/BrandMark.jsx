import { View, StyleSheet } from "react-native";

// Recreates the wireframe's abstract triangle/circle/blob cluster icon
// (see the Splash/Welcome reference screens) as plain RN shapes, so it
// scales cleanly and needs no exported asset. Sits above the
// OnboardingBackdrop as the screen's focal mark.
export default function BrandMark() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.square} />
      <View style={styles.circle} />
      <View style={styles.blob} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 96,
    height: 96,
    alignSelf: "center",
    marginBottom: 22,
  },

  square: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#3A7BD5",
    transform: [{ rotate: "8deg" }],
  },

  circle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#8F7CFF",
  },

  blob: {
    position: "absolute",
    bottom: 0,
    left: 14,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FF9D7C",
    transform: [{ rotate: "-6deg" }],
  },
});