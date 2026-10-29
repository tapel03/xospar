// Realistic mock data. Replace with broker / market-data / news feeds in production.

function rng(seed) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const hash = (str) => [...str].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100000, 7);

export const assets = [
  { sym: 'EUR/USD', name: 'Euro / US Dollar', cat: 'Forex', price: 1.1664, chg: -0.21, vol: 'Medium', volume: '412K', status: 'Open', dec: 4 },
  { sym: 'GBP/USD', name: 'British Pound / US Dollar', cat: 'Forex', price: 1.3418, chg: -0.09, vol: 'Low', volume: '298K', status: 'Open', dec: 4 },
  { sym: 'USD/JPY', name: 'US Dollar / Japanese Yen', cat: 'Forex', price: 148.32, chg: 0.36, vol: 'Medium', volume: '355K', status: 'Open', dec: 2 },
  { sym: 'USD/CAD', name: 'US Dollar / Canadian Dollar', cat: 'Forex', price: 1.3712, chg: 0.18, vol: 'Low', volume: '141K', status: 'Open', dec: 4 },
  { sym: 'XAU/USD', name: 'Gold Spot', cat: 'Commodities', price: 2684.1, chg: 0.54, vol: 'High', volume: '188K', status: 'Open', dec: 2 },
  { sym: 'WTI', name: 'WTI Crude Oil', cat: 'Commodities', price: 74.82, chg: 1.92, vol: 'High', volume: '226K', status: 'Open', dec: 2 },
  { sym: 'US500', name: 'S&P 500', cat: 'Indices', price: 5842.6, chg: 0.42, vol: 'Low', volume: '1.9M', status: 'Pre-market', dec: 1 },
  { sym: 'NAS100', name: 'Nasdaq 100', cat: 'Indices', price: 20611.3, chg: 0.71, vol: 'Medium', volume: '1.1M', status: 'Pre-market', dec: 1 },
  { sym: 'GER40', name: 'DAX 40', cat: 'Indices', price: 19402.8, chg: -0.18, vol: 'Low', volume: '640K', status: 'Open', dec: 1 },
  { sym: 'AAPL', name: 'Apple Inc.', cat: 'Stocks', price: 228.14, chg: 0.86, vol: 'Medium', volume: '41M', status: 'Pre-market', dec: 2 },
  { sym: 'NVDA', name: 'NVIDIA Corp.', cat: 'Stocks', price: 124.36, chg: -1.42, vol: 'High', volume: '212M', status: 'Pre-market', dec: 2 },
  { sym: 'BTC/USD', name: 'Bitcoin', cat: 'Crypto', price: 63280, chg: -1.12, vol: 'High', volume: '$28B', status: '24/7', dec: 0 },
  { sym: 'ETH/USD', name: 'Ether', cat: 'Crypto', price: 2611.4, chg: -0.84, vol: 'High', volume: '$11B', status: '24/7', dec: 1 },
];
export const assetBy = (sym) => assets.find((a) => a.sym === sym) || assets[0];
export const fmtPrice = (sym, p) => {
  const d = assetBy(sym).dec;
  return Number(p).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
};

export function makeCandles(sym = 'EUR/USD', n = 84) {
  const a = assetBy(sym); const r = rng(hash(sym));
  const vol = a.price * 0.0009; const out = []; let o = a.price * 0.996;
  for (let i = 0; i < n; i++) {
    const drift = i < 28 ? vol * 0.08 : i < 56 ? -vol * 0.06 : vol * 0.1;
    const c = o + drift + (r() - 0.5) * vol;
    const h = Math.max(o, c) + r() * vol * 0.55;
    const l = Math.min(o, c) - r() * vol * 0.55;
    out.push({ i, o, h, l, c }); o = c;
  }
  const shift = a.price - out[out.length - 1].c;
  return out.map((k) => ({ ...k, o: k.o + shift, h: k.h + shift, l: k.l + shift, c: k.c + shift }));
}

export const account = {
  equity: 48612.4, balance: 48250.12, floating: 362.28,
  day: 362.28, week: -214.9, month: 1840.55, drawdown: -3.2, winRate: 54, profitFactor: 1.62,
};

