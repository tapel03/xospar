import React, { useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView, Modal, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { useAssetCandles } from '../hooks/useAssetCandles';
import { useLiveAssets } from '../hooks/useLiveAssets';
import CandleChart, { CHART_DEFAULTS } from '../../../components/charts/CandleChart';
import ColorPicker from '../../../components/ui/ColorPicker';
import CreateAlertSheet from '../../alerts/components/CreateAlertSheet';
import { T, Card, Row, Segmented, Delta, Icon, Button, AITag, CheckRow, Disclaimer, Chip, Bar, Sheet, Field, Stat, signed, useLayout } from '../../../components/ui';
import { KV } from '../../../components/domain';
import { assetBy, fmtPrice, makeCandles, news, upcomingEvents, strategies, account } from '../../../mocks/mock';
import { correlationMatrix, corrSyms } from '../data/correlation';
import { vpu, sizeDec, sizeUnit, usd, positionMoney, riskBaseOf } from '../../trading/risk';
import { useStore } from '../../../app/store';

const AMBER = '#F5B54A';
const TFS = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const CHART_TYPES = [['candles', 'Candles', 'bar-chart-2'], ['line', 'Line', 'trending-up']];
// Simulated spread per market type, used only to draw the ask line. Replace with a real ask from the feed.
const SPREAD = { Forex: 0.00009, Commodities: 0.00015, Indices: 0.0002, Stocks: 0.0003, Crypto: 0.0004 };
const TOOL_GROUPS = [
  { id: 'cursor', icon: 'mouse-pointer', label: 'Cursors', tools: [['cursor', 'Cursor', 'mouse-pointer'], ['crosshair', 'Crosshair', 'crosshair']] },
  { id: 'lines', icon: 'minus', label: 'Lines', tools: [['trend', 'Trend line', 'trending-up'], ['ray', 'Ray', 'arrow-up-right'], ['ext', 'Extended line', 'maximize-2'], ['hline', 'Horizontal line', 'minus'], ['hray', 'Horizontal ray', 'arrow-right'], ['vline', 'Vertical line', 'more-vertical']] },
  { id: 'channels', icon: 'menu', label: 'Channels', tools: [['parallel', 'Parallel channel', 'menu'], ['regression', 'Regression channel', 'bar-chart']] },
  { id: 'shapes', icon: 'square', label: 'Shapes', tools: [['rect', 'Rectangle / zone', 'square'], ['ellipse', 'Circle / ellipse', 'circle'], ['brush', 'Brush / highlighter', 'edit-3'], ['arrow', 'Arrow', 'arrow-up-right']] },
  { id: 'text', icon: 'type', label: 'Annotation', tools: [['text', 'Text / note', 'type']] },
  { id: 'fib', icon: 'align-justify', label: 'Fibonacci & geometry', tools: [['fibr', 'Fib retracement', 'align-justify'], ['fibe', 'Fib extension', 'align-left'], ['fibc', 'Fib channel', 'align-center'], ['pitch', 'Pitchfork', 'git-branch']] },
  { id: 'pos', icon: 'git-commit', label: 'Position', tools: [['long', 'Long position', 'arrow-up'], ['short', 'Short position', 'arrow-down']] },
  { id: 'measure', icon: 'maximize', label: 'Measurement', tools: [['pmeasure', 'Price range', 'code'], ['tmeasure', 'Date / time range', 'clock'], ['rr', 'Risk / reward', 'percent']] },
  { id: 'adv', icon: 'sliders', label: 'Advanced', tools: [['avwap', 'Anchored VWAP', 'anchor'], ['vprofile', 'Volume profile', 'bar-chart-2'], ['elliott', 'Elliott wave / patterns', 'activity']] },
];
const ALL_TOOLS = TOOL_GROUPS.flatMap((g) => g.tools);
const TOOL_HELP = { rect: 'Drag on the chart to mark a zone.', hline: 'Tap the chart to place a level.', crosshair: 'Press and drag to read prices.', cursor: 'Tap event markers under the chart to see what moved price.' };
const DEFAULT_FAVS = ['cursor']; // pinned until you change them in the Tools sheet

// Cards shown in the chart menu. 'home' is the card grid itself. Trade entry is not in this list:
// it sits below the grid as one full-width card, at the bottom of the modal.
const MENU = [
  ['chart', 'Chart settings', 'settings', 'Style, grid, price lines, colors'],
  ['tools', 'Tools', 'tool', 'Drawing tools, levels and zones'],
  ['brief', 'AI brief', 'cpu', 'Why it is moving, levels, scenarios'],
  ['edge', 'My edge', 'layers', 'Does the setup fit your rules'],
  ['news', 'News & events', 'file-text', 'What could move this market'],
  ['corr', 'Correlations', 'hash', 'What moves with or against it'],
  ['sent', 'Sentiment', 'thermometer', 'Positioning, options, news tone'],
];

// Chart settings list: [key, title, description]. Each one is a checkbox.
const PREF_ROWS = [
  ['ohlc', 'OHLC', 'On-chart display of open, high, low and close prices for the last candlestick or for the one on which the crosshair is placed'],
  ['dataWindow', 'Show data window', 'Show a pop-up window near the crosshair with the values of the candle under it. Use the Crosshair tool'],
  ['positions', 'Trade positions', 'Show position open prices on the chart'],
  ['grid', 'Show grid', 'Show grid on the chart'],
  ['pnl', 'Profit/loss', 'Show profit/loss amounts on the SL and TP labels of a planned trade'],
  ['sltp', 'SL/TP levels', 'Show Stop Loss and Take Profit values on the chart'],
  ['separators', 'Show period separators', 'Show additional vertical lines on the chart indicating the higher timeframe borders'],
  ['askLine', 'Ask price line', 'Show Ask line'],
  ['lastLine', 'Last price line', 'Show Last line'],
  ['countdown', 'Countdown to Bar Close', 'Show the remaining time until the current bar closes'],
  ['free', 'Free chart movement', 'Drag the chart up and down as well as left and right. When off, the price scale stays fitted'],
];

const DRIVERS = [
  { dir: -1, kind: 'Correlation', text: 'USD strength increasing', detail: 'DXY +0.24% today; EUR/USD 30D correlation with DXY is −0.94.' },
  { dir: -1, kind: 'Macro', text: 'EUR softness', detail: 'Euro-area services PMI revised lower this morning.' },
  { dir: 0, kind: 'Event', text: 'ECB decision Thursday 14:15', detail: 'Markets price a hold. Tone is the swing factor.' },
  { dir: 0, kind: 'Event', text: 'US CPI today 14:30', detail: 'A hot print would extend USD strength; soft print the opposite.' },
  { dir: -1, kind: 'Bonds', text: 'US–German 2Y spread widening', detail: '+4bp on the day, historically USD supportive.' },
  { dir: 1, kind: 'Volume', text: 'Buyers defending 1.1650', detail: 'Volume 1.4× average on the two tests of the zone.' },
];
const MARKERS = [
  { id: 'mk1', i: 18, letter: 'N', title: 'ECB speaker: patience on easing', detail: 'EUR bid briefly; move faded within an hour as USD data hit.' },
  { id: 'mk2', i: 47, letter: 'E', title: 'US retail sales beat (+0.6% vs +0.3%)', detail: 'USD bid across the board. This started the push lower into 1.1650.' },
  { id: 'mk3', i: 70, letter: 'G', title: 'Regional conflict headlines', detail: 'Brief safe-haven USD bid, then a small pullback as oil stabilised.' },
];

/* ---------- Trading sessions (UTC hours). Sydney runs past midnight. ---------- */
const SESSIONS = [
  { name: 'New York', s: 13, e: 22 },
  { name: 'London', s: 8, e: 17 },
  { name: 'Tokyo', s: 0, e: 9 },
  { name: 'Sydney', s: 21, e: 30 },
];
const hm = (mins) => { const h = Math.floor(mins / 60); const m = mins % 60; return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`; };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const stamp = (ms) => { const d = new Date(ms); return `${d.getDate()} ${MON[d.getMonth()]} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

function sessionsNow(d) {
  const m = d.getUTCHours() * 60 + d.getUTCMinutes();
  const out = [];
  SESSIONS.forEach((x) => {
    const s = x.s * 60; const e = x.e * 60;
    if (m >= s && m < e) out.push({ name: x.name, left: e - m });
    else if (e > 1440 && m < e - 1440) out.push({ name: x.name, left: e - 1440 - m });
  });
  return out;
}

/** Live clock plus how long each open session has left. Ticks on its own so the chart does not redraw. */
function SessionLine({ always }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const act = always ? [] : sessionsNow(now);
  return (
    <Row style={{ flexWrap: 'wrap', marginTop: 2 }} gap={10}>
      <T v="caption" mono muted>{time}</T>
      {always ? <T v="caption" muted>● 24/7 market, no session end</T> : act.length ? (
        act.map((x) => <T key={x.name} v="caption" muted>● {x.name} ends in <T v="caption" mono>{hm(x.left)}</T></T>)
      ) : <T v="caption" muted>● Between sessions</T>}
    </Row>
  );
}

/** One item inside the top bar. Flat and transparent so the bar blends into the chart. `fit` keeps it compact instead of stretching. */
function TBtn({ icon, label, on, onPress, a11y, fit }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y || label}
      accessibilityState={{ selected: !!on }}
      style={({ pressed }) => [{ flex: fit ? 0 : 1, minWidth: fit ? 64 : undefined, minHeight: 44, paddingHorizontal: fit ? 14 : 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: on ? 'rgba(255,255,255,0.10)' : 'transparent' }, pressed && { opacity: 0.6 }]}
    >
      {icon ? <Icon name={icon} size={16} color={on ? c.white : c.text} /> : null}
      {label ? <Text numberOfLines={1} style={{ color: on ? c.white : c.text, fontWeight: '700', fontSize: 13, flexShrink: 1 }}>{label}</Text> : null}
    </Pressable>
  );
}

