import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Badge, Button, Chip, Segmented, Field, Sheet, Icon, AITag, CheckRow, Disclaimer, useLayout } from '../../../components/ui';
import { useStore } from '../../../app/store';
import { assets } from '../../../mocks/mock';
import { aiApi } from '../../chat/aiApi';
import { featureFlags } from '../../../app/config';

const MARKET_TYPES = ['Forex', 'Commodities', 'Indices', 'Stocks', 'Crypto'];
const TFS = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const EMPTY = { name: '', types: [], instruments: '', tfs: [], session: '', entry: '', exit: '', risk: '', indicators: '', structure: '', confirmations: '', forbidden: '', psych: '', aiText: '' };
const RULE_FIELDS = [
  ['entry', 'Entry conditions'], ['exit', 'Exit conditions'], ['risk', 'Risk rules'], ['indicators', 'Indicators'],
  ['structure', 'Market structure'], ['confirmations', 'Required confirmations'], ['forbidden', 'Forbidden setups'], ['psych', 'Psychological rules'],
];
// Everything except indicators, timeframes, specific instruments and sessions is required.
const REQUIRED = [['name', 'Strategy name'], ['types', 'Market'], ['entry', 'Entry conditions'], ['exit', 'Exit conditions'], ['risk', 'Risk rules'], ['structure', 'Market structure'], ['confirmations', 'Required confirmations'], ['forbidden', 'Forbidden setups'], ['psych', 'Psychological rules']];
const REQ_KEYS = REQUIRED.map((r) => r[0]);
const PLACEHOLDER = { forbidden: 'e.g. Fair Value Gap entries, counter-trend scalps', psych: 'e.g. Stop after 2 losses; no trade within 15 min of a loss' };
const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);
const sizeLabel = (b) => (!b ? '' : b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);

/* ---------- AI help: suggestions based on what the person describes ---------- */
const BASE = {
  exit: ['Take profit at the next opposing level or 2R', 'Exit when the setup is invalidated by a close beyond the stop level', 'Move the stop to breakeven after 1R'],
  risk: ['Risk 1% of equity per trade', 'Maximum 3% loss per day', 'Never move a stop further away'],
  confirmations: ['A candle close confirms the direction', 'Momentum or volume supports the move'],
  forbidden: ['Trading within 30 minutes of high-impact news', 'Entries with no stop loss', 'Adding to a losing position'],
  psych: ['Stop after 2 losses in a row', 'Wait 15 minutes after any loss', 'No trading when tired or angry'],
  indicators: ['20 EMA', 'RSI 14', 'ATR for stop distance'],
};
const STYLE_SUG = {
  scalp: { tfs: ['1m', '5m'], structure: ['Liquid session only', 'Clear short-term range or micro trend'], entry: ['Break of a 5m level with momentum', 'Retest of the broken level holds'] },
  day: { tfs: ['5m', '15m', '1H'], structure: ['Daily bias matches the trade direction', 'Key levels marked before the session'], entry: ['Breakout and retest of the session range', 'Liquidity sweep then reclaim'] },
  swing: { tfs: ['4H', '1D'], structure: ['Higher-timeframe trend is clear (higher highs and lows)', 'Pullback into support or the 50 EMA'], entry: ['Pullback to support in an uptrend with a rejection candle', 'Daily range break with a retest'] },
  position: { tfs: ['1D', '1W'], structure: ['Weekly trend and fundamentals agree', 'Buy pullbacks into major support'], entry: ['Weekly breakout holding above the level', 'Pullback to the 200 EMA in a long-term trend'] },
};
function styleOf(text, fallback) {
  const t = `${text} ${fallback || ''}`.toLowerCase();
  if (/scalp/.test(t)) return 'scalp';
  if (/swing/.test(t)) return 'swing';
  if (/position|long.?term/.test(t)) return 'position';
  return 'day';
}
function localSuggestions(text, fallback) {
  const s = STYLE_SUG[styleOf(text, fallback)];
  return { ...BASE, tfs: s.tfs, structure: s.structure, entry: s.entry };
}
function parseSuggestions(reply) {
  try {
    const a = reply.indexOf('{'); const b = reply.lastIndexOf('}');
    const o = JSON.parse(reply.slice(a, b + 1));
    const out = {};
    ['entry', 'exit', 'risk', 'indicators', 'structure', 'confirmations', 'forbidden', 'psych'].forEach((k) => { if (Array.isArray(o[k])) out[k] = o[k].filter((x) => typeof x === 'string').slice(0, 4); });
    if (Array.isArray(o.timeframes)) out.tfs = o.timeframes.filter((x) => TFS.includes(x));
    return Object.keys(out).length ? out : null;
  } catch (e) { return null; }
}

