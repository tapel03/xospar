import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Sheet, T, Row, Button, Icon } from '../../../components/ui';

export const RESULTS = ['Wins', 'Losses', 'Flat / open'];
export const EDGES = ['On edge', 'Partial', 'Off edge'];
export const REVIEWS = ['Reviewed', 'Flagged', 'Pending'];

export const DEFAULT_JOURNAL_FILTER = { results: [...RESULTS], edges: [...EDGES], reviews: [...REVIEWS] };

const resultLabel = (t) => (t.pnl > 0 ? 'Wins' : t.pnl < 0 ? 'Losses' : 'Flat / open');
const edgeLabel = (t) => (t.edge === 'yes' ? 'On edge' : t.edge === 'partial' ? 'Partial' : 'Off edge');
const reviewLabel = (t) => (t.review === 'reviewed' ? 'Reviewed' : t.review === 'flag' ? 'Flagged' : 'Pending');

/** Keeps the trades that match every group of the filter. */
export function applyJournalFilter(trades, f) {
  return trades.filter((t) => f.results.includes(resultLabel(t)) && f.edges.includes(edgeLabel(t)) && f.reviews.includes(reviewLabel(t)));
}

/** How many filter groups differ from the defaults. */
export function countActiveJournal(f) {
  return (f.results.length !== RESULTS.length ? 1 : 0)
    + (f.edges.length !== EDGES.length ? 1 : 0)
    + (f.reviews.length !== REVIEWS.length ? 1 : 0);
}

function Check({ label, on, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '50%', minHeight: 40 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? c.blue : c.borderStrong, backgroundColor: on ? c.blue : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
      </View>
      <T style={{ fontSize: 15, flexShrink: 1 }} numberOfLines={1}>{label}</T>
    </Pressable>
  );
}

function Group({ title, onAll, onNone, children }) {
  return (
    <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, gap: 6 }}>
      <Row gap={6}>
        <T v="h3">{title}</T>
        <T v="small" muted>(</T>
        <Pressable onPress={onAll} hitSlop={8}><T v="small" style={{ color: c.blue, textDecorationLine: 'underline' }}>all</T></Pressable>
        <T v="small" muted>,</T>
        <Pressable onPress={onNone} hitSlop={8}><T v="small" style={{ color: c.blue, textDecorationLine: 'underline' }}>none</T></Pressable>
        <T v="small" muted>)</T>
      </Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{children}</View>
    </View>
  );
}

/** Journal filter: result, edge and review status. Same look as the Calendar filter. */
export default function JournalFilterSheet({ visible, onClose, value, onApply }) {
  const [d, setD] = useState(value);
  useEffect(() => { if (visible) setD(value); }, [visible]);

  const toggle = (key, item) => setD((p) => ({ ...p, [key]: p[key].includes(item) ? p[key].filter((x) => x !== item) : [...p[key], item] }));
  const setAll = (key, list) => setD((p) => ({ ...p, [key]: [...list] }));

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Journal filter"
      footer={(
        <View style={{ gap: 8 }}>
          <Button label="Apply filter" icon="check" onPress={() => { onApply(d); onClose(); }} />
          <Row>
            <Button style={{ flex: 1 }} variant="secondary" label="Cancel" onPress={onClose} />
            <Button style={{ flex: 1 }} variant="ghost" label="Reset" onPress={() => setD(DEFAULT_JOURNAL_FILTER)} />
          </Row>
        </View>
      )}
    >
      <Group title="Result" onAll={() => setAll('results', RESULTS)} onNone={() => setAll('results', [])}>
        {RESULTS.map((x) => <Check key={x} label={x} on={d.results.includes(x)} onPress={() => toggle('results', x)} />)}
      </Group>

      <Group title="Edge" onAll={() => setAll('edges', EDGES)} onNone={() => setAll('edges', [])}>
        {EDGES.map((x) => <Check key={x} label={x} on={d.edges.includes(x)} onPress={() => toggle('edges', x)} />)}
      </Group>

      <Group title="Review" onAll={() => setAll('reviews', REVIEWS)} onNone={() => setAll('reviews', [])}>
        {REVIEWS.map((x) => <Check key={x} label={x} on={d.reviews.includes(x)} onPress={() => toggle('reviews', x)} />)}
      </Group>
    </Sheet>
  );
}