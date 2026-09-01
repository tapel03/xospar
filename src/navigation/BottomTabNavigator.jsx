import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen/DashboardScreen";
import MarketsScreen from "../screens/MarketsScreen/MarketsScreen";
import AlertsScreen from "../screens/AlertsScreen/AlertsScreen";
import CalendarScreen from "../screens/CalendarScreen/CalendarScreen";
import MoreScreen from "../screens/MoreScreen/MoreScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
  headerShown: false,

  // Bottom navigation
  tabBarStyle: {
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "#000000",
    borderTopColor: "#000000",
  },

  // Selected tab
  tabBarActiveTintColor: "#FFFFFF",

  // Unselected tabs
  tabBarInactiveTintColor: "#AAAAAA",

  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "500",
  },

  tabBarIcon: ({ focused, color }) => {
    let iconName;

    if (route.name === "Dashboard") {
      iconName = focused ? "home" : "home-outline";
    } else if (route.name === "Markets") {
      iconName = focused ? "bar-chart" : "bar-chart-outline";
    } else if (route.name === "Alerts") {
      iconName = focused ? "notifications" : "notifications-outline";
    } else if (route.name === "Calendar") {
      iconName = focused ? "calendar" : "calendar-outline";
    } else if (route.name === "More") {
      iconName = focused ? "menu" : "menu-outline";
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
        name="Dashboard"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
      />

      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
      />

      <Tab.Screen
        name="More"
        component={MoreScreen}
      />
    </Tab.Navigator>
  );
}