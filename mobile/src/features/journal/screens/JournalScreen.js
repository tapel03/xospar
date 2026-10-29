import React, { useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Grid, Metric, Segmented, Button, Empty, Row, Icon, Stat, money, signed, useLayout, s as ui } from '../../../components/ui';
import { TradeRow, EdgeBadge, ReviewBadge, DirBadge } from '../../../components/domain';
import ExportSheet from '../../../components/sheet/ExportSheet';
import JournalFilterSheet, { DEFAULT_JOURNAL_FILTER, applyJournalFilter, countActiveJournal } from '../components/JournalFilterSheet';
import { fmtPrice, assetBy } from '../../../mocks/mock';
import { useStore } from '../../../app/store';

const COLS = [['Date', 112], ['Asset', 88], ['Direction', 92], ['Strategy', 140], ['Entry', 84], ['Exit', 84], ['Risk', 56], ['R', 64], ['P&L', 100], ['Edge', 100], ['AI review', 110]];

/* ---------------- P&L calendar ---------------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CAL_PERIODS = ['Week', 'Month', 'Year'];
const CELL = 15; const GAP = 3; const STEP = CELL + GAP; // year heatmap cell size

const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const weekStart = (d) => addDays(d, -((d.getDay() + 6) % 7)); // Monday first
const compact = (v) => { const a = Math.abs(v); const s = a >= 1000 ? `${(a / 1000).toFixed(1)}k` : String(Math.round(a)); return `${v >= 0 ? '+' : '−'}${s}`; };
// Win days get a green border, loss days a red one. Days without trades stay plain.
const fillOf = (v) => (v > 0 ? 'rgba(68,214,129,0.12)' : v < 0 ? 'rgba(255,95,109,0.12)' : c.elevated);
const edgeOf = (v) => (v > 0 ? c.green : v < 0 ? c.red : c.border);

/** Journal trades carry dates like "01 Oct 09:42" or "Today, open". Turn them into real dates. */
function tradeDate(t, today) {
  const raw = String(t.date);
  if (raw.startsWith('Today')) return today;
  const m = /^(\d{1,2})\s+([A-Za-z]{3})/.exec(raw);
  if (!m) return today;
  const mi = MON3.findIndex((x) => x.toLowerCase() === m[2].toLowerCase());
  if (mi < 0) return today;
  let d = new Date(today.getFullYear(), mi, Number(m[1]));
  if (d > today) d = new Date(today.getFullYear() - 1, mi, Number(m[1]));
  return d;
}