export default function StrategyScreen() {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { strategies, addStrategy, updateStrategy, profile } = useStore();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [testing, setTesting] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [sug, setSug] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));
  const flip = (k, v) => setForm((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));
  const addLine = (k, text) => setForm((p) => (lines(p[k]).includes(text) ? p : { ...p, [k]: [...lines(p[k]), text].join('\n') }));

  const filled = (k) => (k === 'types' ? form.types.length > 0 : String(form[k] || '').trim().length > 0);
  const missing = REQUIRED.filter(([k]) => !filled(k)).map(([, l]) => l);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setFiles([]); setSug(null); setCreating(true); };
  const openEdit = (s) => {
    setEditing(s);
    const types = s.marketTypes || [...new Set(s.markets.map((m) => (assets.find((a) => a.sym === m) || {}).cat).filter(Boolean))];
    setForm({
      ...EMPTY, name: s.name, types, instruments: (s.instruments || []).join(', '),
      tfs: String(s.timeframes || '').split(/\s*[\/,]\s*/).filter((x) => TFS.includes(x)),
      session: s.session === 'Any session' ? '' : s.session,
      entry: s.conditions.join('\n'), forbidden: s.invalid.join('\n'), risk: s.risk, ...(s.rules || {}),
    });
    setFiles((s.attachments || []).map((name, i) => ({ id: `old-${i}`, name })));
    setSug(null);
    setCreating(true);
  };

  const askAi = async () => {
    const text = form.aiText.trim();
    if (!text || busy) return;
    setBusy(true);
    let out = localSuggestions(text, profile.style);
    if (featureFlags.useBackend) {
      try {
        const res = await aiApi.chat({
          persona: 'mentor',
          messages: [{ role: 'user', text: `A trader describes their strategy: "${text}". Suggest rules for it. Return ONLY JSON with the keys timeframes (from 1m,5m,15m,1H,4H,1D,1W), entry, exit, risk, indicators, structure, confirmations, forbidden, psych. Each value is an array of up to 4 short strings written for a beginner.` }],
        });
        const parsed = parseSuggestions(res.reply || '');
        if (parsed) out = { ...out, ...parsed };
      } catch (e) { /* offline: keep the built-in suggestions */ }
    }
    setSug(out);
    setBusy(false);
  };
  const askMentor = () => {
    setCreating(false);
    setTimeout(() => nav.navigate('Main', { tab: 'mentor', prompt: `Help me write a trading strategy. ${form.aiText || 'I am a beginner.'}`, ts: Date.now() }), 250);
  };

  // The system file picker cannot open on top of a Modal, so close the sheet, pick, then reopen it.
  const pickFiles = () => {
    setCreating(false);
    setTimeout(async () => {
      try {
        const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', 'text/plain'], multiple: true, copyToCacheDirectory: true });
        if (!res.canceled && res.assets) {
          setFiles((prev) => [...prev, ...res.assets.map((a, i) => ({ id: `${Date.now()}-${i}`, name: a.name, size: a.size }))].slice(0, 5));
        }
      } catch (e) { /* picker unavailable or permission denied */ }
      setCreating(true);
    }, 350);
  };

  const save = () => {
    if (missing.length) return;
    const instruments = form.instruments.split(',').map((x) => x.trim()).filter(Boolean);
    // Trade checks compare against specific symbols, so a market type expands to the symbols in that type.
    const markets = instruments.length ? instruments : assets.filter((a) => form.types.includes(a.cat)).map((a) => a.sym);
    const pct = /(\d+(?:\.\d+)?)\s*%/.exec(form.risk);
    const data = {
      name: form.name.trim(),
      markets, marketTypes: form.types, instruments,
      timeframes: form.tfs.length ? form.tfs.join(' / ') : '—',
      risk: pct ? `${pct[1]}%` : lines(form.risk)[0] || '1%',
      session: form.session.trim() || 'Any session',
      conditions: [...lines(form.entry), ...lines(form.confirmations)],
      invalid: lines(form.forbidden),
      rules: form,
      attachments: files.map((f) => f.name),
    };
    if (editing) updateStrategy(editing.id, { ...data, version: 'edited just now' });
    else addStrategy({ id: `s${Date.now()}`, status: 'Active', setups: [], version: 'v1, created just now', stats: { trades: 0, winRate: 0, avgR: 0 }, ...data });
    setCreating(false);
  };

  const ruleField = (k, l) => {
    const req = REQ_KEYS.includes(k);
    const options = ((sug && sug[k]) || []).filter((x) => !lines(form[k]).includes(x));
    return (
      <View key={k} style={{ gap: 6 }}>
        <Field label={`${l}${req ? ' *' : ' (optional)'}`} multiline placeholder={PLACEHOLDER[k] || 'One rule per line'} value={form[k]} onChangeText={set(k)} style={{ flexBasis: 'auto', flexGrow: 0 }} />
        {options.length ? (
          <>
            <T v="caption" muted>✦ Suggestions, tap to add</T>
            <Row style={{ flexWrap: 'wrap' }} gap={6}>{options.map((x) => <Chip key={x} label={x} onPress={() => addLine(k, x)} />)}</Row>
          </>
        ) : null}
      </View>
    );
  };
  const tfOptions = ((sug && sug.tfs) || []).filter((x) => !form.tfs.includes(x));

  return (
    <Screen>
      <PageTitle title="Strategy and edge" />
      {/* Edge builder on the far left, Create strategy on the far right */}
      <Row style={{ justifyContent: 'space-between', marginBottom: 16 }} gap={8}>
        <Button small variant="secondary" icon="git-merge" label="Edge builder" onPress={() => nav.navigate('EdgeBuilder')} />
        <Button small icon="plus" label="Create strategy" onPress={openCreate} />
      </Row>
      <View style={{ flexDirection: wide ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}>
        {strategies.map((s) => (
          <Card key={s.id} style={[{ flexGrow: 1, flexBasis: wide ? 380 : undefined }, s.status !== 'Active' && { opacity: 0.75 }]} pad={20}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}><T v="h2">{s.name}</T><T v="caption" muted>{s.version}</T></View>
              <Badge kind={s.status === 'Active' ? 'pass' : 'neutral'} glyph={s.status === 'Active' ? '•' : '❙❙'} label={s.status} />
            </Row>
            <Row style={{ flexWrap: 'wrap', marginTop: 16, gap: 20 }}>
              <View><T v="caption" muted>Markets</T><T v="small">{(s.marketTypes && s.marketTypes.length ? s.marketTypes.join(', ') : s.markets.join(', ')) || '—'}</T></View>
              <View><T v="caption" muted>Timeframes</T><T v="small">{s.timeframes}</T></View>
              <View><T v="caption" muted>Risk</T><T v="small" mono>{s.risk}</T></View>
              <View><T v="caption" muted>Session</T><T v="small">{s.session}</T></View>
            </Row>
            {s.conditions.length ? (
              <>
                <T v="label" style={{ marginTop: 16, marginBottom: 6 }}>Conditions</T>
                {s.conditions.map((x) => <T key={x} v="small">✓  {x}</T>)}
              </>
            ) : null}
            {s.invalid.length ? (
              <>
                <T v="label" style={{ marginTop: 12, marginBottom: 6 }}>Invalid conditions</T>
                {s.invalid.map((x) => <T key={x} v="small" muted>✕  {x}</T>)}
              </>
            ) : null}
            {s.attachments && s.attachments.length ? <T v="caption" muted style={{ marginTop: 12 }}>{s.attachments.length} file{s.attachments.length > 1 ? 's' : ''} attached: {s.attachments.join(', ')}</T> : null}
            <Row style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border, gap: 20 }}>
              <T v="caption" muted>{s.stats.trades} trades</T>
              <T v="caption" muted>{s.stats.winRate}% win rate</T>
              <T v="caption" mono bold={s.stats.avgR > 0}>{s.stats.avgR > 0 ? '▲ +' : s.stats.avgR < 0 ? '▼ ' : ''}{s.stats.avgR}R avg</T>
            </Row>
            <Row style={{ marginTop: 12, flexWrap: 'wrap' }}>
              <Button small variant="secondary" icon="activity" label="Test my edge" onPress={() => setTesting(s)} />
              <Button small variant="ghost" icon="edit-2" label="Edit rules" onPress={() => openEdit(s)} />
              <Button small variant="ghost" icon="clock" label="Version history" />
            </Row>
          </Card>
        ))}
      </View>

      <Sheet visible={!!testing} onClose={() => setTesting(null)} title={testing ? `Test my edge: ${testing.name}` : ''}>
        {testing ? (
          <>
            <Row><AITag /><T v="small" muted>Last 20 trades tagged {testing.name}</T></Row>
            <CheckRow status="pass" label="14 of 20 met every required rule" detail="On-edge trades: +0.92R average" />
            <CheckRow status="warn" label="4 were partial" detail="Most common gap: no confirmation candle" />
            <CheckRow status="fail" label="2 broke a rule" detail="Both used Fair Value Gap entries, −2.0R combined" last />
            <T v="small">Your rules describe a positive edge when followed. The drag comes from the trades that weren't.</T>
          </>
        ) : null}
      </Sheet>

      <Sheet
        visible={creating}
        onClose={() => setCreating(false)}
        title={editing ? `Edit ${editing.name}` : 'Create strategy'}
        footer={<Row style={{ justifyContent: 'flex-end' }}><Button variant="ghost" label="Cancel" onPress={() => setCreating(false)} /><Button label="Save strategy" icon="check" disabled={missing.length > 0} onPress={save} /></Row>}
      >
        <Card ai pad={12} style={{ gap: 10 }}>
          <Row gap={8}><AITag label="AI assistant" /><T v="h3">Not sure what to write?</T></Row>
          <Field label="Describe your strategy in your own words" multiline value={form.aiText} onChangeText={set('aiText')} placeholder="e.g. I swing trade EUR/USD on the 4H, buying pullbacks in an uptrend" style={{ flexBasis: 'auto', flexGrow: 0 }} />
          <Row style={{ flexWrap: 'wrap' }} gap={8}>
            <Button small icon="cpu" label={busy ? 'Thinking…' : 'Suggest rules'} disabled={busy || !form.aiText.trim()} onPress={askAi} />
            <Button small variant="ghost" icon="message-square" label="Ask the mentor" onPress={askMentor} />
          </Row>
          {sug ? <T v="caption" muted>Suggestions now appear under each field. Tap one to add it, then edit it however you like.</T> : null}
        </Card>

        <Pressable onPress={pickFiles} accessibilityRole="button" accessibilityLabel="Upload PDF, screenshots or notes" style={({ pressed }) => [{ borderWidth: 1, borderStyle: 'dashed', borderColor: c.borderStrong, borderRadius: 12, padding: 18, alignItems: 'center', gap: 6 }, pressed && { opacity: 0.7 }]}>
          <Icon name="upload" />
          <T v="h3">Upload PDF, screenshots or notes</T>
          <T v="small" muted style={{ textAlign: 'center' }}>Tap to choose files. They are kept with this strategy so you can refer back to them. Reading them into rules is not connected in this prototype, so type the rules below.</T>
        </Pressable>
        {files.length ? (
          <View style={{ gap: 6 }}>
            {files.map((f) => (
              <Row key={f.id} style={{ borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, paddingHorizontal: 12, minHeight: 48 }} gap={10}>
                <Icon name="file-text" size={16} />
                <View style={{ flex: 1 }}><T v="small" numberOfLines={1}>{f.name}</T>{f.size ? <T v="caption" muted>{sizeLabel(f.size)}</T> : null}</View>
                <Pressable onPress={() => setFiles(files.filter((x) => x.id !== f.id))} hitSlop={10} accessibilityLabel={`Remove ${f.name}`}><Icon name="x" size={16} color={c.muted} /></Pressable>
              </Row>
            ))}
          </View>
        ) : null}

        <Field label="Strategy name *" placeholder="London Breakout" value={form.name} onChangeText={set('name')} style={{ flexBasis: 'auto', flexGrow: 0 }} />

        <View style={{ gap: 8 }}>
          <T v="label">Market *</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>{MARKET_TYPES.map((m) => <Chip key={m} label={m} on={form.types.includes(m)} onPress={() => flip('types', m)} />)}</Row>
        </View>
        <Field label="Specific instruments (optional)" placeholder="EUR/USD, GBP/USD" hint="Leave empty to cover every instrument in the markets above." value={form.instruments} onChangeText={set('instruments')} style={{ flexBasis: 'auto', flexGrow: 0 }} />

        <View style={{ gap: 8 }}>
          <T v="label">Timeframes (optional)</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>{TFS.map((t) => <Chip key={t} label={t} on={form.tfs.includes(t)} onPress={() => flip('tfs', t)} />)}</Row>
          {tfOptions.length ? (
            <>
              <T v="caption" muted>✦ Suggested for your style, tap to add</T>
              <Row style={{ flexWrap: 'wrap' }} gap={6}>{tfOptions.map((t) => <Chip key={t} label={t} onPress={() => flip('tfs', t)} />)}</Row>
            </>
          ) : null}
        </View>

        <Field label="Sessions (optional)" placeholder="London 08:00–11:00" hint="Only if your strategy depends on a session." value={form.session} onChangeText={set('session')} style={{ flexBasis: 'auto', flexGrow: 0 }} />

        {RULE_FIELDS.map(([k, l]) => ruleField(k, l))}

        {missing.length ? <T v="caption" muted>Still needed: {missing.join(', ')}.</T> : null}
      </Sheet>
    </Screen>
  );
}

