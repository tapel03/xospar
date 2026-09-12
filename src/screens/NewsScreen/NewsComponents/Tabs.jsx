import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const TABS = ["Top Stories", "Sentiment", "AI Insights"];

export default function Tabs({ onChange }) {
  const [active, setActive] = useState(TABS[0]);

  const handlePress = (tab) => {
    setActive(tab);
    onChange?.(tab);
  };

  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <Pressable
          key={tab}
          style={[styles.tab, active === tab && styles.activeTab]}
          onPress={() => handlePress(tab)}
        >
          <Text style={[styles.tabText, active === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#1C2630",
  },

  activeTab: {
    backgroundColor: "#3A7BD5",
  },

  tabText: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#FFFFFF",
  },
});
