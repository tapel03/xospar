import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Easing } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { Mark, LogoText, AmbientBackdrop } from '../../components/ui';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => navigation.replace('Onboarding'), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <Pressable style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.replace('Onboarding')} accessibilityLabel="Continue">
      <AmbientBackdrop opacity={0.10} />

      {/* Logo mark in the middle */}
      <Animated.View style={{ alignItems: 'center', opacity: fade, transform: [{ translateY: rise }] }}>
        <Mark size={180} />
      </Animated.View>

      {/* Logo text at the bottom */}
      <Animated.View style={{ position: 'absolute', bottom: 64, alignItems: 'center', opacity: fade }}>
        <LogoText height={36} width={180} />
      </Animated.View>
    </Pressable>
  );
}