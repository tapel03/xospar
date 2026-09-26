import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import EconomicEvent from "./EconomicEvent";

const WEEKDAYS = [
  "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY",
  "THURSDAY", "FRIDAY", "SATURDAY",
];

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

function formatHeader(date) {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

// Placeholder events - same list regardless of the day selected for now.
// Swap this out for real per-date data later.
//
// Exported (in addition to the default component export) so
// CalendarScreen can derive the Impact/Currency filter options directly
// from whatever's actually in the data, instead of maintaining a second,
// hand-written list that could drift out of sync with this one.
export const EVENTS = [
  {
    id: "1",
    time: "8:30 AM",
    currency: "USD",
    title: "CPI Inflation (YoY)",
    impact: "High",
    actual: "3.4%",
    forecast: "3.3%",
    previous: "3.2%",
  },

  {
    id: "2",
    time: "10:30 AM",
    currency: "USD",
    title: "Core CPI (YoY)",
    impact: "High",
    actual: "3.9%",
    forecast: "3.5%",
    previous: "3.8%",
  },

  {
    id: "3",
    time: "10:30 AM",
    currency: "USD",
    title: "Retail Sales (MoM)",
    impact: "Medium",
    actual: "0.2%",
    forecast: "0.2%",
    previous: "0.1%",
  },

  {
    id: "4",
    time: "2:00 PM",
    currency: "USD",
    title: "Fed Interest Rate Decision",
    impact: "High",
    actual: "5.50%",
    forecast: "5.50%",
    previous: "5.50%",
  },
];

export default function EventList({
  selectedDate,
  // Empty array = no filter applied for that dimension. Both filters
  // are applied together (AND), so passing both narrows to events that
  // match every active filter; passing neither shows everything.
  selectedImpacts = [],
  selectedCurrencies = [],
}) {
  const navigation = useNavigation();

  const filteredEvents = useMemo(() => {
    return EVENTS.filter((event) => {
      const matchesImpact =
        selectedImpacts.length === 0 ||
        selectedImpacts.includes(event.impact);

      const matchesCurrency =
        selectedCurrencies.length === 0 ||
        selectedCurrencies.includes(event.currency);

      return matchesImpact && matchesCurrency;
    });
  }, [selectedImpacts, selectedCurrencies]);

  const hasActiveFilters =
    selectedImpacts.length > 0 || selectedCurrencies.length > 0;

  return (
    <View style={styles.container}>

      <Text style={styles.sectionTitle}>
        {formatHeader(selectedDate)}
      </Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((event) => (
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

        {filteredEvents.length === 0 && (
          <Text style={styles.emptyText}>
            {hasActiveFilters
              ? "No events match the selected filters."
              : "No events scheduled."}
          </Text>
        )}
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

  emptyText: {
    color: "#59636D",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
});