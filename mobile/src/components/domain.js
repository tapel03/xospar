import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { colors as c, themed } from '../theme/tokens';
import { T, Row, Card, Badge, Button, Icon, AITag, MyAlertTag, money, signed } from './ui';
import { fmtPrice } from '../mocks/mock';

export const EdgeBadge = ({ edge }) =>
  edge === 'yes' ? <Badge kind="pass" label="On edge" /> : edge === 'partial' ? <Badge kind="warn" label="Partial" /> : <Badge kind="fail" label="Off edge" />;

export const ReviewBadge = ({ review }) =>
  review === 'reviewed' ? <Badge kind="neutral" glyph="✦" label="Reviewed" /> : review === 'flag' ? <Badge kind="warn" label="Flagged" /> : <Badge kind="neutral" label="Pending" />;

export const DirBadge = ({ dir }) => <Badge kind={dir === 'Long' ? 'pos' : 'neg'} label={dir} />;

// Same colours as the swatches in the Calendar filter: High red, Medium orange, Low yellow.
const impactColor = () => ({ High: c.red, Medium: '#F5A04A', Low: '#E8D44D' });
export const ImpactBadge = ({ impact }) => {
  const col = impactColor()[impact] || c.muted;
  return (
    <View style={{ borderWidth: 1, borderColor: `${col}66`, backgroundColor: `${col}22`, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Text style={{ color: col, fontSize: 12, fontWeight: '700' }}>{impact}</Text>
    </View>
  );
};

export function TradeRow({ t, onPress, first }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [st.row, !first && st.rowBorder, pressed && { opacity: 0.7 }]}>
      <View style={{ flex: 1, gap: 4 }}>
        <Row>
          <T v="h3">{t.asset}</T>
          <DirBadge dir={t.dir} />
        </Row>
        <T v="caption" muted>{t.date}, {t.strategy}</T>
        <T v="caption" mono muted>{fmtPrice(t.asset, t.entry)} to {fmtPrice(t.asset, t.exit)}</T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <T mono bold>{money(t.pnl)}</T>
        <T v="caption" mono muted>{signed(t.r, 2, 'R')}</T>
        <Row gap={6}><EdgeBadge edge={t.edge} /><ReviewBadge review={t.review} /></Row>
      </View>
    </Pressable>
  );
}

export function InsightCard({ item, onAsk }) {
  const [open, setOpen] = useState(false);
  return (
    <Card ai onPress={() => setOpen(!open)} style={{ marginBottom: 8 }}>
      <Row style={{ alignItems: 'flex-start' }} gap={12}>
        <T style={{ flex: 1, fontWeight: item.kind === 'warn' ? '600' : '400' }}>{item.kind === 'warn' ? '⚠  ' : ''}{item.text}</T>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} color={c.muted} />
      </Row>
      {open ? (
        <View style={{ marginTop: 12, gap: 6 }}>
          <T v="label" muted>Evidence</T>
          {item.evidence.map((e, i) => <T key={i} v="small">— {e}</T>)}
          {item.invalidation ? (
            <>
              <T v="label" muted style={{ marginTop: 8 }}>What would change this</T>
              <T v="small" muted>{item.invalidation}</T>
            </>
          ) : null}
          <Row style={{ marginTop: 10 }}>
            <Button small variant="secondary" icon="message-square" label="Ask mentor" onPress={onAsk} />
          </Row>
        </View>
      ) : null}
    </Card>
  );
}

export function EventRow({ e, first }) {
  return (
    <Row style={[st.row, !first && st.rowBorder, { alignItems: 'center' }]} gap={12}>
      <View style={{ width: 64 }}>
        <T v="caption" muted>{e.day}</T>
        <T mono bold>{e.time}</T>
      </View>
      <View style={{ flex: 1 }}>
        <T v="h3" style={{ fontWeight: '500' }}>{e.label}</T>
        <T v="caption" muted>{e.tag}{e.note ? `, ${e.note}` : ''}</T>
      </View>
      <ImpactBadge impact={e.impact} />
    </Row>
  );
}

