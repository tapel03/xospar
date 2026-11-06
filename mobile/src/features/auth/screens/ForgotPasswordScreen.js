import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Field, Button } from '../../../components/ui';
import AuthShell from '../components/AuthShell';
import { userApi } from '../../../services/userApi';
import { featureFlags } from '../../../app/config';
import { friendlyError, ERRORS } from '../../../utils/errorMessages';

const FS = { flexBasis: 'auto', flexGrow: 0 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = EMAIL.test(email.trim());
  const hint = email && !valid ? ERRORS.validation.email : '';

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      if (featureFlags.useBackend) await userApi.forgotPassword(email.trim());
      navigation.navigate('OTP', { email: email.trim() });
    } catch (e) {
      setError(friendlyError(e, 'forgot'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot your password?" sub="Enter your email and we will send you a 6-digit code to reset it.">
      <Field label="Email" value={email} onChangeText={(t) => { setEmail(t); setError(''); }} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} onSubmitEditing={submit} hint={hint} style={FS} />

      {error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red }}>
          <T v="small">⚠  {error}</T>
        </View>
      ) : null}

      <Button label={busy ? 'Sending…' : 'Send code'} icon="mail" disabled={!valid || busy} onPress={submit} />

      <Row style={{ justifyContent: 'center' }} gap={6}>
        <T v="small" muted>Remembered it?</T>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10}><T v="small" bold>Sign in</T></Pressable>
      </Row>
    </AuthShell>
  );
}