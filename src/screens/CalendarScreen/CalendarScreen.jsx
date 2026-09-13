import { useState } from "react";
import { View, StyleSheet } from "react-native";

import CalendarHeader from "./CalendarComponent/CalendarHeader";
import DateSelector from "./CalendarComponent/DateSelector";
import EventList from "./CalendarComponent/EventList";

export default function CalendarScreen() {
  // Single source of truth for "which day is selected" - shared between
  // the week strip and the month picker, and used to label the event list.
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View style={styles.container}>
      <CalendarHeader />
      <DateSelector
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <EventList selectedDate={selectedDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },
});