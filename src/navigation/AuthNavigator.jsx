import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/AuthScreen/LoginScreen";
import SignUpScreen from "../screens/AuthScreen/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}