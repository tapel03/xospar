import React from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, T, Card, Row, Icon, Delta, SectionHeader, Disclaimer, money, useLayout } from '../../../components/ui';
import { ImpactBadge } from '../../../components/domain';
import { account, assetBy, fmtPrice, news, upcomingEvents } from '../../../mocks/mock';
import { useLiveAssets } from '../../markets/hooks/useLiveAssets';
import { useStore } from '../../../app/store';

const WATCHLIST = ['EUR/USD', 'GBP/USD', 'XAU/USD', 'NAS100'];

const greeting = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
const dateText = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const usd = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** One quick action tile. */
function Action({ icon, label, sub, onPress, basis }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ flexGrow: 1, flexBasis: basis, minHeight: 112, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, justifyContent: 'space-between', gap: 10 }, pressed && { opacity: 0.75, backgroundColor: c.elevated }]}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={18} />
      </View>
      <View>
        <T v="h3">{label}</T>
        <T v="caption" muted numberOfLines={1}>{sub}</T>
      </View>
    </Pressable>
  );
}

/** One stat on its own card: label on top, value underneath. */
function StatCard({ label, value, tone, basis }) {
  return (
    <Card pad={14} style={{ flexGrow: 1, flexBasis: basis, gap: 6, borderRadius: 18 }}>
      <T v="caption" muted>{label}</T>
      <T v="h2" mono style={tone ? { color: tone } : null}>{value}</T>
    </Card>
  );
}

