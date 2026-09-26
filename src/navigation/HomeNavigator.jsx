import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen/HomeScreen";
import NewsScreen from "../screens/NewsScreen/NewsScreen";
import GlobalEventsScreen from "../screens/GlobalEventsScreen/GlobalEventsScreen";
import MarketMovingScreen from "../screens/GlobalEventsScreen/MarketMovingScreen";
import QuickToolScreen from "../screens/HomeScreen/HomeComponets/QuickToolScreen";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import SearchScreen from "../screens/SearchScreen/SearchScreen";

const Stack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Home screen */}
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
      />

      {/* News screen */}
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{
          headerShown: true,
          headerTitle: "News",
          headerStyle: {
            backgroundColor: "#101820",
          },
          headerTintColor: "#FFFFFF",
        }}
      />

      {/* Opened by tapping the Global Market Mood card on Home.
          Live Map / List / Insights tabs of world events. */}
      <Stack.Screen
        name="GlobalEvents"
        component={GlobalEventsScreen}
      />

      {/* Opened by tapping an event inside GlobalEvents -
          the "Why is the Market Moving?" AI analysis page. */}
      <Stack.Screen
        name="MarketMoving"
        component={MarketMovingScreen}
      />

      {/* Opened by tapping a Quick Tools tile on Home (Position Size,
          Risk/Reward, Pip Calculator, Lot Size). */}
      <Stack.Screen
        name="QuickTool"
        component={QuickToolScreen}
      />

      {/* Opened by the floating AI chat button on Home. */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
      />

      {/* Opened by the search icon in HomeHeader. SearchScreen already
          existed in the codebase but wasn't registered in any
          navigator, so the search icon had nowhere to go and did
          nothing when tapped - same issue Chat and QuickTool had
          before they were added here. */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
      />
    </Stack.Navigator>
  );
}