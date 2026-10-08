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
          color="#71717A"
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
                <Ionicons name={tool.icon} size={20} color="#000000" />
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
    backgroundColor: "#F5F5F7",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E6E6EA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    color: "#000000",
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E4",
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
    backgroundColor: "#F0F0F2",
    marginBottom: 8,
  },

  tileLabel: {
    color: "#111111",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
});