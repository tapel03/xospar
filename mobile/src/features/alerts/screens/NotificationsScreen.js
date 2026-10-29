import React, { useMemo, useRef, useState } from 'react';
import { View, Animated, PanResponder } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Icon, Empty, Button } from '../../../components/ui';
import { useStore } from '../../../app/store';

const AMBER = '#F5B54A';
// Colours are read when used, so they follow the light/dark theme.
const CAT = {
  get Risk() { return { color: c.red, label: 'Risk' }; },
  get Market() { return { color: AMBER, label: 'Market' }; },
  get Events() { return { color: c.lavender, label: 'Events' }; },
};
// Title, category and quick action for each notification.
const META = {
  x1: { cat: 'Events', title: 'High-impact event soon', cta: { label: 'See today’s events', go: ['Main', { tab: 'calendar' }] } },
  x2: { cat: 'Market', title: 'Price left its usual range', cta: { label: 'Open chart', go: ['AssetDetail', { sym: 'EUR/USD' }] } },
  x3: { cat: 'Risk', title: 'Trade conflicts with your edge', cta: { label: 'Review strategy', go: ['Main', { tab: 'strategy' }] } },
  x4: { cat: 'Risk', title: 'Daily risk limit reached', cta: { label: 'Risk settings', go: ['Main', { tab: 'settings' }] } },
  x5: { cat: 'Market', title: 'Oil volatility is rising', cta: { label: 'Open WTI chart', go: ['AssetDetail', { sym: 'WTI' }] } },
  x6: { cat: 'Risk', title: 'USD exposure building up', cta: { label: 'Open analytics', go: ['Main', { tab: 'analytics' }] } },
  x7: { cat: 'Risk', title: 'Three off-edge trades in a row', cta: { label: 'Open journal', go: ['Main', { tab: 'journal' }] } },
};
const groupOf = (n) => (n.time.includes(':') ? 'Today' : n.time === 'Yesterday' ? 'Yesterday' : 'Earlier');
const tint = (hex, a = '26') => `${hex}${a}`;

/** Swipe a card left or right to dismiss it. A strip shows behind the card while dragging. */
function SwipeAway({ children, onDismiss }) {
  const x = useRef(new Animated.Value(0)).current;
  const width = useRef(320);
  const done = useRef(onDismiss);
  done.current = onDismiss;

  const back = () => Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
  const pan = useRef(null);
  if (!pan.current) {
    pan.current = PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(g.dx),
      onPanResponderRelease: (_, g) => {
        const far = Math.abs(g.dx) > width.current * 0.35;
        const flick = Math.abs(g.vx) > 0.8 && Math.abs(g.dx) > 30;
        if (far || flick) {
          Animated.timing(x, { toValue: g.dx < 0 ? -width.current : width.current, duration: 160, useNativeDriver: true }).start(() => done.current());
        } else back();
      },
      onPanResponderTerminate: back,
    });
  }

  return (
    <View
      onLayout={(e) => { width.current = e.nativeEvent.layout.width; }}
      style={{ marginBottom: 10, borderRadius: 18, overflow: 'hidden' }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: c.elevated2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22 }}>
        <Row gap={6}><Icon name="x" size={16} color={c.muted} /><T v="small" bold muted>Dismiss</T></Row>
        <Row gap={6}><T v="small" bold muted>Dismiss</T><Icon name="x" size={16} color={c.muted} /></Row>
      </View>
      <Animated.View style={{ transform: [{ translateX: x }] }} {...pan.current.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

function Item({ n, onDismiss, onGo }) {
  const [open, setOpen] = useState(false);
  const meta = META[n.id] || { cat: 'Market', title: n.text, cta: null };
  const cat = CAT[meta.cat];

  return (
    <SwipeAway onDismiss={onDismiss}>
      <Card pad={14} onPress={() => setOpen(!open)} style={{ borderRadius: 18 }}>
        <Row gap={12} style={{ alignItems: 'flex-start' }}>
          <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: tint(cat.color), alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={n.icon} size={20} color={cat.color} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Row style={{ justifyContent: 'space-between' }} gap={8}>
              <Row gap={6} style={{ flex: 1 }}>
                <T v="caption" style={{ color: cat.color, fontWeight: '700', letterSpacing: 0.4 }}>{cat.label.toUpperCase()}</T>
                {n.sev === 'High' ? <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: tint(c.red, '2E') }}><T v="caption" style={{ color: c.red, fontWeight: '700' }}>High</T></View> : null}
              </Row>
              <T v="caption" muted>{n.time}</T>
            </Row>
            <T v="h3">{meta.title}</T>
            <T v="small" muted>{n.text}</T>
          </View>
        </Row>

        {open ? (
          <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, gap: 10 }}>
            <Row style={{ flexWrap: 'wrap' }} gap={20}>
              <View><T v="caption" muted>Category</T><T v="small">{cat.label}</T></View>
              <View><T v="caption" muted>Priority</T><T v="small">{n.sev}</T></View>
              <View><T v="caption" muted>Received</T><T v="small">{n.time}</T></View>
            </Row>
            <Row style={{ flexWrap: 'wrap' }}>
              {meta.cta ? <Button small icon="arrow-right" label={meta.cta.label} onPress={() => onGo(meta.cta.go)} /> : null}
              <Button small variant="ghost" icon="x" label="Dismiss" onPress={onDismiss} />
            </Row>
          </View>
        ) : (
          <T v="caption" muted style={{ marginTop: 10, marginLeft: 58 }}>Tap for details · swipe to dismiss</T>
        )}
      </Card>
    </SwipeAway>
  );
}

export default function NotificationsScreen({ navigation }) {
  const { notifications, dismissNotification } = useStore();

  const groups = useMemo(() => {
    const g = {};
    notifications.forEach((n) => { (g[groupOf(n)] = g[groupOf(n)] || []).push(n); });
    return ['Today', 'Yesterday', 'Earlier'].filter((k) => g[k]).map((k) => ({ title: k, items: g[k] }));
  }, [notifications]);

  const go = ([screen, params]) => navigation.navigate(screen, { ...params, ts: Date.now() });

  return (
    <Frame active="overview">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} title="Notifications" />

        {groups.length === 0 ? <Empty icon="bell" title="You are all caught up" body="You have dismissed all your notifications." /> : groups.map((g) => (
          <View key={g.title}>
            <T v="label" muted style={{ marginBottom: 8, marginTop: 4 }}>{g.title}</T>
            {g.items.map((n) => (
              <Item key={n.id} n={n} onDismiss={() => dismissNotification(n.id)} onGo={go} />
            ))}
          </View>
        ))}
      </Screen>
    </Frame>
  );
}