export const health = {
  score: 72, change: -3, window: '25 trades in the last 30 days',
  parts: [
    { label: 'Strategy adherence', value: 68, basis: '17 of 25 trades met every required rule' },
    { label: 'Risk discipline', value: 86, basis: '24 of 25 trades risked 1% or less' },
    { label: 'Emotional discipline', value: 61, basis: '3 trades opened within 10 minutes of a loss' },
    { label: 'Trade quality', value: 70, basis: 'Average setup score 3.5 of 5' },
    { label: 'Consistency', value: 75, basis: 'Traded inside your session on 19 of 22 days' },
  ],
};

export const insights = [
  { id: 'i1', kind: 'warn', text: '3 of your last 5 trades did not meet your documented entry conditions.',
    evidence: ['T-0147: Fair Value Gap entry, not part of London Breakout', 'T-0143: Fair Value Gap entry outside NY Pullback rules', 'T-0145: no 1H confirmation candle (partial)'],
    invalidation: 'Two fully on-edge trades in a row clears this flag.', ask: 'What mistakes am I repeatedly making?' },
  { id: 'i2', kind: 'info', text: 'You perform better trading EUR/USD inside your London session.',
    evidence: ['London: 11 trades, 64% win rate, +0.92R average', 'Outside session: 6 trades, 33% win rate, −0.41R average'],
    invalidation: 'Sample is small (17 trades). Treat as a lead, not a rule.', ask: 'Review my last 10 EUR/USD trades.' },
  { id: 'i3', kind: 'warn', text: 'Your average loss increased 18% this week.',
    evidence: ['Average loss $241 this week vs $204 over the prior 4 weeks', 'Two stops were widened after entry (T-0147, T-0143)'],
    invalidation: 'Driven by 2 trades; one more week of data will confirm or reject it.', ask: 'Why am I losing during New York session?' },
  { id: 'i4', kind: 'info', text: 'High-impact economic events are approaching.',
    evidence: ['US CPI today at 14:30 affects EUR/USD, XAU/USD and US500 on your watchlist', 'ECB rate decision on Thursday at 14:15'],
    ask: 'Which events could affect my watchlist?' },
];

export const marketContext = [
  { sym: 'US500', label: 'S&P 500', price: '5,842.6', chg: 0.42 },
  { sym: 'NAS100', label: 'Nasdaq 100', price: '20,611.3', chg: 0.71 },
  { sym: 'GER40', label: 'DAX 40', price: '19,402.8', chg: -0.18 },
  { sym: 'EUR/USD', label: 'EUR/USD', price: '1.1664', chg: -0.21 },
  { sym: 'USD/JPY', label: 'USD/JPY', price: '148.32', chg: 0.36 },
  { sym: 'XAU/USD', label: 'Gold', price: '2,684.10', chg: 0.54 },
  { sym: 'WTI', label: 'WTI crude', price: '74.82', chg: 1.92 },
  { sym: 'BTC/USD', label: 'Bitcoin', price: '63,280', chg: -1.12 },
];
export const sentiment = { vix: '16.84', vixChg: -2.3, mood: 'Mild risk-on', dxy: '102.86', dxyChg: 0.24 };

export const upcomingEvents = [
  { id: 'e1', time: '14:30', day: 'Today', label: 'US CPI (Sep)', impact: 'High', tag: 'USD', note: 'in 2h 10m' },
  { id: 'e2', time: '20:00', day: 'Today', label: 'Fed Chair speech', impact: 'Medium', tag: 'USD' },
  { id: 'e3', time: '14:15', day: 'Thu', label: 'ECB rate decision', impact: 'High', tag: 'EUR' },
  { id: 'e4', time: '08:00', day: 'Fri', label: 'UK GDP (Q2 final)', impact: 'Medium', tag: 'GBP' },
  { id: 'e5', time: 'Pre-mkt', day: 'Fri', label: 'JPMorgan earnings', impact: 'Medium', tag: 'US500' },
  { id: 'e6', time: '12:00', day: 'Sun', label: 'OPEC+ ministerial meeting', impact: 'High', tag: 'Oil' },
];

