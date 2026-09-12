import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeNavigator from "./HomeNavigator";
import MarketsNavigator from "./MarketsNavigator";
import AlertsScreen from "../screens/AlertsScreen/AlertsScreen";
import CalendarNavigator from "./CalendarNavigator";
import MoreNavigator from "./MoreNavigator";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarStyle: {
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#000000",
          borderTopColor: "#000000",
        },

        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#AAAAAA",

        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused
              ? "home"
              : "home-outline";
          }

          if (route.name === "Markets") {
            iconName = focused
              ? "bar-chart"
              : "bar-chart-outline";
          }

          if (route.name === "Alerts") {
            iconName = focused
              ? "notifications"
              : "notifications-outline";
          }

          if (route.name === "Calendar") {
            iconName = focused
              ? "calendar"
              : "calendar-outline";
          }

          if (route.name === "More") {
            iconName = focused
              ? "menu"
              : "menu-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={18}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
      />

      <Tab.Screen
        name="Markets"
        component={MarketsNavigator}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarNavigator}
      />

      <Tab.Screen
        name="More"
        component={MoreNavigator}
      />
    </Tab.Navigator>
  );
}