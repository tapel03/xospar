import React, { useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { colors as c } from '../../theme/tokens';
import { Screen, Card, Row, Icon, T, useLayout } from '.';

/* One shared pulse drives every bone on screen, so they all breathe together. It only runs while a skeleton is visible. */
const pulse = new Animated.Value(0.5);
let users = 0;
let loop = null;
const acquire = () => {
  users += 1;
  if (!loop) {
    loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0.5, duration: 750, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
  }
};
const release = () => {
  users = Math.max(0, users - 1);
  if (!users && loop) { loop.stop(); loop = null; }
};

const range = (n) => Array.from({ length: n }, (_, i) => i);

/** One pulsing placeholder block. */
export function Bone({ w = '100%', h = 14, r = 6, style }) {
  useEffect(() => { acquire(); return release; }, []);
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: c.glow ? c.elevated2 : c.border, opacity: pulse }, style]} />;
}

/* ---------------- building blocks ---------------- */

function Page({ children }) {
  return (
    <Screen scroll={false}>
      <View pointerEvents="none" style={{ flex: 1, overflow: 'hidden', gap: 16 }}>{children}</View>
    </Screen>
  );
}

const Title = ({ action = true, back }) => (
  <Row style={{ justifyContent: 'space-between', marginBottom: 4 }}>
    <Row gap={12}>
      {back ? <Bone w={24} h={24} r={12} /> : null}
      <Bone w={170} h={28} r={8} />
    </Row>
    {action ? <Bone w={96} h={38} r={10} /> : null}
  </Row>
);

function Tiles({ n = 4, h = 104 }) {
  const { wide } = useLayout();
  return (
    <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={10}>
      {range(n).map((i) => (
        <View key={i} style={{ flexGrow: 1, flexBasis: wide ? '23%' : '47%', height: h, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, justifyContent: 'space-between' }}>
          <Row gap={8}><Bone w={30} h={30} r={10} /><Bone w="45%" h={10} /></Row>
          <Bone w="60%" h={20} r={6} />
        </View>
      ))}
    </Row>
  );
}

function IconRows({ n = 4 }) {
  return (
    <>
      {range(n).map((i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
          <Bone w={40} h={40} r={14} />
          <View style={{ flex: 1, gap: 8 }}><Bone w="55%" h={13} /><Bone w="35%" h={10} /></View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}><Bone w={64} h={13} /><Bone w={44} h={10} /></View>
        </View>
      ))}
    </>
  );
}

const TextLines = ({ n = 3 }) => (
  <View style={{ gap: 8 }}>{range(n).map((i) => <Bone key={i} w={i === n - 1 ? '60%' : '100%'} h={12} />)}</View>
);

function AlertCards({ n = 4 }) {
  return (
    <>
      {range(n).map((i) => (
        <Card key={i} pad={12} style={{ gap: 8, marginBottom: 8 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row gap={8}><Bone w={64} h={22} r={11} /><Bone w={72} h={16} /></Row>
            <Bone w={70} h={22} r={11} />
          </Row>
          <Bone w="50%" h={13} />
          <Bone w="70%" h={10} />
        </Card>
      ))}
    </>
  );
}

/** Story cards for the News screen. Also used while news is still loading. */
export function NewsCardsSkeleton({ n = 6 }) {
  const { wide } = useLayout();
  return (
    <View pointerEvents="none" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {range(n).map((i) => (
        <View key={i} style={wide ? { flexBasis: '48.5%', flexGrow: 1 } : { width: '100%' }}>
          <Card pad={12} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}><Bone w="45%" h={10} /><Bone w={84} h={18} r={9} /></Row>
            <Bone h={15} />
            <Bone w="70%" h={15} />
            <Bone w="40%" h={10} />
          </Card>
        </View>
      ))}
    </View>
  );
}

/* ---------------- one skeleton per tab ---------------- */

function MentorSkeleton() {
  const { wide } = useLayout();
  return (
    <View style={{ flex: 1, padding: wide ? 24 : 16, width: '100%', maxWidth: 760, alignSelf: 'center' }}>
      <View pointerEvents="none" style={{ flex: 1, overflow: 'hidden' }}>
        <Row style={{ justifyContent: 'space-between', minHeight: 44, marginBottom: 12 }}>
          <Bone w={40} h={40} r={14} />
          <Bone w={104} h={36} r={18} />
        </Row>
        <View style={{ flex: 1, justifyContent: 'center', gap: 10 }}>
          <Bone w="82%" h={38} r={8} />
          <Bone w="60%" h={38} r={8} />
        </View>
        <Row style={{ flexWrap: 'wrap', marginBottom: 12 }} gap={10}>
          {range(4).map((i) => (
            <View key={i} style={{ flexGrow: 1, flexBasis: '46%', minHeight: 112, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, justifyContent: 'space-between' }}>
              <Bone w={34} h={34} r={11} />
              <Bone w="60%" h={14} />
            </View>
          ))}
        </Row>
      </View>

      {/* The message box is the one part that is already usable-looking while everything else loads. */}
      <View>
        <View style={{ borderRadius: 24, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
            <T style={{ color: c.faint, fontSize: 15, lineHeight: 22 }}>Ask about a trade, a pattern or the market</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 4, paddingBottom: 8, gap: 2 }}>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}><Icon name="paperclip" size={18} color={c.muted} /></View>
            <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={18} color={c.muted} /></View>
            <View style={{ flex: 1 }} />
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.border, backgroundColor: c.elevated2, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow-up" size={18} color={c.faint} />
            </View>
          </View>
        </View>
        <T v="caption" muted style={{ marginTop: 6, textAlign: 'center' }}>Analysis and scenarios for education, not financial advice.</T>
      </View>
    </View>
  );
}

