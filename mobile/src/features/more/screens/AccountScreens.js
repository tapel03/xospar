import React, { useState } from 'react';
import { View } from 'react-native';
import { colors as c, themed } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Grid, Segmented, Toggle, Badge, Bar, Divider, AITag, CheckRow, Metric, Disclaimer, useLayout } from '../../../components/ui';
import { Frame } from '../../../navigation/Frame';
import { account } from '../../../mocks/mock';
import { useStore } from '../../../app/store';

/* ---------------- Performance review ---------------- */
const REVIEW = {
  Week: {
    range: '28 Sep – 2 Oct 2026', pnl: '−$214.90', trades: 6, adherence: 50, risk: 100,
    well: ['Both London Reversal trades followed every rule (+2.47R, +1.1R).', 'No trade risked more than 1%.'],
    wrong: ['Two New York trades used Fair Value Gap entries, which are outside your documented strategy.', 'One trade opened 22 minutes after a loss, logged as frustrated.'],
    best: 'London Reversal · liquidity reclaim (+1.8R avg)', mistake: 'Trading outside your session (2 of 6 trades)',
    emotion: 'Frustration after a loss preceded both off-edge trades.', market: 'Range-bound EUR/USD ahead of US CPI; elevated oil volatility.',
  },
  Month: {
    range: 'September 2026', pnl: '+$1,840.55', trades: 25, adherence: 68, risk: 96,
    well: ['On-edge trades returned +0.71R on average across 17 trades.', 'London session win rate of 63%.'],
    wrong: ['8 off-edge trades cost −$1,720, almost half of gross losses.', 'Average loss increased 18% in the final week.'],
    best: 'London Reversal (+1.21R avg, 9 trades)', mistake: 'Entering New York pullbacks without confirmation',
    emotion: '3 trades opened within 10 minutes of a loss; all three lost.', market: 'Dollar strength mid-month; FOMC week compressed ranges.',
  },
};
const PROGRESS = [{ w: 'W36', a: 58 }, { w: 'W37', a: 64 }, { w: 'W38', a: 71 }, { w: 'W39', a: 74 }, { w: 'W40', a: 50 }];