export const trades = [
  { id: 'T-0148', date: '01 Oct 09:42', asset: 'EUR/USD', dir: 'Long', strategy: 'London Reversal', setup: 'Liquidity reclaim', session: 'London', tf: '15m', entry: 1.1652, exit: 1.1689, stop: 1.1637, target: 1.1697, size: '2.0 lots', risk: 1.0, r: 2.47, pnl: 362.28, edge: 'yes', review: 'reviewed', emotion: 'Calm', thesis: 'Asian low swept, 1.1650 reclaimed with displacement.', verdict: 'valid-win' },
  { id: 'T-0147', date: '30 Sep 15:10', asset: 'GBP/USD', dir: 'Short', strategy: 'London Breakout', setup: 'Fair Value Gap', session: 'New York', tf: '5m', entry: 1.3441, exit: 1.3456, stop: 1.3456, target: 1.3410, size: '1.6 lots', risk: 1.0, r: -1.0, pnl: -241.1, edge: 'no', review: 'flag', emotion: 'Frustrated', thesis: 'Thought the gap would fill after the London move.', verdict: 'bad' },
  { id: 'T-0146', date: '30 Sep 09:15', asset: 'EUR/USD', dir: 'Long', strategy: 'London Breakout', setup: 'Breakout + retest', session: 'London', tf: '15m', entry: 1.1671, exit: 1.1658, stop: 1.1658, target: 1.1710, size: '1.8 lots', risk: 1.0, r: -1.0, pnl: -240.0, edge: 'yes', review: 'reviewed', emotion: 'Calm', thesis: 'Range 1.1640–1.1668 broke and retested cleanly.', verdict: 'valid-loss' },
  { id: 'T-0145', date: '29 Sep 10:02', asset: 'XAU/USD', dir: 'Long', strategy: 'NY Pullback', setup: 'Trend pullback', session: 'London', tf: '1H', entry: 2661.4, exit: 2679.8, stop: 2652.0, target: 2685.0, size: '0.25 lots', risk: 1.0, r: 1.96, pnl: 470.4, edge: 'partial', review: 'reviewed', emotion: 'Confident', thesis: 'Pullback into 20 EMA in an established uptrend.', verdict: 'valid-win' },
  { id: 'T-0144', date: '26 Sep 08:31', asset: 'GBP/USD', dir: 'Long', strategy: 'London Breakout', setup: 'Breakout + retest', session: 'London', tf: '5m', entry: 1.3388, exit: 1.342, stop: 1.3375, target: 1.3427, size: '1.9 lots', risk: 1.0, r: 2.46, pnl: 512.3, edge: 'yes', review: 'reviewed', emotion: 'Calm', thesis: 'Asian range breakout with retest and close above.', verdict: 'valid-win' },
  { id: 'T-0143', date: '25 Sep 16:48', asset: 'US500', dir: 'Short', strategy: 'NY Pullback', setup: 'Fair Value Gap', session: 'New York', tf: '5m', entry: 5861.0, exit: 5868.5, stop: 5868.5, target: 5845.0, size: '3 contracts', risk: 1.0, r: -1.0, pnl: -238.5, edge: 'no', review: 'flag', emotion: 'Bored', thesis: 'Faded the afternoon push into a gap.', verdict: 'bad' },
  { id: 'T-0142', date: '25 Sep 09:05', asset: 'EUR/USD', dir: 'Long', strategy: 'London Reversal', setup: 'Liquidity reclaim', session: 'London', tf: '15m', entry: 1.1608, exit: 1.1646, stop: 1.1593, target: 1.165, size: '1.9 lots', risk: 1.0, r: 2.53, pnl: 455.1, edge: 'yes', review: 'reviewed', emotion: 'Calm', thesis: 'Sweep of the prior day low, reclaim into range.', verdict: 'valid-win' },
  { id: 'T-0141', date: '24 Sep 14:36', asset: 'USD/JPY', dir: 'Long', strategy: 'NY Pullback', setup: 'Trend pullback', session: 'New York', tf: '15m', entry: 147.62, exit: 147.31, stop: 147.31, target: 148.2, size: '1.2 lots', risk: 1.0, r: -1.0, pnl: -210.4, edge: 'partial', review: 'pending', emotion: 'Anxious', thesis: 'Buy the dip ahead of US yields move.', verdict: 'valid-loss' },
];

