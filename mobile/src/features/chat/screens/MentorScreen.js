import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Alert, Platform, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors as c } from '../../../theme/tokens';
import { T, Card, Row, Chip, Icon, AITag, Button, Disclaimer, Bar, Sheet, KeyboardSafe, s as ui, useLayout } from '../../../components/ui';
import { ScenarioCard } from '../../../components/domain';
import Composer, { FileChip } from '../components/Composer';
import { useStore } from '../../../app/store';
import { aiApi } from '../aiApi';
import { featureFlags } from '../../../app/config';

const NAME = 'Mpho'; // shown in the greeting; matches the name in Settings
const ACTIONS = [
  ['book-open', 'Review trades', 'Review my last 10 EUR/USD trades.'],
  ['layers', 'Check my edge', 'Am I following my strategy?'],
  ['activity', 'Market today', 'Explain today\'s market movement.'],
  ['calendar', 'Upcoming events', 'Which events could affect my watchlist?'],
];
const MAX_FILES = 5;
const DOC_TYPES = ['application/pdf', 'image/*', 'text/plain', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const pad2 = (n) => String(n).padStart(2, '0');
const nowLabel = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const titleOf = (t) => { const x = (t || 'Attachment').trim(); return x.length > 44 ? `${x.slice(0, 42)}…` : x; };

function confirmAction(title, message, onYes) {
  if (Platform.OS === 'web') { onYes(); return; }
  Alert.alert(title, message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: onYes }]);
}

// A pending reply is a token { stopped, timer } so both the backend call and the offline fallback timer can be cancelled.
const clearReply = (t) => { if (t) { t.stopped = true; clearTimeout(t.timer); } };

function respondToFiles(files) {
  const imgs = files.filter((f) => f.kind === 'image').length;
  const docs = files.length - imgs;
  const parts = [imgs ? `${imgs} photo${imgs > 1 ? 's' : ''}` : null, docs ? `${docs} file${docs > 1 ? 's' : ''}` : null].filter(Boolean).join(' and ');
  return {
    text: `I received ${parts}: ${files.map((f) => f.name).join(', ')}.`,
    bullets: [
      'Charts and screenshots: I can compare the setup with your documented strategy.',
      'Strategy PDFs and notes: I can turn them into editable rules for you to confirm.',
      'Statements and CSVs: I can match fills to your journal.',
    ],
    followUp: 'File reading is not connected in this prototype, so nothing was analysed yet. Tell me what you want checked and I will answer from your journal data.',
  };
}
const fileNote = (files) => `Attached: ${files.map((f) => f.name).join(', ')}. File reading is not connected in this prototype, so this answer uses your journal data only.`;

