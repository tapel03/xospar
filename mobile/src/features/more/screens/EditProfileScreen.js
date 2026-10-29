import React, { useState } from 'react';
import { View } from 'react-native';
import { colors as c, themed } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Chip, Field, Button } from '../../../components/ui';
import Dropdown from '../../../components/ui/Dropdown';
import { useStore } from '../../../app/store';
import { TIME_ZONES } from '../../../app/appInfo';

const STATUSES = ['Active trader', 'Learning', 'On a break', 'Prefer not to say'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];
const MARKETS = ['Forex', 'Stocks', 'Indices', 'Commodities', 'Crypto'];
const STYLES = ['Day trading', 'Swing trading', 'Scalping', 'Position trading'];
const FS = { flexBasis: 'auto', flexGrow: 0 }; // full-width field inside a column

export default function EditProfileScreen({ navigation }) {
  const { profile, setProfile } = useStore();
  const [f, setF] = useState({
    name: profile.name || '', displayName: profile.displayName || '', email: profile.email || '', phone: profile.phone || '',
    country: profile.country || '', timezone: profile.timezone || TIME_ZONES[0], status: profile.status || STATUSES[0],
    experience: profile.experience || EXPERIENCE[1], style: profile.style || STYLES[0], markets: profile.markets || [],
  });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
  const toggleMarket = (m) => setF((p) => ({ ...p, markets: p.markets.includes(m) ? p.markets.filter((x) => x !== m) : [...p.markets, m] }));

  const errors = [];
  if (!f.name.trim()) errors.push('Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) errors.push('Enter a valid email address.');

  const initial = ((f.displayName || f.name || '?').trim()[0] || '?').toUpperCase();

  const save = () => {
    if (errors.length) return;
    setProfile({
      ...profile,
      name: f.name.trim(), displayName: f.displayName.trim() || f.name.trim(), email: f.email.trim(), phone: f.phone.trim(),
      country: f.country.trim(), timezone: f.timezone, status: f.status, experience: f.experience, style: f.style, markets: f.markets,
    });
    navigation.goBack();
  };

  const group = (label, options, value, onPress) => (
    <View style={{ gap: 8 }}>
      <T v="label">{label}</T>
      <Row style={{ flexWrap: 'wrap' }} gap={6}>{options.map((o) => <Chip key={o} label={o} on={value === o} onPress={() => onPress(o)} />)}</Row>
    </View>
  );

  return (
    <Frame active="settings">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker="Settings" title="Edit profile" />
        <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', gap: 16 }}>
          <Card style={{ gap: 16 }}>
            <Row gap={14}>
              <View style={st.avatar}><T v="h1">{initial}</T></View>
              <View style={{ flex: 1 }}>
                <T v="h3" numberOfLines={1}>{f.displayName || f.name || 'Your name'}</T>
                <T v="small" muted>{f.status}</T>
              </View>
            </Row>

            <Field label="Full name" value={f.name} onChangeText={set('name')} placeholder="Your full name" autoCapitalize="words" style={FS} />
            <Field label="Display name" value={f.displayName} onChangeText={set('displayName')} placeholder="What the app calls you" autoCapitalize="words" hint="Shown in greetings and on your profile." style={FS} />
            <Field label="Email" value={f.email} onChangeText={set('email')} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} hint="Used for receipts and account recovery." style={FS} />
            <Field label="Phone (optional)" value={f.phone} onChangeText={set('phone')} placeholder="+27 ..." keyboardType="phone-pad" style={FS} />
            <Field label="Country" value={f.country} onChangeText={set('country')} placeholder="South Africa" autoCapitalize="words" style={FS} />
            <View style={{ gap: 6 }}>
              <T v="label">Time zone</T>
              <Dropdown label="Time zone" width="100%" value={f.timezone} options={TIME_ZONES} onChange={set('timezone')} />
            </View>
          </Card>

          <Card style={{ gap: 16 }}>
            {group('Status', STATUSES, f.status, set('status'))}
            {group('Trading experience', EXPERIENCE, f.experience, set('experience'))}
            {group('Trading style', STYLES, f.style, set('style'))}
            {group('Markets you trade', MARKETS, null, toggleMarket)}
            <Row style={{ flexWrap: 'wrap' }} gap={6}>
              {MARKETS.map((m) => <Chip key={`m-${m}`} label={m} on={f.markets.includes(m)} onPress={() => toggleMarket(m)} />)}
            </Row>
          </Card>

          {errors.length ? (
            <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.text, gap: 4 }}>
              {errors.map((e) => <T key={e} v="small">⚠  {e}</T>)}
            </View>
          ) : null}

          <Row style={{ justifyContent: 'flex-end' }}>
            <Button variant="ghost" label="Cancel" onPress={() => navigation.goBack()} />
            <Button label="Save changes" icon="check" disabled={errors.length > 0} onPress={save} />
          </Row>
        </View>
      </Screen>
    </Frame>
  );
}

const st = themed(() => ({
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center' },
}));