import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../../../theme/colors";

export default function SettingsItem({ icon = "settings-outline", label, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <Ionicons name={icon} size={20} color={colors[950]} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors[500]} />
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
    borderBottomColor: colors[200],
  },

  pressed: {
    backgroundColor: colors[200],
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 14,
  },

  label: {
    color: colors[950],
    fontSize: 16,
  },
});