function respond(q) {
  const t = q.toLowerCase();
  if (t.includes('mistake') || t.includes('following')) return {
    text: 'Two patterns show up repeatedly in your last 25 trades.',
    bullets: ['Fair Value Gap entries: 4 trades, 1 win, −3.0R total. None of your strategies include FVG setups.', 'Trading after a loss: 3 trades opened within 10 minutes of a stop-out, all off-edge, −2.6R.', 'Widened stops: twice this month, both on New York trades.'],
    evidence: [['Trade', 'T-0147', 'TradeDetail', { id: 'T-0147' }], ['Trade', 'T-0143', 'TradeDetail', { id: 'T-0143' }], ['Strategy', 'London Breakout rules', 'Main', { tab: 'strategy' }]],
    followUp: 'Want me to draft a forbidden-setup rule for FVG entries so pre-trade checks flag them?',
  };
  if (t.includes('new york') || t.includes('losing')) return {
    text: 'Your New York results are weaker mainly because most of those trades are outside your written rules, not because the session itself is bad.',
    bullets: ['New York: 13 trades, 38% win rate, −0.31R average.', '9 of 13 were off-edge or partial. On-edge NY trades alone: 4 trades, +0.40R average.', 'Losses cluster in the first 15 minutes after the US open, which NY Pullback lists as invalid.'],
    evidence: [['Analytics', 'Session breakdown', 'Main', { tab: 'analytics' }], ['Trade', 'T-0141', 'TradeDetail', { id: 'T-0141' }]],
  };
  if (t.includes('fit my edge') || t.includes('this trade') || t.startsWith('review trade')) return {
    text: 'Here is how a long on EUR/USD from your 1.1650 zone compares with London Reversal right now.',
    scenario: { asset: 'EUR/USD', bias: 'Buy', window: 'London session today, before 13:30', levels: 'Zone 1.1650–1.1660, stop below 1.1637, target 1.1697', context: 'Asian low swept at 07:40; price reclaimed the zone. Moderate confidence: structure fits, event risk is high.', invalidation: '15m close below 1.1645, or no displacement candle before 10:30.', risks: 'US CPI at 14:30 is inside your 60-min window for USD pairs if the trade is still open.', fits: true },
    evidence: [['Alert', 'MY BUY ZONE', 'Main', { tab: 'alerts' }], ['Chart', 'EUR/USD 15m', 'AssetDetail', { sym: 'EUR/USD' }], ['Event', 'US CPI 14:30', 'Main', { tab: 'map' }]],
  };
  if (t.includes('best setup')) return {
    text: 'Ranked by expectancy over the last 90 days, minimum 5 trades:',
    bullets: ['Liquidity reclaim (London Reversal): 9 trades, 67% win rate, +1.21R average.', 'Breakout + retest (London Breakout): 14 trades, 64% win rate, +0.81R average.', 'Trend pullback (NY Pullback): 11 trades, 36% win rate, −0.18R average.'],
    evidence: [['Analytics', 'Strategy breakdown', 'Main', { tab: 'analytics' }]],
  };
  if (t.includes('event') || t.includes('watchlist')) return {
    text: 'Three scheduled events and one developing story could affect your watchlist this week.',
    bullets: ['US CPI today 14:30: EUR/USD, XAU/USD, US500, USD/JPY.', 'ECB decision Thursday 14:15: EUR/USD, GER40.', 'OPEC+ meeting Sunday: WTI, USD/CAD.', 'Regional conflict (developing): WTI, XAU/USD, safe-haven USD.'],
    evidence: [['Map', 'Events map', 'Main', { tab: 'map' }], ['News', 'US inflation preview', 'Main', { tab: 'news' }]],
  };
  if (t.includes('review my last')) return {
    text: 'Your last 10 EUR/USD trades: 6 wins, 4 losses, +0.84R average.',
    bullets: ['All 6 wins were on-edge London trades.', '2 of the 4 losses were valid losses (news-driven reversals). The other 2 were outside session.', 'Your stop placement is consistent: average 15 pips, always beyond structure.'],
    evidence: [['Trade', 'T-0148', 'TradeDetail', { id: 'T-0148' }], ['Trade', 'T-0146', 'TradeDetail', { id: 'T-0146' }], ['Trade', 'T-0142', 'TradeDetail', { id: 'T-0142' }]],
  };
  return {
    text: 'EUR/USD is down 0.21% today, mostly a USD story rather than a EUR one.',
    bullets: ['DXY up 0.24% as the US–German 2Y spread widened 4bp.', 'Euro-area services PMI was revised lower this morning.', 'Buyers defended 1.1650 twice on above-average volume, which is why the drop paused there.', 'CPI at 14:30 is the next likely driver.'],
    evidence: [['Chart', 'EUR/USD with event markers', 'AssetDetail', { sym: 'EUR/USD' }], ['News', 'ECB officials signal patience', 'Main', { tab: 'news' }]],
  };
}

/** Small round mentor avatar. */
function Orb({ size = 28 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(135,151,255,0.28)', borderWidth: 1, borderColor: 'rgba(135,151,255,0.6)', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, backgroundColor: c.lavender, opacity: 0.9 }} />
    </View>
  );
}

/** Three quietly pulsing dots shown while the mentor is answering. */
function ThinkingDots() {
  const vals = useRef([0, 1, 2].map(() => new Animated.Value(0.25))).current;
  useEffect(() => {
    const loops = vals.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 160),
      Animated.timing(v, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.25, duration: 320, useNativeDriver: true }),
      Animated.delay((2 - i) * 160),
    ])));
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);
  return (
    <Row gap={10} style={{ alignItems: 'center' }}>
      <Orb />
      <Row gap={5}>{vals.map((v, i) => <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.muted, opacity: v }} />)}</Row>
      <T v="caption" muted>Thinking</T>
    </Row>
  );
}

