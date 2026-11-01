import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors as c, useMode } from '../theme/tokens';
import Shell from './Shell';
import { Frame } from './Frame';
import { useSkeletonGate } from '../hooks/useSkeletonGate';
import { useCandlesReady } from '../features/markets/hooks/useAssetCandles';
import { AssetSkeleton, DetailSkeleton, NotificationsSkeleton } from '../components/ui/Skeletons';
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

/**
 * Same as themedScreen, plus a loading skeleton. The header and bottom bar (Frame) show straight away,
 * the skeleton fills the content, and the real screen replaces it once the app is ready and `ms` has passed.
 * Screens that draw their own Frame are swapped as a whole, so there is never a double header.
 */
const gatedScreen = (Comp, active, skeleton, ms = 350) => function GatedScreen(props) {
  useMode();
  const open = useSkeletonGate(ms);
  return open ? <Comp {...props} /> : <Frame active={active}>{skeleton}</Frame>;
};

/** Asset detail also waits for the chart's candles, so the chart and price appear together. */
function AssetDetailT(props) {
  useMode();
  const sym = props.route.params?.sym || 'EUR/USD';
  const candlesReady = useCandlesReady(sym, '1H');
  const open = useSkeletonGate(450, candlesReady);
  return open ? <AssetDetailScreen {...props} /> : <Frame active="markets"><AssetSkeleton /></Frame>;
}

const SplashT = themedScreen(SplashScreen);
const OnboardingT = themedScreen(OnboardingScreen);
const ShellT = themedScreen(Shell);
const TradeDetailT = gatedScreen(TradeDetailScreen, 'journal', <DetailSkeleton chart />);
const AddTradeT = themedScreen(AddTradeScreen);
const TradeCheckT = gatedScreen(TradeCheckScreen, 'journal', <DetailSkeleton />);
const EdgeBuilderT = gatedScreen(EdgeBuilderScreen, 'strategy', <DetailSkeleton />);
const NotificationsT = gatedScreen(NotificationsScreen, 'overview', <NotificationsSkeleton />);
const ReviewT = gatedScreen(ReviewScreen, 'analytics', <DetailSkeleton />);
const EditProfileT = gatedScreen(EditProfileScreen, 'settings', <DetailSkeleton />);
const ManageAccountsT = gatedScreen(ManageAccountsScreen, 'settings', <DetailSkeleton />);
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