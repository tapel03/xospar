import { View, StyleSheet } from "react-native";

// Pure-View decorative background (no image assets/libraries needed).
// Non-interactive - pointerEvents="none" so it never intercepts taps on
// the real content stacked on top of it.
export default function OnboardingBackdrop({ variant = "welcome" }) {
  const flipped = variant === "completion";

  return (
    <View style={styles.container} pointerEvents="none">
      <View
        style={[
          styles.blob,
          styles.blobBlue,
          flipped ? { bottom: -120, right: -100 } : { top: -140, right: -90 },
        ]}
      />

      <View
        style={[
          styles.blob,
          styles.blobPurple,
          flipped ? { top: -100, left: -110 } : { bottom: -110, left: -90 },
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
    backgroundColor: "#FFFFFF",
  },

  blobPurple: {
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#A3A3A3",
  },

  blobCoral: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#D4D4D4",
    opacity: 0.12,
  },
});
