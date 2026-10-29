import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, BackHandler, PanResponder } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLayout } from '../components/ui';
import { Frame } from './Frame';
import OverviewScreen from '../features/home/screens/OverviewScreen';
import MarketsScreen from '../features/markets/screens/MarketsScreen';
import JournalScreen from '../features/journal/screens/JournalScreen';
import MentorScreen from '../features/chat/screens/MentorScreen';
import StrategyScreen from '../features/strategy/screens/StrategyScreen';
import EventsMapScreen from '../features/events/screens/EventsMapScreen';
import AlertsScreen from '../features/alerts/screens/AlertsScreen';
import AnalyticsScreen from '../features/journal/screens/AnalyticsScreen';
import NewsScreen from '../features/news/screens/NewsScreen';
import CalendarScreen from '../features/calendar/screens/CalendarScreen';
import CorrelationScreen from '../features/markets/screens/CorrelationScreen';
import SettingsScreen from '../features/more/screens/SettingsScreen';
import MoreScreen from '../features/more/screens/MoreScreen';

const SCREENS = {
  overview: OverviewScreen, markets: MarketsScreen, journal: JournalScreen, mentor: MentorScreen,
  strategy: StrategyScreen, map: EventsMapScreen, news: NewsScreen, alerts: AlertsScreen, analytics: AnalyticsScreen,
  calendar: CalendarScreen, settings: SettingsScreen, correlation: CorrelationScreen, more: MoreScreen,
};

export default function Shell({ route, navigation }) {
  const [tab, setTab] = useState(route.params?.tab || 'overview');
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const history = useRef([]); // tabs visited before the current one

  const select = useCallback((next) => {
    if (!next || next === tabRef.current) return;
    history.current.push(tabRef.current);
    setTab(next);
  }, []);

  useEffect(() => { if (route.params?.tab) select(route.params.tab); }, [route.params?.tab, route.params?.ts]);

  // Steps back to the tab you came from (Alerts -> More). Returns false when there is nowhere to go.
  const goBackTab = useCallback(() => {
    if (history.current.length === 0) return false;
    setTab(history.current.pop());
    return true;
  }, []);

  // Android Back button, only while this screen is the one in front.
  useFocusEffect(useCallback(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', goBackTab);
    return () => sub.remove();
  }, [goBackTab]));

  // Back gesture from other routes that would remove this screen (keeps tab history first).
  // Only plain "go back" actions are intercepted. A reset (such as Log out) must be allowed through.
  useEffect(() => navigation.addListener('beforeRemove', (e) => {
    const type = e.data && e.data.action && e.data.action.type;
    if (type !== 'GO_BACK' && type !== 'POP') return;
    if (history.current.length === 0) return;
    e.preventDefault();
    goBackTab();
  }), [navigation, goBackTab]);

  // Swipe right from the left edge of the screen goes back one tab.
  // Disabled on the map tab, where dragging and pinching near the edge must stay on the map.
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponderCapture: (e, g) => tabRef.current !== 'map' && g.x0 < 28 && g.dx > 14 && Math.abs(g.dy) < g.dx * 0.6 && history.current.length > 0,
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (e, g) => { if (g.dx > 70) goBackTab(); },
  })).current;

  const { wide } = useLayout();
  const key = wide && tab === 'more' ? 'overview' : tab;
  const Screen = SCREENS[key] || OverviewScreen;
  return (
    <Frame active={key} onSelect={select}>
      <View style={{ flex: 1 }} {...pan.panHandlers}>
        <Screen go={select} params={route.params || {}} />
      </View>
    </Frame>
  );
}