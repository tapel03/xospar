import { Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthBackButton({ onPress }) {
  return (
    <Pressable style={styles.container} onPress={onPress} hitSlop={10}>
      <Ionicons name="chevron-back" size={18} color="#9A9AA0" />
      <Text style={styles.label}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 2,
    marginBottom: 28,
  },

  label: {
    color: "#9A9AA0",
    fontSize: 15,
  },
});
