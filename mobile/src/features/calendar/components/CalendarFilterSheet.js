import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Sheet, T, Row, Chip, Button, Icon } from '../../../components/ui';
import { IMPACTS, EVENT_TYPES, CURRENCIES, VIEWS, DEFAULT_FILTER } from '../data/eventMeta';

const impactColor = () => ({ High: c.red, Medium: '#F5A04A', Low: '#E8D44D' });

function Check({ label, on, onPress, swatch }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '50%', minHeight: 40 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? c.blue : c.borderStrong, backgroundColor: on ? c.blue : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
      </View>
      {swatch ? <View style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: swatch }} /> : null}
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

/** Calendar filter: expected impact, event types, currencies and the default view. */
export default function CalendarFilterSheet({ visible, onClose, value, onApply }) {
  const [d, setD] = useState(value);
  useEffect(() => { if (visible) setD(value); }, [visible]);

  const toggle = (key, item) => setD((p) => ({ ...p, [key]: p[key].includes(item) ? p[key].filter((x) => x !== item) : [...p[key], item] }));
  const setAll = (key, list) => setD((p) => ({ ...p, [key]: [...list] }));
  const col = impactColor();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Calendar filter"
      footer={(
        <View style={{ gap: 8 }}>
          <Button label="Apply filter" icon="check" onPress={() => { onApply(d); onClose(); }} />
          <Row>
            <Button style={{ flex: 1 }} variant="secondary" label="Cancel" onPress={onClose} />
            <Button style={{ flex: 1 }} variant="ghost" label="Reset" onPress={() => setD(DEFAULT_FILTER)} />
          </Row>
        </View>
      )}
    >
      <Group title="Expected impact" onAll={() => setAll('impacts', IMPACTS)} onNone={() => setAll('impacts', [])}>
        {IMPACTS.map((x) => <Check key={x} label={x} swatch={col[x]} on={d.impacts.includes(x)} onPress={() => toggle('impacts', x)} />)}
      </Group>

      <Group title="Event types" onAll={() => setAll('types', EVENT_TYPES)} onNone={() => setAll('types', [])}>
        {EVENT_TYPES.map((x) => <Check key={x} label={x} on={d.types.includes(x)} onPress={() => toggle('types', x)} />)}
      </Group>

      <Group title="Currencies" onAll={() => setAll('ccys', CURRENCIES)} onNone={() => setAll('ccys', [])}>
        {CURRENCIES.map((x) => <Check key={x} label={x} on={d.ccys.includes(x)} onPress={() => toggle('ccys', x)} />)}
      </Group>

      <View style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, gap: 10 }}>
        <Row gap={8}><Icon name="info" size={15} color={c.muted} /><T v="h3">Default view</T></Row>
        <Row style={{ flexWrap: 'wrap' }} gap={6}>
          {VIEWS.map((x) => <Chip key={x} label={x} on={d.view === x} onPress={() => setD((p) => ({ ...p, view: x }))} />)}
        </Row>
      </View>
    </Sheet>
  );
}