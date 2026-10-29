import React, { useEffect, useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors as c } from '../../../theme/tokens';
import { Frame } from '../../../navigation/Frame';
import { Screen, PageTitle, T, Card, Row, Chip, Segmented, Field, Button, Icon, Sheet, Disclaimer, Stat } from '../../../components/ui';
import { KV } from '../../../components/domain';
import { assets, allSetups, assetBy, fmtPrice, account } from '../../../mocks/mock';
import { riskBaseOf } from '../../trading/risk';
import { useStore } from '../../../app/store';

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'Frustrated', 'FOMO', 'Bored', 'Tired'];
const CONDITIONS = ['Trending', 'Ranging', 'Volatile', 'News-driven', 'Quiet'];
const COOLDOWN = 10;
const EQUITY = account.equity; // fallback only: the risk base from Settings is used when it has been set

/* ---------- helpers ---------- */
const num = (s) => parseFloat(String(s).replace(',', '.'));
const usd = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sizeDec = (a) => (a.cat === 'Stocks' ? 0 : a.cat === 'Indices' ? 1 : a.cat === 'Crypto' ? 3 : 2);
const sizeUnit = (a) => (a.cat === 'Stocks' ? 'shares' : a.cat === 'Indices' ? 'contracts' : a.cat === 'Crypto' ? 'units' : 'lots');
// Simulated: dollars gained or lost per 1.0 of price movement, per 1 unit of size.
const vpu = (a) => (a.cat === 'Forex' ? (a.sym.startsWith('USD/') ? 100000 / a.price : 100000) : a.sym === 'XAU/USD' ? 100 : a.sym === 'WTI' ? 1000 : 1);
const riskMoney = (t) => Math.abs(num(t.entry) - num(t.stop)) * num(t.size) * vpu(assetBy(t.asset));
const riskText = (money, unit, base = EQUITY) => (unit === '$' ? money.toFixed(2) : ((money / base) * 100).toFixed(2));

function makeTicket(sym, dir, maxRisk, o = {}, unit = '%', base = EQUITY) {
  const a = assetBy(sym);
  const fx = (v) => v.toFixed(a.dec);
  const buy = dir === 'Long';
  const entry = o.entry || fx(a.price);
  const e = num(entry);
  const stop = o.stop || fx(buy ? e * 0.9975 : e * 1.0025);
  const target = o.target || fx(buy ? e * 1.005 : e * 0.995);
  const dist = Math.abs(e - num(stop));
  let size = o.size;
  if (!size) {
    // Default size = what risks your per-trade limit (on your risk base) at the default stop.
    const raw = ((maxRisk / 100) * base) / (dist * vpu(a) || 1);
    size = isFinite(raw) && raw > 0 ? raw.toFixed(sizeDec(a)) : '1';
    if (!(num(size) > 0)) size = Math.pow(10, -sizeDec(a)).toFixed(sizeDec(a));
  }
  const m = dist * num(size) * vpu(a);
  return { asset: sym, dir, entry, stop, target, size, riskUnit: unit, risk: isFinite(m) ? riskText(m, unit, base) : '' };
}

function calc(f, base = EQUITY) {
  const a = assetBy(f.asset);
  const e = num(f.entry); const s = num(f.stop); const t = num(f.target); const z = num(f.size);
  const v = vpu(a);
  const risk$ = Math.abs(e - s) * z * v;
  const reward$ = Math.abs(t - e) * z * v;
  return { a, e, s, t, z, risk$, reward$, riskPct: (risk$ / base) * 100, rr: risk$ > 0 ? reward$ / risk$ : 0 };
}

function ticketErrors(f) {
  const { e, s, t, z } = calc(f);
  if (![e, s, t, z].every((x) => isFinite(x) && x > 0)) return ['Enter a positive number for position size, entry, stop loss and take profit.'];
  const out = [];
  if (f.dir === 'Long') {
    if (s >= e) out.push('For a buy, the stop loss must be below the entry price.');
    if (t <= e) out.push('For a buy, the take profit must be above the entry price.');
  } else {
    if (s <= e) out.push('For a sell, the stop loss must be above the entry price.');
    if (t >= e) out.push('For a sell, the take profit must be below the entry price.');
  }
  return out;
}

