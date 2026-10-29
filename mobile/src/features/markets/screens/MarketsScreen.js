import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, TextInput, ScrollView, Text, Animated, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Icon, Empty, Sheet, s as ui, useLayout } from '../../../components/ui';
import { assets, fmtPrice, assetBy } from '../../../mocks/mock';
import { useLiveAssets } from '../hooks/useLiveAssets';
import { useStore } from '../../../app/store';

const CATS = ['All', 'Forex', 'Indices', 'Commodities', 'Stocks', 'Crypto'];

// Simulated quote: replace with a real bid/ask feed in production.
const SPREAD = { Forex: 0.00009, Commodities: 0.00015, Indices: 0.0002, Stocks: 0.0003, Crypto: 0.0004 };
const RANGE = { Forex: 0.0045, Commodities: 0.011, Indices: 0.008, Stocks: 0.015, Crypto: 0.03 };
const seeded = (str, n) => { let h = 7; for (const ch of str + n) h = (h * 31 + ch.charCodeAt(0)) % 9973; return (h % 100) / 100; };
const pad2 = (n) => String(n).padStart(2, '0');

const clockText = () => {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
};

/** The clock ticks on its own, so only this small text redraws each second, not the whole market list. */
function Clock() {
  const [t, setT] = useState(clockText());
  useEffect(() => { const id = setInterval(() => setT(clockText()), 1000); return () => clearInterval(id); }, []);
  return <T v="caption" muted mono>{t}</T>;
}

function quote(a) {
  const forex = a.cat === 'Forex';
  const pdec = forex ? a.dec + 1 : a.dec; // forex quotes carry a fractional pip digit
  const unit = Math.pow(10, -pdec);
  const spread = a.price * (SPREAD[a.cat] || 0.0002);
  const prev = a.price / (1 + a.chg / 100);
  const rng = a.price * (RANGE[a.cat] || 0.01);
  const high = Math.max(a.price, prev) + rng * (0.2 + seeded(a.sym, 1) * 0.5);
  const low = Math.min(a.price, prev) - rng * (0.2 + seeded(a.sym, 2) * 0.5);
  return {
    forex, pdec,
    bid: a.price - spread / 2, ask: a.price + spread / 2,
    spreadPts: Math.max(1, Math.round(spread / unit)),
    points: Math.round((a.price - prev) / unit),
    high, low,
  };
}

const fmtQ = (a, k, v) => (k.forex ? v.toFixed(k.pdec) : fmtPrice(a.sym, v));

/* ---------- Asset icons: generic glyphs, no brand logos ---------- */
const AMBER = '#F5B54A';
const CCY = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', NZD: 'N$', CHF: 'Fr' };
const ICON_W = 38;
const ICON_H = 34;
const tintOf = (hex, a = '26') => `${hex}${a}`;

function Disc({ size, bg, border, children, style }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, borderWidth: 1.5, borderColor: border, alignItems: 'center', justifyContent: 'center' }, style]}>
      {children}
    </View>
  );
}

const Glyph = ({ text, size = 15, color = c.text }) => (
  <Text style={{ color, fontSize: size, fontWeight: '800' }} numberOfLines={1}>{text}</Text>
);

/** Round icon shown at the left of each market row. */
function AssetIcon({ a }) {
  if (a.cat === 'Forex') {
    const [base, quoteCcy] = a.sym.split('/');
    const sz = 24;
    const txt = (code) => CCY[code] || code[0];
    return (
      <View style={{ width: ICON_W, height: ICON_H }}>
        <Disc size={sz} bg={c.elevated2} border={c.borderStrong} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Glyph text={txt(base)} size={txt(base).length > 1 ? 9 : 12} />
        </Disc>
        <Disc size={sz} bg={tintOf(c.green, '33')} border={c.bg} style={{ position: 'absolute', left: ICON_W - sz, top: ICON_H - sz }}>
          <Glyph text={txt(quoteCcy)} size={txt(quoteCcy).length > 1 ? 9 : 12} color={c.green} />
        </Disc>
      </View>
    );
  }

  let body; let bg = c.elevated2; let border = c.borderStrong;
  if (a.cat === 'Crypto') {
    const isBtc = a.sym.startsWith('BTC');
    const isEth = a.sym.startsWith('ETH');
    const col = isBtc ? AMBER : isEth ? c.lavender : c.text;
    bg = tintOf(col, '26'); border = tintOf(col, '66');
    body = <Glyph text={isBtc ? '₿' : isEth ? 'Ξ' : a.sym.slice(0, 2)} size={isBtc || isEth ? 16 : 12} color={col} />;
  } else if (a.sym === 'XAU/USD') {
    bg = tintOf(AMBER, '26'); border = tintOf(AMBER, '66');
    body = <Glyph text="Au" size={12} color={AMBER} />;
  } else if (a.cat === 'Commodities') {
    body = <Icon name="droplet" size={16} />;
  } else if (a.cat === 'Indices') {
    body = <Icon name="bar-chart-2" size={16} />;
  } else {
    body = <Glyph text={a.sym[0]} size={15} />;
  }

  return (
    <View style={{ width: ICON_W, height: ICON_H, alignItems: 'center', justifyContent: 'center' }}>
      <Disc size={ICON_H} bg={bg} border={border}>{body}</Disc>
    </View>
  );
}