export function AlertCard({ a, onPause, onDelete, onOpen, onEdit }) {
  const triggered = a.status === 'triggered';
  const dimmed = a.status === 'paused' || a.status === 'expired';
  return (
    <Card ai={a.type === 'ai'} style={[{ marginBottom: 8 }, dimmed && { opacity: 0.6 }]}>
      <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <Row>
          {a.type === 'ai' ? <AITag label="AI alert" /> : <MyAlertTag />}
          <T v="h3">{a.asset}</T>
          {a.priority === 'High' ? <Badge kind="warn" label="High priority" /> : null}
        </Row>
        <Badge kind={triggered ? 'solid' : a.status === 'active' ? 'pass' : 'neutral'} glyph={triggered ? '✓' : a.status === 'active' ? '•' : ''} label={triggered ? 'Triggered' : a.status === 'active' ? 'Waiting' : a.status[0].toUpperCase() + a.status.slice(1)} />
      </Row>
      <T bold>{a.label}</T>
      <T v="small" muted>{a.condition}{a.target && a.target !== '—' ? ` ${a.target}` : ''}</T>
      <Row style={{ marginTop: 10, flexWrap: 'wrap' }} gap={16}>
        <View><T v="caption" muted>Current</T><T mono>{a.current}</T></View>
        {a.target && a.target !== '—' ? <View><T v="caption" muted>Target</T><T mono>{a.target}</T></View> : null}
        <View><T v="caption" muted>Created by</T><T v="small">{a.type === 'ai' ? 'AI monitor' : 'You'}, {a.created}</T></View>
        <View><T v="caption" muted>Expires</T><T v="small">{a.expires}</T></View>
        {a.strategy ? <View><T v="caption" muted>Linked edge</T><T v="small">{a.strategy}</T></View> : null}
      </Row>
      {triggered ? (
        <View style={st.triggered}>
          <T bold>✓ Alert triggered</T>
          <T v="small">{a.asset} {a.type === 'ai' ? 'met the monitor condition' : 'entered your defined zone'}. Triggered at <T v="small" mono bold>{a.triggeredAt}</T>.</T>
          {a.strategy ? <T v="caption" muted>Your own {a.strategy} condition occurred. This is not a trade recommendation.</T> : null}
        </View>
      ) : null}
      <Row style={{ marginTop: 12, flexWrap: 'wrap' }}>
        {triggered ? <Button small label="Open chart" icon="bar-chart" onPress={onOpen} /> : null}
        {!triggered && a.status !== 'expired' && a.type === 'my' ? <Button small variant="secondary" label="Edit" icon="edit-2" onPress={onEdit} /> : null}
        {a.status === 'active' || a.status === 'paused' ? <Button small variant="secondary" label={a.status === 'paused' ? 'Resume' : 'Pause'} icon={a.status === 'paused' ? 'play' : 'pause'} onPress={onPause} /> : null}
        <Button small variant="ghost" label="Delete" icon="trash-2" onPress={onDelete} />
      </Row>
    </Card>
  );
}

export function ScenarioCard({ s, onEvidence }) {
  return (
    <Card ai style={{ marginTop: 12 }}>
      <Row style={{ justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 12 }}>
        <Row><AITag label="Scenario" /><T v="h3">{s.asset}</T></Row>
        <Row gap={6}>
          <Badge kind={s.bias === 'Buy' ? 'pos' : s.bias === 'Sell' ? 'neg' : 'neutral'} glyph={s.bias === 'Wait' ? '◦' : undefined} label={`${s.bias} scenario`} />
          {s.fits ? <Badge kind="pass" label="Fits your edge" /> : <Badge kind="fail" label="Outside your edge" />}
        </Row>
      </Row>
      <View style={{ gap: 10 }}>
        <KV k="Time window" v={s.window} />
        <KV k="Key levels" v={s.levels} mono />
        <KV k="Context" v={s.context} />
        <KV k="Invalidation" v={s.invalidation} strong />
        <KV k="Risks" v={s.risks} />
      </View>
      <T v="caption" muted style={{ marginTop: 12 }}>A scenario, not a prediction. You decide whether it meets your rules.</T>
    </Card>
  );
}

export const KV = ({ k, v, mono, strong }) => (
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <T v="small" muted style={{ width: 96 }}>{k}</T>
    <T v="small" mono={mono} style={{ flex: 1, fontWeight: strong ? '700' : '400' }}>{v}</T>
  </View>
);

// Built per theme so the border colours follow light/dark.
const st = themed(() => ({
  row: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: c.border },
  triggered: { marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: c.text, gap: 4 },
}));