import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c, useMode } from '../../../theme/tokens';
import { T, Row, Icon, Button, Badge, AITag, Disclaimer, Sheet } from '../../../components/ui';
import FilterSheet, { FilterButton } from '../../../components/sheet/FilterSheet';
import GeoMap from '../components/GeoMap';
import { HOME } from '../components/mapStyle';
import { regionCollection } from '../data/regions';
import { mapCategories, mapEvents } from '../../../mocks/mock';

const catIcon = Object.fromEntries(mapCategories.map((m) => [m.key, m.icon]));
const keyByLabel = Object.fromEntries(mapCategories.map((m) => [m.label, m.key]));
const labelByKey = Object.fromEntries(mapCategories.map((m) => [m.key, m.label]));
const iconByLabel = Object.fromEntries(mapCategories.map((m) => [m.label, m.icon]));
const IMPACTS = ['High', 'Medium', 'Low'];

export default function EventsMapScreen() {
  const nav = useNavigation();
  const mode = useMode();
  const [zoom, setZoom] = useState(HOME.zoom);
  const [cats, setCats] = useState(mapCategories.map((m) => m.key));
  const [impacts, setImpacts] = useState(IMPACTS);
  const [sel, setSel] = useState(null);
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // The map always shows the last 24 hours.
  const events = useMemo(() => mapEvents.filter((e) => e.window === '24h' && cats.includes(e.cat) && impacts.includes(e.severity)), [cats, impacts]);
  const regions = useMemo(() => regionCollection(events), [events]);

  const openEvent = (e) => { setSel(e); setFull(false); setOpen(true); };
  const closeSheet = () => setOpen(false);
  const after = (fn) => { setOpen(false); setTimeout(fn, 250); };
  const activeFilters = (impacts.length !== IMPACTS.length ? 1 : 0) + (cats.length !== mapCategories.length ? 1 : 0);
  const reset = () => { setImpacts(IMPACTS); setCats(mapCategories.map((m) => m.key)); };
  const pct = Math.round(Math.pow(2, zoom - HOME.zoom) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: c.bgAlt }}>
      <GeoMap
        events={events}
        regions={regions}
        selectedId={open && sel ? sel.id : null}
        onSelect={openEvent}
        dark={mode === 'dark'}
        onZoom={setZoom}
        icons={catIcon}
      />

      {/* Floating header */}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <View style={{ backgroundColor: c.overlay, borderBottomWidth: 1, borderBottomColor: c.border, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <T v="h1">Events map</T>
              <T v="caption" muted>Last 24 hours · {events.length} event{events.length === 1 ? '' : 's'}</T>
            </View>
            <FilterButton count={activeFilters} onPress={() => setFilterOpen(true)} />
          </Row>
        </View>
      </View>

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter events"
        onReset={reset}
        groups={[
          { key: 'impact', title: 'Impact', options: IMPACTS, value: impacts, onChange: setImpacts, multi: true },
          { key: 'type', title: 'Type of event', options: mapCategories.map((m) => m.label), icons: iconByLabel, value: cats.map((k) => labelByKey[k]), onChange: (labels) => setCats(labels.map((l) => keyByLabel[l])), multi: true },
        ]}
      />

      {/* Zoom level. Pinch or scroll on the map to zoom; this shows how far in you are. */}
      <View pointerEvents="none" style={{ position: 'absolute', right: 12, bottom: 36 }}>
        <View style={{ paddingHorizontal: 10, height: 28, borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center' }}>
          <T v="caption" mono>{pct}%</T>
        </View>
      </View>

      {/* Event details modal */}
      <Sheet
        visible={open && !!sel}
        onClose={closeSheet}
        title={sel ? sel.title : ''}
        footer={sel ? (
          <Row style={{ flexWrap: 'wrap' }}>
            <Button small icon="bar-chart" label="View chart" onPress={() => after(() => nav.navigate('AssetDetail', { sym: sel.chartSym }))} />
            <Button small variant="secondary" icon="message-square" label="Ask mentor" onPress={() => after(() => nav.navigate('Main', { tab: 'mentor', prompt: 'Which events could affect my watchlist?', ts: Date.now() }))} />
            <Button small variant="ghost" label={full ? 'Less detail' : 'Full event detail'} onPress={() => setFull(!full)} />
          </Row>
        ) : null}
      >
        {sel ? (
          <>
            <Row style={{ flexWrap: 'wrap' }}>
              <Icon name={catIcon[sel.cat]} />
              <Badge kind={sel.severity === 'High' ? 'warn' : 'neutral'} label={`${sel.severity} impact`} />
              <T v="caption" muted style={{ flexShrink: 1 }}>{sel.location}, {sel.time}</T>
            </Row>

            <View style={{ gap: 0 }}>
              <T v="label" style={{ marginBottom: 8 }}>Possible transmission chain</T>
              {sel.chain.map((step, i) => (
                <View key={step} style={{ alignItems: 'flex-start' }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: i === 0 ? c.text : c.border, backgroundColor: i === 0 ? c.white : 'transparent' }}>
                    <T v="small" style={{ color: i === 0 ? c.black : c.text, fontWeight: i === 0 ? '700' : '400' }}>{step}</T>
                  </View>
                  {i < sel.chain.length - 1 ? <T muted style={{ marginLeft: 12 }}>↓</T> : null}
                </View>
              ))}
            </View>

            <View>
              <T v="label" style={{ marginBottom: 8 }}>Potentially affected</T>
              <Row style={{ flexWrap: 'wrap' }} gap={6}>{sel.affected.map((a) => <Badge key={a} kind="neutral" label={a} />)}</Row>
            </View>

            {sel.updates.length ? (
              <View style={{ gap: 4 }}>
                <T v="label">Latest updates</T>
                {sel.updates.map((u) => <T key={u} v="small" muted>{u}</T>)}
              </View>
            ) : null}

            {full ? (
              <View>
                <Row style={{ marginBottom: 6 }}><AITag /><T v="h3">Why could this matter to markets?</T></Row>
                <T v="small">Markets price risk through the chain above. The first link is the event itself; each later link is weaker and depends on how long the event lasts.</T>
                {sel.history.length ? (
                  <>
                    <T v="label" style={{ marginTop: 12, marginBottom: 6 }}>How similar events played out</T>
                    {sel.history.map((hh) => (
                      <View key={hh.event} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.border }}>
                        <T v="small" bold>{hh.event}</T>
                        <T v="caption" mono muted>Oil {hh.oil}   Gold {hh.gold}   USD {hh.usd}</T>
                      </View>
                    ))}
                  </>
                ) : <T v="small" muted style={{ marginTop: 8 }}>Not enough comparable events for a historical view.</T>}
              </View>
            ) : null}

            <Disclaimer style={{ marginTop: 0 }}>These are possible market impacts and relationships, not guaranteed price predictions.</Disclaimer>
          </>
        ) : null}
      </Sheet>
    </View>
  );
}