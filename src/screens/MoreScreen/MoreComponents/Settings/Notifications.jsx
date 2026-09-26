import { useState } from "react";
import { View, Text, StyleSheet, Switch } from "react-native";

export default function Notifications() {
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(true);
  const [economicEvents, setEconomicEvents] = useState(false);

  const rows = [
    { label: "Price Alerts", value: priceAlerts, onToggle: setPriceAlerts },
    { label: "Breaking News", value: newsAlerts, onToggle: setNewsAlerts },
    { label: "Economic Events", value: economicEvents, onToggle: setEconomicEvents },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>

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
    backgroundColor: "#0A0A0A",
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
    borderBottomColor: "#171717",
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
