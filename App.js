
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet } from "react-native";
// Existing Splash Screen
import SplashScreen from "./src/screens/SplashScreen/SplashScreen";

// Bottom Navigation
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";


const Stack = createNativeStackNavigator();


export default function App() {

  return (

    
    <NavigationContainer style={styles.container}>

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



const styles = StyleSheet.create({

  container: 
  {
    width: 720,
    height: 1600,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});