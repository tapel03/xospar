import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Alert, Platform, Linking, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c, themed, useMode, setMode } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Segmented, Toggle, Badge, Button, Icon, AITag, Disclaimer, Sheet, Field, Mark, useLayout } from '../../../components/ui';
import Dropdown from '../../../components/ui/Dropdown';
import { useStore } from '../../../app/store';
import { APP_NAME, APP_VERSION, APP_BUILD, CONTACT, STORE_URL, SUBSCRIPTIONS_URL, SHARE_MESSAGE, REQUIREMENTS, LANGUAGES, PLANS } from '../../../app/appInfo';

/* ---------------- small building blocks ---------------- */
function Stepper({ label, detail, value, unit, step, min, max, onChange }) {
  const fmt = (v) => (unit === '%' ? `${v.toFixed(2).replace(/\.?0+$/, '')}%` : `${v}`);
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: 10, gap: 16 }}>
      <View style={{ flex: 1 }}><T v="h3" style={{ fontWeight: '500' }}>{label}</T>{detail ? <T v="small" muted>{detail}</T> : null}</View>
      <Row gap={4}>
        <Pressable accessibilityLabel={`Decrease ${label}`} onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))} style={st.step}><Icon name="minus" size={16} /></Pressable>
        <T mono bold style={{ width: 60, textAlign: 'center' }}>{fmt(value)}</T>
        <Pressable accessibilityLabel={`Increase ${label}`} onPress={() => onChange(Math.min(max, +(value + step).toFixed(2)))} style={st.step}><Icon name="plus" size={16} /></Pressable>
      </Row>
    </Row>
  );
}

/** A titled group inside a settings section. Groups are separated by a line. */
function Sub({ title, note, first, children }) {
  return (
    <View style={[{ gap: 4 }, !first && { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }]}>
      <T v="label" muted style={{ letterSpacing: 0.6 }}>{title.toUpperCase()}</T>
      {note ? <T v="caption" muted>{note}</T> : null}
      {children}
    </View>
  );
}

/** One connectable source. Off | On pill, the same style as the other option pickers. */
function ConnRow({ icon, title, note, on, onToggle, last }) {
  return (
    <Row gap={12} style={[{ paddingVertical: 12 }, !last && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <Icon name={icon} />
      <View style={{ flex: 1 }}><T v="h3">{title}</T><T v="small" muted>{note}</T></View>
      <Segmented options={['Off', 'On']} value={on ? 'On' : 'Off'} onChange={(v) => { if ((v === 'On') !== on) onToggle(); }} />
    </Row>
  );
}

/** A tappable line with an icon, a title, an optional note and a chevron. */
function LinkRow({ icon, title, note, onPress, last, right }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border }, pressed && { opacity: 0.7 }]}
    >
      <Icon name={icon} size={18} />
      <View style={{ flex: 1 }}>
        <T v="h3" style={{ fontWeight: '500' }}>{title}</T>
        {note ? <T v="small" muted>{note}</T> : null}
      </View>
      {right}
      <Icon name="chevron-right" size={16} color={c.muted} />
    </Pressable>
  );
}

const SECTIONS = [
  { key: 'Account', icon: 'user' },
  { key: 'Connections', icon: 'link' },
  { key: 'Subscription', icon: 'award' },
  { key: 'Risk', icon: 'shield' },
  { key: 'AI mentor', icon: 'cpu' },
  { key: 'Notifications', icon: 'bell' },
  { key: 'Privacy & security', icon: 'lock' },
  { key: 'Help & support', icon: 'help-circle' },
  { key: 'About', icon: 'info' },
];

const INTENSITY = ['Light', 'Balanced', 'Strict'];
const INTENSITY_NOTE = { Light: 'Only flags clear rule breaks.', Balanced: 'Flags rule breaks and recurring patterns.', Strict: 'Flags every deviation, including timing and emotional state.' };
const SEVERITY = ['Low', 'Medium', 'High', 'Off'];

