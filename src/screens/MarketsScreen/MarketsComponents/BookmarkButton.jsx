import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookmarkButton({ bookmarked, onPress, size = 20 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons
        name={bookmarked ? "bookmark" : "bookmark-outline"}
        size={size}
        color={bookmarked ? "#F2C94C" : "#59636D"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.6,
  },
});