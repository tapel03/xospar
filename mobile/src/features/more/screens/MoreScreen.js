import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Icon } from '../../../components/ui';
import { NAV } from '../../../navigation/Frame';
import { useStore } from '../../../app/store';

const byKey = (k) => NAV.find((n) => n.key === k);

function Item({ icon, label, onPress, first, count }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={count ? `${label}, ${count} waiting` : label}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 16, borderTopWidth: first ? 0 : 1, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}
    >
      <Icon name={icon} size={18} />
      <T v="h3" style={{ flex: 1, fontWeight: '500' }}>{label}</T>
      {count > 0 ? (
        <View style={{ minWidth: 22, height: 22, borderRadius: 11, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>{count}</Text>
        </View>
      ) : null}
      <Icon name="chevron-right" size={16} color={c.muted} />
    </Pressable>
  );
}

/** Mobile "More" page. Related pages sit together: tools, then alerts with notifications, then settings. */
export default function MoreScreen({ go }) {
  const nav = useNavigation();
  const { notifications } = useStore();

  const tools = [
    { icon: byKey('strategy').icon, label: byKey('strategy').label, onPress: () => go('strategy') },
    { icon: byKey('map').icon, label: byKey('map').label, onPress: () => go('map') },
    { icon: byKey('news').icon, label: byKey('news').label, onPress: () => go('news') },
    { icon: byKey('calendar').icon, label: byKey('calendar').label, onPress: () => go('calendar') },
    { icon: 'hash', label: 'Correlation matrix', onPress: () => go('correlation') },
  ];
  const alertsGroup = [
    { icon: byKey('alerts').icon, label: byKey('alerts').label, onPress: () => go('alerts') },
    { icon: 'inbox', label: 'Notifications', onPress: () => nav.navigate('Notifications'), count: notifications.length },
  ];
  const account = [
    { icon: byKey('settings').icon, label: byKey('settings').label, onPress: () => go('settings') },
  ];

  const group = (items) => (
    <Card pad={0}>
      {items.map((it, i) => <Item key={it.label} first={i === 0} icon={it.icon} label={it.label} count={it.count} onPress={it.onPress} />)}
    </Card>
  );

  return (
    <Screen>
      <PageTitle title="More" />
      <View style={{ gap: 16 }}>
        {group(tools)}
        {group(alertsGroup)}
        {group(account)}
      </View>
    </Screen>
  );
}