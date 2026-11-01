// Economic calendar. Source: the free Forex Factory weekly JSON export (no key). One upstream call
// per cache window; the last good week is served if the feed fails.
import { TtlCache } from '../../../libs/cache/index.js';
import { fetchJson } from '../../../libs/http/index.js';

const TYPES = [
  ['Central Bank', /rate decision|monetary policy|fomc|ecb|boe|boj|rba|rbnz|snb|boc|minutes|cash rate|bank rate|policy rate/i],
  ['Speeches', /speaks|speech|testif|press conference/i],
  ['Inflation', /cpi|ppi|inflation|pce|price index|hicp/i],
  ['Employment', /employment|payroll|jobless|unemployment|claimant|jolts|adp|labor|labour|wage|earnings index/i],
  ['Growth', /gdp|industrial production|retail sales|manufacturing production|trade balance|current account/i],
  ['Housing', /housing|home sales|building permits|house price|mortgage|construction/i],
  ['Business Surveys', /pmi|ism|ifo|zew|business confidence|tankan|empire state|philly fed|richmond/i],
  ['Consumer Surveys', /consumer confidence|consumer sentiment|gfk|michigan/i],
  ['Bonds', /bond auction|bill auction|treasury|gilt|bund|note auction/i],
];
export const eventType = (title) => (TYPES.find(([, re]) => re.test(title)) || ['Misc'])[0];

const AFFECTS = {
  USD: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'US500'], EUR: ['EUR/USD', 'GER40', 'EUR/GBP'], GBP: ['GBP/USD', 'EUR/GBP', 'UK100'],
  JPY: ['USD/JPY', 'EUR/JPY', 'JPN225'], CAD: ['USD/CAD', 'WTI'], AUD: ['AUD/USD'], NZD: ['NZD/USD'], CHF: ['USD/CHF', 'EUR/CHF'],
  CNY: ['USD/CNH', 'AUD/USD'], ZAR: ['USD/ZAR'],
};

/** One Forex Factory row -> the app's event shape. Day/time labels are made on the device, in its own time zone. */
export function shapeEvent(row, i) {
  const ts = Date.parse(row.date);
  if (!Number.isFinite(ts)) return null;
  const impact = ['High', 'Medium', 'Low'].includes(row.impact) ? row.impact : row.impact === 'Holiday' ? 'Holiday' : 'Low';
  const parts = [row.actual && `actual ${row.actual}`, row.forecast && `forecast ${row.forecast}`, row.previous && `previous ${row.previous}`].filter(Boolean);
  const ccy = String(row.country || '').toUpperCase();
  return {
    id: `ff-${ts}-${i}`, ts, label: row.title, impact, tag: ccy, ccy, type: eventType(row.title || ''),
    forecast: row.forecast || null, previous: row.previous || null, actual: row.actual || null,
    note: parts.join(' · ') || null, affects: AFFECTS[ccy] || [ccy],
    about: `${row.title} (${ccy}). ${impact === 'High' ? 'High-impact release: spreads can widen and price can gap around the time.' : 'Scheduled release.'}`,
  };
}

export function createCalendarSource(config, logger) {
  const cache = new TtlCache({ maxEntries: 4 });
  let lastGood = [];
  return {
    async events() {
      try {
        const events = await cache.wrap('week', config.calendar.cacheSeconds, async () => {
          const rows = await fetchJson(config.calendar.url, { provider: 'calendar', timeoutMs: 10000, headers: { 'user-agent': 'Edgeline/1.0' } });
          if (!Array.isArray(rows)) throw new Error('calendar feed returned no list');
          return rows.map(shapeEvent).filter(Boolean).filter((e) => e.impact !== 'Holiday').sort((a, b) => a.ts - b.ts);
        });
        lastGood = events;
        return { events, stale: false };
      } catch (err) {
        logger?.warn(`calendar: ${err.message}`);
        if (lastGood.length) return { events: lastGood, stale: true };
        throw err;
      }
    },
  };
}

export function calendarRoutes(app, { calendarSource }) {
  app.get('/v1/calendar', async (req, reply) => {
    try {
      const { events, stale } = await calendarSource.events();
      const impacts = req.query.impact ? String(req.query.impact).split(',') : null;
      const ccys = req.query.ccy ? String(req.query.ccy).toUpperCase().split(',') : null;
      const items = events.filter((e) => (!impacts || impacts.includes(e.impact)) && (!ccys || ccys.includes(e.ccy)));
      return { stale, items };
    } catch (err) {
      return reply.code(502).send({ error: 'calendar_unavailable', message: err.message });
    }
  });
}
