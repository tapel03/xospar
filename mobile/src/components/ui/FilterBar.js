import React from 'react';
import { View } from 'react-native';
import { T, Row } from '.';
import Dropdown from './Dropdown';

/**
 * The one filter pattern used across the app (same look as Notifications):
 *   Show: [ All  12 v ]
 * Several filters sit side by side on wide screens and stack on phones.
 *
 * filters: [{ key, label, options: string[], value, onChange, counts? }]
 */
export default function FilterBar({ filters, style }) {
  return (
    <Row gap={12} style={[{ flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 16 }, style]}>
      {filters.map((f) => (
        <Row key={f.key} gap={10} style={{ alignItems: 'flex-start', flexGrow: 1, flexBasis: 250, maxWidth: 380 }}>
          <T v="small" style={{ marginTop: 10, minWidth: 66 }}>{f.label}:</T>
          <View style={{ flex: 1 }}>
            <Dropdown label={`Filter by ${f.label}`} width="100%" value={f.value} options={f.options} counts={f.counts} onChange={f.onChange} />
          </View>
        </Row>
      ))}
    </Row>
  );
}
