// Correlation data for forex pairs, metals and indices.
// Simulated from currency exposure. Replace with a real correlation feed in production.

function rng(seed) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
const hash = (str) => [...str].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100000, 7);

export const corrSyms = [
  'AUDCAD', 'AUDCHF', 'AUDUSD', 'AUDJPY', 'AUDNZD', 'CADCHF', 'CADJPY', 'CHFJPY', 'NZDUSD', 'GBPJPY',
  'GBPUSD', 'GBPCAD', 'USDCHF', 'USDJPY', 'USDCAD', 'EURUSD', 'EURJPY', 'EURAUD', 'EURCAD', 'EURNZD',
  'EURGBP', 'GBPAUD', 'NZDJPY', 'GBPNZD', 'GBPCHF', 'NZDCAD', 'NZDCHF', 'SILVER', 'XAUUSD', 'JPYX', 'DXY',
];
export const corrPeriods = ['1D', '7D', '30D', '90D', '1Y'];

const DIMS = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF', 'RISK', 'METAL', 'XAU', 'AG'];
const RISK = { USD: -0.2, EUR: 0.1, GBP: 0.2, JPY: -0.5, AUD: 0.5, NZD: 0.5, CAD: 0.3, CHF: -0.3 };
const zero = () => Array(DIMS.length).fill(0);
const cur = (code) => { const v = zero(); v[DIMS.indexOf(code)] = 1; v[8] = RISK[code]; return v; };
const mix = (parts) => parts.reduce((acc, [k, v]) => acc.map((x, i) => x + k * v[i]), zero());

function vecOf(s) {
  if (s === 'DXY') return mix([[1, cur('USD')], [-0.58, cur('EUR')], [-0.14, cur('JPY')], [-0.12, cur('GBP')], [-0.09, cur('CAD')], [-0.04, cur('CHF')]]);
  if (s === 'JPYX') return mix([[1, cur('JPY')], [-0.4, cur('USD')], [-0.3, cur('EUR')], [-0.15, cur('GBP')], [-0.1, cur('AUD')], [-0.05, cur('CAD')]]);
  if (s === 'XAUUSD') { const v = zero(); v[9] = 1; v[10] = 0.3; return mix([[1, v], [-1, cur('USD')]]); }
  if (s === 'SILVER') { const v = zero(); v[9] = 1; v[11] = 0.5; return mix([[1, v], [-1, cur('USD')]]); }
  return mix([[1, cur(s.slice(0, 3))], [-1, cur(s.slice(3))]]);
}

const cosine = (a, b) => {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  const na = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
  const nb = Math.sqrt(b.reduce((s, x) => s + x * x, 0));
  return dot / (na * nb || 1);
};
const VEC = corrSyms.map(vecOf);
const BASE = VEC.map((a) => VEC.map((b) => cosine(a, b)));

const corrFactor = { '1D': [0.7, 0.28], '7D': [0.85, 0.16], '30D': [1, 0], '90D': [0.96, 0.08], '1Y': [0.9, 0.1] };

export function correlationMatrix(period = '30D') {
  const n = corrSyms.length; const [f, noise] = corrFactor[period]; const r = rng(hash(period));
  const m = Array.from({ length: n }, () => Array(n).fill(1));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const c = BASE[i][j];
      const shaped = Math.sign(c) * Math.pow(Math.abs(c), 0.65) * 0.97;
      const v = Math.max(-0.99, Math.min(0.99, shaped * f + (r() - 0.5) * noise));
      m[i][j] = m[j][i] = Math.round(v * 100) / 100;
    }
  }
  return m;
}