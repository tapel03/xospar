import React, { useEffect, useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, T, Card, Row, Icon, SectionHeader, Disclaimer, money, useLayout } from '../../../components/ui';
import { ImpactBadge } from '../../../components/domain';
import { assets } from '../../../mocks/mock';
import { useMarketNews } from '../../news/hooks/useMarketNews';
import { useEconomicCalendar } from '../../calendar/hooks/useEconomicCalendar';
import { userApi } from '../../../services/userApi';
import { featureFlags } from '../../../app/config';
import { useStore } from '../../../app/store';

const CAP = require('../../../../assets/Cap.png'); // overview illustration

const R = 14; // corner radius used by every card on this screen
const R_HERO = 18; // corner radius of the big balance card

/**
 * Both are functions, not constants: they must be read every time the screen draws,
 * otherwise the colour is frozen to whichever theme was active when the app started.
 *
 * inv():   inverted card. Dark with light text in light mode, white with dark text in dark mode.
 * plain(): normal card. White in light mode, the dark card colour in dark mode.
 */
const inv = () => ({ backgroundColor: c.white, borderColor: c.white });
const plain = () => ({ backgroundColor: c.surface, borderColor: c.border });

/** Market mood from the backend (scored from the same news). Null until it loads or when offline. */
function useMood() {
  const [mood, setMood] = useState(null);
  useEffect(() => {
    if (!featureFlags.useBackend) return undefined;
    let live = true;
    const load = () => userApi.mood().then((m) => { if (live && m) setMood(m); }).catch(() => {});
    load();
    const t = setInterval(load, 5 * 60000);
    return () => { live = false; clearInterval(t); };
  }, []);
  return mood;
}

const greeting = (h) => (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening');
const dateText = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const usd = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd0 = (v) => `$${Math.round(Number(v)).toLocaleString('en-US')}`;

/** Small rounded square that holds an icon, like the tiles in the reference. */
function IconBox({ name, inverted, size = 32 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.34, alignItems: 'center', justifyContent: 'center', backgroundColor: inverted ? `${c.black}22` : c.elevated2 }}>
      <Icon name={name} size={size * 0.5} color={inverted ? c.black : c.text} />
    </View>
  );
}

/** One quick action tile. inverted: dark in light mode, white in dark mode. */
function Action({ icon, label, sub, onPress, basis, inverted }) {
  const fg = inverted ? c.black : c.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        { flexGrow: 1, flexBasis: basis, minHeight: 120, padding: 14, borderRadius: R, borderWidth: 1, justifyContent: 'space-between', gap: 10 },
        inverted ? inv() : plain(),
        pressed && { opacity: 0.8 },
      ]}
    >
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <IconBox name={icon} inverted={inverted} />
        <Icon name="arrow-up-right" size={16} color={inverted ? c.black : c.muted} />
      </Row>
      <View>
        <T v="h3" style={{ color: fg }}>{label}</T>
        <T v="caption" numberOfLines={1} style={{ color: fg, opacity: 0.65 }}>{sub}</T>
      </View>
    </Pressable>
  );
}

/** One stat tile: icon and label on top, big value underneath, and an optional small line under the value (the working). */
function StatCard({ icon, label, value, sub, tone, basis, inverted }) {
  const fg = inverted ? c.black : c.text;
  return (
    <View
      style={[
        { flexGrow: 1, flexBasis: basis, minHeight: 120, padding: 14, borderRadius: R, borderWidth: 1, justifyContent: 'space-between', gap: 10 },
        inverted ? inv() : plain(),
      ]}
    >
      <Row gap={8} style={{ alignItems: 'center' }}>
        <IconBox name={icon} inverted={inverted} size={30} />
        <T v="caption" numberOfLines={1} style={{ flex: 1, color: fg, opacity: 0.7 }}>{label}</T>
      </Row>
      <View>
        <T v="h1" mono style={{ color: tone || fg, fontSize: 26, lineHeight: 32 }}>{value}</T>
        {sub ? <T v="caption" numberOfLines={1} style={{ color: fg, opacity: 0.65 }}>{sub}</T> : null}
      </View>
    </View>
  );
}

/**
 * One open trade in the "Open trades" card. The bottom border uses the page background colour,
 * so the rows look separated by a gap that blends into the background.
 */