function Price({ a, k, value, color }) {
  if (!k.forex) return <T mono style={{ color, fontSize: 20, fontWeight: '600', lineHeight: 26 }}>{fmtPrice(a.sym, value)}</T>;
  const s = value.toFixed(k.pdec);
  const sup = s.slice(-1); const big = s.slice(-3, -1); const pre = s.slice(0, -3);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <T mono style={{ color, fontSize: 13, lineHeight: 18, marginTop: 5 }}>{pre}</T>
      <T mono style={{ color, fontSize: 22, fontWeight: '700', lineHeight: 26 }}>{big}</T>
      <T mono style={{ color, fontSize: 10, fontWeight: '700', lineHeight: 13, marginTop: 1 }}>{sup}</T>
    </View>
  );
}

/** Swipe a row to the left to remove it. A red strip shows behind the row while dragging. */
function SwipeRow({ children, onRemove, wide }) {
  const x = useRef(new Animated.Value(0)).current;
  const width = useRef(320);
  const done = useRef(onRemove);
  done.current = onRemove;

  const back = () => Animated.spring(x, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
  // Created once per row, not on every render.
  const pan = useRef(null);
  if (!pan.current) {
    pan.current = PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dx < -8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => x.setValue(Math.min(0, g.dx)),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -width.current * 0.35 || g.vx < -0.8) {
          Animated.timing(x, { toValue: -width.current, duration: 160, useNativeDriver: true }).start(() => done.current());
        } else back();
      },
      onPanResponderTerminate: back,
    });
  }

  return (
    <View
      onLayout={(e) => { width.current = e.nativeEvent.layout.width; }}
      style={{ flexGrow: 1, flexBasis: wide ? '48%' : '100%', overflow: 'hidden' }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: tintOf(c.red, '33'), alignItems: 'flex-end', justifyContent: 'center', paddingRight: 24 }}>
        <Row gap={6}>
          <Icon name="trash-2" size={16} color={c.red} />
          <T v="small" bold style={{ color: c.red }}>Remove</T>
        </Row>
      </View>
      <Animated.View style={{ backgroundColor: c.surface, transform: [{ translateX: x }] }} {...pan.current.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

function QuoteRow({ a, onPress }) {
  const k = quote(a);
  const up = a.chg >= 0;
  const col = up ? c.green : c.red;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 7 }, pressed && { backgroundColor: c.elevated }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 }}>
        <AssetIcon a={a} />
        <View style={{ gap: 0, flexShrink: 1 }}>
          <Row gap={6}>
            <T v="caption" muted mono>{k.points > 0 ? '+' : ''}{k.points}</T>
            <T v="caption" mono style={{ color: col, fontWeight: '600' }}>{up ? '+' : '−'}{Math.abs(a.chg).toFixed(2)}%</T>
          </Row>
          <T v="h2" style={{ fontWeight: '700', fontSize: 16, lineHeight: 20 }}>{a.sym.replace('/', '')}</T>
          <Row gap={6}>
            <Clock />
            <T v="caption" muted>↔ {k.spreadPts}</T>
          </Row>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Row gap={16} style={{ alignItems: 'flex-start' }}>
          <Price a={a} k={k} value={k.bid} color={col} />
          <Price a={a} k={k} value={k.ask} color={col} />
        </Row>
        <Row gap={14}>
          <T v="caption" muted mono>L: {fmtQ(a, k, k.low)}</T>
          <T v="caption" muted mono>H: {fmtQ(a, k, k.high)}</T>
        </Row>
      </View>
    </Pressable>
  );
}

/* ---------- Add markets ---------- */

