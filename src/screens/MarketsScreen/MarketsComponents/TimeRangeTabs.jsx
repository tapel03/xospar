import { View, Text, Pressable, StyleSheet } from "react-native";

import { CHART_RANGES } from "../../../services/api/candleRanges";

export default function TimeRangeTabs({ value, onChange }) {
  return (
    <View style={styles.row}>
      {CHART_RANGES.map((range) => {
        const isActive = range === value;

        return (
          <Pressable
            key={range}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(range)}
            hitSlop={4}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {range}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  tab: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },

  tabActive: {
    backgroundColor: "#171717",
  },

  label: {
    color: "#59636D",
    fontSize: 12,
    fontWeight: "600",
  },

  labelActive: {
    color: "#FFFFFF",
  },
});