export const tradeContext = {
  'T-0146': [
    { time: '09:15', kind: 'Entry', text: 'Breakout + retest of the 1.1640–1.1668 range confirmed.' },
    { time: '13:30', kind: 'Economic', text: 'US retail sales beat expectations (+0.6% vs +0.3%). USD bid across the board.' },
    { time: '13:34', kind: 'Correlation', text: 'DXY +0.3% in 4 minutes; EUR/USD tracked it inversely (r = −0.94).' },
    { time: '13:41', kind: 'Exit', text: 'Stop hit at 1.1658. Volatility 2.1× the session average.' },
  ],
  default: [
    { time: 'Entry', kind: 'Entry', text: 'Trade opened as logged.' },
    { time: '+40m', kind: 'News', text: 'No high-impact news during the trade window.' },
    { time: '+1h', kind: 'Volatility', text: 'Volatility stayed within 1.2× session average.' },
  ],
};

export const strategies = [
  { id: 'lb', name: 'London Breakout', status: 'Active', markets: ['EUR/USD', 'GBP/USD'], timeframes: '5m / 15m', risk: '1%', session: 'London, 08:00–11:00',
    setups: ['Breakout + retest', 'Range breakout'], version: 'v3, edited 12 Sep',
    conditions: ['London session', 'Defined Asian range', 'Breakout with close outside range', 'Retest of range edge', 'Confirmation candle'],
    invalid: ['Major news within 30 min', 'Outside trading session', 'Spread above 1.2 pips', 'No confirmation candle'],
    stats: { trades: 18, winRate: 61, avgR: 0.74 } },
  { id: 'lr', name: 'London Reversal', status: 'Active', markets: ['EUR/USD'], timeframes: '15m', risk: '1%', session: 'London, 08:00–10:30',
    setups: ['Liquidity reclaim'], version: 'v2, edited 3 Sep',
    conditions: ['Sweep of Asian or prior-day low/high', 'Reclaim of level within 2 candles', 'Displacement candle', 'Target opposing liquidity'],
    invalid: ['Trend day (ADR already 70% used)', 'High-impact news within 60 min', 'Sweep wick under 5 pips'],
    stats: { trades: 9, winRate: 67, avgR: 1.21 } },
  { id: 'np', name: 'NY Pullback', status: 'Paused', markets: ['XAU/USD', 'USD/JPY', 'US500'], timeframes: '15m / 1H', risk: '0.75%', session: 'New York, 14:30–17:00',
    setups: ['Trend pullback'], version: 'v1, edited 20 Aug',
    conditions: ['1H trend aligned', 'Pullback into 20 EMA', '1H confirmation candle', 'Clear structure low/high for stop'],
    invalid: ['Counter-trend', 'Within 15 min of the US open', 'More than 2 trades already today'],
    stats: { trades: 11, winRate: 36, avgR: -0.18 } },
];
export const allSetups = ['Breakout + retest', 'Range breakout', 'Liquidity reclaim', 'Trend pullback', 'Fair Value Gap', 'Order block'];

export const alerts = [
  { id: 'a1', type: 'my', asset: 'EUR/USD', label: 'MY BUY ZONE', condition: 'Enters zone', target: '1.1650–1.1660', current: '1.1664', status: 'active', created: 'Today 07:12', expires: 'Fri 17:00', notify: 'Push + Sound', repeat: false, strategy: 'London Reversal', priority: 'High' },
  { id: 'a2', type: 'my', asset: 'GBP/USD', label: 'Range low', condition: 'Crosses below', target: '1.3400', current: '1.3418', status: 'active', created: 'Yesterday', expires: 'Good till cancelled', notify: 'Push', repeat: true, strategy: null, priority: 'Normal' },
  { id: 'a3', type: 'ai', asset: 'WTI', label: 'Unusual volatility', condition: '1H range 2.4× its 20-day average', target: '—', current: '74.82', status: 'triggered', triggeredAt: '74.61', created: '38m ago', expires: '—', notify: 'In-app', repeat: false },
  { id: 'a4', type: 'my', asset: 'XAU/USD', label: 'Weekly high', condition: 'Reaches level', target: '2,700.00', current: '2,684.10', status: 'paused', created: '28 Sep', expires: 'Fri 17:00', notify: 'Push + Email', repeat: false, strategy: null, priority: 'Normal' },
  { id: 'a5', type: 'my', asset: 'EUR/USD', label: 'Drawn level', condition: 'Returns to level', target: '1.1702', current: '1.1664', status: 'expired', created: '22 Sep', expires: 'Expired 26 Sep', notify: 'Push', repeat: false, strategy: null },
  { id: 'a6', type: 'my', asset: 'EUR/USD', label: 'Reclaim zone', condition: 'Enters zone', target: '1.1650–1.1660', current: '1.1664', status: 'triggered', triggeredAt: '1.1658', created: '30 Sep', expires: '—', notify: 'Push + Sound', repeat: false, strategy: 'London Reversal' },
  { id: 'a7', type: 'ai', asset: 'XAU/USD', label: 'Event approaching', condition: 'US CPI in 2h affects a tracked asset', target: '—', current: '2,684.10', status: 'active', created: 'Today 12:20', expires: '14:30', notify: 'In-app', repeat: false },
];

