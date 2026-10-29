import React from 'react';
import { Pressable, Text } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Icon } from '../../../components/ui';

export const MARKETS = ['Forex', 'Commodities', 'Indices', 'Stocks', 'Crypto'];
export const STYLES = [
  { key: 'Scalping', note: '' },
  { key: 'Day trading', note: '' },
  { key: 'Swing trading', note: '' },
  { key: 'Position trading', note: '' },
];
export const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
export const STRUGGLES = ['Discipline', 'Overtrading', 'Cutting losses', 'Entries', 'Risk sizing', 'Consistency'];

const ICONS = {
  Forex: 'dollar-sign', Commodities: 'droplet', Indices: 'bar-chart-2', Stocks: 'trending-up', Crypto: 'cpu',
  Scalping: 'zap', 'Day trading': 'sun', 'Swing trading': 'repeat', 'Position trading': 'anchor',
  Beginner: 'compass', Intermediate: 'target', Advanced: 'award',
  Discipline: 'shield', Overtrading: 'refresh-cw', 'Cutting losses': 'scissors', Entries: 'log-in', 'Risk sizing': 'percent', Consistency: 'bar-chart',
};

/** An icon and a label. Selected = the whole card turns green. No checkbox, no description, no artwork. */
export default function ChoiceTile({ k, label, on, onPress, height = 124, mini, style }) {
  const fg = on ? c.black : c.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        { flex: 1, height: mini ? 64 : height, borderRadius: 18, borderWidth: 1.5, borderColor: on ? c.green : c.border, backgroundColor: on ? c.green : c.elevated, alignItems: 'center', justifyContent: 'center', gap: 8 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Icon name={ICONS[k] || 'circle'} size={mini ? 18 : 26} color={fg} />
      <Text style={{ color: fg, fontSize: mini ? 12 : 14, fontWeight: '700' }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

/** Kept so old imports do not break. The artwork was removed. */
export function MentorArt() {
  return null;
}