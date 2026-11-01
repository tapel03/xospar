import React from 'react';
import { Pressable, Text, Platform } from 'react-native';
import { colors as c, getMode } from '../../../theme/tokens';
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

/**
 * Frosted glass look. Translucent fill so the artwork behind shows through; blur is applied on web only.
 * Dark theme: dark glass with white text, selected glass is soft white with dark text.
 * Light theme: white glass with dark text, selected glass is dark with white text.
 * Read when used (not at load), so the colours follow the theme.
 */
const WEB_BLUR = Platform.OS === 'web' ? { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } : null;
const glassFor = (light) => (light
  ? {
    off: { fill: 'rgba(255, 255, 255, 0.66)', border: 'rgba(14, 18, 17, 0.22)', text: '#0E1211' },
    on: { fill: 'rgba(14, 18, 17, 0.90)', border: '#0E1211', text: '#FFFFFF' },
  }
  : {
    off: { fill: 'rgba(20, 20, 24, 0.38)', border: 'rgba(255, 255, 255, 0.35)', text: '#FFFFFF' },
    on: { fill: 'rgba(236, 240, 238, 0.86)', border: 'rgba(255, 255, 255, 0.95)', text: '#0E1211' },
  });

/**
 * An icon and a label. Normal tiles turn green when selected. No checkbox, no description.
 * glass: translucent frosted style so a background image stays visible.
 */
export default function ChoiceTile({ k, label, on, onPress, height = 124, mini, glass, style }) {
  const g = glassFor(getMode() === 'light')[on ? 'on' : 'off'];
  const fg = glass ? g.text : on ? c.black : c.text;
  const base = glass
    ? [{ backgroundColor: g.fill, borderColor: g.border }, WEB_BLUR]
    : [{ borderColor: on ? c.green : c.border, backgroundColor: on ? c.green : c.elevated }];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        { flex: 1, height: mini ? 64 : height, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 8 },
        ...base,
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