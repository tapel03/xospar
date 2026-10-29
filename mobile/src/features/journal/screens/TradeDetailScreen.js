import React, { useMemo } from 'react';
import { View } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import CandleChart from '../../../components/charts/CandleChart';
import { Screen, PageTitle, T, Card, Row, Stat, CheckRow, AITag, Badge, Button, Disclaimer, money, signed, useLayout } from '../../../components/ui';
import { DirBadge, EdgeBadge } from '../../../components/domain';
import { fmtPrice, makeCandles, tradeContext, assetBy } from '../../../mocks/mock';
import { useStore } from '../../../app/store';

const REVIEWS = {
  'valid-win': { title: 'Valid winning trade', body: 'You followed your plan and the market paid you for it. Repeat the process, not the outcome.', checks: [['pass', 'Valid setup', 'Matches your documented setup list'], ['pass', 'Correct risk', '1% risk, stop at structure'], ['pass', 'Inside session'], ['pass', 'Exit followed your rules']] },
  'valid-loss': { title: 'Valid losing trade', body: 'You followed your edge. The loss came from the market, not from a mistake. Losses like this are part of a positive expectancy.', checks: [['pass', 'Valid setup', 'Breakout + retest is in London Breakout'], ['pass', 'Correct risk', '1.0% at a structural stop'], ['warn', 'Entry timing inconsistent', 'Entered 3 hours before a scheduled high-impact release'], ['pass', 'Stop respected', 'No widening after entry']] },
  bad: { title: 'Bad trade', body: 'The loss itself is not the problem. The trade did not meet your edge, so the result tells you nothing about your strategy.', checks: [['fail', 'Setup outside documented strategy', 'Fair Value Gap entries are not in this strategy'], ['pass', 'Correct risk', 'Position size matched 1%'], ['fail', 'Outside session', 'Taken in New York; strategy is London only'], ['warn', 'Emotional state flagged', 'Logged as frustrated, 22 minutes after a loss']] },
};

