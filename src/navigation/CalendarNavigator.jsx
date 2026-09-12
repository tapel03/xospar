import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CalendarScreen from "../screens/CalendarScreen/CalendarScreen";
import EventDetailScreen from "../screens/CalendarScreen/CalendarComponent/EventDetailScreen";

const Stack = createNativeStackNavigator();

export default function CalendarNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarMain" component={CalendarScreen} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          headerShown: true,
          headerTitle: "Event Details",
          headerStyle: { backgroundColor: "#101820" },
          headerTintColor: "#FFFFFF",
        }}
      />
    </Stack.Navigator>
  );
}
