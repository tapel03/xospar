import React, { useMemo, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c, mono, getMode } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Grid, Badge, Button, Stat, Icon, Empty, money, useLayout, s as ui } from '../../../components/ui';
import { KV, ImpactBadge } from '../../../components/domain';
import CalendarFilterSheet from '../components/CalendarFilterSheet';
import { DEFAULT_FILTER, EXTRA_EVENTS, applyFilter, countActive, metaOf } from '../data/eventMeta';
import { upcomingEvents } from '../../../mocks/mock';
import { useStore } from '../../../app/store';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EVENT_DAYS = { 3: 'US NFP', 10: 'US CPI', 16: 'FOMC', 17: 'FOMC', 24: 'SA CPI' };

function rng(seed) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

/** Simulated trading days for any month. Future days are empty. Replace with journal data in production. */
function buildMonth(year, month, t0) {
  const r = rng(year * 100 + month + 7);
  const count = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let d = 1; d <= count; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    const event = EVENT_DAYS[d] || null;
    const isToday = date.getTime() === t0.getTime();
    if (dow === 0 || dow === 6) { out.push({ d, dow, weekend: true, isToday }); continue; }
    if (date > t0) { out.push({ d, dow, trades: 0, pnl: 0, future: true, event, isToday }); continue; }
    const trades = Math.floor(r() * 3);
    const pnl = trades ? Math.round((r() - 0.38) * 900) : 0;
    out.push({
      d, dow, trades, pnl, event, isToday,
      winRate: !trades ? null : trades === 1 ? (pnl > 0 ? 100 : 0) : pnl > 0 ? (r() < 0.5 ? 100 : 50) : (r() < 0.5 ? 0 : 50),
      adherence: trades ? 50 + Math.round(r() * 50) : null,
    });
  }
  return out;
}

const EVENT_INFO = {
  e0: { about: 'Monthly US retail sales track consumer spending, the largest part of the US economy. A beat tends to lift the dollar.', affects: ['USD pairs', 'US500'] },
  e1: { about: 'The monthly US consumer price index measures how fast prices for goods and services are rising. It is the main input for rate-cut expectations.', affects: ['EUR/USD', 'XAU/USD', 'US500', 'USD/JPY'] },
  e2: { about: 'The Fed Chair speaks on the economy and interest rates. Tone matters more than the numbers, and spreads can widen with little warning.', affects: ['USD pairs', 'XAU/USD'] },
  e3: { about: 'The European Central Bank announces its interest rate decision and holds a press conference. Markets price a hold, so tone is the swing factor.', affects: ['EUR/USD', 'GER40'] },
  e4: { about: 'The final estimate of UK economic growth for the second quarter. Revisions can move the pound.', affects: ['GBP/USD'] },
  e5: { about: 'JPMorgan reports earnings before the market opens. Bank results shape the credit outlook for US indices.', affects: ['US500', 'Financials'] },
  e6: { about: 'OPEC+ ministers meet to decide oil output. Cuts or increases move crude and oil-linked currencies.', affects: ['WTI', 'USD/CAD'] },
};
const toMin = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(t); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
const hm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

