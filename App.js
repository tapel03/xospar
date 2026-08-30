
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Existing Splash Screen
import SplashScreen from "./src/screens/SplashScreen/SplashScreen";

// Bottom Navigation
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";


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

        {/* Splash Screen */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        {/* Main App */}
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );
}

