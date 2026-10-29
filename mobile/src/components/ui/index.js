import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ScrollView, Modal, TextInput, KeyboardAvoidingView, Keyboard, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Rect, Defs, LinearGradient, RadialGradient, Stop } from 'react-native-svg';
import { colors as c, radius, mono, themed, useMode } from '../../theme/tokens';

export function useLayout() {
  const { width, height } = useWindowDimensions();
  return { width, height, wide: width >= 1024, medium: width >= 700 };
}

/** True while the on-screen keyboard is open. */
export function useKeyboard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return open;
}

export const Icon = ({ name, size = 18, color = c.text, style }) => <Feather name={name} size={size} color={color} style={style} />;

/** Soft coloured glow behind screens. Dark theme only: on the light theme it would look like dirty smudges. */
export function AmbientBackdrop({ opacity = 0.42 }) {
  if (!c.glow) return null;
  return (
    <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="glowLime" cx="18%" cy="0%" rx="70%" ry="55%">
          <Stop offset="0%" stopColor="#17312A" stopOpacity={opacity * 0.65} />
          <Stop offset="100%" stopColor={c.lime} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowLav" cx="95%" cy="15%" rx="60%" ry="50%">
          <Stop offset="0%" stopColor="#17201F" stopOpacity={opacity * 0.7} />
          <Stop offset="100%" stopColor={c.lavender} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="glowPink" cx="8%" cy="100%" rx="75%" ry="50%">
          <Stop offset="0%" stopColor="#121817" stopOpacity={opacity * 0.65} />
          <Stop offset="100%" stopColor={c.pink} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#glowLime)" />
      <Rect width="100%" height="100%" fill="url(#glowLav)" />
      <Rect width="100%" height="100%" fill="url(#glowPink)" />
    </Svg>
  );
}

/**
 * Fills its parent completely. It has no corner radius of its own: the parent's
 * borderRadius and overflow: 'hidden' clip it, so the gradient always matches the card shape.
 * Colours come from the theme (gradA / gradB) so it works in light and dark.
 * The size is measured from the parent and the gradient is drawn at exactly that size,
 * so it never ends up covering only part of the card.
 */
export function SoftGradient({ opacity = 1 }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((p) => (p.w === width && p.h === height ? p : { w: width, h: height }));
  };
  return (
    <View pointerEvents="none" onLayout={onLayout} style={StyleSheet.absoluteFill}>
      {size.w > 0 && size.h > 0 ? (
        <Svg width={size.w} height={size.h}>
          <Defs>
            <LinearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={c.gradA} stopOpacity={opacity} />
              <Stop offset="1" stopColor={c.gradB} stopOpacity={opacity} />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={size.w} height={size.h} fill="url(#edgeGradient)" />
        </Svg>
      ) : null}
    </View>
  );
}

const variants = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8, lineHeight: 40 },
  h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4, lineHeight: 30 },
  h2: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2, lineHeight: 24 },
  h3: { fontSize: 15, fontWeight: '600', lineHeight: 20 },
  body: { fontSize: 14, lineHeight: 21 },
  small: { fontSize: 13, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
  caption: { fontSize: 12, lineHeight: 16 },
};

/** Text. Use v="small" or the shorthand `small`. */
export function T({ v = 'body', small, muted, mono: isMono, bold, style, children, ...rest }) {
  const variant = small ? 'small' : v;
  return (
    <Text
      style={[{ color: muted ? c.muted : c.text }, variants[variant], isMono && { fontFamily: mono, fontVariant: ['tabular-nums'] }, bold && { fontWeight: '700' }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}

/**
 * Logo files, one set per theme. The logos are white, so dark mode uses the white files
 * and light mode uses the dark files. Put all four files in the assets folder:
 *   assets/logo_white.png        assets/logo_dark.png
 *   assets/logo_text_white.png   assets/logo_text_dark.png
 */
const LOGOS = {
  dark: {
    mark: require('../../../assets/logo_white.png'),
    text: require('../../../assets/logo_text_white.png'),
  },
  light: {
    mark: require('../../../assets/logo_dark.png'),
    text: require('../../../assets/logo_text_dark.png'),
  },
};

/** The Edgeline logo mark. Switches between the white and dark file with the theme. */
export function Mark({ size = 28 }) {
  const mode = useMode();
  return (
    <Image
      source={LOGOS[mode].mark}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="Edgeline logo"
    />
  );
}

/** The "Edgeline" logo text. Switches between the white and dark file with the theme. Set height and width to fit. */
export function LogoText({ height = 22, width, style }) {
  const mode = useMode();
  return (
    <Image
      source={LOGOS[mode].text}
      style={[{ height, width: width || height * 4 }, style]}
      resizeMode="contain"
      accessibilityLabel="Edgeline"
    />
  );
}

export const Row = ({ children, style, gap = 8 }) => <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
export const Grid = ({ children, gap = 12, style }) => <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap }, style]}>{children}</View>;
export const Divider = ({ style }) => <View style={[{ height: 1, backgroundColor: c.border }, style]} />;