/** One choice shown when the top bar switches to the chart type or timeframe picker. */
function OptBtn({ icon, label, on, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      accessibilityLabel={label}
      style={({ pressed }) => [{ minHeight: 40, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: on ? 'rgba(255,255,255,0.14)' : 'transparent' }, pressed && { opacity: 0.6 }]}
    >
      {icon ? <Icon name={icon} size={16} color={on ? c.white : c.muted} /> : null}
      <Text style={{ color: on ? c.white : c.muted, fontWeight: on ? '800' : '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

/** One card in the chart menu. `full` makes it span the whole width of the modal's content area (the modal's own padding stays). */
function MenuCard({ icon, title, sub, onPress, full }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        full
          ? { width: '100%', minHeight: 88, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, flexDirection: 'row', alignItems: 'center', gap: 14 }
          : { flexGrow: 1, flexBasis: '46%', minHeight: 112, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, justifyContent: 'space-between', gap: 10 },
        pressed && { opacity: 0.75, backgroundColor: c.elevated2 },
      ]}
    >
      <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} />
      </View>
      <View style={{ gap: 2, flex: full ? 1 : undefined }}>
        <T v="h3">{title}</T>
        <T v="caption" muted numberOfLines={2}>{sub}</T>
      </View>
      {full ? <Icon name="chevron-right" size={16} color={c.muted} /> : null}
    </Pressable>
  );
}

/** One icon inside the favorites bar. No border of its own: the bar is the only border. */
function DockBtn({ icon, label, onPress, on, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!on, disabled: !!disabled }}
      style={({ pressed }) => [{ width: 44, height: 40, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.elevated2 : 'transparent' }}>
        <Icon name={icon} size={16} color={on ? c.white : c.text} />
      </View>
    </Pressable>
  );
}

/** One icon in the bottom action bar. Each takes an equal share of the full width. */
function BarBtn({ icon, label, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [{ flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={19} color={c.text} />
    </Pressable>
  );
}

/** A drawing tool in the tools sheet. Tap the name to use it, tap the star to pin it to (or remove it from) the chart's favorites bar. */
function ToolItem({ label, icon, on, fav, onPick, onFav }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: on ? c.elevated2 : 'transparent', overflow: 'hidden' }}>
      <Pressable onPress={onPick} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingRight: 8, minHeight: 36 }, pressed && { opacity: 0.7 }]}>
        <Icon name={icon} size={14} color={c.text} />
        <Text style={{ color: c.text, fontSize: 13, fontWeight: on ? '700' : '500' }}>{label}</Text>
      </Pressable>
      <Pressable onPress={onFav} accessibilityRole="button" accessibilityLabel={fav ? `Remove ${label} from favorites` : `Add ${label} to favorites`} accessibilityState={{ selected: fav }} style={({ pressed }) => [{ width: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: c.border }, pressed && { opacity: 0.6 }]}>
        <Text style={{ color: fav ? AMBER : c.muted, fontSize: 17 }}>{fav ? '★' : '☆'}</Text>
      </Pressable>
    </View>
  );
}

