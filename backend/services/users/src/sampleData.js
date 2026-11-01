// Sample journal for new accounts (SEED_SAMPLE_DATA=true). Generated from mobile/src/mocks/mock.js.
// ageMin = minutes before the seeding reference time, so the sample stays recent whenever a user is created.
export const SAMPLE = {
 "trades": [
  {
   "id": "T-0148",
   "asset": "EUR/USD",
   "dir": "Long",
   "strategy": "London Reversal",
   "setup": "Liquidity reclaim",
   "session": "London",
   "tf": "15m",
   "entry": 1.1652,
   "exit": 1.1689,
   "stop": 1.1637,
   "target": 1.1697,
   "size": "2.0 lots",
   "risk": 1,
   "r": 2.47,
   "pnl": 362.28,
   "edge": "yes",
   "review": "reviewed",
   "emotion": "Calm",
   "thesis": "Asian low swept, 1.1650 reclaimed with displacement.",
   "verdict": "valid-win",
   "status": "closed",
   "ageMin": 0
  },
  {
   "id": "T-0147",
   "asset": "GBP/USD",
   "dir": "Short",
   "strategy": "London Breakout",
   "setup": "Fair Value Gap",
   "session": "New York",
   "tf": "5m",
   "entry": 1.3441,
   "exit": 1.3456,
   "stop": 1.3456,
   "target": 1.341,
   "size": "1.6 lots",
   "risk": 1,
   "r": -1,
   "pnl": -241.1,
   "edge": "no",
   "review": "flag",
   "emotion": "Frustrated",
   "thesis": "Thought the gap would fill after the London move.",
   "verdict": "bad",
   "status": "closed",
   "ageMin": 1112
  },
  {
   "id": "T-0146",
   "asset": "EUR/USD",
   "dir": "Long",
   "strategy": "London Breakout",
   "setup": "Breakout + retest",
   "session": "London",
   "tf": "15m",
   "entry": 1.1671,
   "exit": 1.1658,
   "stop": 1.1658,
   "target": 1.171,
   "size": "1.8 lots",
   "risk": 1,
   "r": -1,
   "pnl": -240,
   "edge": "yes",
   "review": "reviewed",
   "emotion": "Calm",
   "thesis": "Range 1.1640–1.1668 broke and retested cleanly.",
   "verdict": "valid-loss",
   "status": "closed",
   "ageMin": 1467
  },
  {
   "id": "T-0145",
   "asset": "XAU/USD",
   "dir": "Long",
   "strategy": "NY Pullback",
   "setup": "Trend pullback",
   "session": "London",
   "tf": "1H",
   "entry": 2661.4,
   "exit": 2679.8,
   "stop": 2652,
   "target": 2685,
   "size": "0.25 lots",
   "risk": 1,
   "r": 1.96,
   "pnl": 470.4,
   "edge": "partial",
   "review": "reviewed",
   "emotion": "Confident",
   "thesis": "Pullback into 20 EMA in an established uptrend.",
   "verdict": "valid-win",
   "status": "closed",
   "ageMin": 2860
  },
  {
   "id": "T-0144",
   "asset": "GBP/USD",
   "dir": "Long",
   "strategy": "London Breakout",
   "setup": "Breakout + retest",
   "session": "London",
   "tf": "5m",
   "entry": 1.3388,
   "exit": 1.342,
   "stop": 1.3375,
   "target": 1.3427,
   "size": "1.9 lots",
   "risk": 1,
   "r": 2.46,
   "pnl": 512.3,
   "edge": "yes",
   "review": "reviewed",
   "emotion": "Calm",
   "thesis": "Asian range breakout with retest and close above.",
   "verdict": "valid-win",
   "status": "closed",
   "ageMin": 7271
  },
  {
   "id": "T-0143",
   "asset": "US500",
   "dir": "Short",
   "strategy": "NY Pullback",
   "setup": "Fair Value Gap",
   "session": "New York",
   "tf": "5m",
   "entry": 5861,
   "exit": 5868.5,
   "stop": 5868.5,
   "target": 5845,
   "size": "3 contracts",
   "risk": 1,
   "r": -1,
   "pnl": -238.5,
   "edge": "no",
   "review": "flag",
   "emotion": "Bored",
   "thesis": "Faded the afternoon push into a gap.",
   "verdict": "bad",
   "status": "closed",
   "ageMin": 8214
  },
  {
   "id": "T-0142",
   "asset": "EUR/USD",
   "dir": "Long",
   "strategy": "London Reversal",
   "setup": "Liquidity reclaim",
   "session": "London",
   "tf": "15m",
   "entry": 1.1608,
   "exit": 1.1646,
   "stop": 1.1593,
   "target": 1.165,
   "size": "1.9 lots",
   "risk": 1,
   "r": 2.53,
   "pnl": 455.1,
   "edge": "yes",
   "review": "reviewed",
   "emotion": "Calm",
   "thesis": "Sweep of the prior day low, reclaim into range.",
   "verdict": "valid-win",
   "status": "closed",
   "ageMin": 8677
  },
  {
   "id": "T-0141",
   "asset": "USD/JPY",
   "dir": "Long",
   "strategy": "NY Pullback",
   "setup": "Trend pullback",
   "session": "New York",
   "tf": "15m",
   "entry": 147.62,
   "exit": 147.31,
   "stop": 147.31,
   "target": 148.2,
   "size": "1.2 lots",
   "risk": 1,
   "r": -1,
   "pnl": -210.4,
   "edge": "partial",
   "review": "pending",
   "emotion": "Anxious",
   "thesis": "Buy the dip ahead of US yields move.",
   "verdict": "valid-loss",
   "status": "closed",
   "ageMin": 9786
  }
 ],
 "strategies": [
  {
   "id": "lb",
   "name": "London Breakout",
   "status": "Active",
   "markets": [
    "EUR/USD",
    "GBP/USD"
   ],
   "timeframes": "5m / 15m",
   "risk": "1%",
   "session": "London, 08:00–11:00",
   "setups": [
    "Breakout + retest",
    "Range breakout"
   ],
   "version": "v3, edited 12 Sep",
   "conditions": [
    "London session",
    "Defined Asian range",
    "Breakout with close outside range",
    "Retest of range edge",
    "Confirmation candle"
   ],
   "invalid": [
    "Major news within 30 min",
    "Outside trading session",
    "Spread above 1.2 pips",
    "No confirmation candle"
   ],
   "stats": {
    "trades": 18,
    "winRate": 61,
    "avgR": 0.74
   }
  },
  {
   "id": "lr",
   "name": "London Reversal",
   "status": "Active",
   "markets": [
    "EUR/USD"
   ],
   "timeframes": "15m",
   "risk": "1%",
   "session": "London, 08:00–10:30",
   "setups": [
    "Liquidity reclaim"
   ],
   "version": "v2, edited 3 Sep",
   "conditions": [
    "Sweep of Asian or prior-day low/high",
    "Reclaim of level within 2 candles",
    "Displacement candle",
    "Target opposing liquidity"
   ],
   "invalid": [
    "Trend day (ADR already 70% used)",
    "High-impact news within 60 min",
    "Sweep wick under 5 pips"
   ],
   "stats": {
    "trades": 9,
    "winRate": 67,
    "avgR": 1.21
   }
  },
  {
   "id": "np",
   "name": "NY Pullback",
   "status": "Paused",
   "markets": [
    "XAU/USD",
    "USD/JPY",
    "US500"
   ],
   "timeframes": "15m / 1H",
   "risk": "0.75%",
   "session": "New York, 14:30–17:00",
   "setups": [
    "Trend pullback"
   ],
   "version": "v1, edited 20 Aug",
   "conditions": [
    "1H trend aligned",
    "Pullback into 20 EMA",
    "1H confirmation candle",
    "Clear structure low/high for stop"
   ],
   "invalid": [
    "Counter-trend",
    "Within 15 min of the US open",
    "More than 2 trades already today"
   ],
   "stats": {
    "trades": 11,
    "winRate": 36,
    "avgR": -0.18
   }
  }
 ],
 "alerts": [
  {
   "id": "a1",
   "type": "my",
   "asset": "EUR/USD",
   "label": "MY BUY ZONE",
   "condition": "Enters zone",
   "target": "1.1650–1.1660",
   "status": "active",
   "expires": "Fri 17:00",
   "notify": "Push + Sound",
   "repeat": false,
   "strategy": "London Reversal",
   "priority": "High"
  },
  {
   "id": "a2",
   "type": "my",
   "asset": "GBP/USD",
   "label": "Range low",
   "condition": "Crosses below",
   "target": "1.3400",
   "status": "active",
   "expires": "Good till cancelled",
   "notify": "Push",
   "repeat": true,
   "strategy": null,
   "priority": "Normal"
  },
  {
   "id": "a4",
   "type": "my",
   "asset": "XAU/USD",
   "label": "Weekly high",
   "condition": "Reaches level",
   "target": "2,700.00",
   "status": "paused",
   "expires": "Fri 17:00",
   "notify": "Push + Email",
   "repeat": false,
   "strategy": null,
   "priority": "Normal"
  },
  {
   "id": "a5",
   "type": "my",
   "asset": "EUR/USD",
   "label": "Drawn level",
   "condition": "Returns to level",
   "target": "1.1702",
   "status": "expired",
   "expires": "Expired 26 Sep",
   "notify": "Push",
   "repeat": false,
   "strategy": null
  },
  {
   "id": "a6",
   "type": "my",
   "asset": "EUR/USD",
   "label": "Reclaim zone",
   "condition": "Enters zone",
   "target": "1.1650–1.1660",
   "status": "triggered",
   "triggeredAt": "1.1658",
   "expires": "—",
   "notify": "Push + Sound",
   "repeat": false,
   "strategy": "London Reversal"
  }
 ],
 "alertHistory": [
  {
   "date": "30 Sep 08:47",
   "asset": "EUR/USD",
   "type": "My alert",
   "condition": "Entered 1.1650–1.1660",
   "price": "1.1658",
   "after": "+31 pips within 2h",
   "trade": "T-0148, +2.47R"
  },
  {
   "date": "24 Sep 08:12",
   "asset": "EUR/USD",
   "type": "My alert",
   "condition": "Entered 1.1600–1.1610",
   "price": "1.1606",
   "after": "+40 pips within 3h",
   "trade": "T-0142, +2.53R"
  },
  {
   "date": "19 Sep 15:02",
   "asset": "GBP/USD",
   "type": "My alert",
   "condition": "Crossed below 1.3350",
   "price": "1.3349",
   "after": "−12 pips, then range",
   "trade": "No trade"
  },
  {
   "date": "17 Sep 09:30",
   "asset": "XAU/USD",
   "type": "AI alert",
   "condition": "Volume 3× average",
   "price": "2,598.40",
   "after": "+$14 in 1h",
   "trade": "No trade"
  }
 ],
 "tradeContext": {
  "T-0146": [
   {
    "time": "09:15",
    "kind": "Entry",
    "text": "Breakout + retest of the 1.1640–1.1668 range confirmed."
   },
   {
    "time": "13:30",
    "kind": "Economic",
    "text": "US retail sales beat expectations (+0.6% vs +0.3%). USD bid across the board."
   },
   {
    "time": "13:34",
    "kind": "Correlation",
    "text": "DXY +0.3% in 4 minutes; EUR/USD tracked it inversely (r = −0.94)."
   },
   {
    "time": "13:41",
    "kind": "Exit",
    "text": "Stop hit at 1.1658. Volatility 2.1× the session average."
   }
  ],
  "default": [
   {
    "time": "Entry",
    "kind": "Entry",
    "text": "Trade opened as logged."
   },
   {
    "time": "+40m",
    "kind": "News",
    "text": "No high-impact news during the trade window."
   },
   {
    "time": "+1h",
    "kind": "Volatility",
    "text": "Volatility stayed within 1.2× session average."
   }
  ]
 }
};