const FIELDS = ['market', 'session', 'market structure', 'setup', 'risk', 'news within 30 min', 'spread'];
const WEIGHTS = ['Required', 'Preferred', 'Optional', 'Forbidden'];
const INITIAL = [
  { id: 1, field: 'market', op: '=', value: 'EUR/USD', weight: 'Required' },
  { id: 2, field: 'session', op: '=', value: 'London', weight: 'Required' },
  { id: 3, field: 'market structure', op: '=', value: 'bullish', weight: 'Preferred' },
  { id: 4, field: 'setup', op: '=', value: 'breakout + retest', weight: 'Required' },
  { id: 5, field: 'risk', op: '≤', value: '1%', weight: 'Required' },
  { id: 6, field: 'news within 30 min', op: '=', value: 'yes', weight: 'Forbidden' },
];
const SAMPLE = { market: 'EUR/USD', session: 'London', 'market structure': 'ranging', setup: 'breakout + retest', risk: '1%', 'news within 30 min': 'yes', spread: '0.8' };

export function EdgeBuilderScreen({ navigation }) {
  const [rules, setRules] = useState(INITIAL);
  const upd = (id, k, v) => setRules((r) => r.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const matches = (r) => (r.op === '≤' ? parseFloat(SAMPLE[r.field]) <= parseFloat(r.value) : String(SAMPLE[r.field]).toLowerCase() === r.value.toLowerCase());
  const failedReq = rules.filter((r) => r.weight === 'Required' && !matches(r));
  const hitForbidden = rules.filter((r) => r.weight === 'Forbidden' && matches(r));
  const missingPref = rules.filter((r) => r.weight === 'Preferred' && !matches(r));
  const ok = !failedReq.length && !hitForbidden.length;
  return (
    <Frame active="strategy">
      <Screen>
        <PageTitle onBack={() => navigation.goBack()} kicker="London Breakout" title="Edge builder" right={<Button small icon="plus" label="Add rule" onPress={() => setRules([...rules, { id: Date.now(), field: 'spread', op: '≤', value: '1.2', weight: 'Optional' }])} />} />
        <Card>
          {rules.map((r, i) => (
            <View key={r.id} style={{ paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: c.border, gap: 8 }}>
              <Row style={{ flexWrap: 'wrap' }}>
                <T mono bold style={{ width: 44 }}>{i === 0 ? 'IF' : 'AND'}</T>
                <Chip label={r.field} onPress={() => upd(r.id, 'field', FIELDS[(FIELDS.indexOf(r.field) + 1) % FIELDS.length])} />
                <T mono>{r.op}</T>
                <Field value={r.value} onChangeText={(v) => upd(r.id, 'value', v)} style={{ flexGrow: 0, flexBasis: 180 }} />
                <Pressable onPress={() => setRules(rules.filter((x) => x.id !== r.id))} hitSlop={10} accessibilityLabel="Remove rule"><Icon name="x" size={16} color={c.muted} /></Pressable>
              </Row>
              <Segmented scroll options={WEIGHTS} value={r.weight} onChange={(v) => upd(r.id, 'weight', v)} style={{ marginLeft: 52 }} />
            </View>
          ))}
          <Row style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border }}>
            <T mono bold style={{ width: 44 }}>THEN</T><T bold>trade = allowed</T>
          </Row>
          <T v="small" muted style={{ marginLeft: 52 }}>Otherwise: "Trade does not meet edge."</T>
        </Card>

        <Card ai style={{ marginTop: 16 }}>
          <Row style={{ justifyContent: 'space-between' }}><T v="h2">Live test against the current EUR/USD setup</T><AITag /></Row>
          <T v="caption" muted style={{ marginTop: 4 }}>{Object.entries(SAMPLE).map(([k, v]) => `${k}: ${v}`).join(', ')}</T>
          <View style={{ marginTop: 8 }}>
            {rules.map((r, i) => {
              const m = matches(r);
              const st = r.weight === 'Forbidden' ? (m ? 'fail' : 'pass') : m ? 'pass' : r.weight === 'Required' ? 'fail' : 'warn';
              return <CheckRow key={r.id} status={st} label={`${r.field} ${r.op} ${r.value}`} detail={`${r.weight}${r.weight === 'Forbidden' && m ? ': present' : !m && r.weight !== 'Forbidden' ? ': not met' : ''}`} last={i === rules.length - 1} />;
            })}
          </View>
          <View style={{ marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 2, borderColor: c.text, borderStyle: ok ? 'solid' : 'dashed' }}>
            <T v="h3" bold>{ok ? '✓ Trade meets edge' : '✕ Trade does not meet edge'}</T>
            <T v="small" muted>{ok ? (missingPref.length ? `${missingPref.length} preferred condition not met.` : 'All conditions met.') : [...failedReq.map((r) => `Required "${r.field}" not met`), ...hitForbidden.map((r) => `Forbidden "${r.field}" present`)].join('. ')}</T>
          </View>
          <Disclaimer>You own these rules. The mentor uses them to evaluate trades and never changes them on its own.</Disclaimer>
        </Card>
      </Screen>
    </Frame>
  );
}