/** Rounded pill used in the top bar. */
function Pill({ label, icon, onPress, a11y }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y || label}
      style={({ pressed }) => [{ height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: c.borderStrong, backgroundColor: c.elevated2, flexDirection: 'row', alignItems: 'center', gap: 6 }, pressed && { opacity: 0.7 }]}>
      {icon ? <Icon name={icon} size={14} /> : null}
      <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

export default function MentorScreen({ params }) {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { chats, setChats, activeChatId, setActiveChatId } = useStore();
  const [mode, setMode] = useState('Chat');
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState([]); // ids of chats the mentor is still answering
  const [historyOpen, setHistoryOpen] = useState(false);
  const scroll = useRef(null);
  const filesRef = useRef([]);
  const uploads = useRef({}); // file id -> upload timer
  const timers = useRef({}); // chat id -> answer timer
  const noteTimer = useRef(null);
  filesRef.current = files;
  const toEnd = (delay = 50) => setTimeout(() => scroll.current && scroll.current.scrollToEnd({ animated: true }), delay);

  const active = chats.find((ch) => ch.id === activeChatId) || null;
  const msgs = active ? active.msgs : [];
  const chatting = !!active;
  const answering = !!active && pending.includes(active.id);

  useEffect(() => () => {
    Object.values(uploads.current).forEach(clearInterval);
    Object.values(timers.current).forEach(clearReply);
    clearTimeout(noteTimer.current);
  }, []);

  const flash = (msg) => {
    setNote(msg);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => setNote(''), 2600);
  };

  /* ---------- attachments: they upload inside the message box ---------- */
  // Simulated upload progress. Replace with a real upload in production.
  const startUpload = (id) => {
    let p = 0;
    const t = setInterval(() => {
      p += 0.1 + Math.random() * 0.18;
      if (p >= 1) {
        clearInterval(t);
        delete uploads.current[id];
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'ready', progress: 1 } : f)));
      } else {
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: p } : f)));
      }
    }, 110);
    uploads.current[id] = t;
  };
  const addFiles = (list) => {
    const room = MAX_FILES - filesRef.current.length;
    if (room <= 0) { flash(`Up to ${MAX_FILES} attachments`); return; }
    if (list.length > room) flash(`Only the first ${room} were added. Up to ${MAX_FILES} attachments.`);
    const items = list.slice(0, room).map((f) => ({ ...f, status: 'uploading', progress: 0 }));
    setFiles((prev) => [...prev, ...items].slice(0, MAX_FILES));
    items.forEach((it) => startUpload(it.id));
  };
  const removeFile = (id) => {
    clearInterval(uploads.current[id]);
    delete uploads.current[id];
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.85 });
      if (!res.canceled && res.assets) {
        addFiles(res.assets.map((a, i) => ({ id: `${Date.now()}-${i}`, kind: 'image', uri: a.uri, name: a.fileName || `Photo ${i + 1}.jpg`, size: a.fileSize, mime: a.mimeType || 'image/jpeg' })));
      }
    } catch (e) { /* picker unavailable or permission denied */ }
  };
  const takePhoto = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (!res.canceled && res.assets && res.assets.length) {
        const a = res.assets[0];
        addFiles([{ id: `${Date.now()}`, kind: 'image', uri: a.uri, name: a.fileName || 'Camera photo.jpg', size: a.fileSize, mime: a.mimeType || 'image/jpeg' }]);
      }
    } catch (e) { /* camera unavailable */ }
  };
  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: DOC_TYPES, multiple: true, copyToCacheDirectory: true });
      if (!res.canceled && res.assets) {
        addFiles(res.assets.map((a, i) => ({ id: `${Date.now()}-${i}`, kind: (a.mimeType || '').startsWith('image/') ? 'image' : 'file', uri: a.uri, name: a.name, size: a.size, mime: a.mimeType })));
      }
    } catch (e) { /* picker unavailable */ }
  };
  // Files dropped onto the box (web).
  const dropFiles = (list) => addFiles(list.map((f, i) => ({
    id: `${Date.now()}-${i}`, kind: (f.type || '').startsWith('image/') ? 'image' : 'file',
    uri: URL.createObjectURL(f), name: f.name, size: f.size, mime: f.type,
  })));

  /* ---------- sending and stopping ---------- */
  const send = (q) => {
    if (answering) return;
    if (filesRef.current.some((f) => f.status === 'uploading')) return;
    const text = (q || '').trim();
    const attached = filesRef.current;
    if (!text && attached.length === 0) return;

    const ai = attached.length ? (text ? { ...respond(text), followUp: fileNote(attached) } : respondToFiles(attached)) : respond(text);
    const userMsg = { role: 'user', text, files: attached, at: nowLabel() };

    let id;
    if (active) {
      id = active.id;
      setChats((prev) => prev.map((ch) => (ch.id === id ? { ...ch, msgs: [...ch.msgs, userMsg], updated: 'Just now' } : ch)));
    } else {
      id = `c${Date.now()}`;
      setChats((prev) => [{ id, title: titleOf(text), updated: 'Just now', msgs: [userMsg] }, ...prev]);
      setActiveChatId(id);
    }
    setInput('');
    setFiles([]);
    setPending((p) => [...p, id]);
    toEnd();

    // Ask the backend mentor. If it is unreachable or has no AI provider configured, fall back to the
    // built-in sample answer after the same short pause, so the prototype still works offline.
    const token = { stopped: false, timer: null };
    timers.current[id] = token;
    const finish = (reply) => {
      if (token.stopped) return;
      delete timers.current[id];
      setChats((prev) => prev.map((ch) => (ch.id === id ? { ...ch, msgs: [...ch.msgs, { role: 'ai', ...reply, at: nowLabel() }], updated: 'Just now' } : ch)));
      setPending((p) => p.filter((x) => x !== id));
      toEnd(80);
    };
    const fallback = () => { if (!token.stopped) token.timer = setTimeout(() => finish(ai), 1200 + Math.min(1200, text.length * 10)); };

    if (!featureFlags.useBackend) { fallback(); return; }
    const names = attached.map((f) => f.name).join(', ');
    const lastText = [text || 'Please look at what I attached.', attached.length ? `[Attached, which you cannot open: ${names}]` : ''].filter(Boolean).join('\n\n');
    const prior = (active ? active.msgs : []).filter((m) => m.text && !m.stopped).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
    aiApi.chat({ messages: [...prior, { role: 'user', text: lastText }], persona: 'mentor' })
      .then((res) => finish({ text: res.reply }))
      .catch(fallback);
  };

  const stop = () => {
    if (!active) return;
    const id = active.id;
    clearReply(timers.current[id]);
    delete timers.current[id];
    setChats((prev) => prev.map((ch) => (ch.id === id ? { ...ch, msgs: [...ch.msgs, { role: 'ai', text: 'Response stopped.', stopped: true, at: nowLabel() }] } : ch)));
    setPending((p) => p.filter((x) => x !== id));
    toEnd(80);
  };

  useEffect(() => { if (params?.prompt) { setMode('Chat'); send(params.prompt); } }, [params?.prompt, params?.ts]);

  const newChat = () => { setActiveChatId(null); setInput(''); setMode('Chat'); };
  const openChat = (id) => { setActiveChatId(id); setMode('Chat'); setHistoryOpen(false); toEnd(250); };
  const deleteChat = (ch) => confirmAction('Delete this chat?', ch.title, () => {
    clearReply(timers.current[ch.id]);
    delete timers.current[ch.id];
    setPending((p) => p.filter((x) => x !== ch.id));
    setChats((prev) => prev.filter((x) => x.id !== ch.id));
    if (activeChatId === ch.id) setActiveChatId(null);
  });
  const deleteAll = () => confirmAction('Delete all chats?', 'This removes every saved conversation.', () => {
    Object.values(timers.current).forEach(clearReply);
    timers.current = {};
    setPending([]);
    setChats([]);
    setActiveChatId(null);
  });

  const context = (
    <Card style={{ width: 280 }}>
      <T v="h3">What the mentor uses</T>
      {[['layers', 'Strategies', '3 (2 active)'], ['book-open', 'Journal', '142 trades'], ['shield', 'Risk rules', '1% per trade, 3% daily'], ['eye', 'Watchlist', '9 assets'], ['alert-circle', 'Known mistakes', 'FVG entries, revenge trades'], ['bar-chart-2', 'Performance', 'Last 90 days']].map(([i, k, v]) => (
        <Row key={k} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border }} gap={10}>
          <Icon name={i} size={15} color={c.muted} /><T v="small" style={{ flex: 1 }}>{k}</T><T v="caption" muted>{v}</T>
        </Row>
      ))}
    </Card>
  );

  /* ---------- top bar ---------- */
  const topBar = (
    <Row style={{ justifyContent: 'space-between', marginBottom: 12, minHeight: 44 }} gap={8}>
      <Pressable onPress={() => setHistoryOpen(true)} style={ui.iconBtn} accessibilityLabel="Chat history"><Icon name="menu" size={18} /></Pressable>
      <View style={{ flex: 1 }} />
      {mode === 'Chat'
        ? <Pill label="Analysis" icon="pie-chart" onPress={() => setMode('Analysis')} a11y="Open analysis" />
        : <Pill label="Chat" icon="message-square" onPress={() => setMode('Chat')} a11y="Back to chat" />}
    </Row>
  );

  /* ---------- message box (anchored to the bottom, so it grows upward) ---------- */
  const composer = (
    <View>
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send(input)}
        onStop={stop}
        answering={answering}
        files={files}
        onRemove={removeFile}
        onPickPhoto={pickPhoto}
        onTakePhoto={takePhoto}
        onPickFile={pickFile}
        onDropFiles={dropFiles}
        onGrow={() => toEnd(0)}
        note={note}
        maxFiles={MAX_FILES}
      />
      <T v="caption" muted style={{ marginTop: 6, textAlign: 'center' }}>Analysis and scenarios for education, not financial advice.</T>
    </View>
  );

  /* ---------- home: greeting and action cards ---------- */
  const home = (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingBottom: 12, gap: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 24 }}>
          <T v="display" style={{ fontSize: 38, lineHeight: 44, letterSpacing: -1 }}>Hello {NAME}{'\n'}How can I help you today?</T>
        </View>
        <Row style={{ flexWrap: 'wrap' }} gap={10}>
          {ACTIONS.map(([icon, label, prompt]) => (
            <Pressable key={label} onPress={() => send(prompt)} accessibilityRole="button" accessibilityLabel={label}
              style={({ pressed }) => [{ flexGrow: 1, flexBasis: '46%', minHeight: 112, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated, justifyContent: 'space-between' }, pressed && { opacity: 0.75, backgroundColor: c.elevated2 }]}>
              <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={16} />
              </View>
              <T v="h3">{label}</T>
            </Pressable>
          ))}
        </Row>
      </ScrollView>
      {composer}
    </View>
  );

  /* ---------- chat: messages ---------- */
  const chat = (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: 18, paddingBottom: 16 }} keyboardShouldPersistTaps="handled">
        {msgs.map((m, i) => (m.role === 'user' ? (
          <View key={i} style={{ alignSelf: 'flex-end', maxWidth: '88%', gap: 6, alignItems: 'flex-end' }}>
            {m.files && m.files.length ? (
              <Row style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }} gap={6}>
                {m.files.map((f) => <FileChip key={f.id} f={{ ...f, status: 'ready' }} />)}
              </Row>
            ) : null}
            <Row gap={8} style={{ alignItems: 'flex-end' }}>
              {m.text ? (
                <View style={{ flexShrink: 1, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.borderStrong, borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <T style={{ color: c.text }}>{m.text}</T>
                </View>
              ) : null}
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.text, fontSize: 11, fontWeight: '800' }}>{NAME[0]}</Text>
              </View>
            </Row>
            {m.at ? <T v="caption" muted>{m.at}</T> : null}
          </View>
        ) : (
          <Row key={i} gap={10} style={{ alignItems: 'flex-start', maxWidth: 760 }}>
            <Orb />
            <View style={{ flex: 1 }}>
              <T muted={!!m.stopped}>{m.text}</T>
              {m.bullets ? <View style={{ marginTop: 8, gap: 6 }}>{m.bullets.map((b, j) => <T key={j} v="small">— {b}</T>)}</View> : null}
              {m.scenario ? <ScenarioCard s={m.scenario} /> : null}
              {m.evidence ? (
                <View style={{ marginTop: 10 }}>
                  <T v="caption" muted style={{ marginBottom: 6 }}>Evidence</T>
                  <Row style={{ flexWrap: 'wrap' }} gap={6}>{m.evidence.map(([type, label, screen, p]) => (
                    <Chip key={label} icon={{ Trade: 'book-open', Strategy: 'layers', Analytics: 'pie-chart', Alert: 'bell', Chart: 'bar-chart', Event: 'calendar', Map: 'map', News: 'file-text' }[type]} label={label} onPress={() => nav.navigate(screen, { ...p, ts: Date.now() })} />
                  ))}</Row>
                </View>
              ) : null}
              {m.followUp ? <T v="small" muted style={{ marginTop: 10 }}>{m.followUp}</T> : null}
              {m.at ? <T v="caption" muted style={{ marginTop: 6 }}>{m.at}</T> : null}
            </View>
          </Row>
        )))}
        {answering ? <ThinkingDots /> : null}
      </ScrollView>
      {composer}
    </View>
  );

  const analysis = (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <Card ai>
        <Row style={{ justifyContent: 'space-between' }}><T v="h2">Behaviour patterns, last 30 days</T><AITag /></Row>
        {[['On-edge trades', 68], ['Trades inside your session', 76], ['Stops left untouched after entry', 92], ['Trades logged with a thesis', 84]].map(([k, v]) => (
          <View key={k} style={{ marginTop: 12 }}><Row style={{ justifyContent: 'space-between' }}><T v="small">{k}</T><T v="small" mono>{v}%</T></Row><Bar value={v} style={{ marginTop: 6 }} /></View>
        ))}
      </Card>
      <Card ai>
        <T v="h2">Market regime</T>
        <T v="small" muted style={{ marginTop: 4 }}>Major FX is range-bound ahead of CPI and the ECB. Your London Breakout historically underperforms in this regime (+0.21R vs +0.74R overall). London Reversal holds up better (+1.05R).</T>
      </Card>
      <ScenarioCard s={{ asset: 'XAU/USD', bias: 'Wait', window: 'Until after US CPI (14:30)', levels: 'Support 2,661, resistance 2,700', context: 'Safe-haven bid from conflict headlines vs. a hot CPI risk. Low confidence either way.', invalidation: 'A 1H close outside 2,661–2,700 after the release.', risks: 'Two-sided event risk; spreads widen around the release.', fits: false }} />
      <Disclaimer>Analysis and scenarios for education, not financial advice.</Disclaimer>
    </ScrollView>
  );

  return (
    <KeyboardSafe>
      <View style={{ flex: 1, padding: wide ? 24 : 16, width: '100%', maxWidth: 1360, alignSelf: 'center' }}>
        <Row style={{ flex: 1, alignItems: 'stretch', gap: 20 }}>
          <View style={{ flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
            {topBar}
            {mode === 'Chat' ? (chatting ? chat : home) : analysis}
          </View>
          {wide ? context : null}
        </Row>
      </View>

      <Sheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Chat history"
        footer={(
          <Row style={{ justifyContent: 'space-between' }}>
            {chats.length ? <Button variant="ghost" icon="trash-2" label="Delete all" onPress={deleteAll} /> : <View />}
            <Row gap={8}>
              {chatting && mode === 'Chat'
                ? <Button variant="ghost" icon="x" label="Close chat" onPress={() => { newChat(); setHistoryOpen(false); }} />
                : null}
              <Button icon="plus" label="New chat" onPress={() => { newChat(); setHistoryOpen(false); }} />
            </Row>
          </Row>
        )}
      >
        {chats.length === 0 ? (
          <T v="small" muted>No saved chats yet. Your conversations with the mentor are saved here automatically.</T>
        ) : (
          <View style={{ gap: 8 }}>
            {chats.map((ch) => {
              const on = ch.id === activeChatId;
              const asked = ch.msgs.filter((m) => m.role === 'user').length;
              return (
                <Row key={ch.id} gap={8} style={{ borderRadius: 14, borderWidth: on ? 1.5 : 1, borderColor: on ? c.green : c.border, backgroundColor: c.elevated, paddingLeft: 14, minHeight: 60 }}>
                  <Pressable onPress={() => openChat(ch.id)} style={{ flex: 1, paddingVertical: 10 }} accessibilityLabel={`Open chat: ${ch.title}`}>
                    <T v="h3" numberOfLines={1}>{ch.title}</T>
                    <T v="caption" muted>{ch.updated} · {asked} question{asked === 1 ? '' : 's'}{on ? ' · open now' : ''}</T>
                  </Pressable>
                  <Pressable onPress={() => deleteChat(ch)} hitSlop={8} accessibilityLabel={`Delete chat: ${ch.title}`} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="trash-2" size={16} color={c.red} />
                  </Pressable>
                </Row>
              );
            })}
          </View>
        )}
      </Sheet>
    </KeyboardSafe>
  );
}