export const alertHistory = [
  { date: '30 Sep 08:47', asset: 'EUR/USD', type: 'My alert', condition: 'Entered 1.1650–1.1660', price: '1.1658', after: '+31 pips within 2h', trade: 'T-0148, +2.47R' },
  { date: '24 Sep 08:12', asset: 'EUR/USD', type: 'My alert', condition: 'Entered 1.1600–1.1610', price: '1.1606', after: '+40 pips within 3h', trade: 'T-0142, +2.53R' },
  { date: '19 Sep 15:02', asset: 'GBP/USD', type: 'My alert', condition: 'Crossed below 1.3350', price: '1.3349', after: '−12 pips, then range', trade: 'No trade' },
  { date: '17 Sep 09:30', asset: 'XAU/USD', type: 'AI alert', condition: 'Volume 3× average', price: '2,598.40', after: '+$14 in 1h', trade: 'No trade' },
];

export const news = [
  { id: 'n1', cat: 'Economy', headline: 'US inflation data due: core CPI expected at 0.3% m/m', source: 'Market Wire', time: '12m ago', tags: ['USD', 'Bonds', 'Gold', 'Indices'], relevance: 'High',
    summary: 'Markets expect core CPI to hold at 0.3% month on month. A hotter print would support the case for fewer rate cuts.',
    why: 'Rate expectations drive USD, yields and gold. Your EUR/USD and XAU/USD watchlist items react most.', affects: 'EUR/USD, XAU/USD, US500, US10Y' },
  { id: 'n2', cat: 'Geopolitics', headline: 'Regional conflict escalates; shipping insurers raise Gulf premiums', source: 'World Desk', time: '38m ago', tags: ['Oil', 'Gold', 'USD'], relevance: 'High',
    summary: 'Escalation near key shipping routes has pushed insurance premiums higher. Crude rose nearly 2% on supply concerns.',
    why: 'Supply risk tends to lift oil and safe havens. Higher oil can feed inflation expectations.', affects: 'WTI, XAU/USD, USD/CAD, GER40' },
  { id: 'n3', cat: 'Central Banks', headline: 'ECB officials signal patience ahead of Thursday decision', source: 'Euro Desk', time: '1h ago', tags: ['EUR', 'Bonds'], relevance: 'Medium',
    summary: 'Several policymakers said further easing depends on services inflation. Markets price a hold this week.',
    why: 'A surprise in tone moves EUR crosses during your London session.', affects: 'EUR/USD, GER40' },
  { id: 'n4', cat: 'Earnings', headline: 'Chipmakers slide as export rules tighten', source: 'Tech Markets', time: '2h ago', tags: ['NVDA', 'NAS100'], relevance: 'Medium',
    summary: 'Semiconductor shares fell pre-market after new export restrictions were reported. Index futures held up.',
    why: 'NVDA is on your watchlist with high volatility today.', affects: 'NVDA, NAS100' },
  { id: 'n5', cat: 'Crypto', headline: 'Bitcoin dips below 64,000 as ETF flows turn negative', source: 'Digital Assets', time: '3h ago', tags: ['BTC'], relevance: 'Low',
    summary: 'Two days of net outflows coincided with weaker risk appetite overnight.',
    why: 'Bitcoin is currently 0.46 correlated with US500 (30D).', affects: 'BTC/USD, ETH/USD' },
  { id: 'n6', cat: 'Forex', headline: 'Yen weakens as Japanese yields slip', source: 'FX Desk', time: '4h ago', tags: ['JPY'], relevance: 'Low',
    summary: 'USD/JPY rose for a third session as the yield gap widened again.',
    why: 'Affects USD/JPY, which you trade under NY Pullback (paused).', affects: 'USD/JPY' },
];

