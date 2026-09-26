import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthWelcomeScreen from "../screens/AuthScreen/AuthWelcomeScreen";
import LoginScreen from "../screens/AuthScreen/LoginScreen";
import SignUpScreen from "../screens/AuthScreen/SignUpScreen";
import ForgotPasswordScreen from "../screens/AuthScreen/ForgotPasswordScreen";
import VerifyEmailScreen from "../screens/AuthScreen/VerifyEmailScreen";
import CreateNewPasswordScreen from "../screens/AuthScreen/CreateNewPasswordScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="AuthWelcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AuthWelcome" component={AuthWelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPasswordScreen}
      />
    </Stack.Navigator>
  );
}