export default function TradeDetailScreen({ route, navigation }) {
  const { trades } = useStore();
  const { wide } = useLayout();
  const t = trades.find((x) => x.id === route.params?.id) || trades[0];
  const a = assetBy(t.asset);
  const candles = useMemo(() => {
    const base = makeCandles(t.asset, 60); const shift = t.entry - base[30].c;
    return base.map((k) => ({ ...k, o: k.o + shift, h: k.h + shift, l: k.l + shift, c: k.c + shift }));
  }, [t.id]);
  const rv = REVIEWS[t.verdict] || REVIEWS['valid-loss'];
  const ctx = tradeContext[t.id] || tradeContext.default;
  const lines = [
    { id: 'e', price: t.entry, label: 'ENTRY', style: 'solid', weight: 1.5 },
    { id: 's', price: t.stop, label: 'STOP', style: 'dashed' },
    { id: 't', price: t.target, label: 'TARGET', style: 'dotted' },
    { id: 'x', price: t.exit, label: 'EXIT', style: 'solid', weight: 2.5 },
  ];

  const review = (
    <Card ai>
      <Row style={{ justifyContent: 'space-between' }}><T v="h2">Did this trade follow your edge?</T><AITag label="Trade review" /></Row>
      <View style={{ marginTop: 8 }}>{rv.checks.map(([s, l, d], i) => <CheckRow key={l} status={s} label={l} detail={d} last={i === rv.checks.length - 1} />)}</View>
      <View style={{ marginTop: 12, padding: 14, borderRadius: 12, borderWidth: t.verdict === 'bad' ? 2 : 1, borderColor: t.verdict === 'bad' ? c.text : c.borderStrong, borderStyle: t.verdict === 'bad' ? 'dashed' : 'solid' }}>
        <T v="h3" bold>{t.verdict === 'bad' ? '✕ ' : '✓ '}{rv.title}</T>
        <T v="small" muted style={{ marginTop: 4 }}>{rv.body}</T>
      </View>
      <Row style={{ marginTop: 12 }}><Button small variant="secondary" icon="message-square" label="Discuss with mentor" onPress={() => navigation.navigate('Main', { tab: 'mentor', prompt: `Review trade ${t.id}`, ts: Date.now() })} /></Row>
    </Card>
  );

  const happened = (
    <Card>
      <T v="h2">What happened?</T>
      <T v="small" muted style={{ marginBottom: 8 }}>Your trade {t.r < 0 ? 'lost' : 'made'} {signed(t.r, 2, 'R')}. Here is the context around it.</T>
      {ctx.map((e, i) => (
        <Row key={i} style={{ alignItems: 'flex-start', paddingVertical: 8 }} gap={12}>
          <View style={{ alignItems: 'center', width: 14 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: c.text, backgroundColor: e.kind === 'Entry' || e.kind === 'Exit' ? c.text : c.bg, marginTop: 4 }} />
            {i < ctx.length - 1 ? <View style={{ width: 1, flex: 1, minHeight: 28, backgroundColor: c.border }} /> : null}
          </View>
          <View style={{ flex: 1 }}>
            <T v="caption" muted><T v="caption" mono>{e.time}</T>  {e.kind}</T>
            <T v="small">{e.text}</T>
          </View>
        </Row>
      ))}
      {t.verdict === 'valid-loss' ? <T v="small" bold style={{ marginTop: 8 }}>Did this violate your edge? No. The market reversed after high-impact news.</T> : null}
    </Card>
  );

  return (
    <Frame active="journal">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker={`${t.id}, ${t.date}`} title={`${t.asset} ${t.dir.toLowerCase()}`} right={<><DirBadge dir={t.dir} /><EdgeBadge edge={t.edge} /></>} />
        <Card style={{ marginBottom: 16 }}>
          <Row style={{ flexWrap: 'wrap', gap: 20 }}>
            <Stat label="Result"><T v="h2" mono bold={t.pnl > 0}>{t.pnl > 0 ? '▲ ' : '▼ '}{money(t.pnl)}</T></Stat>
            <Stat label="R multiple" value={signed(t.r, 2, 'R')} />
            <Stat label="Entry" value={fmtPrice(t.asset, t.entry)} size="h3" />
            <Stat label="Exit" value={fmtPrice(t.asset, t.exit)} size="h3" />
            <Stat label="Stop" value={fmtPrice(t.asset, t.stop)} size="h3" />
            <Stat label="Target" value={fmtPrice(t.asset, t.target)} size="h3" />
            <Stat label="Size" value={t.size} size="h3" />
            <Stat label="Risk" value={`${t.risk}%`} size="h3" />
          </Row>
        </Card>
        <Card pad={8} style={{ marginBottom: 16 }}>
          <Row style={{ justifyContent: 'space-between', padding: 8 }}><T v="h3">{t.asset}, {t.tf}</T><T v="caption" muted>Solid: entry and exit. Dashed: stop. Dotted: target.</T></Row>
          <CandleChart candles={candles} height={wide ? 360 : 280} decimals={a.dec} lines={lines} zones={[]} />
        </Card>
        {wide ? <Row style={{ alignItems: 'flex-start', gap: 16 }}><View style={{ flex: 1 }}>{review}</View><View style={{ flex: 1 }}>{happened}</View></Row> : <View style={{ gap: 16 }}>{review}{happened}</View>}
        <Card style={{ marginTop: 16 }}>
          <T v="h2">Your notes</T>
          <Row style={{ flexWrap: 'wrap', marginTop: 8, gap: 20 }}>
            <Stat label="Strategy" value={t.strategy} size="h3" />
            <Stat label="Setup" value={t.setup} size="h3" />
            <Stat label="Session" value={t.session} size="h3" />
            <Stat label="Emotional state" value={t.emotion} size="h3" />
          </Row>
          <T v="caption" muted style={{ marginTop: 12 }}>Trade thesis</T>
          <T>{t.thesis}</T>
        </Card>
        <Disclaimer>AI reviews compare your trade to the rules you wrote. Edit your strategy if a rule no longer reflects how you trade.</Disclaimer>
      </Screen>
    </Frame>
  );
}
