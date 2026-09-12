import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MarketsScreen from "../screens/MarketsScreen/MarketsScreen";
import AIAnalysisScreen from "../screens/MarketsScreen/MarketsComponents/AI/AIAnalysisScreen";
import MarketCategoryDetailScreen from "../screens/MarketsScreen/MarketCategoryDetailScreen";

const Stack = createNativeStackNavigator();

export default function MarketsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Markets page */}
      <Stack.Screen
        name="MarketsMain"
        component={MarketsScreen}
      />

      {/* Existing AI chat screen */}
      <Stack.Screen
        name="AIAnalysis"
        component={AIAnalysisScreen}
      />

      {/* NEW:
          This is the page opened when the user
          clicks Crypto, Forex, Indices, or Stocks. */}
      <Stack.Screen
        name="MarketCategoryDetail"
        component={MarketCategoryDetailScreen}
      />
    </Stack.Navigator>
  );
}
