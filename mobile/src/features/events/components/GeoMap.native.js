import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import Constants from 'expo-constants';
import { colors as c } from '../../../theme/tokens';
import { Icon } from '../../../components/ui';
import { MAP_STYLE_URL, HOME, MIN_Z, MAX_Z } from './mapStyle';
import GeoMapWebView from './GeoMapWebView';

// Expo Go has no MapLibre native code, and the library logs an error the moment it is loaded.
// So in Expo Go it is never loaded, and the map is drawn in a WebView instead (which gets the 3D globe).
const inExpoGo = Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

let MapLibreGL = null;
if (!inExpoGo) {
  try {
    const mod = require('@maplibre/maplibre-react-native');
    MapLibreGL = mod.default || mod;
    if (!MapLibreGL || !MapLibreGL.MapView) MapLibreGL = null;
  } catch (e) {
    MapLibreGL = null;
  }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function Pulse({ size }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.text, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] }) }] }} />
  );
}

function Pin({ e, icon, on, onPress }) {
  const size = e.severity === 'High' ? 38 : 30;
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityLabel={`${e.title}, ${e.severity} impact`}
      style={{ width: size + 20, height: size + 20, alignItems: 'center', justifyContent: 'center' }}>
      {e.recent ? <Pulse size={size} /> : null}
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: on ? c.white : c.bg, borderWidth: e.severity === 'High' ? 2 : 1, borderColor: c.text, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={e.severity === 'High' ? 18 : 14} color={on ? c.black : c.text} />
      </View>
    </Pressable>
  );
}

/**
 * The real native map, used in development and production builds.
 * It is tilted and can be rotated, with 3D buildings. The globe view is only in the web and Expo Go maps,
 * because the native MapLibre version used here does not have it.
 */
const NativeMap = forwardRef(function NativeMap({ events, regions, selectedId, onSelect, onZoom, icons = {} }, ref) {
  const cam = useRef(null);
  const zoom = useRef(HOME.zoom);

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => { if (cam.current) cam.current.zoomTo(clamp(zoom.current + Math.log2(f), MIN_Z, MAX_Z), 300); },
    reset: () => { if (cam.current) cam.current.setCamera({ centerCoordinate: HOME.center, zoomLevel: HOME.zoom, pitch: HOME.pitch, heading: HOME.bearing, animationDuration: 600 }); },
  }));

  const changed = (f) => {
    const z = f && f.properties && f.properties.zoomLevel;
    if (typeof z === 'number') { zoom.current = z; onZoom && onZoom(z); }
  };

  const tapRegion = (ev) => {
    const id = ev.features && ev.features[0] && ev.features[0].properties.id;
    const hit = events.find((x) => x.id === id);
    if (hit && onSelect) onSelect(hit);
  };

  return (
    <MapLibreGL.MapView
      style={{ flex: 1 }}
      styleURL={MAP_STYLE_URL}
      logoEnabled={false}
      attributionEnabled={false}
      compassEnabled
      rotateEnabled
      pitchEnabled
      onRegionDidChange={changed}
    >
      <MapLibreGL.Camera ref={cam} defaultSettings={{ centerCoordinate: HOME.center, zoomLevel: HOME.zoom, pitch: HOME.pitch, heading: HOME.bearing }} minZoomLevel={MIN_Z} maxZoomLevel={MAX_Z} />

      <MapLibreGL.ShapeSource id="regions" shape={regions} onPress={tapRegion}>
        <MapLibreGL.FillLayer id="regionFill" style={{ fillColor: ['get', 'color'], fillOpacity: ['case', ['==', ['get', 'id'], selectedId || ''], 0.45, 0.22] }} />
        <MapLibreGL.LineLayer id="regionLine" style={{ lineColor: ['get', 'color'], lineWidth: 1.5, lineOpacity: 0.9 }} />
      </MapLibreGL.ShapeSource>

      {events.map((e) => (
        <MapLibreGL.MarkerView key={e.id} id={e.id} coordinate={[e.lng, e.lat]}>
          <Pin e={e} icon={icons[e.cat] || 'globe'} on={e.id === selectedId} onPress={() => onSelect && onSelect(e)} />
        </MapLibreGL.MarkerView>
      ))}
    </MapLibreGL.MapView>
  );
});

/**
 * Phone map. Same props as the web version.
 * events, regions (GeoJSON), selectedId, onSelect(event), dark (unused), onZoom(zoomLevel), icons ({ category: featherIconName })
 */
const GeoMap = forwardRef(function GeoMap(props, ref) {
  return MapLibreGL ? <NativeMap ref={ref} {...props} /> : <GeoMapWebView ref={ref} {...props} />;
});

export default GeoMap;