/** One line in the chart settings list: title, short description and a checkbox on the right. */
function PrefRow({ title, sub, on, onToggle, first }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!on }}
      accessibilityLabel={title}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: c.border }, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <T v="h3">{title}</T>
        {sub ? <T v="caption" muted>{sub}</T> : null}
      </View>
      <View style={{ width: 24, height: 24, borderRadius: 5, borderWidth: on ? 0 : 2, borderColor: c.borderStrong, backgroundColor: on ? c.blue : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="check" size={16} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}

export default function AssetDetailScreen({ route, navigation }) {
  const sym = route.params?.sym || 'EUR/USD';
  const a = assetBy(sym);
  const { height: winH } = useLayout();
  const { settings, setSetting, positions } = useStore();
  const riskBase = riskBaseOf(settings, account.equity); // risk % is worked out from this fixed amount, not live equity
  const [tf, setTf] = useState('1H');
  useLiveAssets([sym]);                                   // live price + change from the backend
  const liveCandles = useAssetCandles(sym, tf);           // real candles, null until the backend answers
  const candles = useMemo(() => liveCandles || makeCandles(sym), [sym, liveCandles]);
  const always = a.status === '24/7';
  const [chartType, setChartType] = useState('candles'); // 'candles' | 'line'
  const [menu, setMenu] = useState(null); // 'type' | 'tf' | null
  const [layout, setLayout] = useState('1');
  const [tool, setTool] = useState('cursor');
  const [toolsOpen, setToolsOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [section, setSection] = useState('home'); // which view the chart menu modal shows
  const [secOpen, setSecOpen] = useState(false);
  const [cfgOpen, setCfgOpen] = useState(false); // chart settings modal
  const [cfgView, setCfgView] = useState('list'); // 'list' | 'colors'
  const [colorFor, setColorFor] = useState('Up candles'); // which colour the picker is editing
  const [favOpen, setFavOpen] = useState(false); // the favorites bar starts collapsed to one icon
  const [resetN, setResetN] = useState(0); // bump to put the chart back to its default zoom and position
  const [showMarkers, setShowMarkers] = useState(true);
  const [hide, setHide] = useState(false);
  const [locked, setLocked] = useState(false);
  const [magnet, setMagnet] = useState(true);
  const [history, setHistory] = useState([[]]);
  const [hIdx, setHIdx] = useState(0);
  const drawings = history[hIdx];
  const [alertFor, setAlertFor] = useState(null);
  const [alertLine, setAlertLine] = useState(null); // { price } draggable alert level placed from the bell icon
  const [toast, setToast] = useState(null);
  const [marker, setMarker] = useState(null);
  const [stageH, setStageH] = useState(0); // height of the area the chart fills
  const [topInset, setTopInset] = useState(120); // space taken by the header and top bar
  const [tradePrompt, setTradePrompt] = useState(false);
  const [pos, setPos] = useState(null); // { dir, entry, stop, target, size, time } planned trade shown on the chart

  // Chart display settings (grid, price lines, colours...). Kept in app settings so they stay the same across assets.
  const prefs = { ...CHART_DEFAULTS, ...(settings.chartPrefs || {}) };
  const setPrefs = (patch) => setSetting('chartPrefs', { ...(settings.chartPrefs || {}), ...patch });
  const upHex = prefs.up || c.green;
  const downHex = prefs.down || c.red;

  // Favorite tools are pinned to the vertical bar on the chart. Kept in settings so they survive switching assets.
  const favTools = settings.favTools || DEFAULT_FAVS;
  const favInfo = favTools.map((id) => ALL_TOOLS.find((t) => t[0] === id)).filter(Boolean);
  const toggleFav = (id) => setSetting('favTools', favTools.includes(id) ? favTools.filter((x) => x !== id) : [...favTools, id]);

  // Open positions on this market, drawn as entry lines. Matches EUR/USD or EURUSD style symbols.
  const myPositions = positions.filter((p) => p.asset === sym || p.sym === sym.replace('/', ''));
  const ask = a.price * (1 + (SPREAD[a.cat] || 0.0002) / 2);

  const commit = (next) => { const h = history.slice(0, hIdx + 1); h.push(next); setHistory(h); setHIdx(h.length - 1); };
  const undo = () => setHIdx(Math.max(0, hIdx - 1));
  const redo = () => setHIdx(Math.min(history.length - 1, hIdx + 1));
  const resetZoom = () => setResetN((n) => n + 1);
  const onZone = (z) => { if (locked) return; const d = { id: 'd' + Date.now(), type: 'zone', label: 'ZONE', ...z }; commit([...drawings, d]); setTool('cursor'); setAlertFor(d); };
  const onLine = (p) => { if (locked) return; const d = { id: 'd' + Date.now(), type: 'line', label: 'LEVEL', price: p, style: 'dashed' }; commit([...drawings, d]); setTool('cursor'); setAlertFor(d); };
  const zones = drawings.filter((d) => d.type === 'zone');
  const lines = drawings.filter((d) => d.type === 'line');

  const fsH = Math.max(200, winH - 240);

  /* ---------- Alert line (bell icon next to the timeframe) ---------- */
  // Tap the bell: an alert line appears at the current price. Hold it and drag to the price you want, then create the alert.
  const toggleAlertLine = () => {
    if (alertLine) { setAlertLine(null); return; }
    setMenu(null);
    setTool('cursor');
    setAlertLine({ price: Number(a.price.toFixed(a.dec)) });
  };
  const onAlertLine = (patch) => setAlertLine((p) => (p ? { ...p, ...patch } : p));
  const createFromAlertLine = () => {
    if (!alertLine) return;
    setAlertFor({ id: 'al' + Date.now(), type: 'line', label: 'MY ALERT', price: alertLine.price, style: 'dashed' });
  };

  /* ---------- Trade entry ---------- */
  // Trade entry asks Buy or Sell, then places the position on the chart: entry at the current price with a
  // stop loss and take profit you can hold and drag. Risk and reward are shown in money.
  const openTradeEntry = () => setTradePrompt(true);

  const chooseTradeDirection = (dir) => {
    const p = a.price;
    const isBuy = dir === 'Long';
    const stopDist = p * 0.0025;
    const stop = Number((isBuy ? p - stopDist : p + stopDist).toFixed(a.dec));
    const target = Number((isBuy ? p + p * 0.005 : p - p * 0.005).toFixed(a.dec));
    const entry = Number(p.toFixed(a.dec));
    // Default size risks your per-trade limit (on your risk base) at the default stop.
    const raw = ((settings.maxRisk / 100) * riskBase) / ((Math.abs(entry - stop) * vpu(a)) || 1);
    let size = isFinite(raw) && raw > 0 ? raw.toFixed(sizeDec(a)) : '1';
    if (!(parseFloat(size) > 0)) size = Math.pow(10, -sizeDec(a)).toFixed(sizeDec(a));
    setTradePrompt(false);
    setTool('cursor');
    setPos({ dir, entry, stop, target, size, time: Date.now() });
  };

  const money = pos ? positionMoney(a, pos, riskBase) : null;
  const chartPos = pos && money ? {
    dir: pos.dir, entry: pos.entry, stop: pos.stop, target: pos.target,
    slText: prefs.pnl ? `SL  −${usd(money.risk)} · ${money.riskPct.toFixed(2)}%` : 'SL',
    tpText: prefs.pnl ? `TP  +${usd(money.reward)} · ${money.rr.toFixed(2)}R` : 'TP',
  } : null;
  const onPosition = (patch) => setPos((p) => (p ? { ...p, ...patch } : p));

  const continueTrade = () => {
    if (!pos) return;
    const f = (v) => Number(v).toFixed(a.dec);
    const draft = { asset: sym, dir: pos.dir, entry: f(pos.entry), stop: f(pos.stop), target: f(pos.target), size: String(pos.size) };
    setPos(null);
    navigation.navigate('AddTrade', { draft });
  };

  /* ---------- Chart menu (one icon, one modal of cards) ---------- */
  const openMenu = () => { setSection('home'); setSecOpen(true); };
  const pickMenu = (key) => {
    if (key === 'trade') { setSecOpen(false); setTimeout(openTradeEntry, 250); return; }
    if (key === 'tools') { setSecOpen(false); setTimeout(() => setToolsOpen(true), 250); return; }
    if (key === 'chart') { setSecOpen(false); setTimeout(() => { setCfgView('list'); setCfgOpen(true); }, 250); return; }
    setSection(key);
  };
  const menuTitle = section === 'home' ? `${sym} · Menu` : `${sym} · ${(MENU.find((x) => x[0] === section) || [])[1] || ''}`;

  /* ---------- Top bar: chart type (Candles or Line), timeframe and alert ---------- */
  // Tap one and the bar switches to that picker in the same place. Picking an option brings the buttons back.
  const typeInfo = CHART_TYPES.find((t) => t[0] === chartType) || CHART_TYPES[0];
  const toolbarEl = menu ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', minHeight: 44, gap: 4 }}>
      <Pressable onPress={() => setMenu(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={6}
        style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }]}>
        <Icon name="chevron-left" size={20} color={c.text} />
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'space-around', gap: 4 }}>
        {menu === 'type'
          ? CHART_TYPES.map(([id, label, icon]) => <OptBtn key={id} icon={icon} label={label} on={chartType === id} onPress={() => { setChartType(id); setMenu(null); }} />)
          : TFS.map((t) => <OptBtn key={t} label={t} on={tf === t} onPress={() => { setTf(t); setMenu(null); }} />)}
      </ScrollView>
    </View>
  ) : (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', minHeight: 44, gap: 4 }}>
      <TBtn fit icon={typeInfo[2]} label={typeInfo[1]} a11y="Chart type" onPress={() => setMenu('type')} />
      <TBtn fit label={tf} a11y="Timeframe" onPress={() => setMenu('tf')} />
      <TBtn fit icon="bell" a11y={alertLine ? 'Remove alert line' : 'Create alert'} on={!!alertLine} onPress={toggleAlertLine} />
    </View>
  );

  // Bottom action bar: full width, fixed just above the app's navigation bar.
  // Normal: full screen, chart menu, undo, redo, reset zoom. In full screen: undo, redo, reset zoom.
  const actionsEl = (inFull) => (
    <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgAlt }}>
      {!inFull ? <BarBtn icon="maximize" label="Full screen" onPress={() => setFull(true)} /> : null}
      {!inFull ? <BarBtn icon="grid" label="Open chart menu" onPress={openMenu} /> : null}
      <BarBtn icon="corner-up-left" label="Undo" onPress={undo} disabled={hIdx === 0} />
      <BarBtn icon="corner-up-right" label="Redo" onPress={redo} disabled={hIdx >= history.length - 1} />
      <BarBtn icon="refresh-cw" label="Reset zoom" onPress={resetZoom} />
    </View>
  );

  // Vertical favorites bar on the left edge of the chart. Collapsed it is one icon; tap it to show all your starred tools.
  // Hidden when you have no favorites.
  const favBarEl = (maxH) => (favInfo.length ? (
    <View style={{ position: 'absolute', left: 6, top: 4, width: 44, borderRadius: 14, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, overflow: 'hidden' }}>
      <DockBtn
        icon={favOpen ? 'chevron-up' : 'tool'}
        label={favOpen ? 'Collapse favorite tools' : 'Expand favorite tools'}
        on={!favOpen && tool !== 'cursor'}
        onPress={() => setFavOpen(!favOpen)}
      />
      {favOpen ? (
        <>
          <View style={{ width: 24, height: 1, backgroundColor: c.border, alignSelf: 'center' }} />
          <ScrollView style={{ maxHeight: Math.max(60, maxH - 44), width: 44, flexGrow: 0 }} contentContainerStyle={{ alignItems: 'center', paddingVertical: 2 }} showsVerticalScrollIndicator={false} bounces={false}>
            {favInfo.map(([id, label, icon]) => (
              <DockBtn key={id} icon={icon} label={label} on={tool === id} onPress={() => setTool(tool === id ? 'cursor' : id)} />
            ))}
          </ScrollView>
        </>
      ) : null}
    </View>
  ) : null);

  const hintEl = alertLine && tool === 'cursor' ? (
    <Row style={{ marginTop: 8 }} gap={6}>
      <Icon name="info" size={13} color={c.muted} />
      <T v="caption" muted style={{ flex: 1 }}>Press and hold the ALERT line, then drag it to the price you want.</T>
    </Row>
  ) : pos && tool === 'cursor' ? (
    <Row style={{ marginTop: 8 }} gap={6}>
      <Icon name="info" size={13} color={c.muted} />
      <T v="caption" muted style={{ flex: 1 }}>Press and hold the SL or TP line, then drag to move it.</T>
    </Row>
  ) : tool !== 'cursor' ? (
    <Row style={{ marginTop: 8 }} gap={6}>
      <Icon name="info" size={13} color={c.muted} />
      <T v="caption" muted style={{ flex: 1 }}>{locked ? 'Drawings are locked.' : TOOL_HELP[tool] || 'This tool is selectable; drawing for it is not wired up in this prototype.'}</T>
    </Row>
  ) : null;

  // Panel shown while the alert line is on the chart: live price, Cancel and Create alert.
  const alertPanelEl = alertLine ? (
    <Card pad={12} style={{ gap: 10 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={8}><Icon name="bell" size={16} /><T v="h3">Alert on {sym}</T></Row>
        <T v="caption" mono muted>now {fmtPrice(sym, a.price)}</T>
      </Row>
      <Row style={{ alignItems: 'flex-end' }} gap={12}>
        <View>
          <T v="caption" muted>Alert price</T>
          <T v="h2" mono>{fmtPrice(sym, alertLine.price)}</T>
        </View>
        <T v="caption" muted style={{ flex: 1, textAlign: 'right' }}>{alertLine.price > a.price ? 'Above the current price' : alertLine.price < a.price ? 'Below the current price' : 'At the current price'}</T>
      </Row>
      <Row style={{ justifyContent: 'flex-end' }}>
        <Button small variant="ghost" label="Cancel" onPress={() => setAlertLine(null)} />
        <Button small icon="bell" label="Create alert" onPress={createFromAlertLine} />
      </Row>
    </Card>
  ) : null;

  const chartEl = (h, inset = 0) => (
    layout === '1' ? (
      <CandleChart key={`main${resetN}`} candles={candles} height={h} topInset={inset} decimals={a.dec} type={chartType} tf={tf} zones={zones} lines={lines} markers={showMarkers ? MARKERS : []} tool={locked ? 'cursor' : tool} hideDrawings={hide} magnet={magnet} onZone={onZone} onLine={onLine} onMarker={setMarker} selectedMarker={marker?.id} position={chartPos} onPosition={onPosition} alertLine={alertLine} onAlertLine={onAlertLine} prefs={prefs} ask={ask} openPositions={myPositions} />
    ) : (
      <Row style={{ flexWrap: 'wrap' }} gap={8}>
        {(layout === '2' ? ['15m', '1H'] : ['5m', '15m', '1H', '4H']).map((t) => (
          <View key={t} style={{ flexGrow: 1, flexBasis: 280 }}>
            <T v="caption" muted>{sym}, {t}</T>
            <CandleChart candles={candles.slice(layout === '2' ? 20 : 40)} height={layout === '2' ? Math.max(200, (h - 24) / 2) : 200} decimals={a.dec} type={chartType} tf={t} zones={zones} lines={lines} hideDrawings={hide} prefs={prefs} />
          </View>
        ))}
      </Row>
    )
  );

  /* ---------- Modals ---------- */
  const toolsSheet = (
    <Sheet visible={toolsOpen} onClose={() => setToolsOpen(false)} title="Chart tools" footer={<Row style={{ justifyContent: 'flex-end' }}><Button label="Done" icon="check" onPress={() => setToolsOpen(false)} /></Row>}>
      <Row gap={8} style={{ alignItems: 'flex-start' }}>
        <Text style={{ color: AMBER, fontSize: 15 }}>★</Text>
        <T v="caption" muted style={{ flex: 1 }}>Tap ☆ next to a tool to pin it to the bar on the left of the chart. Tap ★ to remove it.</T>
      </Row>
      {TOOL_GROUPS.map((g) => (
        <View key={g.id} style={{ gap: 8 }}>
          <T v="label">{g.label}</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>
            {g.tools.map(([id, label, icon]) => (
              <ToolItem key={id} label={label} icon={icon} on={tool === id} fav={favTools.includes(id)} onPick={() => { setTool(id); setToolsOpen(false); }} onFav={() => toggleFav(id)} />
            ))}
          </Row>
        </View>
      ))}
      <View style={{ gap: 8 }}>
        <T v="label">Chart layout</T>
        <Segmented options={['1', '2', '4']} value={layout} onChange={setLayout} />
      </View>
      <Row style={{ flexWrap: 'wrap' }} gap={8}>
        <Button small variant="secondary" icon="corner-up-left" label="Undo" onPress={undo} />
        <Button small variant="secondary" icon="corner-up-right" label="Redo" onPress={redo} />
        <Button small variant="ghost" icon="trash-2" label="Delete all drawings" onPress={() => commit([])} />
      </Row>
      {drawings.length ? (
        <Card pad={0}>
          <T v="caption" muted style={{ padding: 12 }}>Your drawings</T>
          {drawings.map((d) => (
            <Row key={d.id} style={{ paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.border }}>
              <Icon name={d.type === 'zone' ? 'square' : 'minus'} size={15} />
              <T v="small" mono style={{ flex: 1 }}>{d.label} {d.type === 'zone' ? `${d.low.toFixed(a.dec)}–${d.high.toFixed(a.dec)}` : d.price.toFixed(a.dec)}</T>
              <Button small variant="secondary" icon="bell" label="Create alert" onPress={() => { setToolsOpen(false); setTimeout(() => setAlertFor(d), 250); }} />
            </Row>
          ))}
        </Card>
      ) : null}
    </Sheet>
  );

  // Chart settings modal: a list like a platform settings page, with a checkbox on each line. Colors opens the colour picker.
  const settingsSheet = (
    <Sheet
      visible={cfgOpen}
      onClose={() => setCfgOpen(false)}
      title={cfgView === 'colors' ? 'Chart colors' : 'Chart settings'}
      footer={cfgView === 'colors' ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" icon="chevron-left" label="Back" onPress={() => setCfgView('list')} />
          <Button variant="secondary" icon="rotate-ccw" label="Reset colors" onPress={() => setPrefs({ up: null, down: null })} />
        </Row>
      ) : (
        <Row style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" icon="rotate-ccw" label="Reset all" onPress={() => setSetting('chartPrefs', {})} />
          <Button label="Done" icon="check" onPress={() => setCfgOpen(false)} />
        </Row>
      )}
    >
      {cfgView === 'colors' ? (
        <>
          <Segmented options={['Up candles', 'Down candles']} value={colorFor} onChange={setColorFor} />
          <ColorPicker
            key={colorFor}
            idPrefix={colorFor === 'Up candles' ? 'cu' : 'cd'}
            value={colorFor === 'Up candles' ? upHex : downHex}
            onChange={(hex) => setPrefs(colorFor === 'Up candles' ? { up: hex } : { down: hex })}
          />
          <Row gap={10} style={{ marginTop: 4 }}>
            <View style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: upHex, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#000', fontWeight: '800', fontSize: 12 }}>UP</Text></View>
            <View style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: downHex, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#000', fontWeight: '800', fontSize: 12 }}>DOWN</Text></View>
          </Row>
          <T v="caption" muted>Used for candles, the line chart, the last price line and the price tag.</T>
        </>
      ) : (
        <>
          <View style={{ gap: 8 }}>
            <T v="h3">Chart style</T>
            <T v="caption" muted>Chart line type and appearance of bars</T>
            <Segmented options={CHART_TYPES.map((t) => t[1])} value={typeInfo[1]} onChange={(label) => { const t = CHART_TYPES.find((x) => x[1] === label); if (t) setChartType(t[0]); }} />
          </View>
          <View style={{ gap: 8 }}>
            <T v="h3">Timeframe</T>
            <Row style={{ flexWrap: 'wrap' }} gap={6}>
              {TFS.map((t) => <Chip key={t} label={t} on={tf === t} onPress={() => setTf(t)} />)}
            </Row>
          </View>
          <View style={{ gap: 8 }}>
            <T v="h3">Chart layout</T>
            <Segmented options={['1', '2', '4']} value={layout} onChange={setLayout} />
          </View>

          <View>
            <PrefRow first title="Event markers" sub="Show the news and event markers on the chart" on={showMarkers} onToggle={() => setShowMarkers(!showMarkers)} />
            <PrefRow title="Show drawings" sub="Show your zones, levels and drawings" on={!hide} onToggle={() => setHide(!hide)} />
            <PrefRow title="Snap to price" sub="Drawings snap to the nearest open, high, low or close" on={magnet} onToggle={() => setMagnet(!magnet)} />
            <PrefRow title="Lock drawings" sub="Stop new drawings while you move around the chart" on={locked} onToggle={() => setLocked(!locked)} />
            {PREF_ROWS.map(([key, title, sub]) => (
              <PrefRow key={key} title={title} sub={sub} on={!!prefs[key]} onToggle={() => setPrefs({ [key]: !prefs[key] })} />
            ))}
            <Pressable
              onPress={() => setCfgView('colors')}
              accessibilityRole="button"
              accessibilityLabel="Colors"
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.border }, pressed && { opacity: 0.7 }]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <T v="h3">Colors</T>
                <T v="caption" muted>Customize color scheme</T>
              </View>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: upHex, borderWidth: 1, borderColor: c.borderStrong }} />
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: downHex, borderWidth: 1, borderColor: c.borderStrong }} />
              <Icon name="chevron-right" size={16} color={c.muted} />
            </Pressable>
          </View>
        </>
      )}
    </Sheet>
  );

  const alertSheet = (
    <CreateAlertSheet
      visible={!!alertFor}
      asset={sym}
      drawing={alertFor && alertFor.type !== 'price' ? alertFor : null}
      onClose={() => setAlertFor(null)}
      onCreated={(p) => {
        if (alertFor && alertFor.id) commit(drawings.map((d) => (d.id === alertFor.id ? { ...d, label: p.label, alert: true } : d)));
        setAlertLine(null);
        setToast(`Alert created: ${p.asset} ${p.condition.toLowerCase()} ${p.target}. It fires on price only.`);
      }}
    />
  );

  return (
    <Frame active="markets">
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        {/* Stage: the chart fills this whole area as the background */}
        <View style={{ flex: 1, backgroundColor: c.bg }} onLayout={(e) => setStageH(e.nativeEvent.layout.height)}>
          {stageH > 0 ? (
            layout === '1' ? (
              <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                {chartEl(stageH, topInset)}
              </View>
            ) : (
              <ScrollView style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} contentContainerStyle={{ paddingTop: topInset, paddingHorizontal: 16, paddingBottom: 48 }}>
                {chartEl(stageH - topInset)}
              </ScrollView>
            )
          ) : null}

          {/* Vertical favorites bar: collapsible, only the tools you starred, on the left edge of the chart */}
          {stageH > 0 && layout === '1' ? (
            <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, top: topInset, bottom: 36 }}>
              {favBarEl(Math.max(80, stageH - topInset - 80))}
            </View>
          ) : null}

          {/* Header and top bar: full width, same colour as the chart, so top and chart read as one surface */}
          <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <View
              pointerEvents="box-none"
              onLayout={(e) => setTopInset(e.nativeEvent.layout.y + e.nativeEvent.layout.height + 10)}
              style={{ backgroundColor: c.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}
            >
              <Row style={{ justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                <Row gap={12} style={{ flexShrink: 1 }}>
                  <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Back"><Icon name="chevron-left" size={22} /></Pressable>
                  <View style={{ flexShrink: 1 }}>
                    <T v="small" muted numberOfLines={1}>{a.name}</T>
                    <Row style={{ alignItems: 'flex-end', flexWrap: 'wrap' }} gap={12}>
                      <T v="h1">{sym}</T>
                      <T v="h1" mono>{fmtPrice(sym, a.price)}</T>
                      <Delta value={a.chg} size={15} style={{ marginBottom: 4 }} />
                    </Row>
                    <SessionLine always={always} />
                  </View>
                </Row>
              </Row>
              {toolbarEl}
            </View>
            {hintEl ? <View pointerEvents="none" style={{ paddingHorizontal: 16 }}>{hintEl}</View> : null}
          </View>

          {/* Alert panel, position panel, event note and alert toast, floating to the right of the favorites bar */}
          {(marker && showMarkers) || toast || pos || alertLine ? (
            <View pointerEvents="box-none" style={{ position: 'absolute', left: 60, right: 16, bottom: 40, gap: 8 }}>
              {marker && showMarkers ? (
                <Card ai>
                  <Row style={{ justifyContent: 'space-between' }}><Row><AITag label="What moved price here" /></Row><Pressable onPress={() => setMarker(null)} hitSlop={10}><Icon name="x" size={16} /></Pressable></Row>
                  <T v="h3" style={{ marginTop: 8 }}>{marker.title}</T>
                  <T v="small" muted>{marker.detail}</T>
                </Card>
              ) : null}
              {toast ? (
                <Row style={{ padding: 12, borderRadius: 10, borderWidth: 2, borderColor: c.text, backgroundColor: c.surface }}>
                  <T bold>✓</T><T v="small" style={{ flex: 1 }}>{toast}</T>
                  <Button small variant="ghost" label="View alerts" onPress={() => navigation.navigate('Main', { tab: 'alerts', ts: Date.now() })} />
                </Row>
              ) : null}
              {alertPanelEl}
              {pos && money ? (
                <Card pad={12} style={{ gap: 10 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <T v="h3">{pos.dir === 'Long' ? 'Buy' : 'Sell'} {sym}</T>
                    <T v="caption" mono muted>Entry {fmtPrice(sym, pos.entry)} · {stamp(pos.time)}</T>
                  </Row>
                  <Row style={{ alignItems: 'flex-start', flexWrap: 'wrap' }} gap={12}>
                    <Field label={`Size (${sizeUnit(a)})`} value={String(pos.size)} onChangeText={(v) => onPosition({ size: v })} keyboardType="decimal-pad" style={{ flexGrow: 0, flexBasis: 110 }} />
                    <Stat label="You risk" style={{ minWidth: 80 }}><T v="h3" mono style={{ color: c.red }}>−{usd(money.risk)}</T><T v="caption" muted>{money.riskPct.toFixed(2)}% of {usd(riskBase)}</T></Stat>
                    <Stat label="You could make" style={{ minWidth: 80 }}><T v="h3" mono style={{ color: c.green }}>+{usd(money.reward)}</T><T v="caption" muted>{money.rr.toFixed(2)} : 1</T></Stat>
                  </Row>
                  {money.riskPct > settings.maxRisk + 0.0001 ? <T v="caption" bold>⚠ {money.riskPct.toFixed(2)}% is above your {settings.maxRisk}% per-trade limit.</T> : null}
                  <Row style={{ justifyContent: 'flex-end' }}>
                    <Button small variant="ghost" label="Cancel" onPress={() => setPos(null)} />
                    <Button small icon="arrow-right" label="Continue" disabled={!(money.size > 0)} onPress={continueTrade} />
                  </Row>
                </Card>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* Bottom action bar: 100% width, sits directly above the app navigation bar */}
        {actionsEl(false)}
      </View>

      {!full ? toolsSheet : null}
      {!full ? settingsSheet : null}
      {!full ? alertSheet : null}

      <Sheet visible={tradePrompt} onClose={() => setTradePrompt(false)} title={`Trade ${sym}`} footer={
        <Button variant="secondary" label="Cancel" onPress={() => setTradePrompt(false)} />
      }>
        <T v="small" muted>Pick a direction, then drag the stop loss or take profit lines.</T>
        <Row gap={10}>
          <Button style={{ flex: 1 }} icon="trending-up" label="Buy" onPress={() => chooseTradeDirection('Long')} />
          <Button style={{ flex: 1 }} variant="secondary" icon="trending-down" label="Sell" onPress={() => chooseTradeDirection('Short')} />
        </Row>
      </Sheet>

      {/* Chart menu: cards for everything. Chart settings and Tools open their own modal; the rest open inside this one.
          Trade entry is the last option, one full-width card at the bottom of the modal. */}
      <Sheet
        visible={secOpen}
        onClose={() => setSecOpen(false)}
        title={menuTitle}
        footer={section !== 'home' ? (
          <Row style={{ justifyContent: 'space-between' }}>
            <Button variant="ghost" icon="chevron-left" label="Back" onPress={() => setSection('home')} />
            <Button variant="secondary" label="Close" onPress={() => setSecOpen(false)} />
          </Row>
        ) : null}
      >
        {section === 'home' ? (
          <>
            <Row style={{ flexWrap: 'wrap' }} gap={10}>
              {MENU.map(([key, title, icon, sub]) => <MenuCard key={key} icon={icon} title={title} sub={sub} onPress={() => pickMenu(key)} />)}
            </Row>
            <MenuCard full icon="trending-up" title="Trade entry" sub="Buy or sell with draggable SL and TP" onPress={() => pickMenu('trade')} />
          </>
        ) : null}

        {section === 'brief' ? (<><WhyMoving sym={sym} /><AIBrief sym={sym} wide={false} /></>) : null}
        {section === 'edge' ? <MyEdge sym={sym} /> : null}
        {section === 'news' ? <NewsEvents sym={sym} /> : null}
        {section === 'corr' ? <Correlations sym={sym} /> : null}
        {section === 'sent' ? <Sentiment /> : null}
      </Sheet>

      <Modal visible={full} animationType="fade" onRequestClose={() => setFull(false)} supportedOrientations={['portrait', 'landscape']}>
        <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
          <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12, gap: 8, backgroundColor: c.bg }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Row gap={10}>
                  <T v="h2">{sym}</T>
                  <T v="h2" mono>{fmtPrice(sym, a.price)}</T>
                  <Delta value={a.chg} size={13} />
                </Row>
                <SessionLine always={always} />
              </View>
              <Pressable onPress={() => setFull(false)} hitSlop={8} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Exit full screen"><Icon name="minimize" size={20} /></Pressable>
            </Row>
            {/* Same colour as the chart: no card, so the top bar and chart are one surface */}
            <View style={{ backgroundColor: c.bg }}>
              {toolbarEl}
              {hintEl}
            </View>
            <View style={{ height: fsH }}>
              {chartEl(fsH)}
              {layout === '1' ? <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, top: 0, bottom: 36 }}>{favBarEl(Math.max(80, fsH - 80))}</View> : null}
              {alertPanelEl ? <View pointerEvents="box-none" style={{ position: 'absolute', left: 60, right: 4, bottom: 40 }}>{alertPanelEl}</View> : null}
            </View>
          </View>
          {actionsEl(true)}
          {toolsSheet}
          {alertSheet}
        </SafeAreaView>
      </Modal>
    </Frame>
  );
}

function WhyMoving({ sym }) {
  return (
    <Card ai>
      <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}><T v="h2">Why is {sym} moving?</T><AITag /></Row>
      <T v="small" muted style={{ marginBottom: 8 }}>Price is down 0.21% today, holding above your 1.1650 zone.</T>
      {DRIVERS.map((d, i) => (
        <View key={i} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border }}>
          <Row style={{ alignItems: 'flex-start' }} gap={10}>
            <T mono bold style={{ width: 16 }}>{d.dir > 0 ? '▲' : d.dir < 0 ? '▼' : '◦'}</T>
            <View style={{ flex: 1 }}>
              <T v="small" bold>{d.text}</T>
              <T v="caption" muted>{d.kind}: {d.detail}</T>
            </View>
          </Row>
        </View>
      ))}
      <Disclaimer>▼ pushes {sym} lower, ▲ higher, ◦ two-sided risk. Relationships, not predictions.</Disclaimer>
    </Card>
  );
}

