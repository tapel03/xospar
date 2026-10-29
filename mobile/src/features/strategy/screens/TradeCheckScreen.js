import React from 'react';
import { View } from 'react-native';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, CheckRow, AITag, Button, Disclaimer, useLayout } from '../../../components/ui';
import { allSetups, strategies } from '../../../mocks/mock';

export function evaluateTrade(d = {}) {
  const s = strategies.find((x) => x.name === d.strategy) || strategies[1];
  const asset = d.asset || 'EUR/USD';
  const setup = d.setup || s.setups[0];
  const risk = parseFloat(d.risk || '1');
  const checks = [
    { key: 'Strategy', q: 'Does this setup match my strategy?', status: s.setups.includes(setup) && s.markets.includes(asset) ? 'pass' : 'fail',
      detail: s.setups.includes(setup) ? `${setup} is part of ${s.name}.` : `${setup} is not in ${s.name} (allowed: ${s.setups.join(', ')}).` },
    { key: 'Market conditions', q: 'Does the market condition match my edge?', status: 'warn', detail: 'Range day so far, ATR 18% below average. Your best results come on expansion days.' },
    { key: 'Risk', q: 'Is risk within my rules?', status: risk <= 1 ? 'pass' : 'fail', detail: `${risk}% planned vs your 1% maximum.` },
    { key: 'Upcoming event', q: 'Are there major upcoming events?', status: 'warn', detail: 'US CPI at 14:30, inside your 60-minute no-trade window for USD pairs.' },
    { key: 'Correlation', q: 'Is it correlated with an open position?', status: 'pass', detail: 'No open positions. GBP/USD alert pending (0.81 correlated).' },
    { key: 'Exposure', q: 'Am I overexposed?', status: 'pass', detail: 'USD exposure would be 1 position, 1% at risk. Limit is 2.' },
    { key: 'Losing pattern', q: 'Does this resemble previous losing trades?', status: setup === 'Fair Value Gap' ? 'fail' : 'pass', detail: setup === 'Fair Value Gap' ? '3 of your last 4 FVG entries lost (−3.0R total).' : 'No close match with your recent losers.' },
    { key: 'Historical similarity', q: 'Does this resemble previous successful trades?', status: setup === 'Liquidity reclaim' || setup === 'Breakout + retest' ? 'pass' : 'warn', detail: setup === 'Liquidity reclaim' ? 'Similar to T-0142 and T-0148 (+2.5R each).' : 'Partial match with 2 winning trades.' },
  ];
  return { checks, s, setup, asset, risk };
}

export default function TradeCheckScreen({ route, navigation }) {
  const d = route.params?.draft || { asset: route.params?.asset || 'EUR/USD', strategy: 'London Reversal', setup: 'Liquidity reclaim', risk: '1' };
  const { checks, s, asset } = evaluateTrade(d);
  const { wide } = useLayout();
  const fails = checks.filter((x) => x.status === 'fail').length;
  const warns = checks.filter((x) => x.status === 'warn').length;
  const verdict = fails ? 'Not aligned with your edge' : warns ? 'Aligned, with cautions' : 'Fully aligned with your edge';
  return (
    <Frame active="journal">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker={`${asset}, ${s.name}`} title="AI trade check" right={<AITag label="Pre-trade check" />} />
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1, alignSelf: 'stretch' }}>
            <T v="h2">Trade alignment</T>
            <View style={{ marginTop: 8 }}>{checks.map((x, i) => <CheckRow key={x.key} status={x.status} label={`${x.key}`} detail={`${x.q} ${x.detail}`} last={i === checks.length - 1} />)}</View>
          </Card>
          <Card ai style={{ flex: wide ? 0.8 : undefined, alignSelf: 'stretch' }}>
            <T v="h2">{fails ? '✕ ' : warns ? '⚠ ' : '✓ '}{verdict}</T>
            <T v="small" muted style={{ marginTop: 4 }}>{checks.length - fails - warns} passed, {warns} cautions, {fails} conflicts.</T>
            <T style={{ marginTop: 12 }}>
              {fails
                ? 'This trade breaks at least one rule you wrote yourself. If you take it, it will be logged as off-edge so it does not distort your strategy statistics.'
                : 'The setup fits your rules. The main risk is timing: CPI lands inside your no-trade window, and the current range conditions are weaker than your best historical trades. Consider waiting for the release or reducing size.'}
            </T>
            <View style={{ gap: 8, marginTop: 16 }}>
              <Button label="Continue to trade entry" onPress={() => navigation.navigate('AddTrade', { draft: d })} />
              <Button variant="secondary" icon="message-square" label="Ask the mentor why" onPress={() => navigation.navigate('Main', { tab: 'mentor', prompt: 'Does this trade fit my edge?', ts: Date.now() })} />
            </View>
            <Disclaimer>The check informs your decision. It does not make it.</Disclaimer>
          </Card>
        </View>
      </Screen>
    </Frame>
  );
}
