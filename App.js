
// Import NavigationContainer
import { NavigationContainer } from "@react-navigation/native";

// Import Stack Navigator
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import the two screens
import SplashScreen from "./src/screens/SplashScreen/SplashScreen";
import HomeScreen from "./src/screens/HomeScreen/HomeScreen";

// Create the Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >

        {/* First screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Second screen */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}