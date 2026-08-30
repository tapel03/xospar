import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Screens
import DashboardScreen from "../screens/DashboardScreen/DashboardScreen";
import MarketsScreen from "../screens/MarketsScreen/MarketsScreen";
import AlertsScreen from "../screens/AlertsScreen/AlertsScreen";
import CalendarScreen from "../screens/CalendarScreen/CalendarScreen";
import MoreScreen from "../screens/MoreScreen/MoreScreen";


const Tab = createBottomTabNavigator();


export default function BottomTabNavigator() {

  return (

    <Tab.Navigator

      screenOptions={{

        // Hide the normal top header
        headerShown: false,

        // Bottom navigation bar
        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },

        // Selected button
        tabBarActiveTintColor: "#000000",

        // Unselected buttons
        tabBarInactiveTintColor: "#888888",

        // Button text
        tabBarLabelStyle: {
          fontSize: 11,
        },

      }}

    >

      {/* DASHBOARD */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />


      {/* MARKETS */}
      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
      />


      {/* ALERTS */}
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
      />


      {/* CALENDAR */}
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
      />


      {/* MORE */}
      <Tab.Screen
        name="More"
        component={MoreScreen}
      />

    </Tab.Navigator>

  );
}

