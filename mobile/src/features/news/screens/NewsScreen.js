import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c, getMode } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Button, Empty, Disclaimer, Icon, useLayout } from '../../../components/ui';
import FilterSheet, { FilterButton } from '../../../components/sheet/FilterSheet';
import { useMarketNews } from '../hooks/useMarketNews';

const TYPES = ['All', 'Forex', 'Stocks', 'Commodities', 'Crypto', 'Central banks', 'Geopolitics', 'Economy'];
const ATTENTION = ['All', 'High', 'Medium', 'Low'];
const RANK = { High: 0, Medium: 1, Low: 2 };

// Soft tones so important stories stand out without shouting. Light mode uses deeper accents so the text stays readable.
const toneOf = (rel) => {
  const light = getMode() === 'light';
  if (rel === 'High') {
    return light
      ? { accent: '#C0394B', bg: 'rgba(226,59,75,0.06)', border: 'rgba(226,59,75,0.28)', pill: 'rgba(226,59,75,0.12)', label: 'High impact' }
      : { accent: '#E8A0A8', bg: 'rgba(232,160,168,0.08)', border: 'rgba(232,160,168,0.30)', pill: 'rgba(232,160,168,0.16)', label: 'High impact' };
  }
  if (rel === 'Medium') {
    return light
      ? { accent: '#3F55D1', bg: 'rgba(85,104,232,0.06)', border: 'rgba(85,104,232,0.26)', pill: 'rgba(85,104,232,0.12)', label: 'Medium impact' }
      : { accent: '#9DB4EC', bg: 'rgba(157,180,236,0.08)', border: 'rgba(157,180,236,0.28)', pill: 'rgba(157,180,236,0.16)', label: 'Medium impact' };
  }
  return null;
};

const TYPE_RULES = {
  All: () => true,
  Forex: (n) => n.cat === 'Forex' || n.cat === 'Central Banks' || n.tags.some((t) => ['USD', 'EUR', 'GBP', 'JPY'].includes(t)),
  Stocks: (n) => n.cat === 'Earnings' || n.tags.some((t) => ['NVDA', 'AAPL', 'NAS100', 'Indices'].includes(t)),
  Commodities: (n) => n.tags.some((t) => ['Oil', 'Gold'].includes(t)),
  Crypto: (n) => n.cat === 'Crypto',
  'Central banks': (n) => n.cat === 'Central Banks',
  Geopolitics: (n) => n.cat === 'Geopolitics',
  Economy: (n) => n.cat === 'Economy',
};

/** Compact story card. Tap to read the AI summary. High and medium impact stories are softly highlighted. */
function NewsCard({ n, onAsk }) {
  const [open, setOpen] = useState(false);
  const tone = toneOf(n.relevance);
  return (
    <Card
      pad={12}
      onPress={() => setOpen(!open)}
      style={[{ gap: 6 }, tone && { backgroundColor: tone.bg, borderColor: tone.border, borderLeftWidth: 3, borderLeftColor: tone.accent }]}
    >
      <Row style={{ justifyContent: 'space-between' }} gap={8}>
        <T v="caption" muted numberOfLines={1} style={{ flex: 1 }}>{n.source} · {n.time} · {n.cat}</T>
        <Row gap={6}>
          {tone ? (
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: tone.pill }}>
              <T v="caption" style={{ color: tone.accent, fontWeight: '700' }}>{tone.label}</T>
            </View>
          ) : <T v="caption" muted>{n.relevance}</T>}
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} color={c.muted} />
        </Row>
      </Row>
      <T v="h3" numberOfLines={open ? undefined : 2}>{n.headline}</T>
      <T v="caption" muted numberOfLines={1}>{n.tags.join(' · ')}</T>
      {open ? (
        <View style={{ marginTop: 6, paddingTop: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: tone ? tone.accent : c.text, gap: 8 }}>
          <T v="small">✦ {n.summary}</T>
          <View><T v="label">Why it matters</T><T v="small" muted>{n.why}</T></View>
          <View><T v="label">What could it affect?</T><T v="small" mono>{n.affects}</T></View>
          <Row><Button small variant="ghost" icon="message-square" label="Ask mentor" onPress={onAsk} /></Row>
        </View>
      ) : null}
    </Card>
  );
}

export default function NewsScreen() {
  const nav = useNavigation();
  const { wide } = useLayout();
  const [type, setType] = useState('All');
  const [attn, setAttn] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const { news } = useMarketNews();   // live from the backend, sample stories until it answers

  const rows = useMemo(
    () => news.filter((n) => TYPE_RULES[type](n) && (attn === 'All' || n.relevance === attn)).sort((a, b) => RANK[a.relevance] - RANK[b.relevance]),
    [type, attn, news],
  );
  const activeFilters = (type !== 'All' ? 1 : 0) + (attn !== 'All' ? 1 : 0);
  const reset = () => { setType('All'); setAttn('All'); };
  const ask = (n) => nav.navigate('Main', { tab: 'mentor', prompt: `Why does "${n.headline}" matter for my watchlist?`, ts: Date.now() });

  return (
    <Screen>
      <PageTitle title="News" right={<FilterButton count={activeFilters} onPress={() => setFilterOpen(true)} />} />
      <T v="caption" muted style={{ marginBottom: 12 }}>Showing {rows.length} stor{rows.length === 1 ? 'y' : 'ies'}{type !== 'All' ? ` · ${type}` : ''}{attn !== 'All' ? ` · ${attn} impact` : ''}</T>
      {rows.length === 0 ? (
        <Empty icon="file-text" title="No stories match these filters" body="Try a different type or impact level." action="Reset filters" onAction={reset} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {rows.map((n) => <View key={n.id} style={wide ? { flexBasis: '48.5%', flexGrow: 1 } : { width: '100%' }}><NewsCard n={n} onAsk={() => ask(n)} /></View>)}
        </View>
      )}
      <Disclaimer>AI summaries describe possible market channels, not price predictions. Always read the source.</Disclaimer>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter news"
        onReset={reset}
        groups={[
          { key: 'attn', title: 'Impact', options: ATTENTION, value: attn, onChange: setAttn },
          { key: 'type', title: 'Type', options: TYPES, value: type, onChange: setType },
        ]}
      />
    </Screen>
  );
}