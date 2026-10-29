import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import * as maplibreNs from 'maplibre-gl';
import { colors as c } from '../../../theme/tokens';
import { MAP_STYLE_URL, HOME, MIN_Z, MAX_Z, MAX_PITCH } from './mapStyle';

// maplibre-gl has no default export in v6: use the namespace, and fall back to .default for older builds.
const maplibregl = maplibreNs.Map ? maplibreNs : (maplibreNs.default || maplibreNs);

const GLYPH = { geo: '◎', economic: '$', cb: '%', energy: 'ϟ', supply: '⚓', commodities: '◍', industry: '⌘', corporate: '↗', disaster: '≋' };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// The map's own stylesheet and the pulse animation, added once.
function ensureCss() {
  if (document.getElementById('gm-css')) return;
  const link = document.createElement('link');
  link.id = 'gm-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css';
  document.head.appendChild(link);
  const st = document.createElement('style');
  st.id = 'gm-pulse';
  st.textContent = '.gm-pulse{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:1px solid #fff;animation:gmp 1.8s infinite;pointer-events:none}@keyframes gmp{from{transform:scale(.8);opacity:.7}to{transform:scale(1.8);opacity:0}}';
  document.head.appendChild(st);
}

const opacityExpr = (id) => ['case', ['==', ['get', 'id'], id || ''], 0.45, 0.22];

/**
 * Web map (MapLibre GL JS), OpenFreeMap "Liberty" style, shown as a 3D globe that can be tilted and rotated.
 * Same props as the phone version.
 * events, regions (GeoJSON), selectedId, onSelect(event), dark (unused), onZoom(zoomLevel), icons (unused here)
 */
const GeoMap = forwardRef(function GeoMap({ events, regions, selectedId, onSelect, dark, onZoom }, ref) {
  const el = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const live = useRef({});
  live.current = { events, regions, selectedId, onSelect, onZoom };

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => { const m = map.current; if (m) m.zoomTo(clamp(m.getZoom() + Math.log2(f), MIN_Z, MAX_Z), { duration: 300 }); },
    reset: () => { const m = map.current; if (m) m.flyTo({ center: HOME.center, zoom: HOME.zoom, pitch: HOME.pitch, bearing: HOME.bearing, duration: 600 }); },
  }));

  // Create the map once.
  useEffect(() => {
    ensureCss();
    const m = new maplibregl.Map({
      container: el.current,
      style: MAP_STYLE_URL,
      center: HOME.center, zoom: HOME.zoom, pitch: HOME.pitch, bearing: HOME.bearing,
      minZoom: MIN_Z, maxZoom: MAX_Z, maxPitch: MAX_PITCH,
      dragRotate: true, pitchWithRotate: true, attributionControl: false,
    });
    map.current = m;

    // 3D globe. It flattens into a normal map as you zoom in. If this build cannot do it, the flat map still works.
    m.on('style.load', () => {
      try { m.setProjection({ type: 'globe' }); } catch (e) { /* flat map */ }
    });

    // Any tile or style problem shows up in the browser console (F12).
    m.on('error', (ev) => console.warn('Map error:', ev && ev.error ? ev.error.message : ev));

    // The container can be 0 px tall when the map is created. Re-measure once it has its real size.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => m.resize()) : null;
    if (ro && el.current) ro.observe(el.current);
    const t = setTimeout(() => m.resize(), 300);

    m.on('zoomend', () => live.current.onZoom && live.current.onZoom(m.getZoom()));
    m.on('load', () => {
      m.resize();
      m.addSource('regions', { type: 'geojson', data: live.current.regions });
      m.addLayer({ id: 'regionFill', type: 'fill', source: 'regions', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': opacityExpr(live.current.selectedId) } });
      m.addLayer({ id: 'regionLine', type: 'line', source: 'regions', paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-opacity': 0.9 } });
      m.on('click', 'regionFill', (ev) => {
        const id = ev.features && ev.features[0] && ev.features[0].properties.id;
        const hit = live.current.events.find((x) => x.id === id);
        if (hit && live.current.onSelect) live.current.onSelect(hit);
      });
      m.on('mouseenter', 'regionFill', () => { m.getCanvas().style.cursor = 'pointer'; });
      m.on('mouseleave', 'regionFill', () => { m.getCanvas().style.cursor = ''; });
      if (live.current.onZoom) live.current.onZoom(m.getZoom());
    });
    return () => {
      clearTimeout(t);
      if (ro) ro.disconnect();
      markers.current.forEach((k) => k.remove());
      markers.current = [];
      m.remove();
      map.current = null;
    };
  }, []);

  // Keep the shaded areas in step with the filters and the selected event.
  useEffect(() => {
    const m = map.current;
    if (!m || !m.getSource('regions')) return;
    m.getSource('regions').setData(regions);
    m.setPaintProperty('regionFill', 'fill-opacity', opacityExpr(selectedId));
  }, [regions, selectedId]);

  // Pins.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((k) => k.remove());
    markers.current = events.map((e) => {
      const size = e.severity === 'High' ? 38 : 30;
      const on = e.id === selectedId;
      const node = document.createElement('div');
      node.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;`;
      node.setAttribute('aria-label', `${e.title}, ${e.severity} impact`);
      if (e.recent) { const p = document.createElement('div'); p.className = 'gm-pulse'; node.appendChild(p); }
      const dot = document.createElement('div');
      dot.textContent = GLYPH[e.cat] || '●';
      dot.style.cssText = `position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 ${e.severity === 'High' ? 16 : 13}px sans-serif;background:${on ? c.white : c.bg};color:${on ? c.black : c.text};border:${e.severity === 'High' ? 2 : 1}px solid ${c.text};box-shadow:0 1px 4px rgba(0,0,0,0.35);`;
      node.appendChild(dot);
      node.addEventListener('click', (ev) => { ev.stopPropagation(); live.current.onSelect && live.current.onSelect(e); });
      return new maplibregl.Marker({ element: node, pitchAlignment: 'viewport', rotationAlignment: 'viewport' }).setLngLat([e.lng, e.lat]).addTo(m);
    });
  }, [events, selectedId, dark]);

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
      {React.createElement('div', { ref: el, style: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 } })}
    </View>
  );
});

export default GeoMap;