export const mapCategories = [
  { key: 'geo', label: 'Geopolitical', icon: 'globe' },
  { key: 'economic', label: 'Economic', icon: 'bar-chart-2' },
  { key: 'cb', label: 'Central banks', icon: 'percent' },
  { key: 'energy', label: 'Energy', icon: 'zap' },
  { key: 'supply', label: 'Supply chain', icon: 'anchor' },
  { key: 'commodities', label: 'Commodities', icon: 'droplet' },
  { key: 'industry', label: 'Industry', icon: 'cpu' },
  { key: 'corporate', label: 'Corporate', icon: 'trending-up' },
  { key: 'disaster', label: 'Natural disasters', icon: 'wind' },
];

export const mapEvents = [
  { id: 'm1', cat: 'geo', title: 'Regional conflict escalation', location: 'Eastern Mediterranean', lat: 32, lng: 35, time: '38m ago', window: '24h', severity: 'High', recent: true,
    chain: ['Israel', 'Regional conflict', 'Oil supply concerns', 'Oil prices', 'Inflation expectations', 'Currency and bond-market implications'],
    affected: ['Oil', 'Gold', 'USD', 'Regional currencies', 'Equity indices'], chartSym: 'WTI',
    updates: ['13:02 Shipping insurers raise premiums for Gulf routes', '12:41 Crude up 1.9% on the session', '12:20 Officials report strikes near border areas'],
    history: [{ event: 'Similar escalation, Apr 2024', oil: '+3.1% over 5d', gold: '+1.8%', usd: '+0.4%' }, { event: 'Similar escalation, Oct 2023', oil: '+4.2% over 5d', gold: '+2.6%', usd: '+0.2%' }] },
  { id: 'm2', cat: 'cb', title: 'ECB rate decision', location: 'Frankfurt', lat: 50.1, lng: 8.7, time: 'Thu 14:15', window: '7d', severity: 'High',
    chain: ['ECB decision', 'Rate expectations', 'Bund yields', 'EUR crosses'], affected: ['EUR/USD', 'GER40', 'Bunds'], chartSym: 'EUR/USD',
    updates: ['Officials signal patience on further easing'], history: [{ event: 'Hold with hawkish tone, Jul', oil: '—', gold: '−0.2%', usd: '−0.5% (EUR up)' }] },
  { id: 'm3', cat: 'economic', title: 'US CPI release', location: 'Washington, DC', lat: 38.9, lng: -77.0, time: 'Today 14:30', window: '24h', severity: 'High', recent: true,
    chain: ['CPI print', 'Fed path repricing', 'US yields', 'USD and gold'], affected: ['USD', 'Gold', 'US500', 'US10Y'], chartSym: 'XAU/USD',
    updates: ['Consensus core 0.3% m/m'], history: [{ event: 'Hot CPI, Apr', oil: '—', gold: '−1.1% same day', usd: '+0.8%' }] },
  { id: 'm4', cat: 'energy', title: 'OPEC+ ministerial meeting', location: 'Vienna', lat: 48.2, lng: 16.4, time: 'Sun 12:00', window: '7d', severity: 'Medium',
    chain: ['Output decision', 'Crude supply outlook', 'Oil prices', 'CAD and inflation expectations'], affected: ['Oil', 'USD/CAD'], chartSym: 'WTI', updates: ['Delegates discuss extending cuts'], history: [] },
  { id: 'm5', cat: 'supply', title: 'Canal draft restrictions extended', location: 'Panama Canal', lat: 9.1, lng: -79.7, time: '6h ago', window: '24h', severity: 'Medium',
    chain: ['Fewer transits', 'Shipping delays', 'Freight costs', 'Goods inflation'], affected: ['Freight', 'Agricultural commodities'], chartSym: 'US500', updates: ['Daily transits capped at 24'], history: [] },
  { id: 'm6', cat: 'disaster', title: 'Typhoon approaching Luzon', location: 'Philippines', lat: 16, lng: 121.5, time: '3h ago', window: '24h', severity: 'Medium', recent: true,
    chain: ['Port closures', 'Electronics supply delays', 'Regional equities'], affected: ['PHP', 'Regional equities'], chartSym: 'NAS100', updates: ['Ports in northern Luzon closed'], history: [] },
  { id: 'm7', cat: 'industry', title: 'Chip export rules tightened', location: 'Taiwan Strait region', lat: 24.5, lng: 121, time: '2h ago', window: '24h', severity: 'Medium',
    chain: ['Export restrictions', 'Chipmaker revenue outlook', 'Tech indices'], affected: ['NVDA', 'NAS100'], chartSym: 'NVDA', updates: ['Chipmakers slide pre-market'], history: [] },
  { id: 'm8', cat: 'commodities', title: 'Copper mine strike', location: 'Antofagasta, Chile', lat: -23.6, lng: -70.4, time: '1d ago', window: '7d', severity: 'Low',
    chain: ['Supply disruption', 'Copper prices', 'AUD and miners'], affected: ['Copper', 'AUD'], chartSym: 'US500', updates: ['Union rejects latest offer'], history: [] },
  { id: 'm9', cat: 'corporate', title: 'JPMorgan earnings', location: 'New York', lat: 40.7, lng: -74.0, time: 'Fri pre-market', window: '7d', severity: 'Low',
    chain: ['Bank earnings', 'Credit outlook', 'US indices'], affected: ['US500', 'Financials'], chartSym: 'US500', updates: [], history: [] },
  { id: 'm10', cat: 'economic', title: 'South Africa CPI', location: 'Pretoria', lat: -25.7, lng: 28.2, time: '2d ago', window: '7d', severity: 'Low',
    chain: ['Inflation print', 'SARB expectations', 'ZAR'], affected: ['USD/ZAR'], chartSym: 'EUR/USD', updates: ['Inflation eased to 4.4%'], history: [] },
];

