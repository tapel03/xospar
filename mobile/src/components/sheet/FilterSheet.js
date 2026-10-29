import React from 'react';
import { View } from 'react-native';
import { Sheet, T, Row, Chip, Button } from '../ui';

/** The "Filter · n" button used on Journal, Events map, News and Alerts. */
export function FilterButton({ count = 0, onPress }) {
  return <Button small variant="secondary" icon="filter" label={count ? `Filter · ${count}` : 'Filter'} onPress={onPress} />;
}

/**
 * One filter sheet for every screen.
 * groups: [{ key, title, options: string[], value, onChange, multi?, icons?: { [option]: featherIconName } }]
 * multi groups take an array as value, single groups take a string.
 */
export default function FilterSheet({ visible, onClose, title = 'Filter', groups, onReset }) {
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      footer={(
        <Row style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" label="Reset" onPress={onReset} />
          <Button label="Done" icon="check" onPress={onClose} />
        </Row>
      )}
    >
      {groups.map((g) => (
        <View key={g.key} style={{ gap: 8 }}>
          <T v="label">{g.title}</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>
            {g.options.map((o) => {
              const on = g.multi ? g.value.includes(o) : g.value === o;
              const press = () => (g.multi ? g.onChange(on ? g.value.filter((x) => x !== o) : [...g.value, o]) : g.onChange(o));
              return <Chip key={o} label={o} icon={g.icons ? g.icons[o] : undefined} on={on} onPress={press} />;
            })}
          </Row>
        </View>
      ))}
    </Sheet>
  );
}