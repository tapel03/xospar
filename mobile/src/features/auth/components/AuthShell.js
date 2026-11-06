import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { T, Icon, Mark, AmbientBackdrop, useLayout } from '../../../components/ui';

/** Shared layout for the auth screens: optional back arrow, logo, title, subtitle, then the form. */
export default function AuthShell({ title, sub, onBack, children }) {
  const { medium } = useLayout();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.08} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: medium ? 32 : 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 440, alignSelf: 'center', gap: 16 }}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back" style={{ width: 40, height: 40, marginLeft: -8, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="chevron-left" size={22} />
              </Pressable>
            ) : null}
            <Mark size={56} />
            <View style={{ gap: 6 }}>
              <T v="h1" style={{ fontSize: 30, lineHeight: 36 }}>{title}</T>
              {sub ? <T muted>{sub}</T> : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}