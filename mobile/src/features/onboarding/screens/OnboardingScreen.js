import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Button, Card, Mark, useLayout, AmbientBackdrop } from '../../../components/ui';
import { useStore } from '../../../app/store';
import ChoiceTile, { MARKETS, STYLES, EXPERIENCE, STRUGGLES } from '../components/OnboardingParts';

/**
 * Every onboarding question is tap-only. To add a screen, add an entry here.
 * field: key saved on the profile. multi: true allows several picks, false allows one.
 * perRow: tiles per row. summary: label used on the final summary screen.
 */
const QUESTIONS = [
  { field: 'markets', multi: true, perRow: 3, options: MARKETS, summary: 'You trade',
    title: 'What do you trade?', sub: 'Pick everything you trade. This shapes your market context and news.' },
  { field: 'experience', multi: false, perRow: 3, options: EXPERIENCE, summary: 'Your experience',
    title: 'How experienced are you?', sub: 'Choose the level that fits you best. Your mentor adjusts how it explains things.' },
  { field: 'styles', multi: true, perRow: 2, options: STYLES.map((s) => s.key), summary: 'Your trading style',
    title: 'How do you trade?', sub: 'Choose the styles closest to how you actually trade. You can pick more than one.' },
  { field: 'struggles', multi: true, perRow: 2, options: STRUGGLES, summary: 'Your struggles',
    title: 'What holds you back?', sub: 'Pick everything that sounds like you. Your mentor will work on these first.' },
];

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** Plain text summary of an earlier step. */
function Picked({ title, items }) {
  return (
    <View style={{ gap: 4 }}>
      <T v="label" muted>{title}</T>
      <T v="h3">{items.length ? items.join(', ') : 'Nothing selected. You can set this later in Edit profile.'}</T>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { profile, setProfile } = useStore();
  const { medium } = useLayout();
  const [page, setPage] = useState(0);

  const pickedStyles = profile.styles || (profile.style ? [profile.style] : []);
  const finish = () => navigation.replace('Main', { tab: 'overview' });

  const selected = (q) => {
    if (q.field === 'styles') return pickedStyles;
    if (q.multi) return profile[q.field] || [];
    return profile[q.field] ? [profile[q.field]] : [];
  };

  const choose = (q, opt) => {
    if (!q.multi) return setProfile({ ...profile, [q.field]: opt });
    const cur = selected(q);
    const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
    if (q.field === 'styles') return setProfile({ ...profile, styles: next, style: next[0] || '' });
    return setProfile({ ...profile, [q.field]: next });
  };

  const questionPages = QUESTIONS.map((q) => ({
    title: q.title,
    sub: q.sub,
    bottom: true,
    body: (
      <View style={{ gap: 10 }}>
        {chunk(q.options, q.perRow).map((row, i) => (
          <Row key={i} gap={10} style={{ alignItems: 'stretch' }}>
            {row.map((opt) => (
              <ChoiceTile key={opt} k={opt} label={opt} on={selected(q).includes(opt)} onPress={() => choose(q, opt)} />
            ))}
          </Row>
        ))}
      </View>
    ),
  }));

  const pages = [
    ...questionPages,
    { title: 'Meet your AI mentor.', sub: 'Here is what you told us. Your mentor uses it to focus its analysis and coaching on you.', bottom: false, body: (
      <View style={{ gap: 18 }}>
        {QUESTIONS.map((q) => (
          <Picked key={q.field} title={q.summary} items={q.options.filter((o) => selected(q).includes(o))} />
        ))}
        <Card ai>
          <T small>The first time you open the AI Mentor it can ask a few more quick questions, so its advice fits you from the start.</T>
          <T v="caption" muted style={{ marginTop: 8 }}>Outlooks are presented as scenarios with evidence and invalidation, never as guaranteed outcomes.</T>
        </Card>
      </View>
    ) },
  ];
  const p = pages[page];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.08} />
      <View style={{ flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', padding: medium ? 32 : 20 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 24 }}>
          <Mark size={24} />
          <Row gap={6}>{pages.map((_, i) => <View key={i} style={{ width: i === page ? 24 : 8, height: 4, borderRadius: 2, backgroundColor: i <= page ? c.lime : c.border }} />)}</Row>
          <Pressable onPress={finish} hitSlop={12}><T v="small" muted>Skip</T></Pressable>
        </Row>
        <T v="small" muted>Step {page + 1} of {pages.length}</T>
        <T v="h1" style={{ fontSize: 30, lineHeight: 36, marginTop: 4 }}>{p.title}</T>
        <T muted style={{ marginTop: 8, marginBottom: 16 }}>{p.sub}</T>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: p.bottom ? 'flex-end' : 'flex-start', paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {p.body}
        </ScrollView>
        <Row style={{ justifyContent: 'space-between', paddingTop: 12 }}>
          {page > 0 ? <Button variant="ghost" label="Back" icon="chevron-left" onPress={() => setPage(page - 1)} /> : <View />}
          <Button label={page === pages.length - 1 ? 'Start trading with my edge' : 'Continue'} onPress={() => (page === pages.length - 1 ? finish() : setPage(page + 1))} />
        </Row>
      </View>
    </SafeAreaView>
  );
}