/** One economic event. Compact by default; tap to see what it is about. */
function EventItem({ e }) {
  const [open, setOpen] = useState(false);
  const info = EVENT_INFO[e.id] || { about: 'Scheduled market event.', affects: [e.tag] };
  const meta = metaOf(e);
  const mins = toMin(e.time);
  const win = e.impact === 'High' && mins != null ? [mins - 60, mins + 60] : null;
  return (
    <Card pad={12} onPress={() => setOpen(!open)} style={{ marginBottom: 8 }}>
      <Row gap={12}>
        <View style={{ width: 54 }}>
          <T v="caption" muted>{e.day}</T>
          <T mono bold>{e.time}</T>
        </View>
        <View style={{ flex: 1 }}>
          <T v="h3" numberOfLines={open ? undefined : 1}>{e.label}</T>
          <T v="caption" muted numberOfLines={1}>{e.tag} · {meta.type}{e.note ? `, ${e.note}` : ''}</T>
        </View>
        <ImpactBadge impact={e.impact} />
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={c.muted} />
      </Row>
      {open ? (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border, gap: 8 }}>
          <T v="small">{info.about}</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>{info.affects.map((a) => <Badge key={a} label={a} />)}</Row>
          {win ? (
            <Row style={{ padding: 10, borderRadius: 10, borderWidth: 2, borderColor: c.text, alignItems: 'flex-start' }} gap={8}>
              <Icon name="alert-triangle" size={14} />
              <T v="caption" style={{ flex: 1 }}>No-trade window {hm(win[0])} to {hm(win[1])}: your rules avoid entries within 60 minutes of {e.label}.</T>
            </Row>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

export default function CalendarScreen() {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { settings, setSetting } = useStore();
  const t0 = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const [cur, setCur] = useState({ y: t0.getFullYear(), m: t0.getMonth() });
  const [sel, setSel] = useState(t0.getDate());
  const [filterOpen, setFilterOpen] = useState(false);
  const light = getMode() === 'light';

  const filter = settings.calFilter || DEFAULT_FILTER;
  const allEvents = useMemo(() => [...EXTRA_EVENTS, ...upcomingEvents], []);
  const shown = useMemo(() => applyFilter(allEvents, filter), [allEvents, filter]);
  const activeFilters = countActive(filter);

  const days = useMemo(() => buildMonth(cur.y, cur.m, t0), [cur, t0]);
  const traded = days.filter((d) => d.trades);
  const isThisMonth = cur.y === t0.getFullYear() && cur.m === t0.getMonth();
  const defaultSel = isThisMonth ? t0.getDate() : (traded.length ? traded[traded.length - 1].d : 1);
  const selected = sel != null && days.some((x) => x.d === sel) ? sel : defaultSel;
  const day = days.find((d) => d.d === selected);

  const maxAbs = Math.max(...days.map((d) => Math.abs(d.pnl || 0)), 1);
  const offset = (new Date(cur.y, cur.m, 1).getDay() + 6) % 7; // Monday first
  const cells = [...Array(offset).fill(null), ...days];
  while (cells.length % 7) cells.push(null);
  const total = traded.reduce((s1, d) => s1 + d.pnl, 0);
  const green = traded.filter((d) => d.pnl > 0).length;

  const shift = (delta) => {
    const d = new Date(cur.y, cur.m + delta, 1);
    setCur({ y: d.getFullYear(), m: d.getMonth() });
    setSel(null);
  };

  return (
    <Screen>
      <PageTitle title="Calendar" kicker={`${MONTHS[cur.m]} ${cur.y}`} right={<Button small variant="secondary" icon="file-text" label="Monthly review" onPress={() => nav.navigate('Review', { period: 'Month' })} />} />

      <Grid style={{ marginBottom: 16 }}>
        <Card style={{ flexGrow: 1, flexBasis: 140 }}><Stat label="Month P&L" value={money(total)} /></Card>
        <Card style={{ flexGrow: 1, flexBasis: 140 }}><Stat label="Trading days" value={`${traded.length}`} /></Card>
        <Card style={{ flexGrow: 1, flexBasis: 140 }}><Stat label="Positive days" value={`${green} of ${traded.length}`} /></Card>
      </Grid>

      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <Card style={{ flex: wide ? 2 : undefined, width: wide ? undefined : '100%' }} pad={12}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <Pressable onPress={() => shift(-1)} style={ui.iconBtn} accessibilityLabel="Previous month"><Icon name="chevron-left" size={18} /></Pressable>
            <T v="h3">{MONTHS[cur.m]} {cur.y}</T>
            <Pressable onPress={() => shift(1)} style={ui.iconBtn} accessibilityLabel="Next month"><Icon name="chevron-right" size={18} /></Pressable>
          </Row>
          <Row gap={0}>{DOW.map((d) => <View key={d} style={{ flex: 1, alignItems: 'center', paddingBottom: 8 }}><T v="caption" muted>{d}</T></View>)}</Row>
          {Array.from({ length: cells.length / 7 }, (_, w) => (
            <Row key={w} gap={0}>
              {cells.slice(w * 7, w * 7 + 7).map((d, k) => {
                if (!d) return <View key={k} style={{ flex: 1, aspectRatio: wide ? 1.15 : 0.8, padding: 2 }} />;
                const inten = d.trades ? Math.abs(d.pnl) / maxAbs : 0; const on = d.d === selected;
                // Dark mode: busier days get lighter. Light mode: busier days get darker.
                const g = Math.round(light ? 243 - inten * 205 : 17 + inten * 200); const hex = g.toString(16).padStart(2, '0');
                const bright = inten > 0.4;
                return (
                  <Pressable key={k} onPress={() => setSel(d.d)} style={{ flex: 1, aspectRatio: wide ? 1.15 : 0.8, padding: 2, opacity: d.future ? 0.6 : 1 }} accessibilityLabel={`${d.d} ${MONTHS[cur.m]}${d.isToday ? ', today' : ''}${d.trades ? `, ${money(d.pnl)}` : ''}`}>
                    <View style={{ flex: 1, borderRadius: 8, padding: wide ? 8 : 4, justifyContent: 'space-between', backgroundColor: d.weekend ? c.bg : `#${hex}${hex}${hex}`, borderWidth: d.isToday ? 2 : on ? 2 : 1, borderColor: d.isToday ? c.green : on ? c.white : d.pnl < 0 ? c.borderStrong : c.border, borderStyle: d.pnl < 0 && !on && !d.isToday ? 'dashed' : 'solid' }}>
                      <Row style={{ justifyContent: 'space-between' }} gap={2}>
                        {d.isToday ? (
                          <View style={{ minWidth: 20, height: 20, borderRadius: 10, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 11 }}>{d.d}</Text>
                          </View>
                        ) : (
                          <T v="caption" style={{ color: bright ? c.black : d.weekend ? c.faint : c.text, fontWeight: '600' }}>{d.d}</T>
                        )}
                        {d.event ? <Text style={{ fontSize: 10, color: bright ? c.black : c.text }}>◆</Text> : null}
                      </Row>
                      {d.trades ? (
                        <View>
                          <Text style={{ fontFamily: mono, fontSize: wide ? 12 : 9, color: bright ? c.black : c.text, fontWeight: d.pnl >= 0 ? '700' : '400' }} numberOfLines={1}>{d.pnl >= 0 ? '▲' : '▼'}{wide ? ` ${Math.abs(d.pnl)}` : ''}</Text>
                          {wide ? <Text style={{ fontSize: 10, color: bright ? c.black : c.text, opacity: 0.85 }}>{d.trades} trade{d.trades > 1 ? 's' : ''} · {d.adherence}%</Text> : null}
                        </View>
                      ) : d.isToday ? (
                        <Text style={{ fontSize: wide ? 10 : 8, color: c.green, fontWeight: '700' }}>TODAY</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </Row>
          ))}
        </Card>

        <Card style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', gap: 10 }}>
          <T v="caption" muted>{day ? `${DOW[(day.dow + 6) % 7]} ${day.d} ${MONTHS[cur.m]}${day.isToday ? ' · Today' : ''}` : ''}</T>
          {!day || day.weekend ? <T v="small" muted>Weekend. Markets closed.</T> : day.future ? (
            <><T v="h2">Upcoming</T><T v="small" muted>{day.event ? `${day.event} is scheduled for this day.` : 'Nothing logged yet.'}</T></>
          ) : !day.trades ? (
            <><T v="h2">{day.isToday ? 'No trades yet today' : 'No trades'}</T><T v="small" muted>{day.event ? `${day.event} day. Staying flat around high-impact data is a valid decision.` : 'Flat days count toward consistency.'}</T></>
          ) : (
            <>
              <T v="h1" mono>{money(day.pnl)}</T>
              <KV k="Trades" v={`${day.trades}`} mono />
              <KV k="Win rate" v={`${day.winRate}%`} mono />
              <KV k="Adherence" v={`${day.adherence}%`} mono strong={day.adherence < 70} />
              <KV k="Event" v={day.event || '—'} />
              {day.adherence < 70 ? <Badge kind="warn" label="Below your adherence target" /> : <Badge kind="pass" label="Followed your edge" />}
              <Button small variant="secondary" icon="book-open" label="Open in journal" onPress={() => nav.navigate('Main', { tab: 'journal', ts: Date.now() })} style={{ marginTop: 6 }} />
            </>
          )}
        </Card>
      </View>

      <Row style={{ justifyContent: 'space-between', marginTop: 24, marginBottom: 6 }}>
        <T v="h2">Economic events</T>
        <Row gap={6}>
          {activeFilters ? <Button small variant="ghost" icon="x" label="Reset" onPress={() => setSetting('calFilter', DEFAULT_FILTER)} /> : null}
          <Button small variant="secondary" icon="filter" label={activeFilters ? `Filter · ${activeFilters}` : 'Filter'} onPress={() => setFilterOpen(true)} />
        </Row>
      </Row>
      <T v="caption" muted style={{ marginBottom: 10 }}>{filter.view} · showing {shown.length} of {allEvents.length} events</T>

      {shown.length === 0 ? (
        <Empty icon="calendar" title="No events match this filter" body="Try a different view, or include more impact levels, event types or currencies." action="Reset filter" onAction={() => setSetting('calFilter', DEFAULT_FILTER)} />
      ) : shown.map((e) => <EventItem key={e.id} e={e} />)}

      <CalendarFilterSheet visible={filterOpen} onClose={() => setFilterOpen(false)} value={filter} onApply={(f) => setSetting('calFilter', f)} />
    </Screen>
  );
}