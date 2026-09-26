import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const QUICK_TOOLS = [
  { key: "position", label: "Position\nSize", icon: "reader-outline" },
  { key: "rr", label: "Risk/Reward", icon: "locate-outline" },
  { key: "pip", label: "Pip\nCalculator", icon: "calculator-outline" },
  { key: "lot", label: "Lot Size", icon: "server-outline" },
];

export default function QuickTools({ onSelectTool }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.card}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((value) => !value)}
        hitSlop={6}
      >
        <Text style={styles.title}>Quick Tools</Text>

        <Ionicons
          name={expanded ? "chevron-down" : "chevron-up"}
          size={16}
          color="#8B949E"
        />
      </Pressable>

      {expanded && (
        <View style={styles.row}>
          {QUICK_TOOLS.map((tool) => (
            <Pressable
              key={tool.key}
              onPress={() => onSelectTool?.(tool.key)}
              style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
            >
              <View style={styles.iconBox}>
                <Ionicons name={tool.icon} size={20} color="#9CC2FF" />
              </View>

              <Text style={styles.tileLabel}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B1420",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C2A3A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  tile: {
    flex: 1,
    minHeight: 92,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#0F1B2B",
    borderWidth: 1,
    borderColor: "#1F5FD0",
  },

  pressed: {
    opacity: 0.7,
  },

  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#13233A",
    marginBottom: 8,
  },

  tileLabel: {
    color: "#E5E7EB",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
});