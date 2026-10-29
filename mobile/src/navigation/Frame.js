import React, { useMemo, useRef, useState } from 'react';
import { View, Pressable, Text, TextInput, KeyboardAvoidingView } from 'react-native';
import Svg, { Line as SvgLine, Rect as SvgRect } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors as c, themed } from '../theme/tokens';
import { T, Icon, Mark, LogoText, Row, Sheet, useLayout, useKeyboard, s as ui } from '../components/ui';
import { assets, mapEvents, fmtPrice } from '../mocks/mock';
import { useStore } from '../app/store';

/** Two forex candles side by side: one solid, one hollow. Used as the Markets icon. */
function CandleIcon({ size = 18, color = c.text }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgLine x1={7} y1={3} x2={7} y2={21} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <SvgRect x={4} y={8} width={6} height={8} rx={1.2} fill={color} stroke={color} strokeWidth={1.5} />
      <SvgLine x1={17} y1={2} x2={17} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <SvgRect x={14} y={5} width={6} height={9} rx={1.2} fill="none" stroke={color} strokeWidth={2} />
    </Svg>
  );
}

/** Feather icon, except 'candles' which is the custom two-candle Markets icon. */
const NavIcon = ({ name, size = 18, color = c.text }) => (name === 'candles' ? <CandleIcon size={size + 2} color={color} /> : <Icon name={name} size={size} color={color} />);