/** Text tab with an underline when active. */
function TabText({ label, on, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} style={{ minHeight: 40, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: on ? c.green : 'transparent' }}>
      <Text numberOfLines={1} style={{ color: on ? c.text : c.muted, fontWeight: on ? '700' : '500', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

/** One market you can add. Tap it and it moves to your Markets list. */
function AddRow({ a, onAdd }) {
  const up = a.chg >= 0;
  const col = up ? c.green : c.red;
  const prev = a.price / (1 + a.chg / 100);
  const diff = Math.abs(a.price - prev);
  return (
    <Pressable
      onPress={onAdd}
      accessibilityLabel={`Add ${a.sym}`}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 }, pressed && { backgroundColor: c.elevated }]}
    >
      <AssetIcon a={a} />
      <View style={{ flex: 1 }}>
        <T v="h3" numberOfLines={1}>{a.name}</T>
        <T v="caption" muted>{a.sym.replace('/', '')}</T>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <T v="h3" mono>{fmtPrice(a.sym, a.price)}</T>
        <T v="caption" mono style={{ color: col }}>{up ? '▲' : '▼'} {diff.toFixed(a.dec)} ({up ? '+' : '−'}{Math.abs(a.chg).toFixed(2)}%)</T>
      </View>
    </Pressable>
  );
}

function AddMarketsSheet({ visible, onClose, marketList, addMarket }) {
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => { if (!visible) { setQ(''); setCat('All'); setSearching(false); } }, [visible]);

  const norm = (s) => s.toLowerCase().replace(/[\/\s]/g, '');
  // Always sorted alphabetically by name.
  const list = useMemo(() => {
    const r = assets.filter((a) => !marketList.includes(a.sym) && (cat === 'All' || a.cat === cat) && norm(a.sym + a.name).includes(norm(q)));
    return [...r].sort((x, y) => x.name.localeCompare(y.name));
  }, [marketList, cat, q]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Add markets">
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }} gap={8}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ alignItems: 'center' }}>
            {CATS.map((x) => <TabText key={x} label={x} on={cat === x} onPress={() => setCat(x)} />)}
          </ScrollView>
          <Pressable onPress={() => { setSearching(!searching); if (searching) setQ(''); }} style={ui.iconBtn} accessibilityLabel="Search">
            <Icon name={searching ? 'x' : 'search'} size={18} />
          </Pressable>
        </Row>

        {searching ? (
          <Row style={ui.input}>
            <Icon name="search" size={16} color={c.muted} />
            <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Search EURUSD, gold, NVDA, BTC…" placeholderTextColor={c.faint} autoCapitalize="none" autoCorrect={false} style={{ flex: 1, color: c.text, fontSize: 14, minHeight: 46 }} />
          </Row>
        ) : null}
      </View>

      {list.length === 0 ? (
        <T v="small" muted>Nothing to add. Everything matching is already on your list, or nothing matches that search.</T>
      ) : (
        <View>
          {list.map((a) => <AddRow key={a.sym} a={a} onAdd={() => addMarket(a.sym)} />)}
        </View>
      )}
    </Sheet>
  );
}

export default function MarketsScreen() {
  useLiveAssets(assets.map((a) => a.sym));   // stream live prices into the list
  const nav = useNavigation();
  const { wide } = useLayout();
  const { marketList, addMarket, removeMarket } = useStore();
  const [editing, setEditing] = useState(false);
  const mine = useMemo(() => marketList.map((sym) => assetBy(sym)), [marketList]);

  return (
    <Screen>
      <PageTitle
        title="Markets"
        right={
          <Pressable onPress={() => setEditing(true)} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Add markets">
            <Icon name="edit-2" size={18} />
          </Pressable>
        }
      />

      {mine.length === 0 ? (
        <Empty icon="plus-circle" title="Your list is empty" body="Tap the pen at the top to add pairs, stocks, commodities or crypto." action="Add markets" onAction={() => setEditing(true)} />
      ) : (
        <Card pad={0} style={{ borderWidth: 0, shadowOpacity: 0, shadowRadius: 0, elevation: 0 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {mine.map((a) => (
              <SwipeRow key={a.sym} wide={wide} onRemove={() => removeMarket(a.sym)}>
                <QuoteRow a={a} onPress={() => nav.navigate('AssetDetail', { sym: a.sym })} />
              </SwipeRow>
            ))}
          </View>
        </Card>
      )}

      <AddMarketsSheet visible={editing} onClose={() => setEditing(false)} marketList={marketList} addMarket={addMarket} />
    </Screen>
  );
}