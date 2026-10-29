import React, { useState } from 'react';
import { View } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Card, Badge, Button, Icon, AITag, MyAlertTag } from '../../../components/ui';

const condLine = (cd) => `${cd.op} ${cd.v2 ? `${cd.v1}–${cd.v2}` : cd.v1}`;

/** Compact alert row. Tap to expand details and actions. */
export default function AlertItem({ a, onPause, onDelete, onOpen, onEdit }) {
  const [open, setOpen] = useState(false);
  const triggered = a.status === 'triggered';
  const dimmed = a.status === 'paused' || a.status === 'expired';
  const hasTarget = a.target && a.target !== '—';
  const statusLabel = triggered ? 'Triggered' : a.status === 'active' ? 'Waiting' : a.status[0].toUpperCase() + a.status.slice(1);
  const many = a.conditions && a.conditions.length > 1;

  return (
    <Card ai={a.type === 'ai'} pad={12} onPress={() => setOpen(!open)} style={[{ marginBottom: 8 }, dimmed && { opacity: 0.6 }]}>
      <Row style={{ justifyContent: 'space-between' }} gap={8}>
        <Row gap={8} style={{ flex: 1, flexWrap: 'wrap' }}>
          {a.type === 'ai' ? <AITag label="AI" /> : <MyAlertTag />}
          <T v="h3">{a.asset}</T>
          {a.priority === 'High' ? <Badge kind="warn" label="High" /> : null}
        </Row>
        <Row gap={6}>
          <Badge kind={triggered ? 'solid' : a.status === 'active' ? 'pass' : 'neutral'} glyph={triggered ? '✓' : a.status === 'active' ? '•' : ''} label={statusLabel} />
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={c.muted} />
        </Row>
      </Row>

      <T v="small" bold style={{ marginTop: 6 }} numberOfLines={1}>{a.label}</T>
      <T v="caption" muted numberOfLines={open ? undefined : 1}>{a.condition}{hasTarget ? ` ${a.target}` : ''}</T>
      <Row style={{ marginTop: 6, flexWrap: 'wrap' }} gap={14}>
        <T v="caption" muted>Now <T v="caption" mono>{a.current}</T></T>
        {hasTarget ? <T v="caption" muted>Target <T v="caption" mono>{a.target}</T></T> : null}
        {triggered ? <T v="caption" muted>Hit at <T v="caption" mono bold>{a.triggeredAt}</T></T> : null}
      </Row>

      {open ? (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border, gap: 6 }}>
          {many ? (
            <View>
              <T v="caption" muted>All conditions must be met</T>
              {a.conditions.map((cd, i) => <T key={i} v="small" mono>{i ? 'and ' : ''}{condLine(cd)}</T>)}
            </View>
          ) : null}
          {a.message ? <View><T v="caption" muted>Message</T><T v="small">{a.message}</T></View> : null}
          <Row style={{ flexWrap: 'wrap' }} gap={16}>
            <View><T v="caption" muted>Created by</T><T v="small">{a.type === 'ai' ? 'AI monitor' : 'You'}, {a.created}</T></View>
            {a.trigger ? <View><T v="caption" muted>Trigger</T><T v="small">{a.trigger}</T></View> : null}
            <View><T v="caption" muted>Expires</T><T v="small">{a.expires}</T></View>
            {a.notify ? <View><T v="caption" muted>Notify</T><T v="small">{a.notify}</T></View> : null}
            {a.strategy ? <View><T v="caption" muted>Linked edge</T><T v="small">{a.strategy}</T></View> : null}
          </Row>
          {triggered && a.strategy ? <T v="caption" muted>Your own {a.strategy} condition occurred. This is not a trade recommendation.</T> : null}
          <Row style={{ marginTop: 4, flexWrap: 'wrap' }}>
            {triggered ? <Button small label="Open chart" icon="bar-chart" onPress={onOpen} /> : null}
            {!triggered && a.status !== 'expired' && a.type === 'my' ? <Button small variant="secondary" label="Edit" icon="edit-2" onPress={onEdit} /> : null}
            {a.status === 'active' || a.status === 'paused' ? <Button small variant="secondary" label={a.status === 'paused' ? 'Resume' : 'Pause'} icon={a.status === 'paused' ? 'play' : 'pause'} onPress={onPause} /> : null}
            <Button small variant="ghost" label="Delete" icon="trash-2" onPress={onDelete} />
          </Row>
        </View>
      ) : null}
    </Card>
  );
}