export function Card({ children, style, ai, onPress, pad = 16, gradient = false }) {
  const Comp = onPress ? Pressable : View;
  const content = <>{gradient ? <SoftGradient /> : null}{children}</>;
  return (
    <Comp onPress={onPress} style={onPress ? ({ pressed }) => [s.card, gradient && s.gradientCard, { padding: pad }, ai && s.ai, style, pressed && { opacity: 0.85 }] : [s.card, gradient && s.gradientCard, { padding: pad }, ai && s.ai, style]}>
      {content}
    </Comp>
  );
}

export const AITag = ({ label = 'AI' }) => (
  <View style={s.tag}><Text style={s.tagText}>✦ {label}</Text></View>
);
export const MyAlertTag = () => (
  <View style={[s.tag, { borderStyle: 'solid', borderColor: c.text }]}><Row gap={4}><Icon name="bell" size={11} /><Text style={s.tagText}>My alert</Text></Row></View>
);

/** Built on demand so the colours follow the light/dark theme. */
const badgeKinds = () => ({
  pos: { glyph: '▲', box: { backgroundColor: c.white, borderColor: c.white }, txt: { color: c.black, fontWeight: '700' } },
  neg: { glyph: '▼', box: { borderColor: c.text }, txt: {} },
  warn: { glyph: '⚠', box: { borderColor: c.text, borderWidth: 2 }, txt: { fontWeight: '700' } },
  fail: { glyph: '✕', box: { backgroundColor: c.bg, borderColor: c.muted, borderStyle: 'dashed' }, txt: { fontWeight: '600' } },
  pass: { glyph: '✓', box: { borderColor: c.borderStrong }, txt: {} },
  neutral: { glyph: '', box: { backgroundColor: c.elevated, borderColor: c.border }, txt: { color: c.muted } },
  solid: { glyph: '', box: { backgroundColor: c.white, borderColor: c.white }, txt: { color: c.black, fontWeight: '700' } },
});
export function Badge({ kind = 'neutral', label, glyph, style }) {
  const b = badgeKinds()[kind];
  const g = glyph !== undefined ? glyph : b.glyph;
  return (
    <View style={[s.badge, b.box, style]}>
      <Text style={[s.badgeText, b.txt]}>{g ? `${g} ` : ''}{label}</Text>
    </View>
  );
}

export const signed = (v, d = 2, suf = '') => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}${suf}`;
export const money = (v) => `${v >= 0 ? '+' : '−'}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function Delta({ value, suffix = '%', decimals = 2, size = 13, style }) {
  const up = value >= 0;
  return <T mono style={[{ fontSize: size, fontWeight: up ? '700' : '400' }, style]}>{up ? '▲ ' : '▼ '}{signed(value, decimals, suffix)}</T>;
}

/** Primary buttons are solid with contrasting text, with softly rounded corners. */
export function Button({ label, onPress, variant = 'primary', icon, style, disabled, small }) {
  const primary = variant === 'primary';
  const box = primary
    ? { backgroundColor: c.btn }
    : variant === 'secondary' ? { borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.surface } : {};
  const col = primary ? c.btnText : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      hitSlop={small ? 6 : 0}
      style={({ pressed }) => [s.btn, small && s.btnSm, box, (pressed || disabled) && { opacity: disabled ? 0.35 : 0.72 }, style]}
    >
      {icon ? <Icon name={icon} size={small ? 14 : 16} color={col} /> : null}
      <Text style={{ color: col, fontWeight: '700', fontSize: small ? 13 : 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented({ options, value, onChange, style, scroll, counts }) {
  const items = options.map((o) => {
    const on = o === value;
    return (
      <Pressable key={o} onPress={() => onChange(o)} style={[s.seg, on && s.segOn]} accessibilityState={{ selected: on }}>
        <Text style={{ color: on ? c.white : c.muted, fontWeight: on ? '700' : '500', fontSize: 13 }}>
          {o}{counts && counts[o] != null ? `  ${counts[o]}` : ''}
        </Text>
      </Pressable>
    );
  });
  if (scroll) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ flexGrow: 0 }, style]} contentContainerStyle={s.segWrap}>
        {items}
      </ScrollView>
    );
  }
  return <View style={[s.segWrap, style]}>{items}</View>;
}

