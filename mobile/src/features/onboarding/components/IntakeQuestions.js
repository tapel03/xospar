import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Button, Icon } from '../../../components/ui';
import { useStore } from '../../../app/store';

const STAGES = [
  'I am just starting out',
  'I am trading but losing money',
  'I am around break-even',
  'I am profitable and want to make more',
];
const PROFITABLE = STAGES[3];

const STRUGGLES = [
  'Sticking to my rules',
  'Cutting losses on time',
  'Overtrading',
  'Revenge trading after a loss',
  'Entries and timing',
  'Managing risk and position size',
  'Fear, FOMO or other emotions',
  'Knowing what my edge is',
];
const GROWTH = [
  'Winning more often',
  'Bigger winners (better reward to risk)',
  'Trading bigger size safely',
  'More consistency week to week',
  'Smaller drawdowns',
  'Scaling to a larger account',
  'Finding my best setups',
];
const WHY_LOSING = ['Understand why I lose', 'Build and test a strategy', 'Stay disciplined', 'Keep a proper trade journal', 'Learn the markets', 'Get a second opinion on trades'];
const WHY_PROFIT = ['Find where I leave money on the table', 'Test and refine my strategy', 'Stay disciplined as I scale', 'Keep a proper trade journal', 'Get a second opinion on trades', 'Spot patterns I cannot see myself'];

const QUESTIONS = {
  stage: { title: 'Where are you with your trading right now?', sub: 'Be honest. This only shapes how the mentor helps you.', multi: false, options: STAGES },
  struggles: { title: 'What do you struggle with most?', sub: 'Pick all that apply.', multi: true, options: STRUGGLES },
  growth: { title: 'What would help you make more?', sub: 'You are already profitable, so let us aim higher. Pick all that apply.', multi: true, options: GROWTH },
  why: (profit) => ({ title: 'Why do you want to use Edgeline?', sub: 'Pick all that apply.', multi: true, options: profit ? WHY_PROFIT : WHY_LOSING }),
};

const FIX = {
  'Sticking to my rules': 'I will compare each trade with your written rules and show where you drift.',
  'Cutting losses on time': 'I will track stops that were widened or ignored.',
  'Overtrading': 'I will count trades per day and show what the extra ones cost you.',
  'Revenge trading after a loss': 'I will flag trades opened soon after a loss.',
  'Entries and timing': 'I will review your entries against your setups and sessions.',
  'Managing risk and position size': 'I will check every trade against your risk limits.',
  'Fear, FOMO or other emotions': 'I will connect your logged emotions to your results.',
  'Knowing what my edge is': 'I will find which setups and sessions actually pay you.',
};
const GROW = {
  'Winning more often': 'I will find which setups win most and which ones drag your win rate down.',
  'Bigger winners (better reward to risk)': 'I will check whether you close your winners too early.',
  'Trading bigger size safely': 'I will test what size your drawdown history can support.',
  'More consistency week to week': 'I will look at what changes in your weaker weeks.',
  'Smaller drawdowns': 'I will find what drives your losing streaks.',
  'Scaling to a larger account': 'I will check which results hold up as size increases.',
  'Finding my best setups': 'I will rank your setups by expectancy.',
};

const pad2 = (n) => String(n).padStart(2, '0');
const nowLabel = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

/** Turns the answers into the mentor's first chat: what the user said, and a personal reply. */
export function buildIntro(a, at) {
  const label = a.profit ? 'What would help me most' : 'My struggles';
  const userText = `${a.stage}. ${label}: ${a.list.join('; ')}. I am here to: ${a.why.join('; ')}.`;
  const map = a.profit ? GROW : FIX;
  return {
    title: 'Getting started',
    msgs: [
      { role: 'user', text: userText, files: [], at },
      {
        role: 'ai', at,
        text: a.profit
          ? 'Good, you are already profitable. The job now is to grow it without breaking what works.'
          : 'Thanks for being straight with me. Let us fix what is costing you before adding anything new.',
        bullets: a.list.slice(0, 3).map((x) => `${x}: ${map[x] || 'I will keep an eye on this in your journal.'}`),
        followUp: a.profit
          ? 'Want me to start by ranking your setups by expectancy?'
          : 'Want me to start by checking your last 25 trades for these patterns?',
      },
    ],
  };
}

