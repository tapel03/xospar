import React, { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Sheet, T, Row, Chip, Segmented, Field, Button, Icon } from '../../../components/ui';
import { colors as c } from '../../../theme/tokens';
import { useStore } from '../../../app/store';
import { assetBy, fmtPrice, strategies } from '../../../mocks/mock';

const CONDS = {
  zone: ['Enters zone', 'Exits zone', 'Returns to zone'],
  line: ['Reaches level', 'Crosses above', 'Crosses below', 'Breaks level', 'Returns to level'],
  price: ['Reaches price', 'Crosses above', 'Crosses below', 'Enters range', 'Exits range'],
};
const NOTIFY = ['In-app', 'Push', 'Sound', 'Email', 'SMS'];

/** One collapsible option. Closed: title and a one-line summary. Open: the full controls. */
function Option({ title, summary, open, onToggle, children }) {
  return (
    <View style={{ borderWidth: 1, borderColor: open ? c.borderStrong : c.border, borderRadius: 14, backgroundColor: c.elevated, overflow: 'hidden' }}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={title}
        style={({ pressed }) => [{ minHeight: 56, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }, pressed && { opacity: 0.75 }]}>
        <View style={{ flex: 1 }}>
          <T v="label">{title}</T>
          {!open && summary ? <T v="small" muted numberOfLines={1}>{summary}</T> : null}
        </View>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} color={c.muted} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2, gap: 12 }}>{children}</View> : null}
    </View>
  );
}

