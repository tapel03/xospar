import React, { useState } from 'react';
import { View, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c } from '../../../theme/tokens';
import { T, Row, Button, Mark, Icon, useLayout, AmbientBackdrop } from '../../../components/ui';
import { useStore } from '../../../app/store';
import ChoiceTile, { MARKETS, STYLES, EXPERIENCE, STRUGGLES } from '../components/OnboardingParts';

const ART = require('../../../../assets/onboarding/Stylized_Streetwear_Duo_Cutout.png');
const RAM = require('../../../../assets/onboarding/Ram.png');
const GROUP = require('../../../../assets/onboarding/Group.png');
const RELAXED = require('../../../../assets/onboarding/Relaxed.png'); // intro screen only
const GIRL = require('../../../../assets/onboarding/Girl.png'); // last screen only
const BOOK = require('../../../../assets/onboarding/book.png'); // step 4 ("What holds you back?")

/**
 * Every onboarding question is tap-only. To add a screen, add an entry here.
 * field: key saved on the profile. multi: true allows several picks, false allows one.
 * perRow: tiles per row. summary: label used on the final summary screen.
 * tileH: height of each tile. Every question page uses the glass tile style.
 * art: an illustration for the page. Pages with art do not scroll.
 *   place 'behind': the illustration sits behind the tiles, which cover its lower part.
 *   place 'above':  the illustration sits above the tiles and nothing is on top of it.
 */
const QUESTIONS = [
  { field: 'markets', multi: true, perRow: 3, tileH: 88, options: MARKETS, summary: 'You trade',
    art: { src: GROUP, place: 'above' },
    title: 'What do you trade?', sub: 'Pick everything you trade. This shapes your market context and news.' },
  { field: 'experience', multi: false, perRow: 3, tileH: 124, options: EXPERIENCE, summary: 'Your experience',
    art: { src: ART, place: 'behind' },
    title: 'How experienced are you?', sub: 'Choose the level that fits you best. Your mentor adjusts how it explains things.' },
  { field: 'styles', multi: true, perRow: 2, tileH: 124, options: STYLES.map((s) => s.key), summary: 'Your trading style',
    art: { src: RAM, place: 'above' },
    title: 'How do you trade?', sub: 'Choose the styles closest to how you actually trade. You can pick more than one.' },
  { field: 'struggles', multi: true, perRow: 2, tileH: 72, options: STRUGGLES, summary: 'Your struggles',
    art: { src: BOOK, place: 'above' },
    title: 'What holds you back?', sub: 'Pick everything that sounds like you. Your mentor will work on these first.' },
];

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/** One line of the summary on the last screen: a small label and what the user picked. */
function PickedLine({ title, items }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
      <T v="caption" muted style={{ width: 92 }} numberOfLines={1}>{title}</T>
      <T v="small" bold style={{ flex: 1 }} numberOfLines={1}>{items.length ? items.join(', ') : 'Not set yet'}</T>
    </View>
  );
}

/** The one button used on every onboarding page: round-ended pill with the mark on the left and an arrow. */
function PillArrow({ onPress, label = 'Continue' }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ width: 132, height: 56, borderRadius: 28, backgroundColor: c.btn, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, gap: 8 }, pressed && { opacity: 0.8 }]}
    >
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.btnText, alignItems: 'center', justifyContent: 'center' }}>
        <Mark size={22} />
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Icon name="arrow-right" size={24} color={c.btnText} />
      </View>
    </Pressable>
  );
}

const BIG = { fontSize: 58, lineHeight: 58, fontWeight: '800', letterSpacing: -2 };

