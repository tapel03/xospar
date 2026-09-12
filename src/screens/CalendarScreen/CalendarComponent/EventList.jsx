import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import EconomicEvent from "./EconomicEvent";

const EVENTS = [
  {
    id: "1",
    time: "8:30 AM",
    currency: "USD",
    title: "CPI Inflation (YoY)",
    impact: "High",
    actual: "3.4%",
    forecast: "3.3%",
  },
  {
    id: "2",
    time: "10:30 AM",
    currency: "USD",
    title: "Core CPI (YoY)",
    impact: "High",
    actual: "3.9%",
    forecast: "3.5%",
  },
  {
    id: "3",
    time: "10:30 AM",
    currency: "USD",
    title: "Retail Sales (MoM)",
    impact: "Medium",
    actual: "0.2%",
    forecast: "0.2%",
  },
  {
    id: "4",
    time: "2:00 PM",
    currency: "USD",
    title: "Fed Interest Rate Decision",
    impact: "High",
    actual: "5.50%",
    forecast: "5.50%",
  },
];

export default function EventList() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

      <Text style={styles.sectionTitle}>
        WEDNESDAY, MAY 15
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {EVENTS.map((event) => (
          <EconomicEvent
            key={event.id}
            time={event.time}
            currency={event.currency}
            title={event.title}
            impact={event.impact}
            actual={event.actual}
            forecast={event.forecast}
            onPress={() =>
              navigation.navigate("EventDetail", {
                event,
              })
            }
          />
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  sectionTitle: {
    color: "#737C86",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 30,
  },
});
