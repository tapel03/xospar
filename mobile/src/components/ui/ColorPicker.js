import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors as c, mono } from '../../theme/tokens';
import { T, Row } from '.';

/* ---------- colour maths: hex <-> hue / saturation / brightness (each 0 to 1) ---------- */
const to2 = (x) => Math.round(Math.max(0, Math.min(1, x)) * 255).toString(16).padStart(2, '0');

export function hsvToHex(h, s, v) {
  const f = (n) => { const k = (n + h * 6) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); };
  return `#${to2(f(5))}${to2(f(3))}${to2(f(1))}`.toUpperCase();
}

export function hexToHsv(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255; const g = ((n >> 8) & 255) / 255; const b = (n & 255) / 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h, s: max ? d / max : 0, v: max };
}

/** One draggable colour bar. Touch or drag anywhere on it. */
function Slider({ id, value, onChange, stops, thumb }) {
  const [w, setW] = useState(0);
  const set = (e) => { if (w) onChange(Math.max(0, Math.min(1, e.nativeEvent.locationX / w))); };
  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ height: 34, justifyContent: 'center' }}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
      onResponderGrant={set}
      onResponderMove={set}
    >
      <View pointerEvents="none" style={{ height: 14, borderRadius: 7, overflow: 'hidden', borderWidth: 1, borderColor: c.border }}>
        {w ? (
          <Svg width={w} height={14}>
            <Defs>
              <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
                {stops.map((col, i) => <Stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={col} />)}
              </LinearGradient>
            </Defs>
            <Rect x={0} y={0} width={w} height={14} fill={`url(#${id})`} />
          </Svg>
        ) : null}
      </View>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: Math.max(0, Math.min(w, value * w)) - 12, top: 5, width: 24, height: 24, borderRadius: 12, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: thumb, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 3 }}
      />
    </View>
  );
}

const HUES = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];

/**
 * Full colour picker: hue, saturation and brightness sliders plus a hex box.
 * value is a hex string like "#44D681". onChange gets a hex string.
 */
export default function ColorPicker({ value, onChange, idPrefix = 'cp' }) {
  const [hsv, setHsv] = useState(() => hexToHsv(value) || { h: 0.4, s: 0.7, v: 0.85 });
  const [txt, setTxt] = useState(String(value || '').toUpperCase());

  // Keep in step when the colour is changed from outside (hex typed, reset, other tab).
  useEffect(() => {
    const now = hsvToHex(hsv.h, hsv.s, hsv.v);
    if (String(value || '').toUpperCase() !== now) {
      const next = hexToHsv(value);
      if (next) setHsv(next);
    }
    setTxt(String(value || '').toUpperCase());
  }, [value]);

  const push = (next) => { setHsv(next); onChange(hsvToHex(next.h, next.s, next.v)); };
  const hex = hsvToHex(hsv.h, hsv.s, hsv.v);

  const typed = (t) => {
    setTxt(t);
    const clean = t.startsWith('#') ? t : `#${t}`;
    if (/^#[0-9a-f]{6}$/i.test(clean)) {
      const next = hexToHsv(clean);
      if (next) { setHsv(next); onChange(clean.toUpperCase()); }
    }
  };

  return (
    <View style={{ gap: 6 }}>
      <Row gap={12}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: hex, borderWidth: 2, borderColor: c.borderStrong }} />
        <View style={{ flex: 1, gap: 4 }}>
          <T v="caption" muted>Hex colour</T>
          <TextInput
            value={txt}
            onChangeText={typed}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            placeholder="#44D681"
            placeholderTextColor={c.faint}
            accessibilityLabel="Hex colour"
            style={{ height: 40, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 12, color: c.text, backgroundColor: c.elevated, fontFamily: mono, fontSize: 14 }}
          />
        </View>
      </Row>
      <T v="caption" muted style={{ marginTop: 6 }}>Hue</T>
      <Slider id={`${idPrefix}h`} value={hsv.h} onChange={(h) => push({ ...hsv, h })} stops={HUES} thumb={hsvToHex(hsv.h, 1, 1)} />
      <T v="caption" muted>Saturation</T>
      <Slider id={`${idPrefix}s`} value={hsv.s} onChange={(s) => push({ ...hsv, s })} stops={[hsvToHex(hsv.h, 0, hsv.v), hsvToHex(hsv.h, 1, hsv.v)]} thumb={hex} />
      <T v="caption" muted>Brightness</T>
      <Slider id={`${idPrefix}v`} value={hsv.v} onChange={(v) => push({ ...hsv, v })} stops={['#000000', hsvToHex(hsv.h, hsv.s, 1)]} thumb={hex} />
    </View>
  );
}