function OpenTradeRow({ p, onPress }) {
  const up = p.pnl >= 0;
  const long = p.dir === 'Long';
  const name = p.sym || String(p.asset || '').replace('/', '');
  const dec = p.dec != null ? p.dec : 2;
  const col = up ? c.green : c.red;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={`${long ? 'Buy' : 'Sell'} ${name}, ${money(p.pnl)}`}
      style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, minHeight: 64, borderBottomWidth: 2, borderBottomColor: c.bg }, pressed && { backgroundColor: c.elevated }]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: `${col}22`, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={long ? 'trending-up' : 'trending-down'} size={17} color={col} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="h3">{name}</T>
        <T v="caption" muted numberOfLines={1}>{long ? 'Buy' : 'Sell'} {p.size} · entry {Number(p.entry).toFixed(dec)}</T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <T mono bold style={{ color: col }}>{money(p.pnl)}</T>
        <T v="caption" muted>Now {Number(p.price).toFixed(dec)}</T>
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
      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: c.elevated2, borderWidth: 1, borderColor: c.border }}>
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
  const { settings, profile, account, positions, trades, sync } = useStore();
  const { news } = useMarketNews();
  const { upcoming: upcomingEvents } = useEconomicCalendar();
  const mood = useMood();

  const name = profile.displayName || profile.name || 'Trader';
  const now = new Date();
  const tiles = wide ? '23%' : '47%';

  // Open trades: only the positions you are in right now, and what they are making.
  const inTrade = positions.length > 0;
  const openPnl = positions.reduce((s, p) => s + (Number(p.pnl) || 0), 0);

  // Profit factor from closed trades: total won divided by total lost.
  const closed = trades.filter((t) => t.status !== 'open' && !String(t.date).includes('open'));
  const grossWin = closed.reduce((s, t) => s + (t.pnl > 0 ? t.pnl : 0), 0);
  const grossLoss = closed.reduce((s, t) => s + (t.pnl < 0 ? -t.pnl : 0), 0);
  const pf = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : grossWin > 0 ? '∞' : '—';
  const pfSub = closed.length ? `${usd0(grossWin)} won / ${usd0(grossLoss)} lost` : 'No closed trades yet';

  const dayUp = account.day >= 0;
  const tone = (v) => (v >= 0 ? c.green : c.red);

  const openChart = (p) => {
    const a = assets.find((x) => x.sym === p.asset || x.sym.replace('/', '') === p.sym);
    return a ? () => nav.navigate('AssetDetail', { sym: a.sym }) : undefined;
  };

  const topStory = news.find((n) => n.relevance === 'High') || news[0];
  const nextEvent = upcomingEvents.find((e) => e.impact === 'High') || upcomingEvents[0];
  const moodTint = mood ? (mood.mood === 'RISK-OFF' ? c.red : mood.mood === 'RISK-ON' ? c.green : c.lavender) : c.lavender;

  return (
    <Screen>
      {/* Hero header */}
      <View style={{ marginBottom: 18 }}>
        <T v="small" muted>{dateText()}</T>
        <T v="h1" style={{ fontSize: 28, lineHeight: 34 }} numberOfLines={1}>{greeting(now.getHours())}, {name}!</T>
      </View>

      {/* Total balance: inverted card (dark in light mode, white in dark mode) */}
      <Card pad={20} style={[inv(), { marginBottom: 10, borderRadius: R_HERO, width: '100%' }]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="small" style={{ color: c.black, opacity: 0.7, fontWeight: '700', letterSpacing: 0.6 }}>TOTAL BALANCE</T>
          <Icon name={dayUp ? 'arrow-up-right' : 'arrow-down-right'} size={18} color={c.black} />
        </Row>
        <T v="display" mono style={{ color: c.black, marginTop: 6 }}>{usd(account.equity)}</T>
        <Row gap={8} style={{ marginTop: 6, flexWrap: 'wrap' }}>
          <T v="small" mono bold style={{ color: c.black }}>{money(account.day)} today</T>
          <T v="small" style={{ color: c.black, opacity: 0.65 }}>· Open P&L {money(openPnl)}</T>
        </Row>
      </Card>

      {/* Stat tiles. When you are in a trade, an Open P&L tile comes first. The first tile is inverted, the rest are normal cards. */}
      <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={10}>
        {inTrade ? (
          <StatCard inverted basis={tiles} icon="activity" label="Open P&L" value={money(openPnl)} sub={`${positions.length} open trade${positions.length === 1 ? '' : 's'}`} tone={openPnl >= 0 ? undefined : c.red} />
        ) : null}
        <StatCard inverted={!inTrade} basis={tiles} icon="target" label="Win rate" value={`${account.winRate}%`} />
        <StatCard basis={tiles} icon="percent" label="Profit factor" value={pf} sub={pfSub} />
        <StatCard basis={tiles} icon="trending-up" label="Week" value={money(account.week)} tone={tone(account.week)} />
        <StatCard basis={tiles} icon="bar-chart-2" label="Month" value={money(account.month)} tone={tone(account.month)} />
      </Row>

      {/* Quick actions. zIndex 1: sits underneath the illustration. */}
      <View style={{ zIndex: 1 }}>
        <SectionHeader title="Quick actions" />
        <Row style={{ flexWrap: 'wrap', alignItems: 'stretch' }} gap={10}>
          <Action inverted basis={tiles} icon="calendar" label="Calendar" sub="Economic events" onPress={() => go('calendar')} />
          <Action basis={tiles} icon="file-text" label="News" sub="Market headlines" onPress={() => go('news')} />
          <Action basis={tiles} icon="hash" label="Correlations" sub="Pair relationships" onPress={() => go('correlation')} />
          <Action basis={tiles} icon="map" label="Events map" sub="What is moving markets" onPress={() => go('map')} />
        </Row>
      </View>

      {/*
        Illustration. zIndex 2: in front of the Quick actions cards, behind the Open trades cards.
        marginTop (negative) pulls it up over the Events map and Correlations cards.
        marginBottom (negative) lets the Open trades block slide over its bottom edge.
        Taps pass through it to the cards underneath.
      */}
      <View pointerEvents="none" style={{ zIndex: 2, height: 280, marginTop: -56, marginBottom: -96, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={CAP} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      </View>

      {/* Open trades and upcoming events. zIndex 3: in front of the illustration, so the cards cover its bottom. */}
      <View style={{ zIndex: 3, flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        {/* Open trades */}
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
          <SectionHeader title="Open trades" action={inTrade ? 'Journal' : undefined} onAction={() => go('journal')} />
          <Card pad={0} style={{ borderRadius: R }}>
            {inTrade
              ? positions.map((p) => <OpenTradeRow key={p.id} p={p} onPress={openChart(p)} />)
              : <View style={{ padding: 16 }}><T v="small" muted>You are not in a trade right now.</T></View>}
          </Card>
        </View>

        {/* Upcoming events */}
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%' }}>
          <SectionHeader title="Upcoming events" action="Calendar" onAction={() => go('calendar')} />
          <Card pad={0} style={{ borderRadius: R }}>
            {upcomingEvents.length
              ? upcomingEvents.slice(0, 3).map((e, i) => <EventLine key={e.id} e={e} first={i === 0} />)
              : <View style={{ padding: 16 }}><T v="small" muted>No more scheduled events this week.</T></View>}
          </Card>
        </View>
      </View>

      {/* Today's Focus */}
      <SectionHeader title="Today's focus" />
      <Card pad={0} style={{ borderRadius: R }}>
        {mood ? (
          <FocusItem
            first
            icon="activity"
            tint={moodTint}
            title={`Market mood: ${mood.mood.toLowerCase().replace('-', ' ')}`}
            body={mood.description}
            onPress={() => go('news')}
          />
        ) : null}
        {topStory ? <FocusItem
          first={!mood}
          icon="file-text"
          tint={c.red}
          title={topStory.headline}
          body={`${topStory.source} · ${topStory.time}. ${topStory.why}`}
          onPress={() => go('news')}
        /> : null}
        <FocusItem
          icon="shield"
          tint={c.green}
          title="Trading plan reminder"
          body={`Risk up to ${settings.maxRisk}% per trade, stop for the day at ${settings.maxDailyLoss}% loss, and keep to ${settings.maxPositions} open positions.`}
        />
        {nextEvent ? <FocusItem
          icon="clock"
          tint={c.lavender}
          title={`Watch: ${nextEvent.label}`}
          body={`${nextEvent.day} at ${nextEvent.time} (${nextEvent.tag}). ${nextEvent.impact} impact, so plan your entries around it.`}
          onPress={() => go('calendar')}
        /> : null}
      </Card>

      {/* Footer */}
      <View style={{ alignItems: 'center', marginTop: 28, gap: 4 }}>
        <T v="caption" muted>Edgeline · Trade with your edge. Learn from every trade.</T>
        <Disclaimer style={{ marginTop: 0 }}>Analysis and scenarios for education, not financial advice. {sync.status === 'live' ? 'Balances come from your journal.' : 'Offline: showing sample values.'}</Disclaimer>
      </View>
    </Screen>
  );
}