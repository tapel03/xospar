// Filter options and per-event details for the economic calendar.
// Simulated: replace with the fields from a real economic calendar feed.

export const IMPACTS = ['High', 'Medium', 'Low'];
export const EVENT_TYPES = ['Growth', 'Inflation', 'Employment', 'Central Bank', 'Bonds', 'Housing', 'Consumer Surveys', 'Business Surveys', 'Speeches', 'Misc'];
export const CURRENCIES = ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'JPY', 'NZD', 'USD'];
export const VIEWS = ['Today', 'Tomorrow', 'Today+Tomorrow', 'Yesterday', 'This Week'];

export const DEFAULT_FILTER = { impacts: [...IMPACTS], types: [...EVENT_TYPES], ccys: [...CURRENCIES], view: 'This Week' };

// offset = days from today (0 today, 1 tomorrow, -1 yesterday).
export const EVENT_META = {
  e0: { type: 'Growth', ccy: 'USD', offset: -1 },
  e1: { type: 'Inflation', ccy: 'USD', offset: 0 },
  e2: { type: 'Speeches', ccy: 'USD', offset: 0 },
  e3: { type: 'Central Bank', ccy: 'EUR', offset: 1 },
  e4: { type: 'Growth', ccy: 'GBP', offset: 2 },
  e5: { type: 'Misc', ccy: 'USD', offset: 2 },
  e6: { type: 'Misc', ccy: 'CAD', offset: 4 },
};

// An event from yesterday so the Yesterday view has something to show.
export const EXTRA_EVENTS = [
  { id: 'e0', time: '14:30', day: 'Yesterday', label: 'US Retail Sales (Sep)', impact: 'High', tag: 'USD', note: '+0.6% vs +0.3%' },
];

export const metaOf = (e) => EVENT_META[e.id] || { type: 'Misc', ccy: CURRENCIES.includes(e.tag) ? e.tag : 'USD', offset: 0 };

const inView = (offset, view) => {
  if (view === 'Today') return offset === 0;
  if (view === 'Tomorrow') return offset === 1;
  if (view === 'Today+Tomorrow') return offset === 0 || offset === 1;
  if (view === 'Yesterday') return offset === -1;
  return true; // This Week
};

const minutes = (t) => { const m = /^(\d{1,2}):(\d{2})$/.exec(t); return m ? Number(m[1]) * 60 + Number(m[2]) : -1; };

/** Filters the events and puts them in order: today first, then the days ahead, then yesterday. */
export function applyFilter(events, f) {
  const rank = (o) => (o < 0 ? 99 : o);
  return events
    .filter((e) => {
      const m = metaOf(e);
      return f.impacts.includes(e.impact) && f.types.includes(m.type) && f.ccys.includes(m.ccy) && inView(m.offset, f.view);
    })
    .sort((a, b) => rank(metaOf(a).offset) - rank(metaOf(b).offset) || minutes(a.time) - minutes(b.time));
}

/** How many filter groups differ from the defaults. */
export function countActive(f) {
  return (f.impacts.length !== IMPACTS.length ? 1 : 0)
    + (f.types.length !== EVENT_TYPES.length ? 1 : 0)
    + (f.ccys.length !== CURRENCIES.length ? 1 : 0)
    + (f.view !== DEFAULT_FILTER.view ? 1 : 0);
}