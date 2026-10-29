// Asset catalogue. The app symbol ("EUR/USD") is the primary key everywhere; `quote` and
// `candles` say which provider serves it and in what format.
// Forex, metals, crypto and indices are the focus. Stocks are kept as they were.

// ---------- Forex ----------
const CCY = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen', AUD: 'Australian Dollar',
  CAD: 'Canadian Dollar', CHF: 'Swiss Franc', NZD: 'New Zealand Dollar', ZAR: 'South African Rand',
  MXN: 'Mexican Peso', TRY: 'Turkish Lira', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
  DKK: 'Danish Krone', PLN: 'Polish Zloty', CZK: 'Czech Koruna', HUF: 'Hungarian Forint',
  SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', CNH: 'Chinese Yuan (offshore)',
  INR: 'Indian Rupee', BRL: 'Brazilian Real', THB: 'Thai Baht', ILS: 'Israeli Shekel',
};

// All 28 pairs of the eight major currencies.
const MAJORS = [
  'AUD/CAD', 'AUD/CHF', 'AUD/JPY', 'AUD/NZD', 'AUD/USD', 'CAD/CHF', 'CAD/JPY', 'CHF/JPY',
  'EUR/AUD', 'EUR/CAD', 'EUR/CHF', 'EUR/GBP', 'EUR/JPY', 'EUR/NZD', 'EUR/USD',
  'GBP/AUD', 'GBP/CAD', 'GBP/CHF', 'GBP/JPY', 'GBP/NZD', 'GBP/USD',
  'NZD/CAD', 'NZD/CHF', 'NZD/JPY', 'NZD/USD', 'USD/CAD', 'USD/CHF', 'USD/JPY',
];
const EXOTICS = [
  'USD/ZAR', 'USD/MXN', 'USD/TRY', 'USD/SEK', 'USD/NOK', 'USD/DKK', 'USD/PLN', 'USD/CZK',
  'USD/HUF', 'USD/SGD', 'USD/HKD', 'USD/CNH', 'USD/INR', 'USD/BRL', 'USD/THB', 'USD/ILS',
];
const CROSSES = [
  'EUR/SEK', 'EUR/NOK', 'EUR/DKK', 'EUR/PLN', 'EUR/CZK', 'EUR/HUF', 'EUR/TRY', 'EUR/ZAR',
  'GBP/ZAR', 'ZAR/JPY', 'NOK/SEK', 'SGD/JPY',
];

const DEC_BY_QUOTE = { JPY: 2, HUF: 2, INR: 2, THB: 2, CZK: 3 };
const FOREX = [...MAJORS, ...EXOTICS, ...CROSSES].sort().map((sym) => {
  const [b, q] = sym.split('/');
  return { sym, name: `${CCY[b]} / ${CCY[q]}`, dec: DEC_BY_QUOTE[q] ?? 4 };
});

// ---------- Metals and energy (category stays 'Commodities' so the app's folders still work) ----------
// [app symbol, name, Twelve Data symbol, decimals]
const COMMODITIES = [
  ['XAU/USD', 'Gold Spot', 'XAU/USD', 2],
  ['XAG/USD', 'Silver Spot', 'XAG/USD', 3],
  ['XPT/USD', 'Platinum Spot', 'XPT/USD', 2],
  ['XPD/USD', 'Palladium Spot', 'XPD/USD', 2],
  ['XCU/USD', 'Copper', 'XCU/USD', 4],
  ['WTI', 'WTI Crude Oil', 'WTI/USD', 2],
];

// ---------- Indices ----------
// [app symbol, name, Twelve Data symbol, decimals]. Index coverage depends on your Twelve Data
// plan (many need a paid tier). Check each symbol against Twelve Data's /indices list; a symbol
// the plan can't serve simply reports as unavailable and the rest keep working.
const INDICES = [
  ['US500', 'S&P 500', 'SPX', 1],
  ['NAS100', 'Nasdaq 100', 'NDX', 1],
  ['US30', 'Dow Jones 30', 'DJI', 1],
  ['US2000', 'Russell 2000', 'RUT', 1],
  ['GER40', 'DAX 40', 'DAX', 1],
  ['UK100', 'FTSE 100', 'FTSE', 1],
  ['FRA40', 'CAC 40', 'CAC', 1],
  ['JPN225', 'Nikkei 225', 'N225', 1],
  ['HK50', 'Hang Seng', 'HSI', 1],
];