export function Chip({ label, on, onPress, icon, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.chip, on && s.chipOn, pressed && { opacity: 0.7 }, style]} accessibilityState={{ selected: !!on }}>
      {icon ? <Icon name={icon} size={14} color={on ? c.white : c.text} /> : null}
      <Text style={{ color: on ? c.white : c.text, fontSize: 13, fontWeight: on ? '700' : '500' }}>{label}</Text>
    </Pressable>
  );
}

export function Stat({ label, value, children, style, size = 'h2' }) {
  return (
    <View style={[{ minWidth: 104, flexGrow: 1, gap: 4 }, style]}>
      <T v="caption" muted>{label}</T>
      {children || <T v={size} mono>{value}</T>}
    </View>
  );
}

export function Metric({ label, value, sub, style }) {
  return (
    <View style={[s.metric, style]}>
      <T v="caption" muted>{label}</T>
      <T v="h2" mono style={{ marginTop: 6 }}>{value}</T>
      {sub ? (typeof sub === 'string' ? <T v="caption" muted style={{ marginTop: 2 }}>{sub}</T> : sub) : null}
    </View>
  );
}

export function SectionHeader({ title, action, onAction, right, style }) {
  return (
    <Row style={[{ justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }, style]}>
      <Row>
        <T v="h2">{title}</T>
        {right}
      </Row>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <T v="small" muted style={{ textDecorationLine: 'underline' }}>{action}</T>
        </Pressable>
      ) : null}
    </Row>
  );
}

const CHECK = { pass: '✓', warn: '⚠', fail: '✕', info: '•' };
export function CheckRow({ status, label, detail, last }) {
  const strong = status === 'warn' || status === 'fail';
  return (
    <View style={[{ flexDirection: 'row', gap: 12, paddingVertical: 10 }, !last && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <View style={[s.checkBox, status === 'pass' && { backgroundColor: c.white }, status === 'warn' && { borderWidth: 2, borderColor: c.text }, status === 'fail' && { borderStyle: 'dashed', borderColor: c.muted }]}>
        <Text style={{ color: status === 'pass' ? c.black : c.text, fontWeight: '700', fontSize: 13 }}>{CHECK[status]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <T v="h3" style={{ fontWeight: strong ? '700' : '500' }}>{label}</T>
        {detail ? <T v="small" muted style={{ marginTop: 2 }}>{detail}</T> : null}
      </View>
    </View>
  );
}

export function Bar({ value, max = 100, height = 6, style, dashed }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <View style={[{ height, backgroundColor: c.border, borderRadius: height, overflow: 'hidden' }, style]}>
      <View style={[{ width: `${pct}%`, height: '100%', backgroundColor: c.lime, borderRadius: height }, dashed && { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.text, borderStyle: 'dashed' }]} />
    </View>
  );
}

/**
 * Plain full-height container. Keyboard avoidance now lives once, at the app Frame level
 * (and inside each Sheet), so nested wrappers never double-pad.
 */
export function KeyboardSafe({ children, style }) {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
}

export function Screen({ children, style, scroll = true }) {
  const { wide } = useLayout();
  const inner = [{ padding: wide ? 24 : 16, paddingBottom: 72, width: '100%', maxWidth: 1360, alignSelf: 'center' }, style];
  if (!scroll) return <KeyboardSafe style={{ backgroundColor: c.bg }}><AmbientBackdrop opacity={0.12} /><View style={[{ flex: 1 }, ...inner]}>{children}</View></KeyboardSafe>;
  return (
    <KeyboardSafe style={{ backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.10} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={inner} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardSafe>
  );
}

export function PageTitle({ kicker, title, right, onBack, style }) {
  return (
    <Row style={[{ justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }, style]}>
      <Row gap={12} style={{ flexShrink: 1 }}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={8} style={s.backBtn} accessibilityLabel="Back"><Icon name="chevron-left" size={22} /></Pressable>
        ) : null}
        <View style={{ flexShrink: 1 }}>
          {kicker ? <T v="small" muted>{kicker}</T> : null}
          <T v="h1">{title}</T>
        </View>
      </Row>
      {right ? <Row gap={8} style={{ flexWrap: 'wrap' }}>{right}</Row> : null}
    </Row>
  );
}

/** Modal sheet. It has no close icon: tap outside it (or press Back on Android) to close. */
export function Sheet({ visible, onClose, title, children, footer }) {
  const { wide } = useLayout();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={[s.backdrop, wide && { justifyContent: 'center', alignItems: 'center' }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
          <View style={[s.sheet, wide ? { width: 560, borderRadius: 16, maxHeight: '88%' } : { maxHeight: '92%' }]}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <T v="h2">{title}</T>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">{children}</ScrollView>
            {footer ? <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: c.border }}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Field({ label, hint, style, multiline, ...props }) {
  return (
    <View style={[{ gap: 6, flexGrow: 1, flexBasis: 160 }, style]}>
      {label ? <T v="label">{label}</T> : null}
      <TextInput
        placeholderTextColor={c.faint}
        multiline={multiline}
        style={[s.input, multiline && { minHeight: 88, textAlignVertical: 'top', paddingTop: 12 }]}
        {...props}
      />
      {hint ? <T v="caption" muted>{hint}</T> : null}
    </View>
  );
}

/** On/off setting shown as the same Off | On pill used by the other option pickers. */
export function Toggle({ label, detail, value, onChange }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 10, gap: 16 }}>
      <View style={{ flex: 1 }}>
        <T v="h3" style={{ fontWeight: '500' }}>{label}</T>
        {detail ? <T v="small" muted>{detail}</T> : null}
      </View>
      <Segmented options={['Off', 'On']} value={value ? 'On' : 'Off'} onChange={(v) => onChange(v === 'On')} />
    </Row>
  );
}

