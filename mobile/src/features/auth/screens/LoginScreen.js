import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Field, Button } from '../../../components/ui';
import AuthShell from '../components/AuthShell';
import AuthCheckbox from '../components/AuthCheckbox';
import { userApi } from '../../../services/userApi';
import { signIn } from '../../../services/authState';
import { featureFlags } from '../../../app/config';
import { useStore } from '../../../app/store';
import { friendlyError, ERRORS } from '../../../utils/errorMessages';

const FS = { flexBasis: 'auto', flexGrow: 0 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { reload } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const emailOk = EMAIL.test(email.trim());
  const valid = emailOk && password.length > 0;
  const hint = email && !emailOk ? ERRORS.validation.email : '';
  const legal = (doc) => navigation.navigate('AuthLegal', { doc });
  const back = () => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Welcome'));

  const submit = async () => {
    if (busy) return;
    if (!valid) { setError(!emailOk ? ERRORS.validation.email : 'Enter your password.'); return; }
    setBusy(true);
    setError('');
    try {
      let token = null;
      if (featureFlags.useBackend) {
        const res = await userApi.login(email.trim(), password);
        token = res && res.token; // change this if your server names the token differently
        if (!token) throw new Error('no token');
      }
      await signIn({ token, email: email.trim(), remember });
      await reload(); // load this user's profile, journal and settings
      // The splash decides next: Onboarding for a first-time user, Main for everyone else.
      navigation.reset({ index: 0, routes: [{ name: 'Splash', params: { quick: true } }] });
    } catch (e) {
      setError(e && e.status ? friendlyError(e, 'login') : e && e.code ? friendlyError(e, 'login') : 'We could not sign you in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" sub="Sign in to see your journal, alerts and mentor." onBack={back}>
      <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); setError(''); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} hint={hint} style={FS} />
      <Field label="Password" value={password} onChangeText={(t) => { setPassword(t); setError(''); }} placeholder="Your password" secureTextEntry autoCapitalize="none" autoCorrect={false} onSubmitEditing={submit} style={FS} />

      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }} gap={12}>
        <View style={{ flexShrink: 1 }}>
          <AuthCheckbox value={remember} onChange={setRemember} label="Remember me">
            <Pressable onPress={() => setRemember(!remember)}><T v="small">Remember me</T></Pressable>
          </AuthCheckbox>
        </View>
        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Forgot password" style={{ flexShrink: 0 }}>
          <T v="small" bold style={{ textDecorationLine: 'underline' }}>Forgot password?</T>
        </Pressable>
      </Row>

      {error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red }}>
          <T v="small">⚠  {error}</T>
        </View>
      ) : null}

      <Button label={busy ? 'Signing in…' : 'Sign in'} icon="log-in" disabled={!valid || busy} onPress={submit} />

      <T v="caption" muted style={{ textAlign: 'center' }}>
        By signing in you agree to our{' '}
        <T v="caption" bold style={{ textDecorationLine: 'underline' }} onPress={() => legal('terms')}>Terms of use</T>
        {' '}and{' '}
        <T v="caption" bold style={{ textDecorationLine: 'underline' }} onPress={() => legal('privacy')}>Privacy policy</T>.
      </T>

      <Row style={{ justifyContent: 'center' }} gap={6}>
        <T v="small" muted>New to Edgeline?</T>
        <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={10}><T v="small" bold>Create an account</T></Pressable>
      </Row>
    </AuthShell>
  );
}