export const NAV = [
  { key: 'overview', label: 'Overview', icon: 'grid' },
  { key: 'markets', label: 'Markets', icon: 'candles' },
  { key: 'journal', label: 'Journal', icon: 'book-open' },
  { key: 'mentor', label: 'AI Mentor', icon: 'message-square' },
  { key: 'strategy', label: 'Strategy / Edge', icon: 'layers' },
  { key: 'map', label: 'Events Map', icon: 'map' },
  { key: 'news', label: 'News', icon: 'file-text' },
  { key: 'alerts', label: 'Alerts', icon: 'bell' },
  { key: 'analytics', label: 'Analytics', icon: 'pie-chart' },
  { key: 'calendar', label: 'Calendar', icon: 'calendar' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
];
const MOBILE = [
  { key: 'overview', label: 'Home', icon: 'grid' },
  { key: 'markets', label: 'Markets', icon: 'candles' },
  { key: 'journal', label: 'Journal', icon: 'book-open' },
  { key: 'mentor', label: 'AI', icon: 'message-square' },
  { key: 'more', label: 'More', icon: 'menu' },
];
function Sidebar({ active, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <View style={[st.side, collapsed && { width: 72 }]}>
      <Row style={{ paddingHorizontal: 18, height: 64 }} gap={10}>
        <Mark />
        {!collapsed ? <LogoText height={22} width={110} /> : null}
      </Row>
      {NAV.map((n) => {
        const on = active === n.key || (n.key === 'analytics' && active === 'correlation');
        return (
          <Pressable key={n.key} onPress={() => onSelect(n.key)} accessibilityRole="link" accessibilityState={{ selected: on }}
            style={({ pressed }) => [st.sideItem, on && st.sideOn, pressed && { opacity: 0.7 }, collapsed && { justifyContent: 'center', paddingHorizontal: 0 }]}>
            <NavIcon name={n.icon} size={18} color={on ? c.text : c.muted} />
            {!collapsed ? <Text style={{ color: on ? c.text : c.muted, fontWeight: on ? '700' : '500', fontSize: 14 }}>{n.label}</Text> : null}
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      <Pressable onPress={() => setCollapsed(!collapsed)} style={[st.sideItem, collapsed && { justifyContent: 'center', paddingHorizontal: 0 }]} accessibilityLabel="Toggle sidebar">
        <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} color={c.muted} />
        {!collapsed ? <T v="small" muted>Collapse</T> : null}
      </Pressable>
    </View>
  );
}

const norm = (x) => String(x).toLowerCase().replace(/[\/\s\-_.]/g, '');

/** Search across assets, your trades, map events and app pages. */
function SearchSheet({ visible, onClose, onSelect }) {
  const nav = useNavigation();
  const { trades } = useStore();
  const [q, setQ] = useState('');
  const query = norm(q);

  const go = (fn) => { setQ(''); onClose(); setTimeout(fn, 200); };

  const groups = useMemo(() => {
    const pages = NAV.map((n) => ({ key: `p-${n.key}`, icon: n.icon, title: n.label, sub: 'Page', fn: () => onSelect(n.key) }));
    if (!query) return [{ title: 'Pages', items: pages }];
    const hit = (...parts) => norm(parts.join(' ')).includes(query);
    const out = [
      {
        title: 'Markets',
        items: assets.filter((a) => hit(a.sym, a.name, a.cat)).slice(0, 6).map((a) => ({
          key: `a-${a.sym}`, icon: 'candles', title: a.sym.replace('/', ''), sub: `${a.name} · ${a.cat}`, right: fmtPrice(a.sym, a.price),
          fn: () => nav.navigate('AssetDetail', { sym: a.sym }),
        })),
      },
      {
        title: 'Trades',
        items: trades.filter((t) => hit(t.id, t.asset, t.strategy, t.setup, t.dir)).slice(0, 6).map((t) => ({
          key: `t-${t.id}`, icon: 'book-open', title: `${t.asset} ${t.dir.toLowerCase()}`, sub: `${t.id} · ${t.strategy} · ${t.date}`,
          fn: () => nav.navigate('TradeDetail', { id: t.id }),
        })),
      },
      {
        title: 'Events',
        items: mapEvents.filter((e) => hit(e.title, e.location, e.affected.join(' '))).slice(0, 6).map((e) => ({
          key: `e-${e.id}`, icon: 'map-pin', title: e.title, sub: `${e.location} · ${e.time}`,
          fn: () => nav.navigate('Main', { tab: 'map', ts: Date.now() }),
        })),
      },
      { title: 'Pages', items: pages.filter((p) => hit(p.title)).slice(0, 6) },
    ];
    return out.filter((g) => g.items.length);
  }, [query, trades]);

  return (
    <Sheet visible={visible} onClose={() => { setQ(''); onClose(); }} title="Search">
      <Row style={ui.input}>
        <Icon name="search" size={16} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Search assets, trades, events, pages"
          placeholderTextColor={c.faint}
          style={{ flex: 1, color: c.text, fontSize: 14, minHeight: 46 }}
          returnKeyType="search"
        />
        {q ? <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Clear search"><Icon name="x" size={16} color={c.muted} /></Pressable> : null}
      </Row>

      {groups.length === 0 ? (
        <T v="small" muted>Nothing matches "{q}". Try a symbol like EURUSD, a trade ID like T-0148, or an event like ECB.</T>
      ) : groups.map((g) => (
        <View key={g.title} style={{ gap: 6 }}>
          <T v="label" muted>{g.title}</T>
          <View style={{ borderRadius: 14, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
            {g.items.map((it, i) => (
              <Pressable key={it.key} onPress={() => go(it.fn)} accessibilityLabel={`${it.title}, ${it.sub}`}
                style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 56, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}>
                <NavIcon name={it.icon} size={16} color={c.muted} />
                <View style={{ flex: 1 }}>
                  <T v="h3" numberOfLines={1}>{it.title}</T>
                  <T v="caption" muted numberOfLines={1}>{it.sub}</T>
                </View>
                {it.right ? <T v="small" mono muted>{it.right}</T> : null}
                <Icon name="chevron-right" size={15} color={c.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </Sheet>
  );
}

function TopBar({ onSelect }) {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { notifications } = useStore();
  const [searching, setSearching] = useState(false);
  const count = notifications.length;
  return (
    <View style={st.top}>
      {!wide ? <LogoText height={24} width={120} /> : null}
      {wide ? (
        <Pressable onPress={() => setSearching(true)} style={st.search} accessibilityLabel="Search">
          <Icon name="search" size={16} color={c.muted} />
          <T v="small" muted>Search assets, trades, events</T>
        </Pressable>
      ) : null}
      <View style={{ flex: 1 }} />
      {wide ? <View style={st.pill}><T v="caption">✦ Mentor ready</T></View> : null}
      {!wide ? <Pressable onPress={() => setSearching(true)} style={st.iconBtn} accessibilityLabel="Search"><Icon name="search" /></Pressable> : null}
      <Pressable onPress={() => nav.navigate('Notifications')} style={st.iconBtn} accessibilityLabel={count ? `Notifications, ${count} waiting` : 'Notifications'}>
        <Icon name="bell" />
        {count > 0 ? <View style={st.count}><Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>{count}</Text></View> : null}
      </Pressable>
      <Pressable onPress={() => onSelect('settings')} style={st.iconBtn} accessibilityLabel="Profile and settings"><Icon name="user" size={18} /></Pressable>
      <SearchSheet visible={searching} onClose={() => setSearching(false)} onSelect={onSelect} />
    </View>
  );
}

function BottomNav({ active, onSelect }) {
  const insets = useSafeAreaInsets();
  const last = useRef(0);
  const inMore = !['overview', 'markets', 'journal', 'mentor'].includes(active);
  // Switch the moment the finger lands, and ignore a second fire within 300 ms.
  const tap = (key) => {
    const now = Date.now();
    if (now - last.current < 300) return;
    last.current = now;
    onSelect(key);
  };
  return (
    <View style={[st.bottom, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {MOBILE.map((n) => {
        const on = n.key === 'more' ? inMore : active === n.key;
        return (
          <Pressable key={n.key} onPressIn={() => tap(n.key)} onPress={() => tap(n.key)} hitSlop={{ top: 6, bottom: 6 }} style={st.bottomItem} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View style={st.bottomIcon}><NavIcon name={n.icon} size={20} color={on ? c.text : c.muted} /></View>
            <Text style={{ fontSize: 11, color: on ? c.text : c.muted, fontWeight: on ? '700' : '500' }}>{n.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * App chrome: sidebar on desktop, bottom nav on mobile/tablet. Used by tabs and pushed detail screens.
 * The keyboard wrapper sits around the whole frame so it measures the full overlap with the keyboard,
 * and the bottom nav hides while typing so the input sits directly above the keyboard.
 */
export function Frame({ active, onSelect, children }) {
  const nav = useNavigation();
  const { wide } = useLayout();
  const typing = useKeyboard();
  const select = onSelect || ((key) => nav.navigate('Main', { tab: key, ts: Date.now() }));
  if (wide) {
    return (
      <SafeAreaView style={st.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <View style={{ flex: 1, flexDirection: 'row' }}>
            <Sidebar active={active} onSelect={select} />
            <View style={{ flex: 1 }}><TopBar onSelect={select} />{children}</View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={st.root} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TopBar onSelect={select} />
        <View style={{ flex: 1 }}>{children}</View>
        {typing ? null : <BottomNav active={active} onSelect={select} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = themed(() => ({
  root: { flex: 1, backgroundColor: c.bg },
  side: { width: 232, backgroundColor: c.bgAlt, borderRightWidth: 1, borderRightColor: c.border, paddingBottom: 12 },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, paddingHorizontal: 18, marginHorizontal: 8, marginVertical: 2, borderRadius: 16 },
  sideOn: { backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.borderStrong },
  top: { height: 64, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, backgroundColor: c.bgAlt, borderBottomWidth: 1, borderBottomColor: c.border },
  search: { width: 380, height: 40, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 11, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  count: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: c.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bottom: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgAlt, paddingTop: 6 },
  bottomItem: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  bottomIcon: { width: 44, height: 28, alignItems: 'center', justifyContent: 'center' },
}));