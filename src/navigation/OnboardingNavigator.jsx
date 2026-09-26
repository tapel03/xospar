import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingQuestionsScreen from "../screens/OnboardingScreen/OnboardingQuestionsScreen";
import CompletionScreen from "../screens/OnboardingScreen/CompletionScreen";

const Stack = createNativeStackNavigator();

// "Get Started" now lives pre-auth (AuthWelcomeScreen), so this stack
// no longer needs its own separate welcome step - it opens straight
// into the goal-setting questions once the user is verified.
export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingQuestions"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="OnboardingQuestions"
        component={OnboardingQuestionsScreen}
      />
      <Stack.Screen name="Completion" component={CompletionScreen} />
    </Stack.Navigator>
  );
}