const SCENARIOS = [
  { name: 'Bullish', glyph: '▲', cond: 'Holds 1.1650 zone and closes a 1H candle above 1.1680.', evidence: 'Two volume-backed defences of 1.1650; higher low on 4H.', inval: '1H close below 1.1645.', risk: 'Hot US CPI at 14:30 could override technicals.' },
  { name: 'Bearish', glyph: '▼', cond: 'Breaks and accepts below 1.1645 after CPI.', evidence: 'DXY trending up; widening 2Y spread.', inval: 'Reclaim of 1.1665 after the break.', risk: 'ECB tone on Thursday could reverse a USD-driven move.' },
  { name: 'Neutral', glyph: '◦', cond: 'Range 1.1650–1.1702 holds into Thursday.', evidence: 'ATR contracting 18% ahead of two major events.', inval: 'Any 4H close outside the range.', risk: 'Event-driven spikes can sweep both edges.' },
];

function AIBrief({ sym, wide }) {
  return (
    <View style={{ gap: 12 }}>
      <Card ai>
        <Row style={{ justifyContent: 'space-between' }}><T v="h2">AI market brief</T><AITag /></Row>
        <Row style={{ flexWrap: 'wrap', marginTop: 12 }} gap={24}>
          <View><T v="caption" muted>Current structure</T><T v="h3">Ranging, testing support</T></View>
          <View><T v="caption" muted>Higher timeframe</T><T v="h3">▲ Bullish on 1D</T></View>
          <View><T v="caption" muted>Event risk</T><T v="h3">⚠ High (CPI, ECB)</T></View>
        </Row>
        <View style={{ marginTop: 16, gap: 8 }}>
          <KV k="Resistance" v="1.1702, 1.1735" mono />
          <KV k="Support" v="1.1650 (your zone), 1.1612" mono />
          <KV k="Liquidity" v="Equal lows 1.1598; Asian high 1.1688" mono />
        </View>
      </Card>
      <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={12}>
        {SCENARIOS.map((s) => (
          <Card key={s.name} style={{ flexGrow: 1, flexBasis: wide ? 0 : 280 }}>
            <T v="h3">{s.glyph} {s.name} scenario</T>
            <View style={{ gap: 8, marginTop: 10 }}>
              <KV k="Conditions" v={s.cond} />
              <KV k="Evidence" v={s.evidence} />
              <KV k="Invalidation" v={s.inval} strong />
              <KV k="Risks" v={s.risk} />
            </View>
          </Card>
        ))}
      </Row>
      <Disclaimer>Scenarios describe what would need to happen, not what will happen. Analysis for education, not financial advice.</Disclaimer>
    </View>
  );
}

