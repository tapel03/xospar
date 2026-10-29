import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import Svg, { Polyline, Polygon, Line, Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors as c, mono } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Grid, Metric, Segmented, AITag, Button, Stat, Sheet, Chip, Icon, signed, money, useLayout } from '../../../components/ui';
import { analytics } from '../../../mocks/mock';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PERIODS = { 'Last 7 days': 6, 'Last 14 days': 11, 'Last 30 days': 21 };
const dateLabel = (offsetFromEnd) => { const d = new Date(2026, 9, 1); d.setDate(d.getDate() - offsetFromEnd); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const k = (v) => `$${(v / 1000).toFixed(1)}k`;

/* ---------------- Equity curve ---------------- */
function Equity({ data, height = 240 }) {
  const [w, setW] = useState(0);
  const [idx, setIdx] = useState(null);
  const AX = 52; const top = 14; const bottom = 26;
  const n = data.length;
  const plotW = Math.max(0, w - AX); const ph = height - top - bottom;
  const mn = Math.min(...data); const mx = Math.max(...data);
  const pad = (mx - mn) * 0.12 || 1; const lo = mn - pad; const hi = mx + pad;
  const x = (i) => (n > 1 ? (i / (n - 1)) * plotW : 0);
  const y = (v) => top + ((hi - v) / (hi - lo)) * ph;
  let pk = data[0]; const peaks = data.map((v) => (pk = Math.max(pk, v)));
  const line = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const area = `${x(0)},${top + ph} ${line} ${x(n - 1)},${top + ph}`;
  const dd = `${peaks.map((v, i) => `${x(i)},${y(v)}`).join(' ')} ${data.map((v, i) => `${x(i)},${y(v)}`).reverse().join(' ')}`;
  const ticks = [0, 1, 2, 3].map((q) => lo + ((hi - lo) * q) / 3);
  const cur = idx == null ? n - 1 : idx;
  const change = data[cur] - data[0];
  const fromPeak = ((data[cur] - peaks[cur]) / peaks[cur]) * 100;
  const maxDD = Math.min(...data.map((v, i) => ((v - peaks[i]) / peaks[i]) * 100));
  const touch = (e) => {
    if (!plotW) return;
    const p = e.nativeEvent.locationX;
    setIdx(Math.max(0, Math.min(n - 1, Math.round((p / plotW) * (n - 1)))));
  };
  const xl = [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <View style={{ gap: 12 }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' }} gap={12}>
        <View>
          <T v="caption" muted>{idx == null ? 'Latest' : dateLabel(n - 1 - cur)}</T>
          <T v="h1" mono>${Math.round(data[cur]).toLocaleString('en-US')}</T>
        </View>
        <Row gap={16}>
          <View><T v="caption" muted>Change</T><T v="small" mono bold style={{ color: change >= 0 ? c.green : c.red }}>{change >= 0 ? '▲ ' : '▼ '}{money(change)}</T></View>
          <View><T v="caption" muted>From peak</T><T v="small" mono style={{ color: fromPeak < 0 ? c.red : c.text }}>{fromPeak.toFixed(1)}%</T></View>
        </Row>
      </Row>

      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
        {w ? (
          <>
            <Svg width={w} height={height}>
              <Defs>
                <LinearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={c.green} stopOpacity="0.30" />
                  <Stop offset="1" stopColor={c.green} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              {ticks.map((v, i) => (
                <React.Fragment key={i}>
                  <Line x1={0} x2={plotW} y1={y(v)} y2={y(v)} stroke={c.border} strokeDasharray="2 4" />
                  <SvgText x={plotW + 8} y={y(v) + 4} fill={c.muted} fontSize={10} fontFamily={mono}>{k(v)}</SvgText>
                </React.Fragment>
              ))}
              <Polygon points={area} fill="url(#eqFill)" />
              <Polygon points={dd} fill={c.red} fillOpacity={0.14} />
              <Polyline points={peaks.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={c.muted} strokeWidth={1} strokeDasharray="3 4" />
              <Polyline points={line} fill="none" stroke={c.green} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              <Circle cx={x(n - 1)} cy={y(data[n - 1])} r={4} fill={c.green} />
              {idx != null ? (
                <>
                  <Line x1={x(idx)} x2={x(idx)} y1={top} y2={top + ph} stroke={c.muted} strokeDasharray="3 3" />
                  <Circle cx={x(idx)} cy={y(data[idx])} r={5} fill={c.bg} stroke={c.white} strokeWidth={2} />
                </>
              ) : null}
              <Line x1={0} x2={plotW} y1={top + ph} y2={top + ph} stroke={c.border} />
              {xl.map((i, j) => (
                <SvgText key={i} x={x(i)} y={height - 8} fill={c.muted} fontSize={10} textAnchor={j === 0 ? 'start' : j === 2 ? 'end' : 'middle'}>{dateLabel(n - 1 - i)}</SvgText>
              ))}
            </Svg>
            <View style={{ position: 'absolute', left: 0, top: 0, width: plotW, height }} onTouchStart={touch} onTouchMove={touch} onTouchEnd={() => setIdx(null)} onTouchCancel={() => setIdx(null)} />
          </>
        ) : null}
      </View>

      <Row style={{ flexWrap: 'wrap' }} gap={16}>
        <Row gap={6}><View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: c.green }} /><T v="caption" muted>Equity</T></Row>
        <Row gap={6}><View style={{ width: 16, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.muted }} /><T v="caption" muted>Running peak</T></Row>
        <Row gap={6}><View style={{ width: 16, height: 8, borderRadius: 2, backgroundColor: 'rgba(255,95,109,0.3)' }} /><T v="caption" muted>Drawdown</T></Row>
        <T v="caption" muted>Max drawdown {maxDD.toFixed(1)}% · touch and drag to read values</T>
      </Row>
    </View>
  );
}

/* ---------------- Breakdown ---------------- */
function DivBar({ v, max }) {
  const half = Math.min(1, Math.abs(v) / max) * 100;
  const col = v >= 0 ? c.green : c.red;
  return (
    <View style={{ height: 8, flexDirection: 'row', borderRadius: 4, backgroundColor: c.border, overflow: 'hidden' }}>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{v < 0 ? <View style={{ width: `${half}%`, height: 8, backgroundColor: col }} /> : null}</View>
      <View style={{ width: 2, backgroundColor: c.muted }} />
      <View style={{ flex: 1 }}>{v >= 0 ? <View style={{ width: `${half}%`, height: 8, backgroundColor: col }} /> : null}</View>
    </View>
  );
}

function BreakdownRow({ b, maxR, totalTrades, tag }) {
  const good = b.avgR >= 0;
  const share = Math.round((b.trades / totalTrades) * 100);
  return (
    <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: tag === 'Best' ? c.green : tag === 'Weakest' ? c.red : c.border, backgroundColor: c.elevated, gap: 10 }}>
      <Row style={{ justifyContent: 'space-between' }} gap={10}>
        <View style={{ flex: 1 }}>
          <Row gap={8} style={{ flexWrap: 'wrap' }}>
            <T v="h3">{b.label}</T>
            {tag ? <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: tag === 'Best' ? 'rgba(68,214,129,0.18)' : 'rgba(255,95,109,0.18)' }}><T v="caption" bold style={{ color: tag === 'Best' ? c.green : c.red }}>{tag}</T></View> : null}
          </Row>
          <T v="caption" muted>{b.trades} trades · {share}% of activity</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <T v="h2" mono style={{ color: good ? c.green : c.red }}>{good ? '▲ ' : '▼ '}{signed(b.avgR, 2, 'R')}</T>
          <T v="caption" muted>avg per trade</T>
        </View>
      </Row>
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}><T v="caption" muted>Expectancy</T></Row>
        <DivBar v={b.avgR} max={maxR} />
      </View>
      <View style={{ gap: 4 }}>
        <Row style={{ justifyContent: 'space-between' }}><T v="caption" muted>Win rate</T><T v="caption" mono>{b.winRate}%</T></Row>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: c.border, overflow: 'hidden' }}>
          <View style={{ width: `${b.winRate}%`, height: 8, backgroundColor: b.winRate >= 50 ? c.green : c.red }} />
          <View style={{ position: 'absolute', left: '50%', top: 0, width: 2, height: 8, backgroundColor: c.muted }} />
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen({ go }) {
  const { wide } = useLayout();
  const [f, setF] = useState({ period: 'Last 30 days', strategy: 'All', edge: 'All trades' });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dim, setDim] = useState('Strategy');
  const m = analytics.metrics;
  const set = (key) => (v) => setF((p) => ({ ...p, [key]: v }));
  const activeCount = (f.period !== 'Last 30 days' ? 1 : 0) + (f.strategy !== 'All' ? 1 : 0) + (f.edge !== 'All trades' ? 1 : 0);
  const reset = () => setF({ period: 'Last 30 days', strategy: 'All', edge: 'All trades' });

  const equity = useMemo(() => analytics.equity.slice(-PERIODS[f.period]), [f.period]);

  // A strategy or edge filter narrows the headline numbers to that group.
  const strat = analytics.breakdowns.Strategy.find((s) => s.label === f.strategy);
  const scope = strat
    ? { label: strat.label, winRate: strat.winRate, avgR: strat.avgR, trades: strat.trades }
    : f.edge === 'On edge only' ? { label: 'On-edge trades', winRate: analytics.onEdge.winRate, avgR: analytics.onEdge.avgR, trades: analytics.onEdge.trades }
    : f.edge === 'Off edge only' ? { label: 'Off-edge trades', winRate: analytics.offEdge.winRate, avgR: analytics.offEdge.avgR, trades: analytics.offEdge.trades }
    : null;

  const rows = analytics.breakdowns[dim];
  const sorted = [...rows].sort((a, b) => b.avgR - a.avgR);
  const maxR = Math.max(...rows.map((r) => Math.abs(r.avgR)), 0.5);
  const totalTrades = rows.reduce((s1, r) => s1 + r.trades, 0) || 1;
  const best = sorted[0]; const worst = sorted[sorted.length - 1];


  const edge = (label, d, strong) => (
    <View style={{ flex: 1, padding: 16, borderRadius: 12, borderWidth: strong ? 2 : 1, borderColor: strong ? c.text : c.border, borderStyle: strong ? 'solid' : 'dashed', gap: 10 }}>
      <T v="h3">{label}</T>
      <Row style={{ flexWrap: 'wrap', gap: 16 }}>
        <Stat label="Trades" value={String(d.trades)} size="h3" />
        <Stat label="Win rate" value={`${d.winRate}%`} size="h3" />
        <Stat label="Expectancy" value={d.expectancy} size="h3" />
        <Stat label="P&L"><T v="h3" mono bold={d.pnl > 0}>{d.pnl > 0 ? '▲ +' : '▼ −'}${Math.abs(d.pnl).toLocaleString()}</T></Stat>
      </Row>
    </View>
  );

  const Pick = ({ title, options, value, onChange }) => (
    <View style={{ gap: 8 }}>
      <T v="label">{title}</T>
      <Row style={{ flexWrap: 'wrap' }} gap={6}>{options.map((o) => <Chip key={o} label={o} on={value === o} onPress={() => onChange(o)} />)}</Row>
    </View>
  );

  return (
    <Screen>
      <PageTitle
        title="Analytics"
        right={(
          <Pressable
            onPress={() => setFiltersOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={activeCount ? `Open analytics filters, ${activeCount} active` : 'Open analytics filters'}
            hitSlop={10}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated }}
          >
            <Icon name="sliders" size={20} />
          </Pressable>
        )}
      />

      <Row style={{ flexWrap: 'wrap', marginBottom: 16 }} gap={8}>
        {[f.period, f.strategy !== 'All' ? f.strategy : null, f.edge !== 'All trades' ? f.edge : null].filter(Boolean).map((t) => (
          <View key={t} style={{ paddingHorizontal: 10, height: 30, borderRadius: 15, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, justifyContent: 'center' }}>
            <T v="caption" bold>{t}</T>
          </View>
        ))}
        {activeCount ? <Pressable onPress={reset} hitSlop={8}><T v="small" muted style={{ textDecorationLine: 'underline' }}>Reset</T></Pressable> : null}
      </Row>

      {scope ? (
        <>
          <Grid style={{ marginBottom: 8 }}>
            <Metric label="Win rate" value={`${scope.winRate}%`} sub={scope.label} />
            <Metric label="Expectancy" value={signed(scope.avgR, 2, 'R')} sub="per trade" />
            <Metric label="Average R" value={signed(scope.avgR, 2, 'R')} />
            <Metric label="Trades" value={String(scope.trades)} />
          </Grid>
          <T v="caption" muted style={{ marginBottom: 16 }}>Showing {scope.label.toLowerCase()} only. Other statistics need the full trade set.{strat && f.edge !== 'All trades' ? ' The strategy filter takes priority over the edge filter.' : ''}</T>
        </>
      ) : (
        <Grid style={{ marginBottom: 16 }}>
          <Metric label="Win rate" value={`${m.winRate}%`} />
          <Metric label="Expectancy" value={m.expectancy} />
          <Metric label="Profit factor" value={String(m.profitFactor)} />
          <Metric label="Average R" value={`+${m.avgR}R`} />
          <Metric label="Average win" value={m.avgWin} />
          <Metric label="Average loss" value={m.avgLoss} />
          <Metric label="Max drawdown" value={m.maxDD} />
          <Metric label="Risk consistency" value={m.riskConsistency} sub="trades within 0.1% of plan" />
          <Metric label="Strategy adherence" value={m.adherence} />
        </Grid>
      )}

      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'stretch' }}>
        <Card style={{ flex: 1.3 }}>
          <T v="h2" style={{ marginBottom: 12 }}>Equity curve</T>
          <Equity data={equity} />
        </Card>
        <Card style={{ flex: 1 }}>
          <T v="h2" style={{ marginBottom: 12 }}>On-edge vs off-edge</T>
          <View style={{ gap: 12 }}>
            {edge('✓ Followed your rules', analytics.onEdge, true)}
            {edge('✕ Broke a rule', analytics.offEdge, false)}
          </View>
        </Card>
      </View>

      <Card style={{ marginTop: 16, gap: 12 }}>
        <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <T v="h2">Breakdown by {dim.toLowerCase()}</T>
          <Segmented scroll options={Object.keys(analytics.breakdowns)} value={dim} onChange={setDim} />
        </Row>
        {rows.length > 1 ? (
          <Row style={{ flexWrap: 'wrap' }} gap={16}>
            <View><T v="caption" muted>Strongest</T><T v="small" bold style={{ color: c.green }}>▲ {best.label} {signed(best.avgR, 2, 'R')}</T></View>
            <View><T v="caption" muted>Weakest</T><T v="small" bold style={{ color: c.red }}>▼ {worst.label} {signed(worst.avgR, 2, 'R')}</T></View>
          </Row>
        ) : null}
        <View style={{ gap: 10 }}>
          {sorted.map((b, i) => (
            <BreakdownRow key={b.label} b={b} maxR={maxR} totalTrades={totalTrades} tag={rows.length > 1 && i === 0 ? 'Best' : rows.length > 1 && i === sorted.length - 1 && b.avgR < 0 ? 'Weakest' : null} />
          ))}
        </View>
      </Card>

      <Card ai style={{ marginTop: 16 }}>
        <Row style={{ marginBottom: 6 }}><AITag label="Insight" /></Row>
        <T>Your London-session trades have a higher average R (+0.88R) than your New York-session trades (−0.31R) over the selected period. 9 of 13 New York trades were off-edge.</T>
        <Row style={{ marginTop: 12 }}><Button small variant="secondary" icon="hash" label="Open correlation matrix" onPress={() => go && go('correlation')} /></Row>
      </Card>

      <Sheet
        visible={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter analytics"
        footer={<Row style={{ justifyContent: 'flex-end' }}><Button variant="ghost" label="Reset" onPress={reset} /><Button label="Done" icon="check" onPress={() => setFiltersOpen(false)} /></Row>}
      >
        <Pick title="Time range" options={Object.keys(PERIODS)} value={f.period} onChange={set('period')} />
        <Pick title="Strategy" options={['All', ...analytics.breakdowns.Strategy.map((s) => s.label)]} value={f.strategy} onChange={set('strategy')} />
        <Pick title="Rule adherence" options={['All trades', 'On edge only', 'Off edge only']} value={f.edge} onChange={set('edge')} />
      </Sheet>

    </Screen>
  );
}
