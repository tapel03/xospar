import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";

import SplashScreen from "../screens/SplashScreen/SplashScreen";
import AuthNavigator from "./AuthNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import BottomTabNavigator from "./BottomTabNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoading, isAuthenticated, hasCompletedOnboarding } = useAuth();

  // APP LAUNCH -> Splash / Loading, while the saved session (if any)
  // is being read from disk.
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Authentication -> Login / Sign Up
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasCompletedOnboarding ? (
          // Welcome / Introduction -> Optional Questions -> Completion
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Existing main app
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}