function MyEdge({ sym }) {
  const [sid, setSid] = useState('lr');
  const s = strategies.find((x) => x.id === sid);
  const inMarket = s.markets.includes(sym);
  return (
    <View style={{ gap: 12 }}>
      <Row style={{ flexWrap: 'wrap' }}>{strategies.map((x) => <Chip key={x.id} label={x.name} on={sid === x.id} onPress={() => setSid(x.id)} />)}</Row>
      <Card>
        <T v="h2">Does the current setup fit {s.name}?</T>
        <View style={{ marginTop: 8 }}>
          <CheckRow status={inMarket ? 'pass' : 'fail'} label={`Market is ${inMarket ? '' : 'not '}in this strategy`} detail={s.markets.join(', ')} />
          <CheckRow status="pass" label="Inside session" detail={s.session} />
          <CheckRow status={sid === 'lr' ? 'pass' : 'warn'} label={sid === 'lr' ? 'Sweep of Asian low occurred at 07:40' : 'Range is defined but no breakout yet'} />
          <CheckRow status="warn" label="High-impact news within your no-trade window" detail="US CPI at 14:30 is outside London hours but inside 60 min of NY overlap." />
          <CheckRow status="fail" label="No confirmation candle yet" detail="Your rules require one before entry." last />
        </View>
        <T v="small" style={{ marginTop: 12 }} bold>Not yet aligned. 2 required conditions are still missing.</T>
      </Card>
    </View>
  );
}

