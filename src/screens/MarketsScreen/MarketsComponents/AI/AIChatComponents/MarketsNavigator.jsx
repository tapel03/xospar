import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MarketsScreen from "../screens/MarketsScreen/MarketsScreen";
import AIChatScreen from "../screens/MarketsScreen/MarketsComponents/AI/AIChatScreen";

const Stack = createNativeStackNavigator();

export default function MarketsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MarketsMain"
        component={MarketsScreen}
      />

      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
      />
    </Stack.Navigator>
  );
}