import { Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SocialButton({ icon, iconColor = "#FFFFFF", label, onPress }) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name={icon} size={18} color={iconColor} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#17171A",
    marginBottom: 12,
  },

  icon: {
    marginRight: 8,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
