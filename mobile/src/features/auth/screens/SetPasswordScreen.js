import React, { useState } from 'react';
import { View } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Field, Button } from '../../../components/ui';
import AuthShell from '../components/AuthShell';
import { userApi } from '../../../services/userApi';
import { featureFlags } from '../../../app/config';
import { friendlyError, ERRORS } from '../../../utils/errorMessages';

const FS = { flexBasis: 'auto', flexGrow: 0 };

export default function SetPasswordScreen({ navigation, route }) {
  const resetToken = route.params?.resetToken || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const problems = [];
  if (password && password.length < 8) problems.push(ERRORS.validation.password);
  if (password && password.length >= 8 && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) problems.push('Use both letters and numbers in your password.');
  if (confirm && confirm !== password) problems.push(ERRORS.validation.passwordMatch);
  const valid = password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password) && confirm === password;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError('');
    try {
      if (featureFlags.useBackend) await userApi.resetPassword(resetToken, password);
      // Back to the login screen so the person signs in with the new password.
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      setError(friendlyError(e, 'reset'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Choose a new password" sub="Pick something you have not used before. You will sign in with it next.">
      <Field label="New password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry autoCapitalize="none" autoCorrect={false} style={FS} />
      <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} placeholder="Type it again" secureTextEntry autoCapitalize="none" autoCorrect={false} onSubmitEditing={submit} style={FS} />

      {problems.length || error ? (
        <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red, gap: 4 }}>
          {[...problems, ...(error ? [error] : [])].map((p) => <T key={p} v="small">⚠  {p}</T>)}
        </View>
      ) : null}

      <Button label={busy ? 'Saving…' : 'Save new password'} icon="check" disabled={!valid || busy} onPress={submit} />
    </AuthShell>
  );
}