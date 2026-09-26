import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MoreScreen from "../screens/MoreScreen/MoreScreen";

import Profile from "../screens/MoreScreen/MoreComponents/Settings/Profile";
import Preferences from "../screens/MoreScreen/MoreComponents/Settings/Preferences";
import Notifications from "../screens/MoreScreen/MoreComponents/Settings/Notifications";

// NEW MT5 SCREENS
import ConnectMTScreen from "../screens/MoreScreen/MoreComponents/MT5/ConnectMTScreen";
import ConnectedAccountsScreen from "../screens/MoreScreen/MoreComponents/MT5/ConnectedAccountsScreen";
import TradingPortfolioScreen from "../screens/MoreScreen/MoreComponents/MT5/TradingPortfolioScreen";
import OpenPositionsScreen from "../screens/MoreScreen/MoreComponents/MT5/OpenPositionsScreen";

// NEW: Tools
import QuickToolScreen from "../screens/HomeScreen/HomeComponets/QuickToolScreen";

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerShown: true,
  headerStyle: { backgroundColor: "#101820" },
  headerTintColor: "#FFFFFF",
};

export default function MoreNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="MoreMain" component={MoreScreen} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ ...headerOptions, headerTitle: "Profile" }}
      />

      <Stack.Screen
        name="Preferences"
        component={Preferences}
        options={{ ...headerOptions, headerTitle: "Preferences" }}
      />

      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ ...headerOptions, headerTitle: "Notifications" }}
      />

      {/* Tools */}
      <Stack.Screen
        name="QuickTool"
        component={QuickToolScreen}
      />

      {/* MT5 / MT4 */}
      <Stack.Screen
        name="ConnectMT"
        component={ConnectMTScreen}
        options={{ ...headerOptions, headerTitle: "Connect MT4 / MT5" }}
      />
      <Stack.Screen
        name="ConnectedAccounts"
        component={ConnectedAccountsScreen}
        options={{ ...headerOptions, headerTitle: "Connected Accounts" }}
      />
      <Stack.Screen
        name="TradingPortfolio"
        component={TradingPortfolioScreen}
        options={{ ...headerOptions, headerTitle: "Trading Portfolio" }}
      />
      <Stack.Screen
        name="OpenPositions"
        component={OpenPositionsScreen}
        options={{ ...headerOptions, headerTitle: "Open Positions" }}
      />

    </Stack.Navigator>
  );
}