function PnLCalendar({ trades, onOpen }) {
  const { wide } = useLayout();
  const today = useMemo(() => midnight(new Date()), []);
  const todayKey = keyOf(today);

  // One bucket per calendar day.
  const { byDay, latest } = useMemo(() => {
    const map = {};
    let last = null;
    trades.forEach((t) => {
      const d = tradeDate(t, today);
      const k = keyOf(d);
      const b = map[k] || (map[k] = { date: d, pnl: 0, r: 0, wins: 0, list: [] });
      b.pnl += t.pnl; b.r += t.r; if (t.pnl > 0) b.wins += 1; b.list.push(t);
      if (!last || d > last) last = d;
    });
    return { byDay: map, latest: last };
  }, [trades, today]);

  const [period, setPeriod] = useState('Month');
  const [anchor, setAnchor] = useState(() => latest || today); // opens on the most recent trade
  const [sel, setSel] = useState(null); // selected Date
  const yearScroll = useRef(null);

  const y = anchor.getFullYear(); const mo = anchor.getMonth();
  const range = useMemo(() => {
    if (period === 'Week') { const s = weekStart(anchor); return { start: s, end: addDays(s, 6) }; }
    if (period === 'Month') return { start: new Date(y, mo, 1), end: new Date(y, mo + 1, 0) };
    return { start: new Date(y, 0, 1), end: new Date(y, 11, 31) };
  }, [period, anchor]);

  const label = period === 'Week'
    ? `${range.start.getDate()} ${MON3[range.start.getMonth()]} – ${range.end.getDate()} ${MON3[range.end.getMonth()]} ${range.end.getFullYear()}`
    : period === 'Month' ? `${MONTHS[mo]} ${y}` : String(y);

  const shift = (dir) => {
    if (period === 'Week') setAnchor(addDays(anchor, 7 * dir));
    else if (period === 'Month') setAnchor(new Date(y, mo + dir, 1));
    else setAnchor(new Date(y + dir, mo, 1));
  };

  // Totals for whatever range is on screen.
  const stats = useMemo(() => {
    let pnl = 0; let count = 0; let days = 0; let green = 0; let best = null;
    for (let d = range.start; d <= range.end; d = addDays(d, 1)) {
      const b = byDay[keyOf(d)];
      if (!b) continue;
      pnl += b.pnl; count += b.list.length; days += 1; if (b.pnl > 0) green += 1;
      if (!best || b.pnl > best.pnl) best = b;
    }
    return { pnl, count, days, green, best };
  }, [range, byDay]);

  const selB = sel ? byDay[keyOf(sel)] : null;
  const selKey = sel ? keyOf(sel) : null;

  /* ---- one day cell, used by week and month views ---- */
  const DayCell = ({ d, tall }) => {
    const k = keyOf(d); const b = byDay[k];
    const on = selKey === k; const isToday = k === todayKey;
    const v = b ? b.pnl : 0;
    return (
      <Pressable
        onPress={() => setSel(on ? null : d)}
        accessibilityLabel={`${d.getDate()} ${MONTHS[d.getMonth()]}${b ? `, ${money(b.pnl)}, ${b.list.length} trade${b.list.length > 1 ? 's' : ''}` : ', no trades'}`}
        style={{ flex: 1, padding: 2, aspectRatio: tall ? 0.72 : 0.85 }}
      >
        <View style={{ flex: 1, borderRadius: 8, padding: tall ? 8 : 5, justifyContent: 'space-between', backgroundColor: fillOf(v), borderWidth: on ? 2 : 1.5, borderColor: on ? c.white : edgeOf(v) }}>
          <Row gap={4}>
            <T v="caption" bold={isToday} style={{ color: c.text }}>{d.getDate()}</T>
            {isToday ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: c.white }} /> : null}
          </Row>
          {b ? <Text numberOfLines={1} style={{ color: c.text, fontSize: tall ? 13 : 10, fontWeight: '700' }}>{compact(b.pnl)}</Text> : null}
        </View>
      </Pressable>
    );
  };

  /* ---- week view ---- */
  const weekView = (
    <View>
      <Row gap={0}>{DOW.map((x) => <View key={x} style={{ flex: 1, alignItems: 'center', paddingBottom: 6 }}><T v="caption" muted>{x}</T></View>)}</Row>
      <Row gap={0} style={{ alignItems: 'stretch' }}>
        {Array.from({ length: 7 }, (_, i) => { const d = addDays(range.start, i); return <DayCell key={i} d={d} tall />; })}
      </Row>
    </View>
  );

  /* ---- month view ---- */
  const monthView = (() => {
    const first = new Date(y, mo, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(y, mo + 1, 0).getDate();
    const cells = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(y, mo, i + 1))];
    while (cells.length % 7) cells.push(null);
    return (
      <View>
        <Row gap={0}>{DOW.map((x) => <View key={x} style={{ flex: 1, alignItems: 'center', paddingBottom: 6 }}><T v="caption" muted>{x}</T></View>)}</Row>
        {Array.from({ length: cells.length / 7 }, (_, w) => (
          <Row key={w} gap={0} style={{ alignItems: 'stretch' }}>
            {cells.slice(w * 7, w * 7 + 7).map((d, i) => (d ? <DayCell key={i} d={d} /> : <View key={i} style={{ flex: 1, aspectRatio: 0.85 }} />))}
          </Row>
        ))}
      </View>
    );
  })();

  /* ---- year view: a heatmap with one column per week ---- */
  const yearView = (() => {
    const first = weekStart(range.start);
    const weeks = Math.ceil(((range.end - first) / 86400000 + 1) / 7);
    const anchorWeek = Math.max(0, Math.floor((weekStart(anchor) - first) / (7 * 86400000)));
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 30, paddingTop: 18 }}>
          {DOW.map((x, i) => <View key={x} style={{ height: CELL, marginBottom: GAP, justifyContent: 'center' }}>{i % 2 === 0 ? <T v="caption" muted style={{ fontSize: 10 }}>{x}</T> : null}</View>)}
        </View>
        <ScrollView
          ref={yearScroll} horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}
          onContentSizeChange={() => yearScroll.current && yearScroll.current.scrollTo({ x: Math.max(0, anchorWeek * STEP - 120), animated: false })}
        >
          <View>
            <Row gap={0} style={{ height: 18, alignItems: 'flex-start' }}>
              {Array.from({ length: weeks }, (_, wk) => {
                const s = addDays(first, wk * 7);
                let name = '';
                for (let i = 0; i < 7; i++) { const d = addDays(s, i); if (d.getDate() === 1 && d.getFullYear() === y) name = MON3[d.getMonth()]; }
                return <View key={wk} style={{ width: STEP }}>{name ? <Text numberOfLines={1} style={{ color: c.muted, fontSize: 10, width: 32 }}>{name}</Text> : null}</View>;
              })}
            </Row>
            <Row gap={0} style={{ alignItems: 'flex-start' }}>
              {Array.from({ length: weeks }, (_, wk) => (
                <View key={wk} style={{ width: STEP }}>
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = addDays(first, wk * 7 + i);
                    if (d < range.start || d > range.end) return <View key={i} style={{ width: CELL, height: CELL, marginBottom: GAP }} />;
                    const k = keyOf(d); const b = byDay[k]; const on = selKey === k; const isToday = k === todayKey;
                    const v = b ? b.pnl : 0;
                    return (
                      <Pressable key={i} onPress={() => setSel(on ? null : d)} hitSlop={2}
                        accessibilityLabel={`${d.getDate()} ${MONTHS[d.getMonth()]}${b ? `, ${money(b.pnl)}` : ', no trades'}`}
                        style={{ width: CELL, height: CELL, marginBottom: GAP, borderRadius: 4, backgroundColor: fillOf(v), borderWidth: on ? 2 : b ? 1.5 : 1, borderColor: on ? c.white : edgeOf(v), alignItems: 'center', justifyContent: 'center' }}>
                        {isToday ? <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c.white }} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </Row>
          </View>
        </ScrollView>
      </View>
    );
  })();

  return (
    <Card style={{ marginBottom: 16, gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View style={{ flexShrink: 1 }}>
          <T v="h2">Calendar</T>
        </View>
        <Segmented options={CAL_PERIODS} value={period} onChange={(p) => { setPeriod(p); setSel(null); }} />
      </Row>

      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => shift(-1)} style={ui.iconBtn} accessibilityLabel={`Previous ${period.toLowerCase()}`}><Icon name="chevron-left" size={18} /></Pressable>
        <View style={{ alignItems: 'center', gap: 2 }}>
          <T v="h3">{label}</T>
          <Pressable onPress={() => { setAnchor(today); setSel(null); }} hitSlop={8}><T v="caption" muted style={{ textDecorationLine: 'underline' }}>Today</T></Pressable>
        </View>
        <Pressable onPress={() => shift(1)} style={ui.iconBtn} accessibilityLabel={`Next ${period.toLowerCase()}`}><Icon name="chevron-right" size={18} /></Pressable>
      </Row>

      <Row style={{ flexWrap: 'wrap' }} gap={16}>
        <Stat label="P&L" size="h3"><T v="h3" mono style={{ color: stats.pnl > 0 ? c.green : stats.pnl < 0 ? c.red : c.text }}>{money(stats.pnl)}</T></Stat>
        <Stat label="Trades" value={String(stats.count)} size="h3" />
        <Stat label="Trading days" value={stats.days ? `${stats.green} of ${stats.days} green` : '0'} size="h3" />
        <Stat label="Best day" value={stats.best ? money(stats.best.pnl) : '—'} size="h3" />
      </Row>

      {stats.count === 0 ? <T v="small" muted>No trades in this {period.toLowerCase()}. Use the arrows to look at another one.</T> : null}

      {period === 'Week' ? weekView : period === 'Month' ? monthView : yearView}

      {sel ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, gap: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="h3">{DOW[(sel.getDay() + 6) % 7]} {sel.getDate()} {MONTHS[sel.getMonth()]} {sel.getFullYear()}</T>
            <Pressable onPress={() => setSel(null)} hitSlop={10} accessibilityLabel="Close day"><Icon name="x" size={16} color={c.muted} /></Pressable>
          </Row>
          {selB ? (
            <>
              <Row gap={16} style={{ flexWrap: 'wrap' }}>
                <T v="h2" mono style={{ color: selB.pnl > 0 ? c.green : selB.pnl < 0 ? c.red : c.text }}>{money(selB.pnl)}</T>
                <T v="small" muted>{selB.list.length} trade{selB.list.length > 1 ? 's' : ''} · {selB.wins} win{selB.wins === 1 ? '' : 's'} · {signed(selB.r, 2, 'R')}</T>
              </Row>
              {selB.list.map((t) => (
                <Pressable key={t.id} onPress={() => onOpen(t.id)} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.border }, pressed && { opacity: 0.7 }]}>
                  <View style={{ flex: 1 }}>
                    <T v="small" bold>{t.asset} {t.dir.toLowerCase()}</T>
                    <T v="caption" muted>{t.id} · {t.strategy}</T>
                  </View>
                  <T v="small" mono bold={t.pnl > 0}>{money(t.pnl)}</T>
                  <Icon name="chevron-right" size={15} color={c.muted} />
                </Pressable>
              ))}
            </>
          ) : <T v="small" muted>No trades on this day.</T>}
        </View>
      ) : null}
    </Card>
  );
}