/**
 * Onboarding questions. Not profitable: stage, struggles, why.
 * Profitable: stage, what would help you make more, why.
 * On finish it saves the answers, creates the mentor's first chat, then calls onComplete().
 * Skipping only marks the questions as done, then calls onComplete().
 */
export default function IntakeQuestions({ name, onComplete }) {
  const { setChats, setActiveChatId, profile, setProfile } = useStore();
  const [a, setA] = useState({ stage: null, struggles: [], growth: [], why: [] });
  const [i, setI] = useState(0);

  const profit = a.stage === PROFITABLE;
  const steps = ['stage', profit ? 'growth' : 'struggles', 'why'];
  const id = steps[i];
  const q = id === 'why' ? QUESTIONS.why(profit) : QUESTIONS[id];
  const val = a[id];
  const isOn = (o) => (q.multi ? val.includes(o) : val === o);
  const press = (o) => setA((p) => (q.multi ? { ...p, [id]: p[id].includes(o) ? p[id].filter((x) => x !== o) : [...p[id], o] } : { ...p, [id]: o }));
  const ready = q.multi ? val.length > 0 : !!val;
  const last = i === steps.length - 1;

  const finish = () => {
    const whyOptions = QUESTIONS.why(profit).options;
    const answers = { stage: a.stage, profit, list: profit ? a.growth : a.struggles, why: a.why.filter((x) => whyOptions.includes(x)) };
    const intro = buildIntro(answers, nowLabel());
    const chatId = `c${Date.now()}`;
    setChats((prev) => [{ id: chatId, title: intro.title, updated: 'Just now', msgs: intro.msgs }, ...prev]);
    setActiveChatId(chatId);
    setProfile({ ...profile, intake: { done: true, answers } });
    if (onComplete) onComplete();
  };
  const skip = () => {
    setProfile({ ...profile, intake: { done: true, answers: null } });
    if (onComplete) onComplete();
  };

  const next = () => {
    if (!ready) return;
    if (!last) { setI(i + 1); return; }
    finish();
  };

  return (
    <View style={{ flex: 1 }}>
      <Row gap={6} style={{ marginBottom: 14 }}>
        {steps.map((s, n) => <View key={s} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= i ? c.lavender : c.border }} />)}
      </Row>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {i === 0 && name ? <T v="small" muted>Hi {name}, a few quick questions so I can help you properly.</T> : null}
        <T v="h1" style={{ fontSize: 26, lineHeight: 32 }}>{q.title}</T>
        <T small muted style={{ marginBottom: 6 }}>{q.sub}</T>
        {q.options.map((o) => {
          const on = isOn(o);
          return (
            <Pressable
              key={o}
              onPress={() => press(o)}
              accessibilityRole={q.multi ? 'checkbox' : 'button'}
              accessibilityState={{ checked: on }}
              style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: on ? 2 : 1, borderColor: on ? c.lavender : c.border, backgroundColor: on ? c.elevated2 : c.elevated }, pressed && { opacity: 0.8 }]}
            >
              <T v="h3" style={{ flex: 1, fontWeight: on ? '700' : '500' }}>{o}</T>
              <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: on ? 0 : 1.5, borderColor: c.borderStrong, backgroundColor: on ? c.lavender : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                {on ? <Icon name="check" size={15} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <Row style={{ justifyContent: 'space-between', paddingTop: 8 }}>
        {i > 0 ? <Button variant="ghost" icon="chevron-left" label="Back" onPress={() => setI(i - 1)} /> : <Button variant="ghost" label="Skip for now" onPress={skip} />}
        <Button label={last ? 'Finish' : 'Continue'} icon={last ? 'check' : 'arrow-right'} disabled={!ready} onPress={next} />
      </Row>
    </View>
  );
}