export function Disclaimer({ children, style }) {
  return (
    <Row style={[{ alignItems: 'flex-start', marginTop: 12 }, style]} gap={6}>
      <Icon name="info" size={13} color={c.muted} style={{ marginTop: 2 }} />
      <T v="caption" muted style={{ flex: 1 }}>{children}</T>
    </Row>
  );
}

export function Empty({ icon = 'inbox', title, body, action, onAction }) {
  return (
    <View style={{ alignItems: 'center', padding: 32, gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: c.border, borderRadius: 16 }}>
      <Icon name={icon} size={24} color={c.muted} />
      <T v="h3">{title}</T>
      {body ? <T v="small" muted style={{ textAlign: 'center', maxWidth: 320 }}>{body}</T> : null}
      {action ? <Button small label={action} onPress={onAction} style={{ marginTop: 8 }} /> : null}
    </View>
  );
}

export const Skeleton = ({ height = 14, width = '100%', style }) => (
  <View style={[{ height, width, borderRadius: 6, backgroundColor: c.elevated }, style]} />
);

/** Shared styles. Built per theme (see themed in tokens.js), so they follow light/dark. */
export const s = themed(() => ({
  card: { backgroundColor: c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, overflow: 'hidden', shadowColor: '#000000', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  gradientCard: { backgroundColor: c.gradB, borderColor: c.borderStrong, shadowOpacity: 0.18 },
  ai: { backgroundColor: c.elevated, borderLeftWidth: 2, borderLeftColor: c.lavender },
  tag: { borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { color: c.text, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  badge: { borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, alignSelf: 'flex-start', backgroundColor: c.elevated },
  badgeText: { color: c.text, fontSize: 12, fontWeight: '500' },
  btn: { minHeight: 50, paddingHorizontal: 20, borderRadius: radius.btn, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSm: { minHeight: 38, paddingHorizontal: 13, borderRadius: radius.btnSm },
  segWrap: { flexDirection: 'row', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 999, padding: 3, gap: 2, alignSelf: 'flex-start' },
  seg: { paddingHorizontal: 12, minHeight: 36, borderRadius: 999, justifyContent: 'center' },
  segOn: { backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.borderStrong },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: c.borderStrong },
  chipOn: { backgroundColor: c.elevated2, borderColor: c.borderStrong },
  // Dark: a slightly lifted tile. Light: white with a soft shadow, the same as the other cards.
  metric: { flexGrow: 1, flexBasis: 150, padding: 16, backgroundColor: c.glow ? c.elevated : c.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: c.border, ...(c.glow ? null : { shadowColor: '#000000', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 3 }) },
  checkBox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  iconBtn: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  // Back arrow: no border and no background, just the arrow. The negative margin lines it up with the page edge.
  backBtn: { width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.24)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: c.border, shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  input: { minHeight: 50, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 14, color: c.text, backgroundColor: c.elevated, fontSize: 14 },
}));