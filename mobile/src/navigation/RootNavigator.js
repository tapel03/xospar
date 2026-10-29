import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors as c, useMode } from '../theme/tokens';
import Shell from './Shell';
import SplashScreen from '../features/splash/SplashScreen';
import OnboardingScreen from '../features/onboarding/screens/OnboardingScreen';
import AssetDetailScreen from '../features/markets/screens/AssetDetailScreen';
import TradeDetailScreen from '../features/journal/screens/TradeDetailScreen';
import AddTradeScreen from '../features/journal/screens/AddTradeScreen';
import TradeCheckScreen from '../features/strategy/screens/TradeCheckScreen';
import { EdgeBuilderScreen } from '../features/strategy/screens/StrategyScreen';
import { ReviewScreen } from '../features/more/screens/AccountScreens';
import NotificationsScreen from '../features/alerts/screens/NotificationsScreen';
import EditProfileScreen from '../features/more/screens/EditProfileScreen';
import ManageAccountsScreen from '../features/more/screens/ManageAccountsScreen';
import LegalScreen from '../features/more/screens/LegalScreen';

const Stack = createNativeStackNavigator();

/** Makes a screen redraw when the light/dark theme changes, without losing where the user is. */
const themedScreen = (Comp) => function ThemedScreen(props) {
  useMode();
  return <Comp {...props} />;
};
const SplashT = themedScreen(SplashScreen);
const OnboardingT = themedScreen(OnboardingScreen);
const ShellT = themedScreen(Shell);
const AssetDetailT = themedScreen(AssetDetailScreen);
const TradeDetailT = themedScreen(TradeDetailScreen);
const AddTradeT = themedScreen(AddTradeScreen);
const TradeCheckT = themedScreen(TradeCheckScreen);
const EdgeBuilderT = themedScreen(EdgeBuilderScreen);
const NotificationsT = themedScreen(NotificationsScreen);
const ReviewT = themedScreen(ReviewScreen);
const EditProfileT = themedScreen(EditProfileScreen);
const ManageAccountsT = themedScreen(ManageAccountsScreen);
const LegalT = themedScreen(LegalScreen);

export default function RootNavigator() {
  const mode = useMode();
  const theme = { ...DefaultTheme, dark: mode === 'dark', colors: { ...DefaultTheme.colors, background: c.bg, card: c.bgAlt, border: c.border, text: c.text, primary: c.blue } };
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="Splash" component={SplashT} />
        <Stack.Screen name="Onboarding" component={OnboardingT} />
        <Stack.Screen name="Main" component={ShellT} />
        <Stack.Screen name="AssetDetail" component={AssetDetailT} />
        <Stack.Screen name="TradeDetail" component={TradeDetailT} />
        <Stack.Screen name="AddTrade" component={AddTradeT} />
        <Stack.Screen name="TradeCheck" component={TradeCheckT} />
        <Stack.Screen name="EdgeBuilder" component={EdgeBuilderT} />
        <Stack.Screen name="Notifications" component={NotificationsT} />
        <Stack.Screen name="Review" component={ReviewT} />
        <Stack.Screen name="EditProfile" component={EditProfileT} />
        <Stack.Screen name="ManageAccounts" component={ManageAccountsT} />
        <Stack.Screen name="Legal" component={LegalT} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}