export default function OnboardingScreen({ navigation }) {
  const { profile, setProfile } = useStore();
  const { medium } = useLayout();
  const [page, setPage] = useState(0);

  const pickedStyles = profile.styles || (profile.style ? [profile.style] : []);
  const finish = () => { setProfile({ ...profile, onboarded: true }); navigation.replace('Main', { tab: 'overview' }); };

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

  // A short last row (for example 2 tiles in a row of 3) is padded with empty spaces,
  // so every tile in the page is exactly the same width and lines up in columns.
  const tiles = (q) => (
    <View style={{ gap: 10 }}>
      {chunk(q.options, q.perRow).map((row, i) => (
        <Row key={i} gap={10} style={{ alignItems: 'stretch' }}>
          {row.map((opt) => (
            <ChoiceTile key={opt} k={opt} label={opt} glass height={q.tileH} on={selected(q).includes(opt)} onPress={() => choose(q, opt)} />
          ))}
          {Array.from({ length: q.perRow - row.length }, (_, n) => <View key={`gap${n}`} style={{ flex: 1 }} />)}
        </Row>
      ))}
    </View>
  );

  const bodyOf = (q) => {
    if (!q.art) return tiles(q);
    if (q.art.place === 'above') {
      // Illustration on top, tiles underneath. They never overlap.
      return (
        <View style={{ flex: 1, gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Image source={q.art.src} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
          </View>
          {tiles(q)}
        </View>
      );
    }
    // Illustration behind the tiles, which sit over its lower part.
    return (
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Image source={q.art.src} resizeMode="contain" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
        {tiles(q)}
      </View>
    );
  };

  const questionPages = QUESTIONS.map((q) => ({
    title: q.title,
    sub: q.sub,
    bottom: true,
    fixed: !!q.art, // pages with art do not scroll
    body: bodyOf(q),
  }));

  const pages = [
    { intro: true },
    ...questionPages,
    { final: true },
  ];
  const p = pages[page];

  // Header: no logo. The dots stay centred (theme text colour for current and finished pages, grey for upcoming), Skip sits on the right.
  const topRow = (
    <Row style={{ marginBottom: 24 }}>
      <View style={{ flex: 1 }} />
      <Row gap={6}>{pages.map((_, i) => <View key={i} style={{ width: i === page ? 24 : 8, height: 4, borderRadius: 2, backgroundColor: i <= page ? c.text : c.borderStrong }} />)}</Row>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Pressable onPress={finish} hitSlop={12}><T v="small" muted>Skip</T></Pressable>
      </View>
    </Row>
  );

  /* ---------- Intro: huge title, illustration overlapping it, big wordmark, tagline and pill button ---------- */
  const intro = (
    <View style={{ flex: 1 }}>
      {/* Huge title. Stays behind the illustration. */}
      <View style={{ zIndex: 1 }} pointerEvents="none">
        <T style={BIG}>YOUR AI</T>
        <T style={BIG}>TRADING</T>
        <T style={BIG}>MENTOR.</T>
      </View>

      {/* Big wordmark, also behind the illustration */}
      <T style={{ position: 'absolute', left: 0, bottom: 84, zIndex: 1, ...BIG, fontSize: 52, lineHeight: 56, letterSpacing: -1.5 }} pointerEvents="none">Edgeline.</T>

      {/* Illustration inside a fixed area, scaled with "contain" so it is always fully visible and centred. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 130, bottom: 70, left: -20, right: -20, zIndex: 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Image source={RELAXED} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      </View>

      {/* Tagline bottom left, pill button bottom right */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T v="caption" style={{ maxWidth: 150, fontWeight: '600', letterSpacing: 0.4 }}>
          ANSWER A FEW QUICK QUESTIONS SO YOUR MENTOR CAN FOCUS ON HOW YOU TRADE.
        </T>
        <PillArrow onPress={() => setPage(1)} />
      </View>
    </View>
  );

  /* ---------- Final: same look as the intro. Big title, illustration, summary of the answers, pill to start ---------- */
  const final = (
    <View style={{ flex: 1 }}>
      {/* Small kicker and huge title, behind the illustration */}
      <View style={{ zIndex: 1 }} pointerEvents="none">
        <T v="label" muted style={{ letterSpacing: 1.6, marginBottom: 6 }}>ALL SET</T>
        <T style={BIG}>MEET YOUR</T>
        <T style={BIG}>MENTOR.</T>
      </View>

      {/* Illustration, in the middle between the title and the summary */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 150, bottom: 150, left: -20, right: -20, zIndex: 2, alignItems: 'center', justifyContent: 'center' }}
      >
        <Image source={GIRL} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      </View>

      {/* Bottom block: what you told us, a line of text, Back and the pill to start */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, gap: 12 }}>
        <View style={{ gap: 4 }}>
          {QUESTIONS.map((q) => (
            <PickedLine key={q.field} title={q.summary} items={q.options.filter((o) => selected(q).includes(o))} />
          ))}
        </View>
        <T v="caption" style={{ fontWeight: '600', letterSpacing: 0.4 }}>
          BUILT AROUND HOW YOU TRADE. SCENARIOS WITH EVIDENCE, NEVER PROMISES.
        </T>
        <Row style={{ justifyContent: 'space-between' }}>
          <Button variant="ghost" label="Back" icon="chevron-left" onPress={() => setPage(page - 1)} />
          <PillArrow label="Start trading with my edge" onPress={finish} />
        </Row>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <AmbientBackdrop opacity={0.08} />
      <View style={{ flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', padding: medium ? 32 : 20 }}>
        {topRow}

        {p.intro ? intro : p.final ? final : (
          <>
            <T v="small" muted>Step {page} of {pages.length - 1}</T>
            <T v="h1" style={{ fontSize: 30, lineHeight: 36, marginTop: 4 }}>{p.title}</T>
            <T muted style={{ marginTop: 8, marginBottom: 16 }}>{p.sub}</T>

            {p.fixed ? (
              <View style={{ flex: 1, paddingBottom: 16 }}>{p.body}</View>
            ) : (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: p.bottom ? 'flex-end' : 'flex-start', paddingBottom: 16 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {p.body}
              </ScrollView>
            )}

            <Row style={{ justifyContent: 'space-between', paddingTop: 12 }}>
              <Button variant="ghost" label="Back" icon="chevron-left" onPress={() => setPage(page - 1)} />
              <PillArrow onPress={() => setPage(page + 1)} />
            </Row>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}