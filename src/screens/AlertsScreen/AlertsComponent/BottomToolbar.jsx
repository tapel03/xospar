import { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TOOLS = [
  { id: "search", icon: "search-outline" },
  { id: "checklist", icon: "checkbox-outline" },
  { id: "edit", icon: "create-outline" },
  { id: "add", icon: "add" },
];

export default function BottomToolbar() {
  const [active, setActive] = useState("checklist");

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.toolbar}>
        {TOOLS.map((tool) => {
          const isActive = active === tool.id;

          return (
            <Pressable
              key={tool.id}
              style={[styles.toolBtn, isActive && styles.toolBtnActive]}
              onPress={() => setActive(tool.id)}
            >
              <Ionicons
                name={tool.icon}
                size={20}
                color={isActive ? "#000000" : "#8e8e93"}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 22,
    alignItems: "center",
  },

  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1c1c1e",
    borderRadius: 30,
    padding: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },

  toolBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  toolBtnActive: {
    backgroundColor: "#FFFFFF",
  },
});