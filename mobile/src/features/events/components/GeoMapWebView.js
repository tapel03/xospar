import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors as c } from '../../../theme/tokens';
import { MAP_STYLE_URL, HOME, MIN_Z, MAX_Z, MAX_PITCH } from './mapStyle';

const GLYPH = { geo: '◎', economic: '$', cb: '%', energy: 'ϟ', supply: '⚓', commodities: '◍', industry: '⌘', corporate: '↗', disaster: '≋' };

const slim = (events) => events.map((e) => ({ id: e.id, cat: e.cat, title: e.title, severity: e.severity, recent: !!e.recent, lat: e.lat, lng: e.lng }));

function buildHtml({ state }) {
  const cfg = {
    style: MAP_STYLE_URL,
    home: HOME, minZ: MIN_Z, maxZ: MAX_Z, maxPitch: MAX_PITCH, glyph: GLYPH,
    col: { bg: c.bg, text: c.text, white: c.white, black: c.black },
    state,
  };
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link href="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css" rel="stylesheet" />
<script src="https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js"></script>
<style>
html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#f8f4f0;overflow:hidden;touch-action:none;overscroll-behavior:none}
.gm-pulse{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:1px solid ${c.text};animation:gmp 1.8s infinite;pointer-events:none}
@keyframes gmp{from{transform:scale(.8);opacity:.7}to{transform:scale(1.8);opacity:0}}
#err{position:absolute;inset:0;display:none;align-items:center;justify-content:center;color:#555;font:14px sans-serif;text-align:center;padding:24px}
</style></head><body>
<div id="map"></div><div id="err">The map could not load. Check your internet connection.</div>
<script>
var CFG = ${JSON.stringify(cfg)};
function post(o){ try { window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch(e){} }
var state = CFG.state, markers = [], ready = false, map = null;
function opacityExpr(id){ return ['case', ['==', ['get','id'], id || ''], 0.45, 0.22]; }
function draw(){
  if(!ready || !map) return;
  var src = map.getSource('regions');
  if(src){ src.setData(state.regions); map.setPaintProperty('regionFill','fill-opacity',opacityExpr(state.sel)); }
  markers.forEach(function(m){ m.remove(); }); markers = [];
  state.events.forEach(function(e){
    var size = e.severity === 'High' ? 38 : 30, on = e.id === state.sel;
    var node = document.createElement('div');
    node.style.cssText = 'width:'+size+'px;height:'+size+'px;cursor:pointer;';
    if(e.recent){ var p = document.createElement('div'); p.className = 'gm-pulse'; node.appendChild(p); }
    var dot = document.createElement('div');
    dot.textContent = CFG.glyph[e.cat] || '●';
    dot.style.cssText = 'position:absolute;inset:0;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 '+(e.severity==='High'?16:13)+'px sans-serif;background:'+(on?CFG.col.white:CFG.col.bg)+';color:'+(on?CFG.col.black:CFG.col.text)+';border:'+(e.severity==='High'?2:1)+'px solid '+CFG.col.text+';box-shadow:0 1px 4px rgba(0,0,0,0.35);';
    node.appendChild(dot);
    node.addEventListener('click', function(ev){ ev.stopPropagation(); post({type:'select', id:e.id}); });
    markers.push(new maplibregl.Marker({element:node, pitchAlignment:'viewport', rotationAlignment:'viewport'}).setLngLat([e.lng,e.lat]).addTo(map));
  });
}
window.setState = function(s){ state = s; draw(); };
window.zoomBy = function(f){ if(map) map.zoomTo(Math.max(CFG.minZ, Math.min(CFG.maxZ, map.getZoom() + Math.log2(f))), {duration:300}); };
window.resetView = function(){ if(map) map.flyTo({center:CFG.home.center, zoom:CFG.home.zoom, pitch:CFG.home.pitch, bearing:CFG.home.bearing, duration:600}); };
try {
  map = new maplibregl.Map({ container:'map', style:CFG.style, center:CFG.home.center, zoom:CFG.home.zoom, pitch:CFG.home.pitch, bearing:CFG.home.bearing, minZoom:CFG.minZ, maxZoom:CFG.maxZ, maxPitch:CFG.maxPitch, dragRotate:true, pitchWithRotate:true, attributionControl:false });
  // 3D globe. It flattens into a normal map as you zoom in. If this build cannot do it, the flat map still works.
  map.on('style.load', function(){ try { map.setProjection({type:'globe'}); } catch(e){} });
  map.on('zoomend', function(){ post({type:'zoom', z: map.getZoom()}); });
  map.on('load', function(){
    map.resize();
    map.addSource('regions', {type:'geojson', data:state.regions});
    map.addLayer({id:'regionFill', type:'fill', source:'regions', paint:{'fill-color':['get','color'], 'fill-opacity':opacityExpr(state.sel)}});
    map.addLayer({id:'regionLine', type:'line', source:'regions', paint:{'line-color':['get','color'], 'line-width':1.5, 'line-opacity':0.9}});
    map.on('click', 'regionFill', function(ev){
      var id = ev.features && ev.features[0] && ev.features[0].properties.id;
      if(id) post({type:'select', id:id});
    });
    ready = true; draw(); post({type:'zoom', z: map.getZoom()});
  });
  map.on('error', function(e){ if(!ready){ document.getElementById('err').style.display = 'flex'; } });
  window.addEventListener('resize', function(){ if(map) map.resize(); });
  setTimeout(function(){ if(map) map.resize(); }, 300);
} catch(e){ document.getElementById('err').style.display = 'flex'; }
</script></body></html>`;
}

/**
 * Map drawn inside a WebView. Used in Expo Go, where MapLibre's native code is not available.
 * OpenFreeMap "Liberty" style as a 3D globe. Same props as the other GeoMap versions.
 */
const GeoMapWebView = forwardRef(function GeoMapWebView({ events, regions, selectedId, onSelect, onZoom }, ref) {
  const web = useRef(null);
  const live = useRef({});
  live.current = { events, regions, selectedId, onSelect, onZoom };

  // The page is built once. Everything after that is pushed in as new state.
  const html = useMemo(
    () => buildHtml({ state: { events: slim(live.current.events), regions: live.current.regions, sel: live.current.selectedId || null } }),
    [],
  );

  const run = (js) => { if (web.current) web.current.injectJavaScript(`${js};true;`); };

  useEffect(() => {
    run(`window.setState && window.setState(${JSON.stringify({ events: slim(events), regions, sel: selectedId || null })})`);
  }, [events, regions, selectedId]);

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => run(`window.zoomBy && window.zoomBy(${Number(f)})`),
    reset: () => run('window.resetView && window.resetView()'),
  }));

  const onMessage = (e) => {
    let m = null;
    try { m = JSON.parse(e.nativeEvent.data); } catch (err) { return; }
    if (m.type === 'select') {
      const hit = live.current.events.find((x) => x.id === m.id);
      if (hit && live.current.onSelect) live.current.onSelect(hit);
    } else if (m.type === 'zoom' && live.current.onZoom) {
      live.current.onZoom(m.z);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f4f0' }}>
      <WebView
        ref={web}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        nestedScrollEnabled
        setSupportMultipleWindows={false}
        style={{ flex: 1, backgroundColor: '#f8f4f0' }}
      />
    </View>
  );
});

export default GeoMapWebView;