/* ---------------- Compare chart ---------------- */
const GROUPS = ['Trade', 'Strategy', 'Session', 'Asset', 'Direction', 'Edge'];
const EDGE_LABEL = { yes: 'On edge', partial: 'Partial', no: 'Off edge' };
const EDGE_ORDER = ['On edge', 'Partial', 'Off edge'];
const groupKey = {
  Strategy: (t) => t.strategy, Session: (t) => t.session, Asset: (t) => t.asset, Direction: (t) => t.dir, Edge: (t) => EDGE_LABEL[t.edge] || 'Off edge',
};
const H = 170; const PAD = 20;

function BarChart({ items, fmt, selected, onSelect }) {
  const vals = items.map((i) => i.value);
  const max = Math.max(0, ...vals); const min = Math.min(0, ...vals);
  const range = max - min || 1;
  const zeroY = PAD + (max / range) * H;
  const showAll = items.length <= 6;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flexDirection: 'row', flexGrow: 1 }}>
        {items.map((it) => {
          const v = it.value; const on = selected === it.key;
          const barH = Math.max(2, (Math.abs(v) / range) * H);
          const top = v >= 0 ? zeroY - barH : zeroY;
          const col = it.color;
          return (
            <Pressable key={it.key} onPress={() => onSelect(on ? null : it.key)} accessibilityLabel={`${it.label}: ${fmt(v)}`} style={{ flex: 1, minWidth: 48, alignItems: 'center' }}>
              <View style={{ width: '100%', height: H + PAD * 2 }}>
                <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: zeroY, height: 1, backgroundColor: c.borderStrong }} />
                <View style={{ position: 'absolute', left: '22%', width: '56%', top, height: barH, borderRadius: 5, backgroundColor: col, opacity: selected && !on ? 0.4 : 1, borderWidth: on ? 2 : 0, borderColor: c.white }} />
                {showAll || on ? (
                  <T v="caption" mono bold={on} style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', top: v >= 0 ? Math.max(0, top - 17) : top + barH + 2 }} numberOfLines={1}>{fmt(v)}</T>
                ) : null}
              </View>
              <T v="caption" muted={!on} bold={on} numberOfLines={1} style={{ maxWidth: '100%' }}>{it.label}</T>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function CompareCard({ trades }) {
  const [by, setBy] = useState('Strategy');
  const [metric, setMetric] = useState('P&L');
  const [sel, setSel] = useState(null);

  const closed = useMemo(() => trades.filter((t) => !String(t.date).includes('open')), [trades]);
  const metrics = by === 'Trade' ? ['P&L', 'R'] : ['P&L', 'Avg R', 'Win rate', 'Trades'];
  const m = metrics.includes(metric) ? metric : metrics[0];

  const fmt = (v) => (m === 'P&L' ? money(v) : m === 'R' || m === 'Avg R' ? signed(v, 2, 'R') : m === 'Win rate' ? `${Math.round(v)}%` : String(v));
  const tone = (v) => (m === 'Win rate' || m === 'Trades' ? c.text : v >= 0 ? c.green : c.red);

  const { items, detail } = useMemo(() => {
    if (by === 'Trade') {
      const list = [...closed].reverse();
      return {
        items: list.map((t) => { const v = m === 'P&L' ? t.pnl : t.r; return { key: t.id, label: t.id.replace('T-', ''), value: v, color: tone(v), t }; }),
        detail: (it) => {
          const t = it.t;
          return `${t.id} · ${t.asset} ${t.dir.toLowerCase()} · ${t.strategy}\n${money(t.pnl)} · ${signed(t.r, 2, 'R')} · ${EDGE_LABEL[t.edge] || 'Off edge'}`;
        },
      };
    }
    const map = {};
    closed.forEach((t) => { const k = groupKey[by](t); (map[k] = map[k] || []).push(t); });
    const rows = Object.entries(map).map(([label, ts]) => {
      const pnl = ts.reduce((a, t) => a + t.pnl, 0);
      const avgR = ts.reduce((a, t) => a + t.r, 0) / ts.length;
      const win = (ts.filter((t) => t.pnl > 0).length / ts.length) * 100;
      const v = m === 'P&L' ? pnl : m === 'Avg R' ? avgR : m === 'Win rate' ? win : ts.length;
      return { key: label, label, value: v, color: tone(v), n: ts.length, pnl, avgR, win };
    });
    if (by === 'Edge') rows.sort((a, b) => EDGE_ORDER.indexOf(a.label) - EDGE_ORDER.indexOf(b.label));
    else rows.sort((a, b) => b.value - a.value);
    return {
      items: rows,
      detail: (it) => `${it.label} · ${it.n} trade${it.n === 1 ? '' : 's'}\nWin rate ${Math.round(it.win)}% · Avg ${signed(it.avgR, 2, 'R')} · P&L ${money(it.pnl)}`,
    };
  }, [by, m, closed]);

  const picked = items.find((i) => i.key === sel);
  const pick = (k) => setSel(k);

  return (
    <Card style={{ marginBottom: 16, gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View style={{ flexShrink: 1 }}>
          <T v="h2">Compare</T>
          <T v="small" muted>Closed trades only. Tap a bar for details.</T>
        </View>
      </Row>
      <View style={{ gap: 8 }}>
        <T v="label" muted>Compare by</T>
        <Segmented scroll options={GROUPS} value={by} onChange={(v) => { setBy(v); setSel(null); }} />
        <T v="label" muted>Measure</T>
        <Segmented scroll options={metrics} value={m} onChange={(v) => { setMetric(v); setSel(null); }} />
      </View>
      {items.length === 0 ? (
        <T v="small" muted>No closed trades to compare yet.</T>
      ) : (
        <>
          <BarChart items={items} fmt={fmt} selected={sel} onSelect={pick} />
          <View style={{ minHeight: 44, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, justifyContent: 'center' }}>
            {picked ? <T v="small" mono>{detail(picked)}</T> : <T v="small" muted>Tap a bar to see the numbers behind it.</T>}
          </View>
        </>
      )}
    </Card>
  );
}

export default function JournalScreen() {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { trades } = useStore();
  const [filter, setFilter] = useState(DEFAULT_JOURNAL_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const rows = useMemo(() => applyJournalFilter(trades, filter), [trades, filter]);
  const activeFilters = countActiveJournal(filter);

  const n = trades.length; const wins = trades.filter((t) => t.pnl > 0); const losses = trades.filter((t) => t.pnl < 0);
  const avgR = trades.reduce((a, t) => a + t.r, 0) / n;
  const adherence = Math.round((trades.filter((t) => t.edge === 'yes').length / n) * 100);

  /** What gets exported: the trades currently shown (respecting the filter), plus a summary. */
  const makeDoc = () => {
    const total = rows.reduce((a, t) => a + t.pnl, 0);
    const rSum = rows.reduce((a, t) => a + t.r, 0);
    return {
      title: 'Trading journal',
      subtitle: `${activeFilters ? 'Filtered trades' : 'All trades'} · ${rows.length} trade${rows.length === 1 ? '' : 's'} · exported ${new Date().toLocaleDateString()}`,
      sections: [
        {
          heading: 'Summary',
          stats: [
            ['Trades', rows.length],
            ['Wins', rows.filter((t) => t.pnl > 0).length],
            ['Losses', rows.filter((t) => t.pnl < 0).length],
            ['Net P&L (USD)', total.toFixed(2)],
            ['Average R', rows.length ? (rSum / rows.length).toFixed(2) : '0.00'],
          ],
        },
        {
          heading: 'Trades',
          headers: ['Date', 'ID', 'Asset', 'Direction', 'Strategy', 'Setup', 'Session', 'Entry', 'Exit', 'Risk %', 'R', 'P&L (USD)', 'Edge', 'Review', 'Emotion'],
          rows: rows.map((t) => {
            const d = assetBy(t.asset).dec;
            return [t.date, t.id, t.asset, t.dir, t.strategy, t.setup, t.session, Number(t.entry).toFixed(d), Number(t.exit).toFixed(d), t.risk, t.r, t.pnl, EDGE_LABEL[t.edge] || 'Off edge', t.review, t.emotion];
          }),
        },
      ],
    };
  };

  const analyticsBtn = <Button small variant="secondary" icon="pie-chart" label="Analytics" onPress={() => nav.navigate('Main', { tab: 'analytics', ts: Date.now() })} />;
  const reviewBtn = <Button small variant="secondary" icon="calendar" label="Review" onPress={() => nav.navigate('Review')} />;
  const exportBtn = <Button small icon="download" label="Export" onPress={() => setExportOpen(true)} />;

  return (
    <Screen>
      <PageTitle
        title="Trading journal"
        style={wide ? undefined : { marginBottom: 12 }}
        right={wide ? <>{analyticsBtn}{reviewBtn}{exportBtn}</> : null}
      />
      {/* On phones the buttons sit on their own line: Analytics and Review stay left, Export goes to the far right. */}
      {!wide ? (
        <Row gap={8} style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <Row gap={8}>{analyticsBtn}{reviewBtn}</Row>
          {exportBtn}
        </Row>
      ) : null}

      <Grid style={{ marginBottom: 16 }}>
        <Metric label="Total trades" value={String(n)} sub="This month" />
        <Metric label="Win rate" value={`${Math.round((wins.length / n) * 100)}%`} sub={`${wins.length} wins, ${losses.length} losses`} />
        <Metric label="Average R" value={signed(avgR, 2, 'R')} />
        <Metric label="Average win" value={money(wins.reduce((a, t) => a + t.pnl, 0) / wins.length)} />
        <Metric label="Average loss" value={money(losses.reduce((a, t) => a + t.pnl, 0) / losses.length)} />
        <Metric label="Expectancy" value={signed(avgR, 2, 'R')} sub="per trade" />
        <Metric label="Drawdown" value="−3.2%" sub="from equity peak" />
        <Metric label="Strategy adherence" value={`${adherence}%`} sub="trades fully on edge" />
      </Grid>

      <PnLCalendar trades={trades} onOpen={(id) => nav.navigate('TradeDetail', { id })} />

      <CompareCard trades={trades} />

      <Row style={{ justifyContent: 'space-between', marginTop: 8, marginBottom: 6 }}>
        <T v="h2">Trades</T>
        <Row gap={6}>
          {activeFilters ? <Button small variant="ghost" icon="x" label="Reset" onPress={() => setFilter(DEFAULT_JOURNAL_FILTER)} /> : null}
          <Button small variant="secondary" icon="filter" label={activeFilters ? `Filter · ${activeFilters}` : 'Filter'} onPress={() => setFilterOpen(true)} />
        </Row>
      </Row>
      <T v="caption" muted style={{ marginBottom: 10 }}>Showing {rows.length} of {trades.length} trades</T>

      {rows.length === 0 ? (
        activeFilters
          ? <Empty icon="book-open" title="No trades match this filter" body="Try including more results, edge types or review states." action="Reset filter" onAction={() => setFilter(DEFAULT_JOURNAL_FILTER)} />
          : <Empty icon="book-open" title="No trades yet" body="Log a trade to start building your record." action="Add trade" onAction={() => nav.navigate('AddTrade')} />
      ) : wide ? (
        <Card pad={0}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: '100%' }}>
              <Row style={{ paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }} gap={0}>
                {COLS.map(([h, w]) => <T key={h} v="caption" muted style={{ width: w }}>{h}</T>)}
              </Row>
              {rows.map((t, i) => (
                <Pressable key={t.id} onPress={() => nav.navigate('TradeDetail', { id: t.id })} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, minHeight: 56, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}>
                  <T v="small" muted style={{ width: 112 }}>{t.date}</T>
                  <T v="h3" style={{ width: 88 }}>{t.asset}</T>
                  <View style={{ width: 92 }}><DirBadge dir={t.dir} /></View>
                  <T v="small" style={{ width: 140 }}>{t.strategy}</T>
                  <T v="small" mono style={{ width: 84 }}>{fmtPrice(t.asset, t.entry)}</T>
                  <T v="small" mono style={{ width: 84 }}>{fmtPrice(t.asset, t.exit)}</T>
                  <T v="small" mono style={{ width: 56 }}>{t.risk}%</T>
                  <T v="small" mono bold={t.r > 0} style={{ width: 64 }}>{signed(t.r, 2, 'R')}</T>
                  <T v="small" mono bold={t.pnl > 0} style={{ width: 100 }}>{t.pnl > 0 ? '▲ ' : '▼ '}{money(t.pnl)}</T>
                  <View style={{ width: 100 }}><EdgeBadge edge={t.edge} /></View>
                  <View style={{ width: 110 }}><ReviewBadge review={t.review} /></View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Card>
      ) : (
        <Card pad={0}>{rows.map((t, i) => <TradeRow key={t.id} t={t} first={i === 0} onPress={() => nav.navigate('TradeDetail', { id: t.id })} />)}</Card>
      )}

      <JournalFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onApply={setFilter} />
      <ExportSheet visible={exportOpen} onClose={() => setExportOpen(false)} title="Export journal" doc={makeDoc} fileName="edgeline-journal" />
    </Screen>
  );
}