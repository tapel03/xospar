import React, { useEffect, useState } from 'react';
import { View, Alert, Platform } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Badge, Button, Segmented, Field, Toggle, Sheet, Empty, Disclaimer } from '../../../components/ui';
import { useStore } from '../../../app/store';

const BLANK = { platform: 'MT5', nickname: '', login: '', server: '', password: '', mode: 'Investor', save: true };
const MODE_LABEL = { Investor: 'Investor (read-only)', Master: 'Master (can trade)' };
const FS = { flexBasis: 'auto', flexGrow: 0 };

function confirmAction(title, message, label, onYes) {
  if (Platform.OS === 'web') { onYes(); return; }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: label, style: 'destructive', onPress: onYes }]);
}

export default function ManageAccountsScreen({ route, navigation }) {
  const { accounts, addAccount, updateAccount, removeAccount, clearAllPasswords, settings, setSetting } = useStore();
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [showPw, setShowPw] = useState(false);

  const savePw = settings.savePasswords !== false;
  const savedCount = accounts.filter((a) => a.password).length;
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const openAdd = () => { setEditing(null); setForm({ ...BLANK, save: savePw }); setShowPw(false); setSheet(true); };
  const openEdit = (a) => {
    setEditing(a);
    setForm({ platform: a.platform, nickname: a.nickname, login: a.login, server: a.server, password: '', mode: a.mode, save: savePw });
    setShowPw(false);
    setSheet(true);
  };

  // Opened from Settings with "Add account".
  useEffect(() => { if (route.params?.add) openAdd(); }, [route.params?.add, route.params?.ts]);

  const valid = /^\d{3,}$/.test(form.login.trim()) && form.server.trim().length > 0 && (editing ? true : form.password.length > 0);

  const save = () => {
    if (!valid) return;
    const login = form.login.trim();
    const keep = form.save && savePw;
    const base = { platform: form.platform, nickname: form.nickname.trim() || `${form.platform} ${login}`, login, server: form.server.trim(), mode: form.mode };
    if (editing) {
      const patch = { ...base };
      if (form.password) patch.password = keep ? form.password : '';
      else if (!keep) patch.password = '';
      updateAccount(editing.id, patch);
    } else {
      addAccount({ ...base, password: keep ? form.password : '' });
    }
    setSheet(false);
  };

  const connect = (a) => {
    // Without a saved password the user has to type it again to connect.
    if (!a.password) { openEdit(a); return; }
    updateAccount(a.id, { status: 'Connected', lastSync: 'Just now' });
  };
  const disconnect = (a) => updateAccount(a.id, { status: 'Disconnected' });

  const clearOne = (a) => confirmAction('Clear saved password?', `The password for ${a.nickname} will be removed from this device.`, 'Clear', () => updateAccount(a.id, { password: '' }));
  const clearAll = () => confirmAction('Clear all saved passwords?', 'Every saved broker password is removed from this device. Your accounts stay in the list.', 'Clear all', clearAllPasswords);
  const remove = (a) => confirmAction('Remove this account?', `${a.nickname} will be disconnected and its saved password deleted.`, 'Remove', () => removeAccount(a.id));

  const toggleSave = (v) => {
    if (v) { setSetting('savePasswords', true); return; }
    if (savedCount === 0) { setSetting('savePasswords', false); return; }
    confirmAction('Turn off saved passwords?', 'This also clears the passwords already saved.', 'Turn off', () => { setSetting('savePasswords', false); clearAllPasswords(); });
  };

  const editingHasNoPw = editing && !editing.password;

  return (
    <Frame active="settings">
      <Screen>
        <PageTitle
          onBack={() => navigation.goBack()}
          kicker="Settings · Connections"
          title="Trading accounts"
          right={<Button small icon="plus" label="Add account" onPress={openAdd} />}
        />

        <Card style={{ marginBottom: 16, gap: 4 }}>
          <T v="h2">Passwords</T>
          <Toggle label="Save passwords on this device" detail="When off, none are kept and you type the password each time you connect." value={savePw} onChange={toggleSave} />
          <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }} gap={12}>
            <View style={{ flex: 1 }}>
              <T v="h3" style={{ fontWeight: '500' }}>Saved passwords</T>
              <T v="small" muted>{savedCount} of {accounts.length} account{accounts.length === 1 ? '' : 's'}</T>
            </View>
            <Button small variant="secondary" icon="trash-2" label="Clear all" disabled={savedCount === 0} onPress={clearAll} />
          </Row>
          <Disclaimer>Use your investor (read-only) password whenever your broker offers one. Edgeline only reads fills and never places trades.</Disclaimer>
        </Card>

        {accounts.length === 0 ? (
          <Empty icon="link" title="No trading accounts" body="Add your MT4 or MT5 account to bring your fills into your journal." action="Add account" onAction={openAdd} />
        ) : accounts.map((a) => {
          const on = a.status === 'Connected';
          return (
            <Card key={a.id} style={{ marginBottom: 12 }} pad={16}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }} gap={10}>
                <View style={{ flex: 1 }}>
                  <Row gap={8}>
                    <Badge kind="solid" label={a.platform} />
                    <T v="h3" numberOfLines={1} style={{ flexShrink: 1 }}>{a.nickname}</T>
                  </Row>
                  <T v="caption" muted style={{ marginTop: 4 }}>Login {a.login} · {a.server}</T>
                </View>
                <Badge kind={on ? 'pass' : 'neutral'} glyph={on ? '•' : ''} label={a.status} />
              </Row>

              <Row style={{ flexWrap: 'wrap', marginTop: 12 }} gap={20}>
                <View><T v="caption" muted>Access</T><T v="small">{MODE_LABEL[a.mode] || a.mode}</T></View>
                <View><T v="caption" muted>Password</T><T v="small">{a.password ? 'Saved on this device' : 'Not saved'}</T></View>
                <View><T v="caption" muted>Last sync</T><T v="small">{a.lastSync}</T></View>
              </Row>

              {a.mode === 'Master' ? <T v="caption" bold style={{ marginTop: 10 }}>⚠ A master password can place trades. Edgeline only needs the investor password.</T> : null}

              <Row style={{ marginTop: 14, flexWrap: 'wrap' }}>
                {on ? <Button small icon="refresh-cw" label="Sync now" onPress={() => connect(a)} /> : <Button small icon="link" label="Connect" onPress={() => connect(a)} />}
                {on ? <Button small variant="secondary" icon="pause" label="Disconnect" onPress={() => disconnect(a)} /> : null}
                <Button small variant="secondary" icon="edit-2" label="Edit" onPress={() => openEdit(a)} />
                {a.password
                  ? <Button small variant="secondary" icon="key" label="Clear password" onPress={() => clearOne(a)} />
                  : <Button small variant="secondary" icon="key" label="Save password" onPress={() => openEdit(a)} />}
                <Button small variant="ghost" icon="trash-2" label="Remove" onPress={() => remove(a)} />
              </Row>
            </Card>
          );
        })}

        <Disclaimer>Broker sync is not live in this prototype. Accounts and passwords are kept in the app's memory only and are lost when the app closes.</Disclaimer>
      </Screen>

      <Sheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={editing ? 'Edit account' : 'Add trading account'}
        footer={<Row style={{ justifyContent: 'flex-end' }}><Button variant="ghost" label="Cancel" onPress={() => setSheet(false)} /><Button label={editing ? 'Save account' : 'Add account'} icon="check" disabled={!valid} onPress={save} /></Row>}
      >
        <View style={{ gap: 8 }}>
          <T v="label">Platform</T>
          <Segmented options={['MT5', 'MT4']} value={form.platform} onChange={set('platform')} />
        </View>
        <Field label="Account name (optional)" value={form.nickname} onChangeText={set('nickname')} placeholder="Main account" style={FS} />
        <Field label="Login (account number)" value={form.login} onChangeText={set('login')} placeholder="5012345" keyboardType="number-pad" style={FS} />
        <Field label="Server" value={form.server} onChangeText={set('server')} placeholder="BrokerName-Live" autoCapitalize="none" autoCorrect={false} style={FS} />
        <View style={{ gap: 8 }}>
          <T v="label">Password type</T>
          <Segmented options={['Investor', 'Master']} value={form.mode} onChange={set('mode')} />
          <T v="caption" muted>{form.mode === 'Investor' ? 'Read-only. Recommended: Edgeline can see your fills but cannot trade.' : 'A master password can place trades. Use investor unless you need more.'}</T>
        </View>
        <Field
          label={editing ? 'Password (leave blank to keep)' : 'Password'}
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          autoCorrect={false}
          hint={editingHasNoPw ? 'No password is saved for this account. Enter it to reconnect.' : undefined}
          style={FS}
        />
        <Row><Button small variant="ghost" icon={showPw ? 'eye-off' : 'eye'} label={showPw ? 'Hide password' : 'Show password'} onPress={() => setShowPw(!showPw)} /></Row>
        <Toggle
          label="Save password on this device"
          detail={savePw ? 'Lets Edgeline reconnect without asking.' : 'Turned off above in the Passwords card.'}
          value={form.save && savePw}
          onChange={(v) => { if (savePw) set('save')(v); }}
        />
      </Sheet>
    </Frame>
  );
}