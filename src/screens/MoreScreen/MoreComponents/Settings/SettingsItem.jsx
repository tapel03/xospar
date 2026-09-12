import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsItem({ icon = "settings-outline", label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666666" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  pressed: {
    backgroundColor: "#1C2630",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 14,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