function NewsEvents({ sym }) {
  const base = sym.split('/')[0];
  const items = news.filter((n) => n.tags.some((t) => sym.includes(t) || t === 'USD' || t === base));
  return (
    <View style={{ gap: 8 }}>
      {upcomingEvents.slice(0, 3).map((e) => (
        <Card key={e.id}><Row><Icon name="calendar" size={16} /><T v="h3" style={{ flex: 1 }}>{e.label}</T><T mono>{e.day} {e.time}</T></Row></Card>
      ))}
      {items.map((n) => (
        <Card key={n.id}>
          <T v="h3">{n.headline}</T>
          <T v="caption" muted>{n.source}, {n.time}</T>
          <T v="small" style={{ marginTop: 8 }}>✦ {n.summary}</T>
        </Card>
      ))}
    </View>
  );
}

function Correlations({ sym }) {
  const m = correlationMatrix('30D');
  const key = sym.replace('/', '');
  const idx = corrSyms.indexOf(key);
  if (idx < 0) {
    return (
      <Card>
        <T v="h2">{sym} correlations</T>
      </Card>
    );
  }
  return (
    <Card>
      <T v="h2">{corrSyms[idx]} correlations, 30 days</T>
      <View style={{ marginTop: 12, gap: 10 }}>
        {corrSyms.map((s2, j) => (j === idx ? null : (
          <Row key={s2} gap={12}>
            <T v="small" style={{ width: 80 }}>{s2}</T>
            <Bar value={Math.abs(m[idx][j])} max={1} style={{ flex: 1 }} dashed={m[idx][j] < 0} />
            <T v="small" mono style={{ width: 52, textAlign: 'right' }}>{signed(m[idx][j])}</T>
          </Row>
        )))}
      </View>
      <Disclaimer>Solid bars move together; dashed bars move opposite.</Disclaimer>
    </Card>
  );
}

function Sentiment() {
  const rows = [['Retail positioning', 'Long 62%', 62], ['Options skew (1M)', 'Mild put bias', 44], ['News tone (24h)', 'Slightly USD positive', 40], ['COT (leveraged funds)', 'Net long EUR, reducing', 58]];
  return (
    <Card>
      <T v="h2">Sentiment</T>
      <View style={{ marginTop: 12, gap: 12 }}>
        {rows.map(([k, v, n]) => (
          <View key={k}><Row style={{ justifyContent: 'space-between' }}><T v="small">{k}</T><T v="small" muted>{v}</T></Row><Bar value={n} style={{ marginTop: 6 }} /></View>
        ))}
      </View>
    </Card>
  );
}