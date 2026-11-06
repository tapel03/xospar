import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Field, Button, Disclaimer } from '../../../components/ui';
import AuthShell from '../components/AuthShell';
import AuthCheckbox from '../components/AuthCheckbox';
import PasswordField from '../components/PasswordField';
import { userApi } from '../../../services/userApi';
import { signIn, ensureSession } from '../../../services/authState';
import { saveToken } from '../../../services/session';
import { featureFlags } from '../../../app/config';
import { useStore } from '../../../app/store';
import { LEGAL } from '../../more/data/legal';
import { friendlyError, ERRORS } from '../../../utils/errorMessages';

const FS = { flexBasis: 'auto', flexGrow: 0 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen({ navigation }) {
  const { reload } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const problems = [];
  if (email && !EMAIL.test(email.trim())) problems.push(ERRORS.validation.email);
  if (password && password.length < 8) problems.push(ERRORS.validation.password);
  if (password && password.length >= 8 && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) problems.push('Use both letters and numbers in your password.');
  if (confirm && confirm !== password) problems.push(ERRORS.validation.passwordMatch);
  const valid = EMAIL.test(email.trim()) && password.length >= 8 && confirm === password && agree;
  const legal = (doc) => navigation.navigate('AuthLegal', { doc });
  const back = () => (navigation.canGoBack() ? navigation.goBack() : navigation.replace('Welcome'));
  const link = (label, doc) => (
    <T v="small" bold style={{ textDecorationLine: 'underline' }} onPress={() => legal(doc)}>{label}</T>
  );

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      if (featureFlags.useBackend) {
        await ensureSession(); // register attaches the new login to this device's session
        const res = await userApi.register(email.trim(), password);
        if (res && res.token) await saveToken(res.token, remember);
      }
      await signIn({ email: email.trim(), remember });

      // Keep a record of when this person accepted the legal documents, and which version.
      if (featureFlags.useBackend) {
        try {
          await userApi.patchProfile({
            termsAcceptedAt: Date.now(),
            termsVersion: LEGAL.terms.updated,
            privacyVersion: LEGAL.privacy.updated,
            rulesVersion: LEGAL.rules.updated,
            ageConfirmed: true,
          });
        } catch { /* the account exists; the record can be retried at next sign-in */ }
      }

      await reload();
      // New account: the splash sends it to Onboarding because it has not been onboarded yet.
      navigation.reset({ index: 0, routes: [{ name: 'Splash', params: { quick: true } }] });
    } catch (e) {
      setError(friendlyError(e, 'signup'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" sub="It takes a minute. Then we will tailor the mentor to how you trade." onBack={back}>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={FS} />
      <PasswordField label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" />
      <PasswordField label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Type it again" onSubmitEditing={submit} />

      <View style={{ gap: 12, marginTop: 4 }}>
        <AuthCheckbox value={agree} onChange={setAgree} label="I agree to the Terms of use, Privacy policy and House rules">
          <T v="small">
            I am at least 18 years old and I agree to the {link('Terms of use', 'terms')}, the {link('Privacy policy', 'privacy')} and the {link('House rules', 'rules')}.
          </T>
        </AuthCheckbox>
        <AuthCheckbox value={remember} onChange={setRemember} label="Remember me on this device">
          <Pressable onPress={() => setRemember(!remember)}><T v="small">Remember me on this device</T></Pressable>
        </AuthCheckbox>
      </View>

      {problems.length || error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red, gap: 4 }}>
          {[...problems, ...(error ? [error] : [])].map((p) => <T key={p} v="small">⚠  {p}</T>)}
        </View>
      ) : null}

      <Button label={busy ? 'Creating account…' : 'Create account'} icon="user-plus" disabled={!valid || busy} onPress={submit} />
      {!agree ? <T v="caption" muted style={{ textAlign: 'center' }}>Tick the box above to confirm you are 18 or older and accept the terms.</T> : null}

      <Disclaimer>Edgeline provides analysis and journaling tools for education, not financial advice. Trading carries a high risk of loss.</Disclaimer>

      <Row style={{ justifyContent: 'center' }} gap={6}>
        <T v="small" muted>Already have an account?</T>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10}><T v="small" bold>Sign in</T></Pressable>
      </Row>
    </AuthShell>
  );
}