import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Animated, Easing } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { Mark, LogoText, AmbientBackdrop } from '../../components/ui';
import { useStore } from '../../app/store';
import { loadAuth } from '../../services/authState';

/*
 * Where the app goes after the splash:
 *   not signed in                 -> Welcome (Sign in / Create account)
 *   signed in, first time         -> Onboarding
 *   signed in, already onboarded  -> Main
 * Login and Sign up come back here (with quick: true) once the user is signed in, so this is the only place that decides.
 */
export default function SplashScreen({ navigation, route }) {
  const { ready, profile } = useStore();
  const quick = !!route?.params?.quick;
  const [minDone, setMinDone] = useState(quick);
  const [authed, setAuthed] = useState(null); // null = still reading the saved sign-in
  const left = useRef(false);

  useEffect(() => {
    let live = true;
    loadAuth().then((a) => { if (live) setAuthed(a.signedIn); });
    return () => { live = false; };
  }, []);

  const next = () => {
    if (left.current || authed === null) return;
    left.current = true;
    if (!authed) navigation.replace('Welcome');
    else if (profile.onboarded) navigation.replace('Main', { tab: 'overview' });
    else navigation.replace('Onboarding');
  };
  useEffect(() => { if (minDone && ready && authed !== null) next(); }, [minDone, ready, authed]);

  const fade = useRef(new Animated.Value(quick ? 1 : 0)).current;
  const rise = useRef(new Animated.Value(quick ? 0 : 12)).current;
  useEffect(() => {
    if (quick) return undefined;
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

      <Animated.View style={{ alignItems: 'center', opacity: fade, transform: [{ translateY: rise }] }}>
        <Mark size={180} />
      </Animated.View>

      <Animated.View style={{ position: 'absolute', bottom: 64, alignItems: 'center', opacity: fade }}>
        <LogoText height={36} width={180} />
      </Animated.View>
    </Pressable>
  );
}