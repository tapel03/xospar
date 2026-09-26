import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";

import CalendarHeader from "./CalendarComponent/CalendarHeader";
import DateSelector from "./CalendarComponent/DateSelector";
import CalendarFilters from "./CalendarComponent/CalendarFilters";
import EventList, { EVENTS } from "./CalendarComponent/EventList";
import { colors } from "../../theme/colors";

// Canonical display order for impact tiers - narrowed down to whichever
// tiers actually show up in the event data (see impactOptions below), so
// the filter never offers a tier with zero matching events.
const IMPACT_DISPLAY_ORDER = ["High", "Medium", "Low"];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter state lives here (not in CalendarFilters or EventList) so both
  // components stay in sync: CalendarFilters reads/writes it, EventList
  // reads it to decide what to render. Empty array = that filter isn't
  // applied - the two filters combine with AND when both are set.
  const [selectedImpacts, setSelectedImpacts] = useState([]);
  const [selectedCurrencies, setSelectedCurrencies] = useState([]);

  const impactOptions = useMemo(() => {
    const present = new Set(EVENTS.map((event) => event.impact));
    return IMPACT_DISPLAY_ORDER.filter((impact) => present.has(impact));
  }, []);

  const currencyOptions = useMemo(
    () =>
      Array.from(new Set(EVENTS.map((event) => event.currency))).sort(),
    []
  );

  const handleToggleImpact = (impact) => {
    setSelectedImpacts((current) =>
      current.includes(impact)
        ? current.filter((item) => item !== impact)
        : [...current, impact]
    );
  };

  const handleToggleCurrency = (currency) => {
    setSelectedCurrencies((current) =>
      current.includes(currency)
        ? current.filter((item) => item !== currency)
        : [...current, currency]
    );
  };

  const handleClearFilters = () => {
    setSelectedImpacts([]);
    setSelectedCurrencies([]);
  };

  return (
    <View style={styles.container}>
      <CalendarHeader />

      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <CalendarFilters
        impactOptions={impactOptions}
        selectedImpacts={selectedImpacts}
        onToggleImpact={handleToggleImpact}
        currencyOptions={currencyOptions}
        selectedCurrencies={selectedCurrencies}
        onToggleCurrency={handleToggleCurrency}
        onClearAll={handleClearFilters}
      />

      <EventList
        selectedDate={selectedDate}
        selectedImpacts={selectedImpacts}
        selectedCurrencies={selectedCurrencies}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors[50],
  },
});