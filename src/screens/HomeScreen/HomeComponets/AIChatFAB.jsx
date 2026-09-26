import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Floating action button for jumping straight into the MARKET AI chat
// from anywhere on the Home screen, without scrolling to a card. Pinned
// to the bottom-right, above the bottom tab bar. Kept as a sibling of
// the ScrollView (not inside it) so it stays fixed while the page
// scrolls.
export default function AIChatFAB({ onPress }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { bottom: insets.bottom + 20 },
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      hitSlop={6}
    >
      <Ionicons name="sparkles" size={22} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A7BD5",

    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});