/** One instrument in the watchlist card. */
function WatchRow({ sym, first, onPress }) {
  const a = assetBy(sym);
  const up = a.chg >= 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`${sym}, ${fmtPrice(sym, a.price)}, ${a.chg}%`}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 64, borderTopWidth: first ? 0 : 1, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: up ? `${c.green}22` : `${c.red}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={up ? 'trending-up' : 'trending-down'} size={17} color={up ? c.green : c.red} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="h3">{sym.replace('/', '')}</T>
        <T v="caption" muted numberOfLines={1}>{a.name}</T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <T mono bold>{fmtPrice(sym, a.price)}</T>
        <Delta value={a.chg} size={12} style={{ color: up ? c.green : c.red }} />
      </View>
    </Pressable>
  );
}

/** One upcoming economic event. Everything sits on the same centre line, and the badge has room from the card edge. */
function EventLine({ e, first }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 68, borderTopWidth: first ? 0 : 1, borderTopColor: c.border }}>
      <View style={{ width: 58, justifyContent: 'center' }}>
        <T v="caption" muted>{e.day}</T>
        <T mono bold>{e.time}</T>
      </View>
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.border }}>
        <T v="caption" bold>{e.tag}</T>
      </View>
      <T v="small" bold style={{ flex: 1 }} numberOfLines={2}>{e.label}</T>
      <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
        <ImpactBadge impact={e.impact} />
      </View>
    </View>
  );
}

/** One line in Today's Focus. */
function FocusItem({ icon, tint, title, body, first, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: first ? 0 : 1, borderTopColor: c.border }, pressed && { backgroundColor: c.elevated }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${tint}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={tint} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="h3">{title}</T>
        <T v="small" muted>{body}</T>
      </View>
      {onPress ? <Icon name="chevron-right" size={16} color={c.muted} /> : null}
    </Pressable>
  );
}

export default function OverviewScreen({ go }) {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { settings, profile } = useStore();
  useLiveAssets(WATCHLIST);

  const name = profile.displayName || profile.name || 'Trader';
  const now = new Date();
  const tiles = wide ? '23%' : '47%';

  const dayUp = account.day >= 0;
  const tone = (v) => (v >= 0 ? c.green : c.red);

  const topStory = news.find((n) => n.relevance === 'High') || news[0];
  const nextEvent = upcomingEvents.find((e) => e.impact === 'High') || upcomingEvents[0];

  return (
    <Screen>
      {/* Hero header */}
      <View style={{ marginBottom: 18 }}>
        <T v="small" muted>{dateText()}</T>
        <T v="h1" style={{ fontSize: 28, lineHeight: 34 }} numberOfLines={1}>{greeting(now.getHours())}, {name}!</T>
      </View>

      {/* Total balance: its own card, full width */}
      <Card gradient pad={20} style={{ marginBottom: 10, borderRadius: 24, width: '100%' }}>
        <T v="small" style={{ color: c.white, opacity: 0.72, fontWeight: '600' }}>TOTAL BALANCE</T>
        <T v="display" mono style={{ color: c.white, marginTop: 4 }}>{usd(account.equity)}</T>
        <Row gap={8} style={{ marginTop: 6, flexWrap: 'wrap' }}>
          <Icon name={dayUp ? 'arrow-up-right' : 'arrow-down-right'} size={16} color={c.white} />
          <T v="small" mono bold style={{ color: c.white }}>{money(account.day)} today</T>
          <T v="small" style={{ color: c.white, opacity: 0.72 }}>· Open P&L {money(account.floating)}</T>
        </Row>
      </Card>

      {/* Four stats, each on its own card, laid out like the quick actions */}
      <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={10}>
        <StatCard basis={tiles} label="Week" value={money(account.week)} tone={tone(account.week)} />
        <StatCard basis={tiles} label="Month" value={money(account.month)} tone={tone(account.month)} />
        <StatCard basis={tiles} label="Win rate" value={`${account.winRate}%`} />
        <StatCard basis={tiles} label="Profit factor" value={String(account.profitFactor)} />
      </Row>

      {/* Quick actions: only pages that are not in the bottom navigation bar */}
      <SectionHeader title="Quick actions" />
      <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={10}>
        <Action basis={tiles} icon="calendar" label="Calendar" sub="Economic events" onPress={() => go('calendar')} />
        <Action basis={tiles} icon="file-text" label="News" sub="Market headlines" onPress={() => go('news')} />
        <Action basis={tiles} icon="hash" label="Correlations" sub="Pair relationships" onPress={() => go('correlation')} />
        <Action basis={tiles} icon="map" label="Events map" sub="What is moving markets" onPress={() => go('map')} />
      </Row>

      {/* Illustration / ad card: empty placeholder to decorate later */}
      <Card pad={0} style={{ marginTop: 16, borderStyle: 'dashed', borderColor: c.borderStrong, borderRadius: 20 }}>
        <View style={{ minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20 }}>
          <Icon name="image" size={26} color={c.muted} />
          <T v="h3">Illustration or ad space</T>
          <T v="caption" muted style={{ textAlign: 'center' }}>Reserved for artwork or a promotion.</T>
        </View>
      </Card>

      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        {/* Watchlist */}
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
          <SectionHeader title="Watchlist" action="See all" onAction={() => go('markets')} />
          <Card pad={0}>
            {WATCHLIST.map((sym, i) => <WatchRow key={sym} sym={sym} first={i === 0} onPress={() => nav.navigate('AssetDetail', { sym })} />)}
          </Card>
        </View>

        {/* Upcoming events */}
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
          <SectionHeader title="Upcoming events" action="Calendar" onAction={() => go('calendar')} />
          <Card pad={0}>
            {upcomingEvents.slice(0, 3).map((e, i) => <EventLine key={e.id} e={e} first={i === 0} />)}
          </Card>
        </View>
      </View>

      {/* Today's Focus */}
      <SectionHeader title="Today's focus" />
      <Card pad={0}>
        <FocusItem
          first
          icon="file-text"
          tint={c.red}
          title={topStory.headline}
          body={`${topStory.source} · ${topStory.time}. ${topStory.why}`}
          onPress={() => go('news')}
        />
        <FocusItem
          icon="shield"
          tint={c.green}
          title="Trading plan reminder"
          body={`Risk up to ${settings.maxRisk}% per trade, stop for the day at ${settings.maxDailyLoss}% loss, and keep to ${settings.maxPositions} open positions.`}
        />
        <FocusItem
          icon="clock"
          tint={c.lavender}
          title={`Watch: ${nextEvent.label}`}
          body={`${nextEvent.day} at ${nextEvent.time} (${nextEvent.tag}). ${nextEvent.impact} impact, so plan your entries around it.`}
          onPress={() => go('calendar')}
        />
      </Card>

      {/* Footer */}
      <View style={{ alignItems: 'center', marginTop: 28, gap: 4 }}>
        <T v="caption" muted>Edgeline · Trade with your edge. Learn from every trade.</T>
        <Disclaimer style={{ marginTop: 0 }}>Analysis and scenarios for education, not financial advice. Values in this prototype are simulated.</Disclaimer>
      </View>
    </Screen>
  );
}