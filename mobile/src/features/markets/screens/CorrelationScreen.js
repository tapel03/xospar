import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, Text, TextInput, Platform } from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';
import { colors as c, mono } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, AITag, Badge, Button, Bar, Icon, Disclaimer, signed, useLayout } from '../../../components/ui';
import { corrSyms, corrPeriods, correlationMatrix } from '../data/correlation';

const LABELS = { '1D': '1 day', '7D': '7 days', '30D': '30 days', '90D': '90 days', '1Y': '1 year' };
const GREEN_BG = 'rgba(68,214,129,0.24)';
const RED_BG = 'rgba(255,95,109,0.24)';
const CELL = 74;
const HEAD = 78;
const ROW_H = 42;

const strength = (v) => { const a = Math.abs(v); return a >= 0.7 ? 'Strong' : a >= 0.4 ? 'Moderate' : a >= 0.2 ? 'Weak' : 'No meaningful'; };
const pct1 = (v) => `${(v * 100).toFixed(1)}%`; // 73.5%, -80.2%
const pct = (v) => Math.round(v * 100);
const fmtPct = (v) => signed(pct(v), 0, '%');
// Accepts "-70", "−70", " 70 " and ignores stray characters. Empty or invalid input means "no limit".
const parseNum = (s) => {
  const t = String(s == null ? '' : s).replace(/\u2212/g, '-').replace(/[^0-9.\-]/g, '');
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : n;
};
// iOS has a keyboard with a minus sign for numbers; Android's decimal pad does not, so fall back to the default keyboard.
const NUM_KB = Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default';
const DEFAULT_COLS = ['AUDCAD', 'AUDJPY', 'AUDNZD', 'EURAUD', 'EURJPY', 'EURUSD', 'GBPJPY', 'GBPUSD', 'USDCAD', 'USDJPY'];

const TAKEAWAYS = {
  'EURUSD|DXY': 'EURUSD is close to a mirror of the dollar index; a long EURUSD and a short DXY are almost the same trade.',
  'XAUUSD|DXY': 'Gold tends to soften when the dollar strengthens, but the link is only moderate.',
  'XAUUSD|SILVER': 'Gold and silver usually move together; holding both in the same direction doubles up on one metals view.',
  'AUDUSD|NZDUSD': 'The Aussie and Kiwi are close cousins; both trade on risk appetite and Asia-Pacific data.',
  'EURUSD|GBPUSD': 'Both are USD-quoted majors, so a USD move pushes them the same way.',
  'USDJPY|JPYX': 'JPYX is the yen index; USDJPY moves against it almost one for one.',
};

function PairSpark({ i, j, v }) {
  const pts = useMemo(() => {
    let a = 50; let b = 50; let s = (i * 31 + j * 17) % 97; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    return Array.from({ length: 40 }, () => { const k = r() - 0.5; a += k * 6; b += (k * v + (r() - 0.5) * (1 - Math.abs(v))) * 6; return [a, b]; });
  }, [i, j, v]);
  const all = pts.flat(); const mn = Math.min(...all); const mx = Math.max(...all); const W = 280; const H = 90;
  const y = (q) => 6 + ((mx - q) / (mx - mn || 1)) * (H - 12); const x = (k) => (k / 39) * W;
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke={c.border} />
      <Polyline points={pts.map((p, k) => `${x(k)},${y(p[0])}`).join(' ')} fill="none" stroke={c.text} strokeWidth={2} />
      <Polyline points={pts.map((p, k) => `${x(k)},${y(p[1])}`).join(' ')} fill="none" stroke={c.muted} strokeWidth={1.5} strokeDasharray="4 3" />
    </Svg>
  );
}

