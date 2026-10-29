// Shows an asset's icon: provider logo, a pair of currency icons for forex, or a local fallback.
// `icon` is a record from useAssetIcons (may be null while loading). Colours here are neutral
// placeholders: swap them for your theme tokens.
import React, { useState } from 'react';
import { Image, Text, View } from 'react-native';

const FLAGS = { EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵', AUD: '🇦🇺', CAD: '🇨🇦', CHF: '🇨🇭', NZD: '🇳🇿' };

const Circle = ({ size, children, style }) => (
  <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9EAEE' }, style]}>
    {children}
  </View>
);

function Remote({ uri, size, onFail, style }) {
  return (
    <Circle size={size} style={style}>
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" onError={onFail} />
    </Circle>
  );
}

function Letters({ sym, size }) {
  const text = sym.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  return <Circle size={size}><Text style={{ fontSize: size * 0.34, fontWeight: '700', color: '#444' }}>{text}</Text></Circle>;
}

export default function AssetIcon({ sym, icon, size = 36 }) {
  const [failed, setFailed] = useState(false);
  const fail = () => setFailed(true);

  // Forex pair: base and quote overlap.
  if (sym.includes('/') && icon?.type === 'forex' || (!icon && /^[A-Z]{3}\/[A-Z]{3}$/.test(sym))) {
    const [b, q] = sym.split('/');
    const small = size * 0.7;
    const part = (code, uri, style) => (uri && !failed
      ? <Remote uri={uri} size={small} onFail={fail} style={style} />
      : <Circle size={small} style={style}><Text style={{ fontSize: small * 0.6 }}>{FLAGS[code] || code}</Text></Circle>);
    return (
      <View style={{ width: size, height: size }}>
        <View style={{ position: 'absolute', left: 0, top: 0 }}>{part(b, icon?.baseIconUrl)}</View>
        <View style={{ position: 'absolute', right: 0, bottom: 0, borderWidth: 1.5, borderColor: '#fff', borderRadius: small / 2 }}>{part(q, icon?.quoteIconUrl)}</View>
      </View>
    );
  }

  if (icon?.iconUrl && !failed) return <Remote uri={icon.iconUrl} size={size} onFail={fail} />;
  return <Letters sym={sym} size={size} />;
}