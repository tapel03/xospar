import React, { useState } from 'react';
import { View } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Card, Row, Field, Segmented, Button, Disclaimer } from '../../../components/ui';
import { useStore } from '../../../app/store';
import { account } from '../../../mocks/mock';
import { riskBaseOf, usd } from '../../trading/risk';

const num = (s) => parseFloat(String(s).replace(',', '.'));
const trim = (v) => String(Number(Number(v).toFixed(2)));

/**
 * Risk settings based on a fixed starting amount (the "risk base").
 * Risk per trade and daily loss are worked out from the base, not from live equity, so the dollar amount
 * stays the same after wins and losses until the user changes the base.
 * Per-trade risk and daily loss can be typed as a percent or as a dollar amount.
 */
export default function RiskBaseCard() {
  const { settings, setSetting } = useStore();
  const saved = riskBaseOf(settings, account.equity);
  const [unit, setUnit] = useState('%');
  const [base, setBase] = useState(String(saved));
  const [trade, setTrade] = useState(String(settings.maxRisk));
  const [daily, setDaily] = useState(String(settings.maxDailyLoss));

  const b = num(base);
  const baseOk = isFinite(b) && b > 0;
  const toPct = (txt) => {
    const v = num(txt);
    if (!baseOk || !isFinite(v) || v <= 0) return null;
    return unit === '%' ? v : (v / b) * 100;
  };
  const toUsd = (txt) => {
    const v = num(txt);
    if (!baseOk || !isFinite(v) || v <= 0) return null;
    return unit === '%' ? (v / 100) * b : v;
  };

  const tradePct = toPct(trade);
  const dailyPct = toPct(daily);
  const tradeUsd = toUsd(trade);
  const dailyUsd = toUsd(daily);
  const valid = baseOk && tradePct != null && dailyPct != null;
  const dirty = valid && (Number(b.toFixed(2)) !== saved || Math.abs(tradePct - settings.maxRisk) > 0.00005 || Math.abs(dailyPct - settings.maxDailyLoss) > 0.00005);

  const changeUnit = (u) => {
    if (u === unit) return;
    if (valid) {
      setTrade(trim(u === '$' ? tradeUsd : tradePct));
      setDaily(trim(u === '$' ? dailyUsd : dailyPct));
    }
    setUnit(u);
  };

  const save = () => {
    if (!valid) return;
    setSetting('riskBase', Number(b.toFixed(2)));
    setSetting('maxRisk', Number(tradePct.toFixed(4)));
    setSetting('maxDailyLoss', Number(dailyPct.toFixed(4)));
  };

  const nowPct = (v) => (account.equity ? ((v / account.equity) * 100).toFixed(2) : '0.00');

  return (
    <Card style={{ gap: 14 }}>
      <View>
        <T v="h2">Risk</T>
        <T v="small" muted>Risk is worked out from a fixed amount you choose, not from your live balance. It only changes when you change it.</T>
      </View>

      <View style={{ gap: 8 }}>
        <Field label="Risk base (your starting amount)" value={base} onChangeText={setBase} keyboardType="decimal-pad" hint={`Current equity is ${usd(account.equity)}.`} style={{ flexBasis: 'auto', flexGrow: 0 }} />
        <Row style={{ flexWrap: 'wrap' }}>
          <Button small variant="secondary" icon="refresh-cw" label="Use current equity" onPress={() => setBase(trim(account.equity))} />
        </Row>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label" muted>Enter risk as</T>
        <Segmented options={['%', '$']} value={unit} onChange={changeUnit} />
      </View>

      <View style={{ gap: 12 }}>
        <Field
          label={`Risk per trade (${unit})`}
          value={trade}
          onChangeText={setTrade}
          keyboardType="decimal-pad"
          hint={tradePct != null ? `${tradePct.toFixed(2)}% of ${usd(b)} = ${usd(tradeUsd)} on every trade (${nowPct(tradeUsd)}% of your equity today)` : 'Enter a number above 0.'}
          style={{ flexBasis: 'auto', flexGrow: 0 }}
        />
        <Field
          label={`Daily loss limit (${unit})`}
          value={daily}
          onChangeText={setDaily}
          keyboardType="decimal-pad"
          hint={dailyPct != null ? `${dailyPct.toFixed(2)}% of ${usd(b)} = ${usd(dailyUsd)} per day` : 'Enter a number above 0.'}
          style={{ flexBasis: 'auto', flexGrow: 0 }}
        />
      </View>

      {!baseOk ? <T v="caption" bold>Enter a risk base above 0.</T> : null}

      <Row style={{ justifyContent: 'flex-end' }}>
        <Button icon="check" label="Save risk settings" disabled={!dirty} onPress={save} />
      </Row>
      <Disclaimer>When your account grows, raise the risk base and your risk amounts scale with it. Until then the dollar amounts stay the same.</Disclaimer>
    </Card>
  );
}