export function ReviewScreen({ navigation, route }) {
  const [period, setPeriod] = useState(route.params?.period || 'Week');
  const [cooling, setCooling] = useState(false);
  const { settings } = useStore();
  const { wide } = useLayout();
  const r = REVIEW[period];
  const ddLimit = 10; const dd = Math.abs(account.drawdown);
  const dailyUsed = 1.1; const dailyRemaining = Math.max(0, settings.maxDailyLoss - dailyUsed);
  const steps = [{ risk: '0.5%', cond: 'Now, until 3 on-edge trades', done: true }, { risk: '0.75%', cond: 'After 3 on-edge trades and drawdown under 3%' }, { risk: '1%', cond: 'After 5 more on-edge trades at 0.75%' }];
  const List = ({ items, glyph }) => items.map((x) => <Row key={x} style={{ alignItems: 'flex-start' }} gap={8}><T v="small" bold style={{ width: 14 }}>{glyph}</T><T v="small" style={{ flex: 1 }}>{x}</T></Row>);
  const col = { flexGrow: 1, flexBasis: wide ? 320 : '100%', gap: 8 };

  return (
    <Frame active="analytics">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker={r.range} title="Your trading review" right={<Segmented options={['Week', 'Month']} value={period} onChange={setPeriod} />} />
        <Grid style={{ marginBottom: 16 }}>
          <Metric label="P&L" value={r.pnl} />
          <Metric label="Trades" value={`${r.trades}`} />
          <Metric label="Strategy adherence" value={`${r.adherence}%`} sub={<Bar value={r.adherence} style={{ marginTop: 8 }} />} />
          <Metric label="Risk discipline" value={`${r.risk}%`} sub={<Bar value={r.risk} style={{ marginTop: 8 }} />} />
        </Grid>
        <Grid>
          <Card style={col}><T v="h3">✓ What went well</T><List items={r.well} glyph="✓" /></Card>
          <Card style={col}><T v="h3">✕ What went wrong</T><List items={r.wrong} glyph="✕" /></Card>
          <Card style={col}><T v="caption" muted>Most profitable setup</T><T v="h3">▲ {r.best}</T><Divider style={{ marginVertical: 4 }} /><T v="caption" muted>Most common mistake</T><T v="h3">⚠ {r.mistake}</T></Card>
          <Card style={col}><T v="caption" muted>Emotional patterns</T><T v="small">{r.emotion}</T><Divider style={{ marginVertical: 4 }} /><T v="caption" muted>Market conditions</T><T v="small">{r.market}</T></Card>
        </Grid>

        <Card ai style={{ marginTop: 16, gap: 8 }}>
          <Row gap={8}><AITag /><T v="h3">Recommendations</T></Row>
          <CheckRow status="info" label="Keep FVG entries out until you test them" detail="Either add FVG to a strategy with rules, or treat it as forbidden. Right now it costs you." />
          <CheckRow status="info" label="Add a 15-minute pause after any loss" detail="All three revenge-window trades this month lost." />
          <CheckRow status="info" label="Stay inside London" detail="Your London expectancy is +0.88R vs −0.31R in New York." last />
          <Disclaimer>Suggestions only. Your rules change only when you edit them.</Disclaimer>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <T v="h3" style={{ marginBottom: 12 }}>Adherence over time</T>
          <Row style={{ alignItems: 'flex-end', height: 120 }} gap={12}>
            {PROGRESS.map((p, i) => (
              <View key={p.w} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                <T v="caption" mono>{p.a}%</T>
                <View style={{ width: '100%', maxWidth: 48, height: p.a, borderRadius: 6, backgroundColor: i === PROGRESS.length - 1 ? 'transparent' : c.text, borderWidth: 1, borderColor: c.text, borderStyle: i === PROGRESS.length - 1 ? 'dashed' : 'solid' }} />
                <T v="caption" muted>{p.w}</T>
              </View>
            ))}
          </Row>
        </Card>

        <Card style={{ marginTop: 16, gap: 12, borderWidth: 2, borderColor: c.text }}>
          <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}><T v="h2">⚠ Recovery plan</T><Badge kind="warn" label="Drawdown period" /></Row>
          <View style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}><T v="small" muted>Drawdown vs limit</T><T v="small" mono bold>{dd.toFixed(1)}% of {ddLimit}%</T></Row>
            <Bar value={dd} max={ddLimit} height={10} />
          </View>
          <View style={{ gap: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}><T v="small" muted>Daily loss remaining today</T><T v="small" mono bold>{dailyRemaining.toFixed(1)}% of {settings.maxDailyLoss}%</T></Row>
            <Bar value={dailyRemaining} max={settings.maxDailyLoss} height={10} dashed />
          </View>
          <T v="label" style={{ marginTop: 4 }}>Temporary risk step-down</T>
          {steps.map((x, i) => (
            <Row key={x.risk} gap={12} style={{ alignItems: 'flex-start' }}>
              <View style={[st.ms, x.done && { backgroundColor: c.white }]}><T v="caption" bold style={{ color: x.done ? c.black : c.text }}>{i + 1}</T></View>
              <View style={{ flex: 1 }}><T v="h3" mono>{x.risk} per trade</T><T v="small" muted>{x.cond}</T></View>
            </Row>
          ))}
          <Divider />
          <Toggle label="Cooling-off mode" detail="Pause new trade entries for 24 hours. Journal, charts and alerts stay available." value={cooling} onChange={setCooling} />
          {cooling ? <Badge kind="solid" glyph="✓" label="Cooling off until tomorrow 09:00" /> : null}
          <Disclaimer>You set the limits. The plan is a suggestion based on your own risk settings and history.</Disclaimer>
        </Card>
      </Screen>
    </Frame>
  );
}

const st = themed(() => ({
  ms: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: c.text, alignItems: 'center', justifyContent: 'center' },
}));