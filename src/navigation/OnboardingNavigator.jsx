import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/OnboardingScreen/WelcomeScreen";
import OnboardingQuestionsScreen from "../screens/OnboardingScreen/OnboardingQuestionsScreen";
import CompletionScreen from "../screens/OnboardingScreen/CompletionScreen";

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="OnboardingQuestions"
        component={OnboardingQuestionsScreen}
      />
      <Stack.Screen name="Completion" component={CompletionScreen} />
    </Stack.Navigator>
  );
}