/** A panel with a grey title bar, like the reference. */
function Panel({ title, right, children, style }) {
  return (
    <Card pad={0} style={[{ marginBottom: 16 }, style]}>
      <Row style={{ justifyContent: 'space-between', paddingHorizontal: 14, minHeight: 46, backgroundColor: c.elevated, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <T v="h3" style={{ flex: 1 }}>{title}</T>
        {right}
      </Row>
      <View style={{ padding: 14, gap: 12 }}>{children}</View>
    </Card>
  );
}

function Check({ label, on, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: 102, minHeight: 34 }}>
      <View style={{ width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: on ? c.green : c.borderStrong, backgroundColor: on ? c.green : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="check" size={12} color={c.black} /> : null}
      </View>
      <Text style={{ color: c.text, fontSize: 12, fontFamily: mono }} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function PctInput({ label, value, onChange, placeholder }) {
  return (
    <Row gap={10}>
      <T v="small" style={{ width: 190 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'stretch', height: 38, borderRadius: 8, borderWidth: 1, borderColor: c.borderStrong, overflow: 'hidden', backgroundColor: c.elevated }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType={NUM_KB}
          placeholder={placeholder}
          placeholderTextColor={c.faint}
          accessibilityLabel={label}
          style={{ width: 72, paddingHorizontal: 10, color: c.text, fontSize: 14 }}
        />
        <View style={{ width: 32, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: c.borderStrong, backgroundColor: c.elevated2 }}>
          <T v="small" muted>%</T>
        </View>
      </View>
    </Row>
  );
}

export default function CorrelationScreen({ go }) {
  const [period, setPeriod] = useState('1D');
  const [tfOpen, setTfOpen] = useState(false);
  const [sel, setSel] = useState([corrSyms.indexOf('AUDCAD'), corrSyms.indexOf('AUDJPY')]);
  const [focus, setFocus] = useState(null);
  const [cols, setCols] = useState(DEFAULT_COLS.map((s) => corrSyms.indexOf(s)).filter((k) => k >= 0));
  const [rows, setRows] = useState(corrSyms.map((_, k) => k));
  const [picker, setPicker] = useState(false);
  // Filter boxes start with the same values as the reference. Empty = no limit on that side.
  const [loIn, setLoIn] = useState('-70');
  const [hiIn, setHiIn] = useState('70');
  const { wide } = useLayout();

  const all = useMemo(() => Object.fromEntries(corrPeriods.map((p) => [p, correlationMatrix(p)])), []);
  const m = all[period];
  const [i, j] = sel; const v = m[i][j]; const a = corrSyms[i]; const b = corrSyms[j];
  const take = TAKEAWAYS[`${a}|${b}`] || TAKEAWAYS[`${b}|${a}`] || `${strength(v)} ${v >= 0 ? 'positive' : 'negative'} relationship over ${LABELS[period]}. ${Math.abs(v) >= 0.6 ? 'Holding both in the same direction concentrates risk.' : 'Treat as mostly independent positions.'}`;

  const lo = parseNum(loIn); const hi = parseNum(hiIn);
  const filterActive = lo != null || hi != null;
  // Compare on the one-decimal percent the table shows.
  const p1 = (val) => Math.round(val * 1000) / 10;
  const isLow = (val) => lo != null && p1(val) < lo;
  const isHigh = (val) => hi != null && p1(val) > hi;

  const colIdx = [...cols].sort((x, y) => x - y);
  const rowIdx = [...rows].sort((x, y) => x - y);
  const toggle = (list, setList, k) => setList(list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);

  const matchCount = useMemo(() => {
    if (!filterActive) return 0;
    let n = 0;
    rowIdx.forEach((r) => colIdx.forEach((k) => { if (k !== r && (isLow(m[r][k]) || isHigh(m[r][k]))) n += 1; }));
    return n;
  }, [filterActive, lo, hi, m, cols, rows]);

  const pick = (r, k) => { setSel([r, k]); setFocus(null); };

  /* ---------- Correlation Filter ---------- */
  const filterPanel = (
    <Panel title="Correlation Filter">
      <T v="small" style={{ lineHeight: 20 }}>Type in the correlation criteria to find the least and/or most correlated forex currencies in real time.</T>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 14, alignItems: wide ? 'flex-start' : 'stretch', justifyContent: 'space-between', marginTop: 4 }}>
        <View style={{ gap: 10 }}>
          <PctInput label="Find currencies with correlation lower than:" value={loIn} onChange={setLoIn} placeholder="-70" />
          <PctInput label="Find currencies with correlation higher than:" value={hiIn} onChange={setHiIn} placeholder="70" />
        </View>
        <Row gap={10} style={{ alignItems: 'flex-start' }}>
          <T v="small" style={{ marginTop: 10 }}>Timeframe:</T>
          <View style={{ width: 170 }}>
            <Pressable onPress={() => setTfOpen(!tfOpen)} accessibilityRole="button" accessibilityLabel="Timeframe"
              style={{ height: 38, borderRadius: 8, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T v="small">{LABELS[period]}</T>
              <Icon name={tfOpen ? 'chevron-up' : 'chevron-down'} size={14} color={c.muted} />
            </Pressable>
            {tfOpen ? (
              <View style={{ marginTop: 4, borderRadius: 8, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, overflow: 'hidden' }}>
                {corrPeriods.map((p, n) => (
                  <Pressable key={p} onPress={() => { setPeriod(p); setTfOpen(false); }} style={({ pressed }) => [{ minHeight: 38, paddingHorizontal: 12, justifyContent: 'center', borderTopWidth: n ? 1 : 0, borderTopColor: c.border, backgroundColor: p === period ? c.elevated2 : 'transparent' }, pressed && { opacity: 0.7 }]}>
                    <T v="small" bold={p === period}>{LABELS[p]}</T>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </Row>
      </View>
      <T v="label" muted>{filterActive ? `${matchCount} matching cell${matchCount === 1 ? '' : 's'} · green above ${hi != null ? `${hi}%` : 'no limit'}, red below ${lo != null ? `${lo}%` : 'no limit'}` : 'Enter a number to highlight matching cells.'}</T>
    </Panel>
  );

  /* ---------- Symbol picker (opened from the sliders icon) ---------- */
  const pickerEl = picker ? (
    <View style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, gap: 10 }}>
      <T v="label" style={{ textAlign: 'center' }}>Column Symbols</T>
      <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }} gap={0}>
        {corrSyms.map((s2, k) => <Check key={s2} label={s2} on={cols.includes(k)} onPress={() => toggle(cols, setCols, k)} />)}
      </Row>
      <T v="label" style={{ textAlign: 'center', marginTop: 6 }}>Row Symbols</T>
      <Row style={{ justifyContent: 'center' }} gap={8}>
        <Button small variant="secondary" label="Show all" onPress={() => setRows(corrSyms.map((_, k) => k))} />
        <Button small variant="secondary" label="Hide all" onPress={() => setRows([])} />
      </Row>
      <Row style={{ flexWrap: 'wrap', justifyContent: 'center' }} gap={0}>
        {corrSyms.map((s2, k) => <Check key={s2} label={s2} on={rows.includes(k)} onPress={() => toggle(rows, setRows, k)} />)}
      </Row>
    </View>
  ) : null;

  /* ---------- Table ---------- */
  const table = (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <View>
        <Row gap={0} style={{ borderBottomWidth: 1, borderBottomColor: c.border }}>
          <View style={{ width: HEAD, height: 38, justifyContent: 'center', paddingLeft: 10 }}><T v="caption" muted style={{ textDecorationLine: 'underline' }}>Currency</T></View>
          {colIdx.map((k) => (
            <Pressable key={k} onPress={() => setFocus(k)} style={{ width: CELL, height: 38, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={`Top correlations for ${corrSyms[k]}`}>
              <Text numberOfLines={1} style={{ color: focus === k ? c.white : c.text, fontSize: 11, fontWeight: '700', textDecorationLine: 'underline' }}>{corrSyms[k]}</Text>
            </Pressable>
          ))}
        </Row>
        <ScrollView style={{ maxHeight: 520 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {rowIdx.map((r) => (
            <Row key={r} gap={0} style={{ borderTopWidth: 1, borderTopColor: c.border }}>
              <Pressable onPress={() => setFocus(r)} style={{ width: HEAD, height: ROW_H, justifyContent: 'center', paddingLeft: 10 }} accessibilityLabel={`Top correlations for ${corrSyms[r]}`}>
                <Text numberOfLines={1} style={{ color: focus === r ? c.white : c.text, fontSize: 11, fontWeight: '700' }}>{corrSyms[r]}</Text>
              </Pressable>
              {colIdx.map((k) => {
                const val = m[r][k]; const diag = r === k;
                const on = (r === i && k === j) || (r === j && k === i);
                const bg = diag && !filterActive ? 'transparent' : isHigh(val) ? GREEN_BG : isLow(val) ? RED_BG : 'transparent';
                return (
                  <Pressable key={k} onPress={() => pick(r, k)} accessibilityLabel={`${corrSyms[r]} and ${corrSyms[k]}, ${pct1(val)}`}
                    style={{ width: CELL, height: ROW_H, alignItems: 'center', justifyContent: 'center', backgroundColor: bg, borderWidth: on ? 2 : 0, borderColor: c.white }}>
                    <Text style={{ color: c.text, fontSize: 12, fontFamily: mono }}>{pct1(val)}</Text>
                  </Pressable>
                );
              })}
            </Row>
          ))}
        </ScrollView>
        {rowIdx.length === 0 ? <T v="small" muted style={{ padding: 14 }}>No rows selected. Open the settings icon and choose Show all.</T> : null}
        {colIdx.length === 0 ? <T v="small" muted style={{ padding: 14 }}>No columns selected. Open the settings icon and tick some column symbols.</T> : null}
      </View>
    </ScrollView>
  );

  const tablePanel = (
    <Panel
      title="Forex Correlation"
      right={<Pressable onPress={() => setPicker(!picker)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Choose symbols" style={{ width: 40, height: 36, alignItems: 'center', justifyContent: 'center' }}><Icon name="sliders" size={18} color={picker ? c.green : c.text} /></Pressable>}
    >
      {pickerEl}
      <View style={{ marginHorizontal: -14 }}>{table}</View>
    </Panel>
  );

  /* ---------- Selected pair and top correlations ---------- */
  const compare = useMemo(() => corrSyms
    .map((s2, k) => ({ k, s2, val: m[i][k] }))
    .filter((x) => x.k !== i && x.k !== j)
    .sort((x, y) => Math.abs(y.val) - Math.abs(x.val))
    .slice(0, 4), [m, i, j]);

  const inspect = (
    <Card style={{ gap: 12, flex: wide ? 1 : undefined, minWidth: wide ? 300 : undefined }}>
      <T v="caption" muted>Selected pair · {LABELS[period]}</T>
      <T v="h2">{a} ↔ {b}</T>
      <Row style={{ alignItems: 'flex-end' }} gap={12}><T v="display" mono>{pct1(v)}</T><Badge kind={Math.abs(v) >= 0.7 ? 'solid' : 'neutral'} label={`${strength(v)} ${v >= 0 ? 'positive' : 'negative'}`} /></Row>
      <PairSpark i={i} j={j} v={v} />
      <Row gap={16}><Row gap={6}><View style={{ width: 16, height: 2, backgroundColor: c.text }} /><T v="caption">{a}</T></Row><Row gap={6}><View style={{ width: 16, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: c.muted }} /><T v="caption" muted>{b}</T></Row></Row>

      <T v="label" style={{ marginTop: 4 }}>Historical correlation</T>
      {corrPeriods.map((p) => {
        const pv = all[p][i][j];
        return (
          <Pressable key={p} onPress={() => setPeriod(p)}>
            <Row gap={10}>
              <T v="small" mono bold={p === period} style={{ width: 32 }}>{p}</T>
              <Bar value={Math.abs(pv)} max={1} dashed={pv < 0} style={{ flex: 1 }} />
              <T v="small" mono bold={p === period} style={{ width: 62, textAlign: 'right' }}>{pct1(pv)}</T>
            </Row>
          </Pressable>
        );
      })}

      <T v="label" style={{ marginTop: 4 }}>Compare with other {a} correlations</T>
      {compare.map((x) => (
        <Pressable key={x.k} onPress={() => pick(i, x.k)}>
          <Row gap={10}>
            <T v="small" style={{ width: 72 }}>{x.s2}</T>
            <Bar value={Math.abs(x.val)} max={1} dashed={x.val < 0} style={{ flex: 1 }} />
            <T v="small" mono style={{ width: 62, textAlign: 'right' }}>{pct1(x.val)}</T>
          </Row>
        </Pressable>
      ))}

      <Card ai pad={12}><Row gap={8} style={{ marginBottom: 6 }}><AITag /><T v="label">Takeaway</T></Row><T v="small">{take}</T></Card>
    </Card>
  );

  const focusCard = focus != null ? (() => {
    const ranked = corrSyms.map((s2, k) => ({ k, s2, val: m[focus][k] })).filter((x) => x.k !== focus);
    const pos = [...ranked].sort((x, y) => y.val - x.val).slice(0, 5);
    const neg = [...ranked].sort((x, y) => x.val - y.val).slice(0, 5);
    const list = (title, items) => (
      <View style={{ gap: 6 }}>
        <T v="label">{title}</T>
        {items.map((x) => (
          <Pressable key={x.k} onPress={() => pick(focus, x.k)}>
            <Row gap={10}>
              <T v="small" style={{ width: 72 }}>{x.s2}</T>
              <Bar value={Math.abs(x.val)} max={1} dashed={x.val < 0} style={{ flex: 1 }} />
              <T v="small" mono style={{ width: 62, textAlign: 'right' }}>{pct1(x.val)}</T>
            </Row>
          </Pressable>
        ))}
      </View>
    );
    return (
      <Card style={{ gap: 12, flex: wide ? 1 : undefined, minWidth: wide ? 300 : undefined }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View><T v="caption" muted>Top correlations · {LABELS[period]}</T><T v="h2">{corrSyms[focus]}</T></View>
          <Pressable onPress={() => setFocus(null)} hitSlop={10} accessibilityLabel="Close"><Icon name="x" size={16} /></Pressable>
        </Row>
        {list('Most positively correlated', pos)}
        {list('Most negatively correlated', neg)}
      </Card>
    );
  })() : null;

  return (
    <Screen>
      <PageTitle title="Correlation matrix" onBack={go ? () => go('analytics') : undefined} />
      {filterPanel}
      {tablePanel}
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        {inspect}
        {focusCard}
      </View>
      <Disclaimer>Correlations describe past co-movement and change over time. They are not a forecast. Values in this prototype are simulated.</Disclaimer>
    </Screen>
  );
}