function SeverityRow({ label, initial }) {
  const { settings, setSetting } = useStore();
  const key = `sev${label}`;
  const v = settings[key] === undefined ? initial : settings[key];
  return (
    <View style={{ paddingVertical: 8, gap: 8 }}>
      <T v="h3" style={{ fontWeight: '500' }}>{label}</T>
      <Segmented options={SEVERITY} value={v} onChange={(x) => setSetting(key, x)} />
    </View>
  );
}

export default function SettingsScreen() {
  const nav = useNavigation();
  const { settings: st2, setSetting, profile, accounts, deleteAccount } = useStore();
  const { wide } = useLayout();
  const mode = useMode();
  const [sec, setSec] = useState(null); // phones start on the list of sections; wide screens show Account
  const [msg, setMsg] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const cur = wide ? (sec || 'Account') : sec;
  const val = (k, d) => (st2[k] === undefined ? d : st2[k]);
  const flip = (k, d) => setSetting(k, !val(k, d));
  const plan = val('plan', 'Pro');
  const currentPlan = PLANS.find((p) => p.key === plan) || PLANS[1];
  const initial = ((profile.displayName || profile.name || '?').trim()[0] || '?').toUpperCase();

  const flash = (m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 3500);
  };
  const open = (url) => Linking.openURL(url).catch(() => flash('Could not open that link on this device.'));
  const mail = (to, subject) => open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`\n\n---\n${APP_NAME} ${APP_VERSION} (${APP_BUILD}), ${Platform.OS}`)}`);
  const refer = async () => {
    try { await Share.share({ message: SHARE_MESSAGE }); } catch (e) { flash('Sharing is not available here.'); }
  };
  const choosePlan = (p) => {
    setSetting('plan', p.key);
    flash(`Switched to ${p.key}. Billing is not connected in this prototype, so nothing was charged.`);
  };

  // Clears the navigation history and returns to the start of the app, so Back cannot return to a signed-in screen.
  const doLogOut = () => nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  const logOut = () => {
    if (Platform.OS === 'web') { doLogOut(); return; }
    Alert.alert('Log out?', 'You will need to sign in again to see your journal and alerts.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogOut },
    ]);
  };

  const canDelete = delText.trim().toUpperCase() === 'DELETE';
  const doDelete = () => {
    if (!canDelete) return;
    deleteAccount();
    setDelOpen(false);
    setDelText('');
    nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const body = {
    Account: (
      <View>
        <Sub first title="Profile">
          <Row gap={12} style={{ paddingVertical: 6 }}>
            <View style={st.avatar}><T v="h2">{initial}</T></View>
            <View style={{ flex: 1 }}>
              <T v="h3">{profile.displayName || profile.name || 'Your name'}</T>
              <T v="small" muted numberOfLines={1}>{profile.email || 'No email added'}</T>
              <T v="caption" muted>{plan} plan · {profile.status}</T>
            </View>
          </Row>
          <View style={{ paddingTop: 6 }}><Button variant="secondary" icon="edit-2" label="Edit profile" onPress={() => nav.navigate('EditProfile')} /></View>
        </Sub>
        <Sub title="Preferences">
          <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}><T v="small" muted>Base currency</T><T v="small" mono>USD</T></Row>
          <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}><T v="small" muted>Time zone</T><T v="small" mono>{profile.timezone}</T></Row>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 6 }} gap={12}>
            <View style={{ flex: 1, paddingTop: 10 }}><T v="small" muted>Language</T></View>
            <Dropdown label="Language" width={170} value={val('language', 'English')} options={LANGUAGES} onChange={(v) => setSetting('language', v)} />
          </Row>
          <T v="caption" muted>Your choice is saved. Translations are being added, so some screens may stay in English for now.</T>
        </Sub>
        <Sub title="Appearance" note="Choose how Edgeline looks.">
          <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }} gap={12}>
            <View style={{ flex: 1 }}><T v="h3" style={{ fontWeight: '500' }}>Theme</T><T v="small" muted>{mode === 'light' ? 'Light mode is on.' : 'Dark mode is on.'}</T></View>
            <Segmented options={['Light', 'Dark']} value={mode === 'light' ? 'Light' : 'Dark'} onChange={(v) => setMode(v.toLowerCase())} />
          </Row>
        </Sub>
        <Sub title="Session">
          <View style={{ paddingTop: 6 }}><Button variant="secondary" icon="log-out" label="Log out" onPress={logOut} /></View>
        </Sub>
      </View>
    ),
    Connections: (
      <View>
        <Sub first title="Data sources" note="Optional. Connecting lets the mentor review real fills.">
          <ConnRow icon="link" title="Broker" note="Import fills automatically" on={val('connBroker', false)} onToggle={() => flip('connBroker', false)} />
          <ConnRow icon="credit-card" title="Trading account" note="Balance, equity and drawdown" on={val('connAccount', false)} onToggle={() => flip('connAccount', false)} />
          <ConnRow icon="briefcase" title="Portfolio" note="Longer-term holdings for exposure checks" on={val('connPortfolio', false)} onToggle={() => flip('connPortfolio', false)} />
          <ConnRow icon="edit-3" title="Manual journal" note="Log trades yourself. You can connect later." on={val('connManual', true)} onToggle={() => flip('connManual', true)} last />
        </Sub>
        <Sub title="Trading accounts" note="Your MetaTrader 4 and 5 accounts.">
          {accounts.length === 0 ? <T v="small" muted style={{ paddingVertical: 8 }}>No accounts added yet.</T> : accounts.map((a) => (
            <Row key={a.id} style={{ justifyContent: 'space-between', paddingVertical: 8 }} gap={10}>
              <View style={{ flex: 1 }}>
                <T v="h3" numberOfLines={1}>{a.nickname || a.platform}</T>
                <T v="small" muted numberOfLines={1}>{a.platform} · {a.login} · {a.mode === 'Master' ? 'Master password' : 'Read-only'}</T>
              </View>
              <Badge kind={a.status === 'Connected' ? 'pass' : 'neutral'} label={a.status} />
            </Row>
          ))}
          <Row style={{ flexWrap: 'wrap', paddingTop: 8 }}>
            <Button icon="settings" label="Manage accounts" onPress={() => nav.navigate('ManageAccounts')} />
            <Button variant="secondary" icon="plus" label="Add account" onPress={() => nav.navigate('ManageAccounts', { add: true, ts: Date.now() })} />
          </Row>
        </Sub>
      </View>
    ),
    Subscription: (
      <View>
        <Sub first title="Current plan">
          <Row style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
            <View>
              <T v="h2">{currentPlan.key}</T>
              <T v="small" muted>{currentPlan.price}{currentPlan.per}</T>
            </View>
            <Badge kind="solid" label="Current" />
          </Row>
        </Sub>
        <Sub title="Plans" note="Prices shown are placeholders.">
          {PLANS.map((p) => {
            const on = p.key === plan;
            return (
              <View key={p.key} style={{ marginTop: 8, padding: 14, borderRadius: 14, borderWidth: on ? 2 : 1, borderColor: on ? c.text : c.border, gap: 6 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <T v="h3">{p.key}</T>
                  <T mono bold>{p.price}<T v="caption" muted>{p.per}</T></T>
                </Row>
                {p.features.map((f) => <T key={f} v="small">✓  {f}</T>)}
                <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                  {on ? <Badge kind="solid" label="Your plan" /> : <Button small variant={p.rank > currentPlan.rank ? 'primary' : 'secondary'} label={p.rank > currentPlan.rank ? `Upgrade to ${p.key}` : `Switch to ${p.key}`} onPress={() => choosePlan(p)} />}
                </View>
              </View>
            );
          })}
        </Sub>
        <Sub title="Billing">
          <LinkRow icon="credit-card" title="Manage billing" note="Change or cancel in your store account" onPress={() => open(SUBSCRIPTIONS_URL)} />
          <LinkRow icon="rotate-ccw" title="Restore purchases" note="Already subscribed on another device?" onPress={() => flash('Restore is not connected in this prototype.')} last />
        </Sub>
      </View>
    ),
    Risk: (
      <View>
        <Sub first title="Per-trade limit">
          <Stepper label="Maximum risk per trade" value={st2.maxRisk} unit="%" step={0.25} min={0.25} max={5} onChange={(v) => setSetting('maxRisk', v)} />
        </Sub>
        <Sub title="Daily limit">
          <Stepper label="Maximum daily loss" detail="Warnings escalate once you reach this level" value={st2.maxDailyLoss} unit="%" step={0.5} min={0.5} max={10} onChange={(v) => setSetting('maxDailyLoss', v)} />
        </Sub>
        <Sub title="Exposure">
          <Stepper label="Maximum open positions" value={st2.maxPositions} step={1} min={1} max={10} onChange={(v) => setSetting('maxPositions', v)} />
          <Stepper label="Maximum correlated exposure" detail="Positions with |r| ≥ 0.70 in the same direction" value={st2.maxCorrelated} step={1} min={1} max={6} onChange={(v) => setSetting('maxCorrelated', v)} />
        </Sub>
      </View>
    ),
    'AI mentor': (
      <View>
        <Sub first title="Mentoring style">
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 4 }} gap={12}>
            <View style={{ flex: 1, paddingTop: 8 }}>
              <T v="h3" style={{ fontWeight: '500' }}>Mentoring intensity</T>
              <T v="small" muted>{INTENSITY_NOTE[st2.mentorIntensity]}</T>
            </View>
            <Dropdown label="Mentoring intensity" width={140} value={st2.mentorIntensity} options={INTENSITY} onChange={(v) => setSetting('mentorIntensity', v)} />
          </Row>
        </Sub>
        <Sub title="Checks and warnings">
          <Toggle label="Trade warnings" detail="Edge-conflict warning before saving a trade" value={st2.tradeWarnings} onChange={(v) => setSetting('tradeWarnings', v)} />
          <Toggle label="Pre-trade checks" detail="Show Check trade on charts and trade forms" value={st2.preTradeChecks} onChange={(v) => setSetting('preTradeChecks', v)} />
        </Sub>
        <Sub title="Strict mode">
          <View style={[st2.hardRule && { borderWidth: 2, borderColor: c.text, borderRadius: 12, paddingHorizontal: 12, marginTop: 4 }]}>
            <Toggle label="Hard rule" detail="When a trade conflicts with your edge: 10-second cooldown and a written reason, logged in your journal. Off by default." value={st2.hardRule} onChange={(v) => setSetting('hardRule', v)} />
          </View>
        </Sub>
      </View>
    ),
    Notifications: (
      <View>
        <Sub first title="Alert types" note="What you hear about">
          <Toggle label="Market alerts" detail="✦ AI alerts for volatility, volume and regime changes" value={st2.marketAlerts} onChange={(v) => setSetting('marketAlerts', v)} />
          <Toggle label="News alerts" value={st2.newsAlerts} onChange={(v) => setSetting('newsAlerts', v)} />
          <Toggle label="Event alerts" value={st2.eventAlerts} onChange={(v) => setSetting('eventAlerts', v)} />
        </Sub>
        <Sub title="Delivery" note="Lowest severity that reaches you, per channel">
          {[['In-app', 'Low'], ['Push', 'Medium'], ['Sound', 'High'], ['Email', 'High']].map(([ch, lvl]) => <SeverityRow key={ch} label={ch} initial={lvl} />)}
          <Disclaimer>Your own price alerts always fire, whatever you set here.</Disclaimer>
        </Sub>
      </View>
    ),
    'Privacy & security': (
      <View>
        <Sub first title="Security">
          <Toggle label="Two-factor authentication" value={val('twoFactor', true)} onChange={(v) => setSetting('twoFactor', v)} />
          <Toggle label="Biometric unlock" value={val('biometric', false)} onChange={(v) => setSetting('biometric', v)} />
        </Sub>
        <Sub title="Data and privacy">
          <Toggle label="Use my journal to personalise the mentor" value={val('personalise', true)} onChange={(v) => setSetting('personalise', v)} />
          <Toggle label="Share anonymised statistics" value={val('shareStats', false)} onChange={(v) => setSetting('shareStats', v)} />
          <LinkRow icon="key" title="Saved broker passwords" note="View, save or clear them" onPress={() => nav.navigate('ManageAccounts')} />
          <LinkRow icon="shield" title="Privacy policy" onPress={() => nav.navigate('Legal', { doc: 'privacy' })} last />
        </Sub>
        <Sub title="Your account">
          <T v="small" muted>Deleting your account signs you out and removes your profile, chats and connected broker accounts from this device.</T>
          <View style={{ paddingTop: 8, alignSelf: 'flex-start' }}>
            <Button variant="secondary" icon="trash-2" label="Delete account" onPress={() => { setDelText(''); setDelOpen(true); }} />
          </View>
        </Sub>
      </View>
    ),
    'Help & support': (
      <View>
        <Sub first title="Get help">
          <LinkRow icon="help-circle" title="Help center" note="Guides and answers" onPress={() => open(CONTACT.help)} />
          <LinkRow icon="mail" title="Contact support" note={CONTACT.support} onPress={() => mail(CONTACT.support, `${APP_NAME} support`)} />
          <LinkRow icon="user" title="Contact the founder" note={CONTACT.owner} onPress={() => mail(CONTACT.owner, `${APP_NAME}: message for the founder`)} />
          <LinkRow icon="alert-triangle" title="Report a problem" onPress={() => mail(CONTACT.support, `${APP_NAME}: problem report`)} last />
        </Sub>
        <Sub title="Spread the word">
          <LinkRow icon="gift" title="Refer a friend" note="Share Edgeline with another trader" onPress={refer} />
          <LinkRow icon="star" title="Rate us" note="Tell others what you think in the store" onPress={() => open(STORE_URL)} last />
        </Sub>
        <Sub title="Contact details">
          {[['Company', CONTACT.company], ['Support', CONTACT.support], ['Founder', CONTACT.owner], ['Website', CONTACT.website]].map(([k, v]) => (
            <Row key={k} style={{ justifyContent: 'space-between', paddingVertical: 6 }} gap={12}>
              <T v="small" muted>{k}</T>
              <T v="small" mono style={{ flexShrink: 1, textAlign: 'right' }}>{v}</T>
            </Row>
          ))}
          <T v="caption" muted>{CONTACT.hours}</T>
        </Sub>
      </View>
    ),
    About: (
      <View>
        <Sub first title={APP_NAME}>
          <Row gap={12} style={{ paddingVertical: 6 }}>
            <Mark size={40} />
            <View>
              <T v="h2">{APP_NAME}</T>
              <T v="small" muted>Version {APP_VERSION} (build {APP_BUILD})</T>
            </View>
          </Row>
          <T v="small" muted>Trade with your edge. Learn from every trade.</T>
        </Sub>
        <Sub title="Requirements">
          {REQUIREMENTS.map(([k, v]) => (
            <View key={k} style={{ paddingVertical: 6 }}>
              <T v="label">{k}</T>
              <T v="small" muted>{v}</T>
            </View>
          ))}
        </Sub>
        <Sub title="Legal">
          <LinkRow icon="shield" title="Privacy policy" onPress={() => nav.navigate('Legal', { doc: 'privacy' })} />
          <LinkRow icon="file-text" title="Terms of use" onPress={() => nav.navigate('Legal', { doc: 'terms' })} />
          <LinkRow icon="database" title="Cookies policy" onPress={() => nav.navigate('Legal', { doc: 'cookies' })} />
          <LinkRow icon="users" title="House rules" onPress={() => nav.navigate('Legal', { doc: 'rules' })} />
          <LinkRow icon="code" title="Licenses" note="Open-source software and data we use" onPress={() => nav.navigate('Legal', { doc: 'licenses' })} last />
        </Sub>
        <Disclaimer>Edgeline provides analysis and scenarios for education, not financial advice.</Disclaimer>
      </View>
    ),
  };

  const deleteSheet = (
    <Sheet
      visible={delOpen}
      onClose={() => setDelOpen(false)}
      title="Delete account"
      footer={(
        <Row style={{ justifyContent: 'flex-end' }}>
          <Button variant="ghost" label="Cancel" onPress={() => setDelOpen(false)} />
          <Button label="Delete my account" icon="trash-2" disabled={!canDelete} onPress={doDelete} />
        </Row>
      )}
    >
      <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.red, gap: 6 }}>
        <T v="small" bold>⚠  This cannot be undone.</T>
        <T v="small">Your profile, mentor chats and connected broker accounts, including any saved passwords, will be removed from this device and you will be signed out.</T>
      </View>
      <Field label="Type DELETE to confirm" value={delText} onChangeText={setDelText} autoCapitalize="characters" autoCorrect={false} style={{ flexBasis: 'auto', flexGrow: 0 }} />
    </Sheet>
  );

  const banner = msg ? (
    <View style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated, marginBottom: 8 }}>
      <T v="small">{msg}</T>
    </View>
  ) : null;

  // Phones: a plain list of sections. Tap one to open its options, back arrow returns to the list.
  if (!wide && !cur) {
    return (
      <Screen>
        <PageTitle title="Settings" />
        <Card pad={0} onPress={() => nav.navigate('EditProfile')} style={{ marginBottom: 16 }}>
          <Row gap={12} style={{ padding: 16 }}>
            <View style={st.avatar}><T v="h2">{initial}</T></View>
            <View style={{ flex: 1 }}>
              <T v="h3" numberOfLines={1}>{profile.displayName || profile.name || 'Your name'}</T>
              <T v="small" muted numberOfLines={1}>{profile.email || 'Add your email'}</T>
            </View>
            <T v="small" muted>Edit</T>
            <Icon name="chevron-right" size={16} color={c.muted} />
          </Row>
        </Card>
        <Card pad={0}>
          {SECTIONS.map((x, i) => (
            <Pressable key={x.key} onPress={() => setSec(x.key)} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}>
              <Icon name={x.icon} size={18} /><T v="h3" style={{ flex: 1, fontWeight: '500' }}>{x.key}</T><Icon name="chevron-right" size={16} color={c.muted} />
            </Pressable>
          ))}
        </Card>
        {deleteSheet}
      </Screen>
    );
  }

  return (
    <Screen>
      <PageTitle title={wide ? 'Settings' : cur} onBack={wide ? undefined : () => setSec(null)} />
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        {wide ? (
          <Card pad={8} style={{ width: 240 }}>
            {SECTIONS.map((x) => (
              <Pressable key={x.key} onPress={() => setSec(x.key)} style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 10 }, cur === x.key && { backgroundColor: c.elevated }]}>
                <Icon name={x.icon} size={16} color={cur === x.key ? c.text : c.muted} /><T v="small" style={{ fontWeight: cur === x.key ? '700' : '400' }}>{x.key}</T>
              </Pressable>
            ))}
          </Card>
        ) : null}
        <Card style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', gap: 8 }}>
          {wide ? <Row gap={8} style={{ marginBottom: 8 }}><T v="h2">{cur}</T>{cur === 'AI mentor' ? <AITag /> : null}</Row> : null}
          {banner}
          {body[cur]}
        </Card>
      </View>
      {deleteSheet}
    </Screen>
  );
}

const st = themed(() => ({
  step: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center' },
}));