/** Manual alerts never depend on AI: they fire on price alone. */
export default function CreateAlertSheet({ visible, onClose, asset = 'EUR/USD', drawing, onCreated, editing }) {
  const { addAlert, updateAlert } = useStore();
  const kind = drawing ? drawing.type : 'price';
  const [sym, setSym] = useState(asset);
  const [cond, setCond] = useState(CONDS[kind][0]);
  const [label, setLabel] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [strategy, setStrategy] = useState('None');
  const [notify, setNotify] = useState(['In-app', 'Push']);
  const [freq, setFreq] = useState('Alert once');
  const [exp, setExp] = useState('This week');
  const [priority, setPriority] = useState('Normal');
  const [tf, setTf] = useState('Any');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState({ condition: true });
  const flip = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  useEffect(() => {
    if (!visible) return;
    setSym(editing ? editing.asset : asset);
    setCond(editing ? editing.condition : CONDS[kind][0]);
    setLabel(editing ? editing.label : kind === 'zone' ? 'MY BUY ZONE' : kind === 'line' ? 'MY LEVEL' : '');
    setStrategy(editing && editing.strategy ? editing.strategy : 'None');
    setOpen({ condition: true });
  }, [visible, drawing, editing]);

  const d = assetBy(sym).dec;
  const target = kind === 'zone' ? `${drawing.low.toFixed(d)}–${drawing.high.toFixed(d)}`
    : kind === 'line' ? drawing.price.toFixed(d)
    : editing && !p1 ? editing.target
    : cond.includes('range') ? `${p1}–${p2}` : p1;
  const valid = kind !== 'price' || (p1 && (!cond.includes('range') || p2)) || (editing && !p1);

  const save = () => {
    const payload = {
      type: 'my', asset: sym, label: label || (kind === 'zone' ? 'MY ZONE' : 'MY LEVEL'), condition: cond, target,
      current: fmtPrice(sym, assetBy(sym).price), expires: exp, notify: notify.join(' + '),
      repeat: freq === 'Repeat alert', strategy: strategy === 'None' ? null : strategy, priority, timeframe: tf, notes,
    };
    if (editing) updateAlert(editing.id, payload); else addAlert(payload);
    onCreated && onCreated(payload);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={editing ? 'Edit alert' : 'Create alert'}
      footer={<Row style={{ justifyContent: 'flex-end' }}><Button variant="ghost" label="Cancel" onPress={onClose} /><Button label={editing ? 'Save alert' : 'Create alert'} icon="bell" onPress={save} disabled={!valid} /></Row>}
    >
      <Row style={{ padding: 12, borderRadius: 10, borderWidth: 1, borderColor: c.border, alignItems: 'flex-start' }}>
        <Icon name="bell" size={16} />
        <T v="small" style={{ flex: 1 }}>This alert fires on price alone. The AI is not involved in deciding when it triggers.</T>
      </Row>

      <Row style={{ justifyContent: 'space-between' }}>
        <View>
          <T v="label">Asset</T>
          <T v="h2" mono>{sym}</T>
        </View>
        <T v="small" muted>now {fmtPrice(sym, assetBy(sym).price)}</T>
      </Row>

      <Option title="Condition" summary={`${cond}${target ? ` · ${target}` : ''}`} open={!!open.condition} onToggle={() => flip('condition')}>
        <Row style={{ flexWrap: 'wrap' }}>{CONDS[kind].map((x) => <Chip key={x} label={x} on={cond === x} onPress={() => setCond(x)} />)}</Row>
        {kind !== 'price' ? <T v="small" muted>{kind === 'zone' ? 'Zone' : 'Level'} from your drawing: <T v="small" mono>{target}</T></T> : (
          <Row style={{ alignItems: 'flex-start' }}>
            <Field label={cond.includes('range') ? 'From price' : 'Price'} value={p1} onChangeText={setP1} keyboardType="decimal-pad" placeholder={editing ? editing.target : fmtPrice(sym, assetBy(sym).price)} />
            {cond.includes('range') ? <Field label="To price" value={p2} onChangeText={setP2} keyboardType="decimal-pad" placeholder="1.1660" /> : null}
          </Row>
        )}
      </Option>

      <Option title="Label" summary={label || 'No label'} open={!!open.label} onToggle={() => flip('label')}>
        <Field value={label} onChangeText={setLabel} placeholder="MY BUY ZONE" />
      </Option>

      <Option title="Link to my edge" summary={strategy === 'None' ? 'Not linked' : strategy} open={!!open.edge} onToggle={() => flip('edge')}>
        <Row style={{ flexWrap: 'wrap' }}>{['None', ...strategies.map((s) => s.name)].map((x) => <Chip key={x} label={x} on={strategy === x} onPress={() => setStrategy(x)} />)}</Row>
        {strategy !== 'None' ? <T v="caption" muted>When this fires you'll see "{sym} has entered your {strategy} zone". It only means your own condition occurred.</T> : null}
      </Option>

      <Option title="Notify me by" summary={notify.length ? notify.join(', ') : 'Nothing selected'} open={!!open.notify} onToggle={() => flip('notify')}>
        <Row style={{ flexWrap: 'wrap' }}>{NOTIFY.map((x) => <Chip key={x} label={x} on={notify.includes(x)} onPress={() => setNotify(notify.includes(x) ? notify.filter((n) => n !== x) : [...notify, x])} />)}</Row>
      </Option>

      <Option title="Frequency and expiry" summary={`${freq} · expires ${exp.toLowerCase()}`} open={!!open.timing} onToggle={() => flip('timing')}>
        <View style={{ gap: 8 }}><T v="label" muted>Frequency</T><Segmented options={['Alert once', 'Repeat alert']} value={freq} onChange={setFreq} /></View>
        <View style={{ gap: 8 }}><T v="label" muted>Expires</T><Segmented scroll options={['Today', 'This week', 'Until cancelled']} value={exp} onChange={setExp} /></View>
      </Option>

      <Option title="Priority and timeframe" summary={`${priority} priority · ${tf === 'Any' ? 'any timeframe' : tf}`} open={!!open.priority} onToggle={() => flip('priority')}>
        <View style={{ gap: 8 }}><T v="label" muted>Priority</T><Segmented options={['Normal', 'High']} value={priority} onChange={setPriority} /></View>
        <View style={{ gap: 8 }}><T v="label" muted>Timeframe</T><Segmented scroll options={['Any', '5m', '15m', '1H', '4H']} value={tf} onChange={setTf} /></View>
      </Option>

      <Option title="Notes" summary={notes || 'No notes'} open={!!open.notes} onToggle={() => flip('notes')}>
        <Field value={notes} onChangeText={setNotes} multiline placeholder="What do you want to check when this fires?" />
      </Option>
    </Sheet>
  );
}