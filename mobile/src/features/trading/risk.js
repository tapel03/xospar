// Shared position maths. Simulated: dollars gained or lost per 1.0 of price movement, per 1 unit of size.
export const vpu = (a) => (a.cat === 'Forex' ? (a.sym.startsWith('USD/') ? 100000 / a.price : 100000) : a.sym === 'XAU/USD' ? 100 : a.sym === 'WTI' ? 1000 : 1);
export const sizeDec = (a) => (a.cat === 'Stocks' ? 0 : a.cat === 'Indices' ? 1 : a.cat === 'Crypto' ? 3 : 2);
export const sizeUnit = (a) => (a.cat === 'Stocks' ? 'shares' : a.cat === 'Indices' ? 'contracts' : a.cat === 'Crypto' ? 'units' : 'lots');

export const usd = (v) => `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * The amount risk percentages are calculated on. The user sets it in Settings (settings.riskBase) and it only
 * changes when they change it, so a 2% risk is the same dollar amount after wins and losses.
 * Falls back to `fallback` (current equity) until a base has been saved.
 */
export const riskBaseOf = (settings, fallback) => {
  const b = Number(settings && settings.riskBase);
  return b > 0 ? b : fallback;
};

/** Risk, reward and reward:risk for a position in dollars. `base` is the risk base, not live equity. */
export function positionMoney(a, p, base) {
  const size = parseFloat(String(p.size).replace(',', '.'));
  const v = vpu(a);
  const ok = isFinite(size) && size > 0;
  const risk = ok ? Math.abs(p.entry - p.stop) * size * v : 0;
  const reward = ok ? Math.abs(p.target - p.entry) * size * v : 0;
  return { size: ok ? size : 0, risk, reward, riskPct: base ? (risk / base) * 100 : 0, rr: risk > 0 ? reward / risk : 0 };
}