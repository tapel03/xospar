import { View, StyleSheet } from "react-native";

import CalendarHeader from "./CalendarComponent/CalendarHeader";
import DateSelector from "./CalendarComponent/DateSelector";
import EventList from "./CalendarComponent/EventList";

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <CalendarHeader />
      <DateSelector />
      <EventList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },
});