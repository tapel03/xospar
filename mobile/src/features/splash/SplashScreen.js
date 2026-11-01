import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Easing } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { Mark, LogoText, AmbientBackdrop } from '../../components/ui';
import { useStore } from '../../app/store';

export default function SplashScreen({ navigation }) {
  const { ready, profile } = useStore();
  const [minDone, setMinDone] = React.useState(false);
  const left = useRef(false);
  // `ready` means the saved copy on the device has been read (or the server has answered), so returning users
  // go straight into the app, even with no internet. First launch goes through onboarding.
  const next = () => {
    if (left.current) return;
    left.current = true;
    navigation.replace(profile.onboarded ? 'Main' : 'Onboarding', profile.onboarded ? { tab: 'overview' } : undefined);
  };
  useEffect(() => { if (minDone && ready) next(); }, [minDone, ready]);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => setMinDone(true), 1400);
    return () => clearTimeout(t);
  }, []);
  return (
    <Pressable style={{ flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }} onPress={() => { if (ready) next(); }} accessibilityLabel="Continue">
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