export default function AddTradeScreen({ route, navigation }) {
  const { settings, addTrade, strategies, trades } = useStore();
  const base = riskBaseOf(settings, EQUITY); // risk % is worked out from this fixed amount, not live equity
  const init = route.params?.draft || {};
  const [lockedAsset] = useState(!!init.asset); // opened from a chart: the market is fixed

  const [f, setF] = useState(() => {
    const sym = init.asset || 'EUR/USD';
    const dir = init.dir || 'Long';
    const s0 = strategies.find((s) => s.name === init.strategy) || strategies.find((s) => s.status === 'Active' && s.markets.includes(sym)) || strategies[0];
    return {
      ...makeTicket(sym, dir, settings.maxRisk, init, '%', base),
      strategy: s0 ? s0.name : '', setup: init.setup || (s0 && s0.setups[0]) || allSetups[0],
      reason: '', thesis: '', emotion: 'Calm', condition: 'Ranging', meets: 'Yes',
    };
  });
  const [stage, setStage] = useState('entry'); // entry | strategy | reason | chart | conflict | result
  const [open, setOpen] = useState(true);
  const [conflict, setConflict] = useState([]);
  const [reason, setReason] = useState('');
  const [left, setLeft] = useState(COOLDOWN);
  const [shot, setShot] = useState(null);
  const [result, setResult] = useState(null); // { ok, id, reasons }

  const a = assetBy(f.asset);
  const buy = f.dir === 'Long';
  const unit = sizeUnit(a);
  const strat = strategies.find((s) => s.name === f.strategy) || strategies[0];
  // One strategy with one setup: nothing to choose, so skip that step.
  const skipStrategy = strategies.length === 1 && !!strat && strat.setups.length === 1;
  const stratName = skipStrategy ? strat.name : f.strategy;
  const setupName = skipStrategy ? strat.setups[0] : f.setup;
  const steps = ['entry', ...(skipStrategy ? [] : ['strategy']), 'reason', 'chart'];
  const idx = steps.indexOf(stage);
  const next = () => setStage(steps[idx + 1]);
  const back = () => setStage(steps[idx - 1]);

  const k = calc(f, base);
  const errs = ticketErrors(f);

  /* ---------- ticket editing ---------- */
  const update = (patch) => setF((p) => {
    const n = { ...p, ...patch };
    const m = riskMoney(n);
    if (!('risk' in patch) && isFinite(m) && m > 0) n.risk = riskText(m, n.riskUnit, base);
    return n;
  });

  // Typing a risk amount moves the stop loss to match.
  const onRisk = (v) => setF((p) => {
    const n = { ...p, risk: v };
    const r = num(v); const e = num(p.entry); const z = num(p.size);
    const m = p.riskUnit === '$' ? r : (r / 100) * base;
    const pa = assetBy(p.asset);
    const d = m / (z * vpu(pa));
    if (isFinite(d) && d > 0 && isFinite(e)) {
      const s = p.dir === 'Long' ? e - d : e + d;
      if (s > 0) n.stop = s.toFixed(pa.dec);
    }
    return n;
  });

  const changeDir = (d) => setF((p) => {
    if (p.dir === d) return p;
    const e = num(p.entry); const s = num(p.stop); const t = num(p.target);
    const n = { ...p, dir: d };
    if ([e, s, t].every(isFinite)) {
      const dec = assetBy(p.asset).dec;
      n.stop = (2 * e - s).toFixed(dec);
      n.target = (2 * e - t).toFixed(dec);
    }
    return n;
  });

  const pickAsset = (sym) => setF((p) => ({ ...p, ...makeTicket(sym, p.dir, settings.maxRisk, {}, p.riskUnit, base) }));
  const set = (key) => (v) => setF((p) => ({ ...p, [key]: v }));

  /* ---------- navigation helpers ---------- */
  const leave = (fn) => { setOpen(false); setTimeout(fn, 280); };
  const goJournal = () => leave(() => navigation.navigate('Main', { tab: 'journal', ts: Date.now() }));
  const draft = () => ({ asset: f.asset, dir: f.dir, entry: f.entry, stop: f.stop, target: f.target, size: f.size, strategy: stratName, setup: setupName, risk: k.riskPct.toFixed(2) });

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => setOpen(true));
    return unsub;
  }, [navigation]);

  useEffect(() => {
    if (stage !== 'conflict' || !settings.hardRule) return undefined;
    setLeft(COOLDOWN);
    const id = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [stage]);

  // The system image picker cannot open on top of a Modal: close, pick, reopen.
  const pickShot = () => {
    setOpen(false);
    setTimeout(async () => {
      try {
        const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
        if (!res.canceled && res.assets && res.assets.length) {
          const s = res.assets[0];
          setShot({ uri: s.uri, width: s.width || 16, height: s.height || 9 });
        }
      } catch (e) { /* picker unavailable or permission denied */ }
      setOpen(true);
    }, 350);
  };

  /* ---------- rules check and placing ---------- */
  const issues = () => {
    const out = [];
    if (!strat) return out;
    if (!strat.setups.includes(setupName)) out.push(`This trade uses a ${setupName} entry, but your documented ${stratName} strategy does not include ${setupName} setups.`);
    if (!strat.markets.includes(f.asset)) out.push(`${f.asset} is not one of the markets for ${stratName}.`);
    if (k.riskPct > settings.maxRisk + 0.0001) out.push(`Risk of ${k.riskPct.toFixed(2)}% is above your ${settings.maxRisk}% per-trade limit.`);
    if (!skipStrategy && f.meets === 'No') out.push('You marked this trade as not meeting your edge.');
    return out;
  };

  const place = (overrideReason) => {
    const fails = [...ticketErrors(f)];
    const openCount = trades.filter((t) => String(t.date).includes('open')).length;
    if (openCount >= settings.maxPositions) fails.push(`You already have ${openCount} open positions. Your limit is ${settings.maxPositions}.`);
    if (fails.length) { setResult({ ok: false, reasons: fails }); setStage('result'); return; }

    const off = issues().length > 0;
    const id = 'T-' + String(Date.now()).slice(-4);
    const rMultiple = Math.abs(k.t - k.e) / (Math.abs(k.e - k.s) || 1);
    addTrade({
      id, date: 'Today, open', asset: f.asset, dir: f.dir, strategy: stratName, setup: setupName, session: 'London', tf: '15m',
      entry: k.e, exit: k.e, stop: k.s, target: k.t, size: `${f.size} ${unit}`, risk: Number(k.riskPct.toFixed(2)),
      r: 0, pnl: 0, edge: off ? 'no' : (!skipStrategy && f.meets === 'Partially') ? 'partial' : 'yes', review: 'pending', emotion: f.emotion,
      thesis: (f.thesis || f.reason || 'No thesis written.') + (overrideReason ? ` [Override reason: ${overrideReason}]` : ''),
      verdict: off ? 'bad' : 'valid-loss', plannedR: rMultiple, screenshot: shot ? shot.uri : null,
    });
    setResult({ ok: true, id });
    setStage('result');
  };

  const submit = () => {
    const list = issues();
    if (list.length && settings.tradeWarnings) { setConflict(list); setReason(''); setStage('conflict'); } else place();
  };

  const onClose = () => {
    if (stage === 'result' && result && result.ok) { goJournal(); return; }
    if (stage === 'result') setStage('entry');
    setOpen(false);
  };

  /* ---------- stage content ---------- */
  const warnBox = (lines) => (
    <View style={{ padding: 12, borderRadius: 12, borderWidth: 2, borderColor: c.text, gap: 6 }}>
      {lines.map((x, i) => <T key={i} small>⚠  {x}</T>)}
    </View>
  );

  const chipGroup = (label, options, value, onPress) => (
    <View style={{ gap: 8 }}>
      <T v="label">{label}</T>
      <Row style={{ flexWrap: 'wrap' }} gap={6}>{options.map((o) => <Chip key={o} label={o} on={value === o} onPress={() => onPress(o)} />)}</Row>
    </View>
  );

  const entryBody = (
    <>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }} gap={12}>
        <View style={{ flexShrink: 1 }}>
          <T v="label" muted>Market</T>
          <T v="h2" mono>{f.asset}</T>
          <T v="caption" muted>{a.name} · now {fmtPrice(f.asset, a.price)}</T>
        </View>
        <View style={{ gap: 6, alignItems: 'flex-end' }}>
          <T v="label" muted>Direction</T>
          <Segmented options={['Buy', 'Sell']} value={buy ? 'Buy' : 'Sell'} onChange={(v) => changeDir(v === 'Buy' ? 'Long' : 'Short')} />
        </View>
      </Row>

      {!lockedAsset ? (
        <View style={{ gap: 8 }}>
          <T v="label">Change market</T>
          <Row style={{ flexWrap: 'wrap' }} gap={6}>{assets.slice(0, 8).map((x) => <Chip key={x.sym} label={x.sym} on={f.asset === x.sym} onPress={() => pickAsset(x.sym)} />)}</Row>
        </View>
      ) : null}

      <Row style={{ flexWrap: 'wrap', alignItems: 'flex-start' }} gap={12}>
        <Field label={`Position size (${unit})`} value={f.size} onChangeText={(v) => update({ size: v })} keyboardType="decimal-pad" />
        <Field label="Entry price" value={f.entry} onChangeText={(v) => update({ entry: v })} keyboardType="decimal-pad" />
      </Row>

      <Row style={{ flexWrap: 'wrap', alignItems: 'flex-start' }} gap={12}>
        <Field label="Stop loss" value={f.stop} onChangeText={(v) => update({ stop: v })} keyboardType="decimal-pad" hint="Changing this updates your risk" />
        <View style={{ gap: 6, flexGrow: 1, flexBasis: 160 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T v="label">Risk</T>
            <Segmented options={['%', '$']} value={f.riskUnit} onChange={(u) => update({ riskUnit: u })} />
          </Row>
          <Field value={f.risk} onChangeText={onRisk} keyboardType="decimal-pad" style={{ flexBasis: 'auto', flexGrow: 0 }}
            hint={f.riskUnit === '%' ? `≈ ${usd(k.risk$ || 0)} · limit ${settings.maxRisk}% of ${usd(base)}` : `≈ ${(k.riskPct || 0).toFixed(2)}% of ${usd(base)} · limit ${settings.maxRisk}%`} />
        </View>
      </Row>

      <Row style={{ flexWrap: 'wrap', alignItems: 'flex-start' }} gap={12}>
        <Field label="Take profit" value={f.target} onChangeText={(v) => update({ target: v })} keyboardType="decimal-pad" />
      </Row>

      {errs.length === 0 ? (
        <Card pad={12}>
          <Row style={{ flexWrap: 'wrap' }} gap={12}>
            <Stat label="You risk" value={usd(k.risk$)} size="h3" />
            <Stat label="Potential reward" value={usd(k.reward$)} size="h3" />
            <Stat label="Reward : risk" value={`${k.rr.toFixed(2)} : 1`} size="h3" />
          </Row>
          {k.riskPct > settings.maxRisk + 0.0001 ? <T v="caption" bold style={{ marginTop: 8 }}>⚠ {k.riskPct.toFixed(2)}% is above your {settings.maxRisk}% per-trade limit.</T> : null}
        </Card>
      ) : warnBox(errs)}
    </>
  );

  const strategyBody = (
    <>
      {strategies.length > 1 ? chipGroup('Strategy', strategies.map((s) => s.name), f.strategy, (name) => {
        const s = strategies.find((x) => x.name === name);
        setF((p) => ({ ...p, strategy: name, setup: (s && s.setups[0]) || p.setup }));
      }) : null}
      <View style={{ gap: 8 }}>
        <T v="label">What was your setup?</T>
        <Row style={{ flexWrap: 'wrap' }} gap={6}>
          {allSetups.map((s) => <Chip key={s} label={strat && strat.setups.includes(s) ? s : `${s} (not in rules)`} on={f.setup === s} onPress={() => set('setup')(s)} />)}
        </Row>
      </View>
      {chipGroup('Market condition', CONDITIONS, f.condition, set('condition'))}
      <View style={{ gap: 8 }}><T v="label">Did this trade meet your edge?</T><Segmented options={['Yes', 'Partially', 'No']} value={f.meets} onChange={set('meets')} /></View>
    </>
  );

  const reasonBody = (
    <>
      <Field label="What made you take this trade?" value={f.reason} onChangeText={set('reason')} multiline placeholder="The trigger you saw, in one or two sentences" />
      <Field label="Trade thesis" value={f.thesis} onChangeText={set('thesis')} multiline placeholder="Why should price reach your target, and what would prove you wrong?" />
      {chipGroup('Emotional state', EMOTIONS, f.emotion, set('emotion'))}
    </>
  );

  const chartBody = (
    <>
      {shot ? (
        <>
          <View style={{ borderRadius: 12, borderWidth: 1, borderColor: c.border, overflow: 'hidden', backgroundColor: c.bg }}>
            <Image source={{ uri: shot.uri }} style={{ width: '100%', aspectRatio: shot.width / shot.height }} resizeMode="contain" accessibilityLabel="Chart screenshot" />
          </View>
          <Row gap={8}>
            <Button small variant="secondary" icon="image" label="Replace" onPress={pickShot} />
            <Button small variant="ghost" icon="trash-2" label="Remove" onPress={() => setShot(null)} />
          </Row>
        </>
      ) : (
        <Pressable onPress={pickShot} accessibilityRole="button" accessibilityLabel="Upload a screenshot" style={({ pressed }) => [{ borderWidth: 1, borderStyle: 'dashed', borderColor: c.borderStrong, borderRadius: 12, padding: 24, alignItems: 'center', gap: 6 }, pressed && { opacity: 0.7 }]}>
          <Icon name="image" />
          <T v="h3">Upload a screenshot</T>
        </Pressable>
      )}
      <Button small variant="secondary" icon="check-square" label="Check trade first" onPress={() => leave(() => navigation.navigate('TradeCheck', { draft: draft() }))} />
      <Disclaimer>Before placing, the mentor compares this trade with your documented strategy. {settings.hardRule ? 'Hard rules are on: conflicts need a written reason.' : 'You can always continue anyway.'}</Disclaimer>
    </>
  );

  const conflictBody = (
    <>
      {warnBox(conflict)}
      <T small muted>If you continue, this trade is logged as off-edge so it does not distort your strategy statistics.</T>
      {settings.hardRule ? <Field label="Why are you overriding your rule?" value={reason} onChangeText={setReason} multiline placeholder="At least 10 characters. This is saved with the trade." /> : null}
    </>
  );

  const resultBody = result ? (
    result.ok ? (
      <>
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.green, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={30} color={c.black} /></View>
          <T v="h1">Trade placed</T>
          <T small muted style={{ textAlign: 'center' }}>Your {buy ? 'buy' : 'sell'} on {f.asset} is open and saved to your journal.</T>
        </View>
        <Card pad={14} style={{ gap: 8 }}>
          <KV k="Trade" v={`${result.id} · ${buy ? 'Buy' : 'Sell'} ${f.asset}`} />
          <KV k="Size" v={`${f.size} ${unit}`} mono />
          <KV k="Entry" v={fmtPrice(f.asset, k.e)} mono />
          <KV k="Stop loss" v={fmtPrice(f.asset, k.s)} mono />
          <KV k="Take profit" v={fmtPrice(f.asset, k.t)} mono />
          <KV k="Risk" v={`${usd(k.risk$)} (${k.riskPct.toFixed(2)}%)`} mono />
        </Card>
      </>
    ) : (
      <>
        <View style={{ alignItems: 'center', gap: 8, paddingTop: 4 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.red, alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={30} color={c.black} /></View>
          <T v="h1">Trade not placed</T>
          <T small muted style={{ textAlign: 'center' }}>Nothing was sent. Fix the points below and try again.</T>
        </View>
        {warnBox(result.reasons)}
      </>
    )
  ) : null;

  const titles = { entry: 'Trade entry', strategy: 'Strategy and setup', reason: 'Reasoning', chart: 'Chart screenshot', conflict: '⚠ Edge conflict', result: result && result.ok ? 'Success' : 'Unsuccessful' };
  const title = idx >= 0 ? `${titles[stage]} · ${idx + 1} of ${steps.length}` : titles[stage];

  const navFooter = (primary) => (
    <Row style={{ justifyContent: 'space-between' }}>
      <Button variant="ghost" icon="chevron-left" label="Back" onPress={back} />
      {primary}
    </Row>
  );

  let footer = null;
  let body = null;
  if (stage === 'entry') {
    body = entryBody;
    footer = (
      <Row style={{ justifyContent: 'space-between' }}>
        <Button variant="ghost" label="Cancel" onPress={() => leave(() => navigation.goBack())} />
        <Button label="Continue" icon="arrow-right" disabled={errs.length > 0} onPress={next} />
      </Row>
    );
  } else if (stage === 'strategy') {
    body = strategyBody;
    footer = navFooter(<Button label="Continue" icon="arrow-right" onPress={next} />);
  } else if (stage === 'reason') {
    body = reasonBody;
    footer = navFooter(<Button label="Continue" icon="arrow-right" onPress={next} />);
  } else if (stage === 'chart') {
    body = chartBody;
    footer = navFooter(<Button label="Place trade" icon="check" onPress={submit} />);
  } else if (stage === 'conflict') {
    body = conflictBody;
    footer = settings.hardRule ? (
      <View style={{ gap: 8 }}>
        <Button label={left > 0 ? `Override available in ${left}s` : 'Override and place trade'} disabled={left > 0 || reason.trim().length < 10} onPress={() => place(reason.trim())} />
        <Row>
          <Button style={{ flex: 1 }} variant="secondary" label="Cancel trade" onPress={() => leave(() => navigation.goBack())} />
          <Button style={{ flex: 1 }} variant="secondary" label="Review strategy" onPress={() => leave(() => navigation.navigate('Main', { tab: 'strategy', ts: Date.now() }))} />
        </Row>
      </View>
    ) : (
      <View style={{ gap: 8 }}>
        <Button label="Continue anyway" onPress={() => place()} />
        <Row>
          <Button style={{ flex: 1 }} variant="secondary" label="Edit trade" onPress={() => setStage('chart')} />
          <Button style={{ flex: 1 }} variant="secondary" label="Review strategy" onPress={() => leave(() => navigation.navigate('Main', { tab: 'strategy', ts: Date.now() }))} />
        </Row>
        <Button variant="ghost" label="Cancel trade" onPress={() => leave(() => navigation.goBack())} />
      </View>
    );
  } else {
    body = resultBody;
    footer = result && result.ok ? (
      <Row style={{ justifyContent: 'flex-end' }}>
        <Button variant="secondary" label="View trade" onPress={() => leave(() => navigation.navigate('TradeDetail', { id: result.id }))} />
        <Button label="Open journal" icon="book-open" onPress={goJournal} />
      </Row>
    ) : (
      <Row style={{ justifyContent: 'space-between' }}>
        <Button variant="ghost" label="Cancel" onPress={() => leave(() => navigation.goBack())} />
        <Button label="Back to edit" icon="edit-2" onPress={() => setStage('entry')} />
      </Row>
    );
  }

  return (
    <Frame active="journal">
      <Screen>
        <PageTitle
          onBack={() => navigation.goBack()}
          kicker={`${f.asset} · ${buy ? 'Buy' : 'Sell'}`}
          title="New trade"
          right={<Button small variant="secondary" icon="check-square" label="Check trade" onPress={() => navigation.navigate('TradeCheck', { draft: draft() })} />}
        />
        <Card style={{ gap: 10 }}>
          <T v="h2">Trade ticket</T>
          <KV k="Market" v={`${buy ? 'Buy' : 'Sell'} ${f.asset}`} />
          <KV k="Size" v={`${f.size} ${unit}`} mono />
          <KV k="Entry" v={f.entry} mono />
          <KV k="Stop loss" v={f.stop} mono />
          <KV k="Take profit" v={f.target} mono />
          <KV k="Risk" v={errs.length ? '—' : `${usd(k.risk$)} (${k.riskPct.toFixed(2)}%)`} mono />
          <Row style={{ marginTop: 6 }}>
            <Button label="Resume ticket" icon="edit-2" onPress={() => setOpen(true)} />
            <Button variant="ghost" label="Discard" onPress={() => navigation.goBack()} />
          </Row>
        </Card>
      </Screen>

      <Sheet visible={open} onClose={onClose} title={title} footer={footer}>
        {body}
      </Sheet>
    </Frame>
  );
}