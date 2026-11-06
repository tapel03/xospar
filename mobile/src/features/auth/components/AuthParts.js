import React, { useState } from 'react';
import { View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { T, Icon, AmbientBackdrop, Row, s as ui } from '../../../components/ui';

/** Shared page layout for every auth screen: back arrow, optional right-hand label, centred content column. */
export function AuthScreen({ navigation, onBack, showBack = true, rightLabel, onRight, children, scroll = true }) {
  const canBack = onBack || (navigation && navigation.canGoBack && navigation.canGoBack());
  const body = scroll ? (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : <View style={{ flex: 1 }}>{children}</View>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.08} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 8 }}>
          <Row style={{ justifyContent: 'space-between', height: 44, marginBottom: 12 }}>
            {showBack && canBack ? (
              <Pressable onPress={onBack || (() => navigation.goBack())} hitSlop={12} accessibilityLabel="Back" style={{ width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevron-left" size={24} />
              </Pressable>
            ) : <View />}
            {rightLabel ? <Pressable onPress={onRight} hitSlop={12}><T v="small" muted>{rightLabel}</T></Pressable> : null}
          </Row>
          {body}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const Heading = ({ title, sub }) => (
  <View style={{ marginBottom: 24, gap: 6 }}>
    <T v="h1" style={{ fontSize: 30, lineHeight: 36 }}>{title}</T>
    {sub ? <T muted>{sub}</T> : null}
  </View>
);

/** Text box with a label, an optional element on the right, and an optional error line. */
export function AuthField({ label, error, right, style, ...props }) {
  return (
    <View style={[{ gap: 6, marginBottom: 12 }, style]}>
      {label ? <T v="label">{label}</T> : null}
      <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 10 }, error && { borderColor: c.red }]}>
        <TextInput
          placeholderTextColor={c.faint}
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, color: c.text, fontSize: 14, minHeight: 46 }}
          {...props}
        />
        {right}
      </View>
      {error ? <T v="caption" style={{ color: c.red }}>{error}</T> : null}
    </View>
  );
}

/** Password box with a Show / Hide switch. */
export function PasswordField({ label = 'Password', ...props }) {
  const [hidden, setHidden] = useState(true);
  return (
    <AuthField
      label={label}
      secureTextEntry={hidden}
      textContentType="password"
      right={(
        <Pressable onPress={() => setHidden(!hidden)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
          <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={c.muted} />
        </Pressable>
      )}
      {...props}
    />
  );
}

/** Returns a message when the password is not acceptable, otherwise ''. The server must check this too. */
export function passwordProblem(pw, repeat) {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Use both letters and numbers.';
  if (repeat !== undefined && pw !== repeat) return 'The two passwords do not match.';
  return '';
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

export function Checkbox({ checked, onToggle, children }) {
  return (
    <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked }} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: checked ? 0 : 1.5, borderColor: c.borderStrong, backgroundColor: checked ? c.blue : 'transparent', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {checked ? <Icon name="check" size={14} color="#FFFFFF" /> : null}
      </View>
      <View style={{ flex: 1 }}>{children}</View>
    </Pressable>
  );
}

/** Small tappable text inside a sentence, such as "Terms of Service". */
export const InlineLink = ({ onPress, children }) => (
  <Text onPress={onPress} style={{ color: c.blue, fontWeight: '700' }}>{children}</Text>
);

export function Dots({ total, active }) {
  return (
    <Row gap={6} style={{ justifyContent: 'center', marginVertical: 18 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === active ? 22 : 8, height: 4, borderRadius: 2, backgroundColor: i <= active ? c.text : c.borderStrong }} />
      ))}
    </Row>
  );
}

/** tone: 'error' (red) or 'ok' (green). */
export function Banner({ tone = 'error', children }) {
  if (!children) return null;
  const col = tone === 'ok' ? c.green : c.red;
  return (
    <View style={{ padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: col, marginBottom: 12 }}>
      <T v="small">{tone === 'ok' ? '✓  ' : '⚠  '}{children}</T>
    </View>
  );
}

/** One box per digit of the code. */
export function OtpBoxes({ value, length }) {
  return (
    <Row gap={10} style={{ justifyContent: 'center', marginVertical: 20 }}>
      {Array.from({ length }).map((_, i) => {
        const on = i === value.length;
        return (
          <View key={i} style={{ width: 46, height: 56, borderRadius: 12, borderWidth: on ? 2 : 1, borderColor: on ? c.blue : c.border, backgroundColor: c.elevated, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ fontSize: 24, fontWeight: '700' }}>{value[i] || ''}</T>
          </View>
        );
      })}
    </Row>
  );
}

const KEYS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'back']];

/** On-screen number pad, like the one in the design kit. onKey gets '0'-'9' or 'back'. */
export function Keypad({ onKey }) {
  return (
    <View style={{ backgroundColor: c.elevated, borderRadius: 16, padding: 8, marginTop: 8 }}>
      {KEYS.map((row, i) => (
        <Row key={i} gap={8} style={{ marginBottom: i < 3 ? 8 : 0 }}>
          {row.map((k, j) => (k === '' ? <View key={j} style={{ flex: 1 }} /> : (
            <Pressable key={j} onPress={() => onKey(k)} accessibilityLabel={k === 'back' ? 'Delete' : k}
              style={({ pressed }) => [{ flex: 1, height: 52, borderRadius: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.6 }]}>
              {k === 'back' ? <Icon name="delete" size={20} /> : <T style={{ fontSize: 20, fontWeight: '600' }}>{k}</T>}
            </Pressable>
          )))}
        </Row>
      ))}
    </View>
  );
}