import { View, StyleSheet } from "react-native";
import DateSelector from './CalendarComponent/DateSelector';
import EventList from './CalendarComponent/EventList';

export default function AlertsScreen() {

  return (

    <View>

      <DateSelector />
      <EventList />

    </View>

  );

}


