import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen/HomeScreen";
import NewsScreen from "../screens/NewsScreen/NewsScreen";

const Stack = createNativeStackNavigator();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="News"
        component={NewsScreen}
        options={{
          headerShown: true,
          headerTitle: "News",
          headerStyle: { backgroundColor: "#101820" },
          headerTintColor: "#FFFFFF",
        }}
      />
    </Stack.Navigator>
  );
}