export const corrSyms = ['EUR/USD', 'DXY', 'XAU/USD', 'WTI', 'USD/CAD', 'US500', 'VIX', 'US10Y', 'BTC/USD'];
const corrUpper = [
  [-0.94, 0.42, 0.18, -0.56, 0.22, -0.15, -0.48, 0.12],
  [-0.51, -0.22, 0.61, -0.19, 0.21, 0.54, -0.17],
  [0.27, -0.33, 0.08, 0.19, -0.44, 0.21],
  [-0.63, 0.24, -0.12, 0.31, 0.1],
  [-0.28, 0.25, 0.22, -0.14],
  [-0.82, -0.12, 0.46],
  [0.09, -0.38],
  [-0.05],
];
const corrFactor = { '1D': [0.7, 0.28], '7D': [0.85, 0.16], '30D': [1, 0], '90D': [0.96, 0.08], '1Y': [0.9, 0.1] };
export function correlationMatrix(period = '30D') {
  const n = corrSyms.length; const [f, noise] = corrFactor[period]; const r = rng(hash(period));
  const m = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const v = Math.max(-0.99, Math.min(0.99, corrUpper[i][j - i - 1] * f + (r() - 0.5) * noise));
    m[i][j] = m[j][i] = Math.round(v * 100) / 100;
  }
  return m;
}

