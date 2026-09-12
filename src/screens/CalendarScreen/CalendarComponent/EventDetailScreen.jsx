import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const IMPACT_COLORS = {
  High: "#FF5A5F",
  Medium: "#FFB020",
  Low: "#8FCB8F",
};

export default function EventDetailScreen() {
  const route = useRoute();
  const event = route.params?.event ?? {
    time: "--:--",
    currency: "—",
    title: "Event details unavailable",
    impact: "Low",
  };

  const impactColor = IMPACT_COLORS[event.impact] || IMPACT_COLORS.Low;

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{event.time}</Text>
      <Text style={styles.currency}>{event.currency}</Text>
      <Text style={styles.title}>{event.title}</Text>

      <View style={[styles.impactBadge, { borderColor: impactColor }]}>
        <Text style={[styles.impactText, { color: impactColor }]}>
          {event.impact} Impact
        </Text>
      </View>

      <Text style={styles.sectionLabel}>What to expect</Text>
      <Text style={styles.text}>
        This event can move {event.currency}-related pairs and correlated
        assets. Volatility often increases in the minutes around the
        release, so check spreads and open positions beforehand.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
    padding: 20,
  },

  time: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  currency: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  impactBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
  },

  impactText: {
    fontSize: 13,
    fontWeight: "600",
  },

  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 28,
    marginBottom: 8,
  },

  text: {
    color: "#AAAAAA",
    fontSize: 14,
    lineHeight: 20,
  },
});
