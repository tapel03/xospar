import { View, StyleSheet } from "react-native";

// Pure-CSS-style decorative background — three large, low-opacity blobs
// built from plain Views (borderRadius + overflow hidden on the parent),
// so no image assets or extra libraries (e.g. expo-linear-gradient,
// expo-blur) are required. Non-interactive: pointerEvents="none" so it
// never intercepts taps on the real content stacked on top of it.
//
// `variant` shifts which corners the blobs sit in, so Welcome and
// Completion don't look like carbon copies of each other.
export default function OnboardingBackdrop({ variant = "welcome" }) {
  const flipped = variant === "completion";

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.blob,
          styles.blobBlue,
          flipped
            ? { bottom: -120, right: -100 }
            : { top: -140, right: -90 },
        ]}
      />

      <View
        style={[
          styles.blob,
          styles.blobPurple,
          flipped
            ? { top: -100, left: -110 }
            : { bottom: -110, left: -90 },
        ]}
      />

      <View
        style={[
          styles.blob,
          styles.blobCoral,
          flipped
            ? { top: "38%", right: -60 }
            : { top: "42%", left: -70 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  blob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.16,
  },

  blobBlue: {
    backgroundColor: "#3A7BD5",
  },

  blobPurple: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#8F7CFF",
  },

  blobCoral: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FF9D7C",
    opacity: 0.12,
  },
});