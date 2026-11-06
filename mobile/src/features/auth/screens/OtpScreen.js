import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Field, Button } from '../../../components/ui';
import AuthShell from '../components/AuthShell';
import { userApi } from '../../../services/userApi';
import { featureFlags } from '../../../app/config';
import { friendlyError, ERRORS } from '../../../utils/errorMessages';

const FS = { flexBasis: 'auto', flexGrow: 0 };
const COOLDOWN = 30;

export default function OtpScreen({ navigation, route }) {
  const email = route.params?.email || '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [left, setLeft] = useState(COOLDOWN);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (left <= 0) return undefined;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const valid = /^\d{6}$/.test(code);
  const hint = code && !valid ? ERRORS.validation.code : '';

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      let resetToken = 'local';
      if (featureFlags.useBackend) {
        const res = await userApi.verifyResetCode(email, code);
        resetToken = res && res.resetToken;
        if (!resetToken) throw Object.assign(new Error('rejected'), { status: 400 });
      }
      navigation.navigate('SetPassword', { email, resetToken });
    } catch (e) {
      setError(friendlyError(e, 'otp'));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    if (left > 0) return;
    setError('');
    setSent(false);
    try {
      if (featureFlags.useBackend) await userApi.forgotPassword(email);
      setLeft(COOLDOWN);
      setSent(true);
    } catch (e) {
      setError(friendlyError(e, 'resend'));
    }
  };

  return (
    <AuthShell title="Check your email" sub={`We sent a 6-digit code to ${email || 'your email'}. It works for 10 minutes.`}>
      <Field label="6-digit code" value={code} onChangeText={(t) => { setCode(t.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="123456" keyboardType="number-pad" maxLength={6} autoCorrect={false} onSubmitEditing={submit} hint={hint} style={FS} />

      {error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red }}>
          <T v="small">⚠  {error}</T>
        </View>
      ) : null}
      {sent && !error ? <T v="small" muted>A new code is on its way. Check your spam folder if you do not see it.</T> : null}

      <Button label={busy ? 'Checking…' : 'Continue'} icon="arrow-right" disabled={!valid || busy} onPress={submit} />

      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}><T v="small" muted style={{ textDecorationLine: 'underline' }}>Change email</T></Pressable>
        <Pressable onPress={resend} disabled={left > 0} hitSlop={10}>
          <T v="small" bold={left <= 0} muted={left > 0}>{left > 0 ? `Resend code in ${left}s` : 'Resend code'}</T>
        </Pressable>
      </Row>
    </AuthShell>
  );
}