export const analytics = {
  metrics: { winRate: 54, expectancy: '+0.31R', profitFactor: 1.62, avgR: 0.31, avgWin: '$448', avgLoss: '$232', maxDD: '−6.8%', riskConsistency: '96%', adherence: '68%' },
  equity: [45000, 45320, 45110, 45680, 45460, 46020, 46410, 46180, 46660, 46420, 46980, 47450, 47210, 46970, 47440, 47680, 47360, 47810, 48090, 47850, 48250],
  onEdge: { trades: 17, winRate: 65, avgR: 0.71, expectancy: '+0.71R', pnl: 4120 },
  offEdge: { trades: 8, winRate: 25, avgR: -0.54, expectancy: '−0.54R', pnl: -1720 },
  breakdowns: {
    Strategy: [{ label: 'London Reversal', trades: 9, winRate: 67, avgR: 1.21 }, { label: 'London Breakout', trades: 18, winRate: 61, avgR: 0.74 }, { label: 'NY Pullback', trades: 11, winRate: 36, avgR: -0.18 }],
    Session: [{ label: 'London', trades: 19, winRate: 63, avgR: 0.88 }, { label: 'New York', trades: 13, winRate: 38, avgR: -0.31 }, { label: 'Asia', trades: 3, winRate: 33, avgR: 0.12 }],
    Asset: [{ label: 'EUR/USD', trades: 14, winRate: 64, avgR: 0.92 }, { label: 'GBP/USD', trades: 9, winRate: 56, avgR: 0.44 }, { label: 'XAU/USD', trades: 6, winRate: 50, avgR: 0.21 }, { label: 'US500', trades: 4, winRate: 25, avgR: -0.62 }, { label: 'USD/JPY', trades: 2, winRate: 0, avgR: -1 }],
    Day: [{ label: 'Mon', trades: 7, winRate: 57, avgR: 0.41 }, { label: 'Tue', trades: 8, winRate: 63, avgR: 0.66 }, { label: 'Wed', trades: 6, winRate: 50, avgR: 0.18 }, { label: 'Thu', trades: 7, winRate: 43, avgR: -0.12 }, { label: 'Fri', trades: 7, winRate: 57, avgR: 0.35 }],
    Direction: [{ label: 'Long', trades: 22, winRate: 59, avgR: 0.52 }, { label: 'Short', trades: 13, winRate: 46, avgR: -0.04 }],
    'Risk %': [{ label: '≤ 0.75%', trades: 9, winRate: 56, avgR: 0.38 }, { label: '1%', trades: 25, winRate: 56, avgR: 0.34 }, { label: '> 1%', trades: 1, winRate: 0, avgR: -1 }],
  },
};

// September 2026: 1 Sep is a Tuesday.
export const calendarMonth = (() => {
  const r = rng(909); const days = [];
  for (let d = 1; d <= 30; d++) {
    const dow = (d + 1) % 7; // 0 Sun … 6 Sat, with 1 Sep = Tue (2)
    if (dow === 0 || dow === 6) { days.push({ d, dow, weekend: true }); continue; }
    const trades = Math.floor(r() * 3);
    const pnl = trades ? Math.round((r() - 0.38) * 900) : 0;
    days.push({ d, dow, trades, pnl, winRate: !trades ? null : trades === 1 ? (pnl > 0 ? 100 : 0) : pnl > 0 ? (r() < 0.5 ? 100 : 50) : (r() < 0.5 ? 0 : 50), adherence: trades ? 50 + Math.round(r() * 50) : null,
      event: [3, 10, 16, 17, 24].includes(d) ? ['US NFP', 'US CPI', 'FOMC', 'FOMC', 'SA CPI'][[3, 10, 16, 17, 24].indexOf(d)] : null });
  }
  return days;
})();

export const notifications = [
  { id: 'x1', sev: 'High', icon: 'clock', text: 'High-impact USD event in 30 minutes.', time: '14:00' },
  { id: 'x2', sev: 'Medium', icon: 'maximize-2', text: 'EUR/USD moved outside your normal trading range.', time: '12:44' },
  { id: 'x3', sev: 'High', icon: 'alert-triangle', text: 'Your planned trade conflicts with your strategy.', time: '11:20' },
  { id: 'x4', sev: 'High', icon: 'octagon', text: 'You have reached your daily risk limit.', time: 'Yesterday' },
  { id: 'x5', sev: 'Medium', icon: 'activity', text: 'Oil volatility has increased significantly.', time: 'Yesterday' },
  { id: 'x6', sev: 'Medium', icon: 'pie-chart', text: 'You are becoming overexposed to USD.', time: 'Mon' },
  { id: 'x7', sev: 'High', icon: 'x-octagon', text: 'Three consecutive trades have violated your edge.', time: 'Mon' },
];