// ---------- Stocks (unchanged) ----------
const STOCKS = [
  ['AAPL', 'Apple Inc.'], ['NVDA', 'NVIDIA Corp.'], ['TSLA', 'Tesla Inc.'], ['MSFT', 'Microsoft Corp.'], ['GOOGL', 'Alphabet Inc.'],
];

// ---------- Crypto ----------
// [app symbol, name, Binance pair, decimals]
const CRYPTO = [
  ['BTC/USD', 'Bitcoin', 'BTCUSDT', 0], ['ETH/USD', 'Ether', 'ETHUSDT', 1], ['BNB/USD', 'BNB', 'BNBUSDT', 1],
  ['SOL/USD', 'Solana', 'SOLUSDT', 2], ['XRP/USD', 'XRP', 'XRPUSDT', 4], ['ADA/USD', 'Cardano', 'ADAUSDT', 4],
  ['DOGE/USD', 'Dogecoin', 'DOGEUSDT', 5], ['AVAX/USD', 'Avalanche', 'AVAXUSDT', 2], ['DOT/USD', 'Polkadot', 'DOTUSDT', 3],
  ['LINK/USD', 'Chainlink', 'LINKUSDT', 3], ['LTC/USD', 'Litecoin', 'LTCUSDT', 2], ['TRX/USD', 'TRON', 'TRXUSDT', 4],
  ['POL/USD', 'Polygon', 'POLUSDT', 4], ['UNI/USD', 'Uniswap', 'UNIUSDT', 3], ['ATOM/USD', 'Cosmos', 'ATOMUSDT', 3],
  ['TON/USD', 'Toncoin', 'TONUSDT', 3], ['SHIB/USD', 'Shiba Inu', 'SHIBUSDT', 8], ['NEAR/USD', 'NEAR Protocol', 'NEARUSDT', 3],
  ['BCH/USD', 'Bitcoin Cash', 'BCHUSDT', 1], ['XLM/USD', 'Stellar', 'XLMUSDT', 4],
];

const td = (symbol) => ({ provider: 'twelvedata', symbol });

export const ASSETS = [
  ...FOREX.map(({ sym, name, dec }) => ({ sym, name, cat: 'Forex', dec, quote: td(sym), candles: [td(sym)] })),
  { sym: 'DXY', name: 'US Dollar Index', cat: 'Forex', dec: 2, quote: td('DXY'), candles: [td('DXY')] },
  ...COMMODITIES.map(([sym, name, tdSym, dec]) => ({ sym, name, cat: 'Commodities', dec, quote: td(tdSym), candles: [td(tdSym)] })),
  ...INDICES.map(([sym, name, tdSym, dec]) => ({ sym, name, cat: 'Indices', dec, quote: td(tdSym), candles: [td(tdSym)] })),
  ...STOCKS.map(([sym, name]) => ({
    sym, name, cat: 'Stocks', dec: 2,
    quote: { provider: 'finnhub', symbol: sym },
    // Finnhub's /stock/candle is paid-only on the free tier, so stock candles use Twelve Data.
    candles: [td(sym)],
  })),
  ...CRYPTO.map(([sym, name, pair, dec]) => ({
    sym, name, cat: 'Crypto', dec,
    quote: { provider: 'binance', symbol: pair },
    // Finnhub crypto candles first (BINANCE:BTCUSDT), Twelve Data as fallback.
    candles: [{ provider: 'finnhub', symbol: `BINANCE:${pair}` }, td(sym)],
  })),
];

const bySym = new Map(ASSETS.map((a) => [a.sym, a]));
export const getAsset = (sym) => bySym.get(sym) || null;
export const assetsByProvider = (provider) => ASSETS.filter((a) => a.quote?.provider === provider);