function MapSkeleton() {
  return (
    <View pointerEvents="none" style={{ flex: 1, backgroundColor: c.bgAlt }}>
      <Bone h="100%" r={0} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: c.overlay, borderBottomWidth: 1, borderBottomColor: c.border, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ gap: 6 }}><Bone w={130} h={22} r={7} /><Bone w={150} h={10} /></View>
          <Bone w={84} h={38} r={10} />
        </Row>
      </View>
    </View>
  );
}

/** Skeleton for a main tab. Used by the Shell until that tab's real screen is ready. */
export function TabSkeleton({ tab }) {
  const { wide } = useLayout();
  switch (tab) {
    case 'markets':
      return (
        <Page>
          <Title />
          {range(7).map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 }}>
              <Row gap={12}>
                <Bone w={38} h={34} r={17} />
                <View style={{ gap: 6 }}><Bone w={70} h={10} /><Bone w={96} h={16} /><Bone w={80} h={10} /></View>
              </Row>
              <Row gap={18}>
                <View style={{ gap: 6, alignItems: 'flex-end' }}><Bone w={70} h={22} /><Bone w={56} h={10} /></View>
                <View style={{ gap: 6, alignItems: 'flex-end' }}><Bone w={70} h={22} /><Bone w={56} h={10} /></View>
              </Row>
            </View>
          ))}
        </Page>
      );
    case 'journal':
      return (
        <Page>
          <Title />
          <Row gap={8}><Bone w={110} h={38} r={10} /><Bone w={90} h={38} r={10} /><View style={{ flex: 1 }} /><Bone w={90} h={38} r={10} /></Row>
          <Tiles n={6} h={96} />
          <Card style={{ gap: 12 }}><Bone w={110} h={18} /><Bone h={200} r={12} /></Card>
          <Card pad={0}><IconRows n={4} /></Card>
        </Page>
      );
    case 'mentor':
      return <MentorSkeleton />;
    case 'strategy':
      return (
        <Page>
          <Title action={false} />
          <Row style={{ justifyContent: 'space-between' }}><Bone w={120} h={38} r={10} /><Bone w={140} h={38} r={10} /></Row>
          {range(2).map((i) => (
            <Card key={i} pad={20} style={{ gap: 14 }}>
              <Row style={{ justifyContent: 'space-between' }}><View style={{ gap: 6 }}><Bone w={160} h={18} /><Bone w={100} h={10} /></View><Bone w={64} h={22} r={11} /></Row>
              <Row gap={20}><Bone w={70} h={28} /><Bone w={70} h={28} /><Bone w={50} h={28} /><Bone w={90} h={28} /></Row>
              <TextLines n={4} />
            </Card>
          ))}
        </Page>
      );
    case 'map':
      return <MapSkeleton />;
    case 'news':
      return (
        <Page>
          <Title />
          <Bone w={180} h={10} />
          <NewsCardsSkeleton n={5} />
        </Page>
      );
    case 'alerts':
      return (
        <Page>
          <Title />
          <Row style={{ justifyContent: 'space-between' }}><Bone w="45%" h={10} /><Bone w={84} h={38} r={10} /></Row>
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
            <View style={{ flex: 1, alignSelf: 'stretch' }}><AlertCards n={4} /></View>
            {wide ? <View style={{ flex: 0.9, alignSelf: 'stretch' }}><Card pad={14} style={{ gap: 12 }}><Bone w={110} h={16} /><TextLines n={5} /></Card></View> : null}
          </View>
        </Page>
      );
    case 'analytics':
      return (
        <Page>
          <Title action={false} />
          <Row gap={8}><Bone w={96} h={30} r={15} /><Bone w={80} h={30} r={15} /></Row>
          <Tiles n={8} h={92} />
          <Card style={{ gap: 12 }}><Bone w={120} h={18} /><Bone w="40%" h={26} /><Bone h={200} r={12} /></Card>
        </Page>
      );
    case 'calendar':
      return (
        <Page>
          <Title />
          <Tiles n={3} h={80} />
          <Card pad={12} style={{ gap: 8 }}>
            <Row style={{ justifyContent: 'space-between' }}><Bone w={40} h={40} r={14} /><Bone w={140} h={16} /><Bone w={40} h={40} r={14} /></Row>
            {range(5).map((w) => (
              <Row key={w} gap={4}>{range(7).map((d) => <View key={d} style={{ flex: 1 }}><Bone h={wide ? 56 : 44} r={8} /></View>)}</Row>
            ))}
          </Card>
          <AlertCards n={2} />
        </Page>
      );
    case 'settings':
      return (
        <Page>
          <Title action={false} />
          <Card pad={16}><Row gap={12}><Bone w={48} h={48} r={24} /><View style={{ flex: 1, gap: 8 }}><Bone w="50%" h={14} /><Bone w="70%" h={10} /></View></Row></Card>
          <Card pad={0}>
            {range(9).map((i) => (
              <Row key={i} gap={14} style={{ minHeight: 56, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                <Bone w={18} h={18} r={5} /><Bone w="45%" h={14} />
              </Row>
            ))}
          </Card>
        </Page>
      );
    case 'correlation':
      return (
        <Page>
          <Title action={false} />
          <Card style={{ gap: 12 }}><Bone w="80%" h={12} /><Bone w="55%" h={38} r={8} /><Bone w="55%" h={38} r={8} /></Card>
          <Card pad={14} style={{ gap: 10 }}>
            <Bone w={150} h={16} />
            {range(8).map((r) => (
              <Row key={r} gap={8}>{range(wide ? 9 : 5).map((k) => <Bone key={k} w={wide ? 64 : 52} h={22} r={5} />)}</Row>
            ))}
          </Card>
        </Page>
      );
    case 'more':
      return (
        <Page>
          <Title action={false} />
          {[5, 2, 1].map((n, g) => (
            <Card key={g} pad={0}>
              {range(n).map((i) => (
                <Row key={i} gap={14} style={{ minHeight: 56, paddingHorizontal: 16, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                  <Bone w={18} h={18} r={5} /><Bone w="45%" h={14} />
                </Row>
              ))}
            </Card>
          ))}
        </Page>
      );
    case 'overview':
    default:
      return (
        <Page>
          <View style={{ gap: 8 }}><Bone w={120} h={12} /><Bone w={240} h={28} r={8} /></View>
          <Bone h={132} r={18} />
          <Tiles n={4} />
          <Bone w={130} h={18} />
          <Tiles n={4} h={110} />
        </Page>
      );
  }
}

/* ---------------- pushed screens ---------------- */

/** Generic detail page: back arrow, a stats card, an optional chart, and some text. */
export function DetailSkeleton({ chart }) {
  return (
    <Page>
      <Title back action={false} />
      <Card style={{ gap: 14 }}>
        <Row style={{ flexWrap: 'wrap' }} gap={20}>{range(4).map((i) => <View key={i} style={{ gap: 6 }}><Bone w={50} h={10} /><Bone w={80} h={20} /></View>)}</Row>
      </Card>
      {chart ? <Bone h={240} r={14} /> : null}
      <Card style={{ gap: 12 }}><Bone w={160} h={18} /><TextLines n={4} /></Card>
    </Page>
  );
}

export function NotificationsSkeleton() {
  return (
    <Page>
      <Title back action={false} />
      {range(5).map((i) => (
        <Card key={i} pad={14} style={{ borderRadius: 18 }}>
          <Row gap={12} style={{ alignItems: 'flex-start' }}>
            <Bone w={46} h={46} r={16} />
            <View style={{ flex: 1, gap: 8 }}>
              <Row style={{ justifyContent: 'space-between' }}><Bone w={70} h={10} /><Bone w={40} h={10} /></Row>
              <Bone w="65%" h={14} />
              <Bone w="90%" h={10} />
            </View>
          </Row>
        </Card>
      ))}
    </Page>
  );
}

/** Asset detail: price header, top bar, the chart with its price column, and the bottom action bar. */
export function AssetSkeleton() {
  return (
    <View pointerEvents="none" style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
        <Row gap={12} style={{ alignItems: 'flex-start' }}>
          <Bone w={24} h={24} r={12} style={{ marginTop: 8 }} />
          <View style={{ gap: 8 }}>
            <Bone w={110} h={12} />
            <Row gap={12}><Bone w={96} h={26} r={8} /><Bone w={110} h={26} r={8} /><Bone w={64} h={16} /></Row>
            <Bone w={190} h={10} />
          </View>
        </Row>
        <Row gap={6}><Bone w={96} h={40} r={12} /><Bone w={60} h={40} r={12} /><View style={{ flex: 1 }} /><Bone w={64} h={40} r={12} /></Row>
      </View>
      <View style={{ flex: 1, flexDirection: 'row', marginTop: 4 }}>
        <View style={{ flex: 1 }}><Bone h="100%" r={0} /></View>
        <View style={{ width: 52, paddingVertical: 14, justifyContent: 'space-between', alignItems: 'center' }}>
          {range(5).map((i) => <Bone key={i} w={38} h={10} />)}
        </View>
      </View>
      <Row style={{ justifyContent: 'space-around', paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.bgAlt }}>
        {range(5).map((i) => <Bone key={i} w={22} h={22} r={11} />)}
      </Row>
    </View>
  );
}