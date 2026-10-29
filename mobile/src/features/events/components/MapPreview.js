import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c, useMode } from '../../../theme/tokens';
import { T, Icon } from '../../../components/ui';
import GeoMap from './GeoMap';
import { regionCollection } from '../data/regions';
import { mapCategories, mapEvents } from '../../../mocks/mock';

const catIcon = Object.fromEntries(mapCategories.map((m) => [m.key, m.icon]));

/**
 * Overview preview of the Events map. It uses the same real map as the full screen.
 * A transparent layer on top blocks dragging, so scrolling the page works and a tap opens the full map.
 */
export default function MapPreview({ height = 380, onOpen }) {
  const mode = useMode();
  const regions = useMemo(() => regionCollection(mapEvents), []);
  const overlay = c.overlay; // follows light/dark

  return (
    <View style={{ height, borderRadius: 24, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.bgAlt, overflow: 'hidden' }}>
      <GeoMap events={mapEvents} regions={regions} selectedId={null} dark={mode === 'dark'} icons={catIcon} />

      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel="Open events map"
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
      />

      <View pointerEvents="none" style={{ position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: overlay, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, paddingVertical: 8 }}>
        <Icon name="map" size={14} />
        <T v="small" bold>Events map</T>
        <T v="caption" muted>{mapEvents.length} events</T>
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', right: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: overlay, borderRadius: 14, borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, paddingVertical: 8 }}>
        <T v="caption" muted>Tap to open</T>
        <Icon name="maximize-2" size={13} color={c.muted} />
      </View>
    </View>
  );
}