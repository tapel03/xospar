import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors as c } from '../../../theme/tokens';
import { Screen, PageTitle, T, Card, Row, Button, Empty, AITag, useLayout } from '../../../components/ui';
import FilterSheet, { FilterButton } from '../../../components/sheet/FilterSheet';
import AlertItem from '../components/AlertItem';
import CreateAlertSheet from '../components/CreateAlertSheet';
import { alertHistory } from '../../../mocks/mock';
import { useStore } from '../../../app/store';

const TABS = ['Active', 'Triggered', 'Paused', 'Expired'];
const WHO = ['All', 'My alerts', 'AI alerts'];

export default function AlertsScreen() {
  const nav = useNavigation();
  const { wide } = useLayout();
  const { alerts, updateAlert, removeAlert } = useStore();
  const [tab, setTab] = useState('Active');
  const [who, setWho] = useState('All');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const list = alerts.filter((a) => a.status === tab.toLowerCase() && (who === 'All' || (who === 'My alerts' ? a.type === 'my' : a.type === 'ai')));
  const activeFilters = (tab !== 'Active' ? 1 : 0) + (who !== 'All' ? 1 : 0);
  const reset = () => { setTab('Active'); setWho('All'); };

  return (
    <Screen>
      <PageTitle title="Alerts" right={<Button small icon="plus" label="New alert" onPress={() => setCreating(true)} />} />
      <Row style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <T v="caption" muted style={{ flex: 1 }}>{tab} alerts{who !== 'All' ? ` · ${who}` : ''} · {list.length}</T>
        <FilterButton count={activeFilters} onPress={() => setFilterOpen(true)} />
      </Row>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, alignSelf: 'stretch' }}>
          {list.length === 0 ? <Empty icon="bell" title={`No ${tab.toLowerCase()} alerts`} body="Draw a zone or level on any chart and tap Create alert." action="New price alert" onAction={() => setCreating(true)} /> : null}
          {list.map((a) => (
            <AlertItem key={a.id} a={a}
              onPause={() => updateAlert(a.id, { status: a.status === 'paused' ? 'active' : 'paused' })}
              onDelete={() => removeAlert(a.id)}
              onEdit={() => setEditing(a)}
              onOpen={() => nav.navigate('AssetDetail', { sym: a.asset })} />
          ))}
        </View>
        <View style={{ flex: wide ? 0.9 : undefined, alignSelf: 'stretch', gap: 12 }}>
          <Card pad={0}>
            <View style={{ padding: 14 }}>
              <T v="h3">Alert history</T>
            </View>
            {alertHistory.map((h, i) => (
              <View key={i} style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border, gap: 2 }}>
                <Row style={{ justifyContent: 'space-between' }}><T v="small" bold>{h.asset}</T><T v="caption" muted>{h.date}</T></Row>
                <T v="caption">{h.type}: {h.condition} at <T v="caption" mono>{h.price}</T></T>
                <T v="caption" muted>After: {h.after}. Trade: {h.trade}</T>
              </View>
            ))}
          </Card>
          <Card ai pad={12}>
            <Row style={{ marginBottom: 6 }}><AITag label="Pattern noticed" /></Row>
            <T v="small">2 of your 3 best trades this month started from your own alert on EUR/USD.</T>
          </Card>
        </View>
      </View>
      <CreateAlertSheet visible={creating || !!editing} editing={editing} asset={editing ? editing.asset : 'EUR/USD'} onClose={() => { setCreating(false); setEditing(null); }} />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter alerts"
        onReset={reset}
        groups={[
          { key: 'status', title: 'Status', options: TABS, value: tab, onChange: setTab },
          { key: 'who', title: 'Source', options: WHO, value: who, onChange: setWho },
        ]}
      />
    </Screen>
  );
}