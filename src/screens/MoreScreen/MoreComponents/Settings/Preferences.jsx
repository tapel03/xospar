import { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function Preferences() {
  const [darkMode, setDarkMode] = useState(true);
  const [showPercent, setShowPercent] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(false);

  const rows = [
    { label: "Dark Mode", value: darkMode, onToggle: setDarkMode },
    { label: "Show % Change", value: showPercent, onToggle: setShowPercent },
    { label: "Haptic Feedback", value: hapticFeedback, onToggle: setHapticFeedback },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Preferences</Text>

      {rows.map((row) => (
        <View style={styles.row} key={row.label}>
          <Text style={styles.label}>{row.label}</Text>
          <Switch
            value={row.value}
            onValueChange={row.onToggle}
            trackColor={{ false: "#3A3A3A", true: "#3A7BD5" }}
            thumbColor="#FFFFFF"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
