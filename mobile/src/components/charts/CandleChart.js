import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import Svg, { Line, Rect, Polyline, Polygon, G, ClipPath, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors as c, mono } from '../../theme/tokens';

const AX = 60; // right-hand price axis width
const BOTTOM = 30; // bottom time axis height
const DASH = { solid: undefined, dashed: '6 4', dotted: '2 3' };
const TF_MIN = { '1m': 1, '5m': 5, '15m': 15, '1H': 60, '4H': 240, '1D': 1440, '1W': 10080 };
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIN_VIS = 8; // most zoomed in: 8 candles on screen
const MAX_VIS = 300; // most zoomed out
const HOLD_MS = 250; // press and hold time before a stop loss / take profit / alert line can be dragged
const GRAB = 24; // how close (px) a touch must be to a line to grab it
const ASK_COLOR = '#F5B54A';
const pad2 = (n) => String(n).padStart(2, '0');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let gradCount = 0;

/**
 * Chart display settings. The screen stores the user's choices and passes them in as `prefs`.
 * up / down are hex colours; null means the theme's green and red.
 */
export const CHART_DEFAULTS = {
  ohlc: false, dataWindow: false, grid: true, pnl: true, sltp: true, separators: false,
  askLine: true, lastLine: true, countdown: true, free: true, positions: true,
  up: null, down: null,
};

/** Time left until the current candle closes. */
function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60); const x = s % 60;
  if (d > 0) return `${d}d ${pad2(h)}h`;
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(x)}`;
  return `${pad2(m)}:${pad2(x)}`;
}

/** Current price on the right axis with the candle-close countdown under it. Ticks every second on its own, so the chart does not redraw. */
function PriceTag({ top, color, price, tfMin, count }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!count) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [count]);
  const M = tfMin * 60000;
  const left = (Math.floor(now / M) + 1) * M - now;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: count ? top : top + 7, width: AX - 2, height: count ? 32 : 18, borderRadius: 4, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: c.black, fontFamily: mono, fontSize: 10, fontWeight: '800', lineHeight: 13 }} numberOfLines={1}>{price}</Text>
      {count ? <Text style={{ color: c.black, fontFamily: mono, fontSize: 10, lineHeight: 13, opacity: 0.85 }} numberOfLines={1}>{countdown(left)}</Text> : null}
    </View>
  );
}

/**
 * Price chart: candles, bars, line or area, with zones, horizontal levels and event markers.
 * Shows a time axis along the bottom and the current price with a candle countdown on the right.
 * Gestures (when the chart is interactive and the cursor tool is active):
 *   drag            pan left/right through time and up/down through price (up/down only when "free movement" is on)
 *   pinch           zoom the time axis (candles get wider or narrower)
 *   drag price axis stretch or squeeze the price scale
 *   drag time axis  zoom the time axis
 *   hold + drag     on a position's stop loss or take profit line, or on the alert line: move that line
 * Drawing tools handled here: 'rect' (drag a zone), 'hline' (tap to place a level), 'crosshair' (press and drag).
 *
 * position: { dir: 'Long'|'Short', entry, stop, target, slText, tpText } drawn at the newest candle.
 * onPosition({ stop }) or onPosition({ target }) is called while a line is being dragged.
 * alertLine: { price } a draggable alert level. onAlertLine({ price }) is called while it is being dragged.
 * prefs: display settings, see CHART_DEFAULTS.
 * ask: ask price for the optional ask line.
 * openPositions: [{ id, dir, entry, size }] open positions on this market, drawn as entry lines.
 */
export default function CandleChart({
  candles = [], height = 300, topInset = 0, decimals = 2, type = 'candles', tf = '1H',
  zones = [], lines = [], markers = [], tool = 'cursor', hideDrawings = false, magnet = true,
  onZone, onLine, onMarker, selectedMarker, position = null, onPosition,
  alertLine = null, onAlertLine,
  prefs = null, ask = null, openPositions = [],
}) {
  const [w, setW] = useState(0);
  const [cross, setCross] = useState(null); // { x, y }
  const [drag, setDrag] = useState(null); // { x0, y0, x1, y1 }
  const [active, setActive] = useState(null); // 'stop' | 'target' | 'alert' while a line is being dragged
  const [view, setView] = useState({ vis: null, off: 0, vp: 0, vz: 1 }); // zoom and pan
  const viewRef = useRef(view);
  const g = useRef(null);
  const gid = useMemo(() => `fill${++gradCount}`, []);
  const cid = `${gid}clip`;

  const n = candles.length;
  const P = { ...CHART_DEFAULTS, ...(prefs || {}) };
  const upC = P.up || c.green;
  const downC = P.down || c.red;
  // Only the main chart (the one with drawing callbacks) pans and zooms. Small charts inside scroll views stay still.
  const pannable = !!onZone;
  const tfMin = TF_MIN[tf] || 60;
  const Mms = tfMin * 60000;
  const base = useMemo(() => Math.floor(Date.now() / Mms) * Mms, [Mms]); // open time of the newest candle
  const padTop = topInset + 8;
  const padBottom = BOTTOM;
  const plotW = Math.max(0, w - AX);
  const ph = Math.max(10, height - padTop - padBottom);
  const axisY = padTop + ph;

  // New data: start from the full view again.
  const firstO = n ? candles[0].o : 0;
  useEffect(() => {
    if (!pannable) return;
    const v = { vis: null, off: 0, vp: 0, vz: 1 };
    viewRef.current = v;
    setView(v);
  }, [n, firstO, pannable]);

  useEffect(() => () => { if (g.current && g.current.timer) clearTimeout(g.current.timer); }, []);

  const visible = view.vis == null ? n : view.vis;
  const off = view.off;
  const right = n - off; // index just past the right edge
  const first = right - visible; // index at the left edge
  const step = visible ? plotW / visible : 0;
  const xAt = (k) => (k - first + 0.5) * step;

  const i0 = Math.max(0, Math.floor(first));
  const i1 = Math.min(n - 1, Math.ceil(right));

  const { lo, hi } = useMemo(() => {
    if (!n) return { lo: 0, hi: 1 };
    let mn = Infinity; let mx = -Infinity;
    const a0 = i0 <= i1 ? i0 : 0; const a1 = i0 <= i1 ? i1 : n - 1;
    for (let k = a0; k <= a1; k++) { mn = Math.min(mn, candles[k].l); mx = Math.max(mx, candles[k].h); }
    if (!hideDrawings) {
      lines.forEach((l) => { mn = Math.min(mn, l.price); mx = Math.max(mx, l.price); });
      zones.forEach((z) => { mn = Math.min(mn, z.low); mx = Math.max(mx, z.high); });
      if (position) {
        [position.entry, position.stop, position.target].forEach((p) => { mn = Math.min(mn, p); mx = Math.max(mx, p); });
      }
      if (alertLine) { mn = Math.min(mn, alertLine.price); mx = Math.max(mx, alertLine.price); }
    }
    const pad = (mx - mn) * 0.08 || 1;
    const l0 = mn - pad; const h0 = mx + pad;
    const range = h0 - l0;
    const mid = (l0 + h0) / 2 + view.vp * range;
    const half = (range / 2) * view.vz;
    return { lo: mid - half, hi: mid + half };
  }, [candles, lines, zones, hideDrawings, n, i0, i1, view.vp, view.vz, position && position.entry, position && position.stop, position && position.target, alertLine && alertLine.price]);

  const yAt = (p) => padTop + ((hi - p) / (hi - lo)) * ph;
  const priceAt = (y) => hi - ((y - padTop) / ph) * (hi - lo);
  const fmt = (p) => Number(p).toFixed(decimals);
  const rawIdx = (x) => Math.floor(first + x / (step || 1));
  const indexAt = (x) => clamp(rawIdx(x), 0, Math.max(0, n - 1));

  const snap = (x, p) => {
    if (!magnet || !n) return p;
    const k = candles[indexAt(x)];
    const opts = [k.o, k.h, k.l, k.c];
    return opts.reduce((best, v) => (Math.abs(v - p) < Math.abs(best - p) ? v : best), opts[0]);
  };

  const ticks = [0, 1, 2, 3, 4].map((q) => lo + ((hi - lo) * q) / 4);
  const last = n ? candles[n - 1] : null;
  const up = last ? last.c >= last.o : true;
  const bodyW = Math.max(1.5, step * 0.62);

  /* ---------- time axis ---------- */
  const timeLabel = (i) => {
    const t = new Date(base - (n - 1 - i) * Mms);
    if (tfMin >= 1440) return `${t.getDate()} ${MON[t.getMonth()]}`;
    const prev = new Date(base - (n - i) * Mms);
    if (t.getDate() !== prev.getDate()) return `${t.getDate()} ${MON[t.getMonth()]}`;
    return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
  };
  const fullTime = (i) => {
    const t = new Date(base - (n - 1 - i) * Mms);
    return `${t.getDate()} ${MON[t.getMonth()]} ${pad2(t.getHours())}:${pad2(t.getMinutes())}`;
  };
  const every = Math.max(1, Math.ceil(64 / (step || 1)));
  const timeTicks = [];
  if (n && step) {
    for (let i = Math.ceil(first / every) * every; i <= right; i += every) {
      const x = xAt(i);
      if (x >= 22 && x <= plotW - 22) timeTicks.push(i);
    }
  }

  /* ---------- pan and zoom ---------- */
  const setV = (next) => {
    const vis = clamp(next.vis, MIN_VIS, MAX_VIS);
    const nv = {
      vis,
      off: clamp(next.off, -vis * 0.5, n - vis * 0.5), // a little empty space is allowed on either side
      vp: clamp(next.vp, -2, 2),
      vz: clamp(next.vz, 0.2, 8),
    };
    viewRef.current = nv;
    setView(nv);
  };
  const cur = () => { const v = viewRef.current; return { ...v, vis: v.vis == null ? n : v.vis }; };

  // Zoom the time axis by `ratio`, keeping the candle under x = fx where it is.
  const zoomTime = (ratio, fx) => {
    const v = cur();
    const st = plotW / v.vis;
    const idxF = n - v.off - v.vis + fx / st;
    const vis2 = clamp(v.vis / ratio, MIN_VIS, MAX_VIS);
    const first2 = idxF - fx / (plotW / vis2);
    setV({ ...v, vis: vis2, off: n - (first2 + vis2) });
  };

  const onPanGrant = (e) => {
    const ne = e.nativeEvent;
    const t = ne.touches && ne.touches[0] ? ne.touches[0] : ne;

    // Touching a stop loss, take profit or alert line: arm it after a short hold.
    if (!hideDrawings && (onPosition || onAlertLine) && ne.locationX <= plotW && ne.locationY < axisY && (!ne.touches || ne.touches.length < 2)) {
      const cands = [];
      if (position && onPosition) {
        cands.push({ kind: 'stop', price: position.stop });
        cands.push({ kind: 'target', price: position.target });
      }
      if (alertLine && onAlertLine) cands.push({ kind: 'alert', price: alertLine.price });
      let best = null; let bestD = Infinity;
      cands.forEach((cd) => {
        const d = Math.abs(ne.locationY - yAt(cd.price));
        if (d < bestD) { bestD = d; best = cd; }
      });
      if (best && bestD <= GRAB) {
        const G0 = { mode: 'hold', which: best.kind, armed: false, px: t.pageX, py: t.pageY, d: null, p0: best.price, range: hi - lo, ph, timer: null };
        G0.timer = setTimeout(() => { if (g.current === G0) { G0.armed = true; setActive(best.kind); } }, HOLD_MS);
        g.current = G0;
        return;
      }
    }

    g.current = {
      mode: ne.locationX > plotW ? 'price' : ne.locationY > axisY ? 'time' : 'pan',
      px: t.pageX, py: t.pageY, d: null,
    };
  };
  const onPanMove = (e) => {
    const G = g.current; const t = e.nativeEvent.touches;
    if (!G || !t || !t.length || !plotW) return;

    if (G.mode === 'hold') {
      if (t.length >= 2) { clearTimeout(G.timer); G.mode = 'pan'; G.d = null; return; }
      if (!G.armed) {
        // Moved before the hold finished: this is a normal pan, not a line drag.
        if (Math.hypot(t[0].pageX - G.px, t[0].pageY - G.py) > 10) { clearTimeout(G.timer); G.mode = 'pan'; G.px = t[0].pageX; G.py = t[0].pageY; }
        return;
      }
      const raw = G.p0 - ((t[0].pageY - G.py) / G.ph) * G.range;
      if (G.which === 'alert') {
        const tickA = Math.pow(10, -decimals);
        onAlertLine && onAlertLine({ price: Number(Math.max(tickA, raw).toFixed(decimals)) });
        return;
      }
      const tick = Math.pow(10, -decimals);
      const long = position.dir === 'Long';
      let v = raw;
      if (G.which === 'stop') v = long ? Math.min(raw, position.entry - tick) : Math.max(raw, position.entry + tick);
      else v = long ? Math.max(raw, position.entry + tick) : Math.min(raw, position.entry - tick);
      onPosition && onPosition({ [G.which]: Number(v.toFixed(decimals)) });
      return;
    }

    if (t.length >= 2) {
      // Two fingers: pinch to zoom the time axis.
      const d = Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
      if (G.d && d > 0) zoomTime(d / G.d, clamp((t[0].locationX + t[1].locationX) / 2, 0, plotW));
      G.d = d;
      return;
    }
    if (G.d) { G.d = null; G.px = t[0].pageX; G.py = t[0].pageY; return; } // one finger lifted after a pinch
    const dx = t[0].pageX - G.px; const dy = t[0].pageY - G.py;
    G.px = t[0].pageX; G.py = t[0].pageY;
    const v = cur();
    if (G.mode === 'price') setV({ ...v, vz: v.vz * Math.exp(-dy / 200) });
    else if (G.mode === 'time') zoomTime(Math.exp(-dx / 200), plotW);
    // Free movement off: only left and right, and the price scale stays fitted to what is on screen.
    else setV({ ...v, off: v.off + dx / (plotW / v.vis), vp: P.free ? v.vp + (dy * v.vz) / ph : 0 });
  };
  const onPanEnd = () => {
    if (g.current && g.current.timer) clearTimeout(g.current.timer);
    g.current = null;
    setActive(null);
  };

  /* ---------- touch handling (only for drawing tools) ---------- */
  const interactive = tool === 'rect' || tool === 'hline' || tool === 'crosshair';
  const clampX = (x) => Math.max(0, Math.min(plotW, x));
  const clampY = (y) => Math.max(padTop, Math.min(axisY, y));
  const pos = (e) => ({ x: clampX(e.nativeEvent.locationX), y: clampY(e.nativeEvent.locationY) });

  const onGrant = (e) => {
    const { x, y } = pos(e);
    if (tool === 'rect') setDrag({ x0: x, y0: y, x1: x, y1: y });
    else if (tool === 'crosshair') setCross({ x, y });
    else if (tool === 'hline') setCross({ x, y });
  };
  const onMove = (e) => {
    const { x, y } = pos(e);
    if (tool === 'rect') setDrag((d) => (d ? { ...d, x1: x, y1: y } : d));
    else setCross({ x, y });
  };
  const onRelease = (e) => {
    const { x, y } = pos(e);
    if (tool === 'hline') {
      onLine && onLine(snap(x, priceAt(y)));
    } else if (tool === 'rect' && drag) {
      const d = { ...drag, x1: x, y1: y };
      if (Math.abs(d.y1 - d.y0) >= 6) {
        const p0 = snap(d.x0, priceAt(d.y0)); const p1 = snap(d.x1, priceAt(d.y1));
        onZone && onZone({ low: Math.min(p0, p1), high: Math.max(p0, p1) });
      }
    }
    setDrag(null);
    if (tool !== 'crosshair') setCross(null);
  };
  const onEnd = () => { setDrag(null); setCross(null); };

  const crossK = cross && n ? candles[indexAt(cross.x)] : null;
  const tagTop = last ? Math.max(padTop - 8, Math.min(axisY - 24, yAt(last.c) - 16)) : 0;
  const inPlotY = (y) => y >= padTop && y <= axisY;
  const seriesFrom = Math.max(0, i0 - 1);
  const seriesTo = Math.min(n - 1, i1 + 1);

  /* ---------- position (entry / stop loss / take profit) ---------- */
  const showPos = !!position && !hideDrawings && n > 0;
  const posY = showPos ? { e: yAt(position.entry), s: yAt(position.stop), t: yAt(position.target) } : null;
  const posX = showPos ? xAt(n - 1) : 0;
  const posAxis = showPos ? [
    ...(P.sltp ? [{ key: 'tp', y: posY.t, price: position.target, fill: c.green }] : []),
    { key: 'en', y: posY.e, price: position.entry, fill: c.white },
    ...(P.sltp ? [{ key: 'sl', y: posY.s, price: position.stop, fill: c.red }] : []),
  ] : [];

  /* ---------- alert line ---------- */
  const showAlert = !!alertLine && !hideDrawings && n > 0;
  const alertY = showAlert ? yAt(alertLine.price) : 0;
  const gripA = active === 'alert';

  /* ---------- extras: ask line, open positions, OHLC readout ---------- */
  const showAsk = P.askLine && ask != null && n > 0;
  const askY = showAsk ? yAt(ask) : 0;
  const myPos = P.positions && !hideDrawings ? openPositions : [];
  const readK = crossK || last;
  const readCol = readK && readK.c >= readK.o ? upC : downC;

  return (
    <View style={{ height, width: '100%' }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && n > 0 ? (
        <>
          <Svg width={w} height={height}>
            <Defs>
              <LinearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={upC} stopOpacity="0.28" />
                <Stop offset="1" stopColor={upC} stopOpacity="0" />
              </LinearGradient>
              <ClipPath id={cid}>
                <Rect x={0} y={0} width={plotW} height={axisY} />
              </ClipPath>
            </Defs>

            {/* grid and price axis */}
            {ticks.map((v, i) => (
              inPlotY(yAt(v)) ? (
                <React.Fragment key={i}>
                  {P.grid ? <Line x1={0} x2={plotW} y1={yAt(v)} y2={yAt(v)} stroke={c.border} strokeDasharray="2 5" /> : null}
                  <SvgText x={plotW + 6} y={yAt(v) + 4} fill={c.muted} fontSize={10} fontFamily={mono}>{fmt(v)}</SvgText>
                </React.Fragment>
              ) : null
            ))}

            {/* time axis */}
            <Line x1={0} x2={plotW} y1={axisY} y2={axisY} stroke={c.border} />
            {timeTicks.map((i) => (
              <React.Fragment key={`t${i}`}>
                {P.grid ? <Line x1={xAt(i)} x2={xAt(i)} y1={padTop} y2={axisY} stroke={c.border} strokeOpacity={0.45} strokeDasharray="2 6" /> : null}
                <Line x1={xAt(i)} x2={xAt(i)} y1={axisY} y2={axisY + 4} stroke={c.borderStrong} />
                <SvgText x={xAt(i)} y={axisY + 17} fill={c.muted} fontSize={10} fontFamily={mono} textAnchor="middle">{timeLabel(i)}</SvgText>
              </React.Fragment>
            ))}

            {/* everything inside the plot is clipped so it never spills onto the axes */}
            <G clipPath={`url(#${cid})`}>
              {/* period separators: a line where the day changes (or the month, on daily and weekly charts) */}
              {P.separators && n && step ? Array.from({ length: Math.max(0, i1 - i0 + 1) }, (_, j) => {
                const i = i0 + j;
                if (i <= 0) return null;
                const t = new Date(base - (n - 1 - i) * Mms);
                const p = new Date(base - (n - i) * Mms);
                const hit = tfMin >= 1440 ? t.getMonth() !== p.getMonth() : t.getDate() !== p.getDate();
                return hit ? <Line key={`sep${i}`} x1={xAt(i) - step / 2} x2={xAt(i) - step / 2} y1={padTop} y2={axisY} stroke={c.borderStrong} strokeWidth={1} strokeDasharray="4 4" /> : null;
              }) : null}

              {/* zones */}
              {!hideDrawings ? zones.map((z) => (
                <React.Fragment key={z.id}>
                  <Rect x={0} y={yAt(z.high)} width={plotW} height={Math.max(2, yAt(z.low) - yAt(z.high))} fill={c.lime} fillOpacity={0.14} stroke={c.lime} strokeOpacity={0.6} strokeWidth={1} />
                  <SvgText x={6} y={yAt(z.high) + 12} fill={c.text} fontSize={10} fontWeight="700">{z.label || 'ZONE'}</SvgText>
                </React.Fragment>
              )) : null}

              {/* series */}
              {type === 'line' || type === 'area' ? (
                <>
                  {type === 'area' ? (
                    <Polygon
                      points={`${xAt(0)},${axisY} ${candles.map((k, i) => `${xAt(i)},${yAt(k.c)}`).join(' ')} ${xAt(n - 1)},${axisY}`}
                      fill={`url(#${gid})`}
                    />
                  ) : null}
                  <Polyline points={candles.map((k, i) => `${xAt(i)},${yAt(k.c)}`).join(' ')} fill="none" stroke={upC} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                </>
              ) : candles.slice(seriesFrom, seriesTo + 1).map((k, j) => {
                const i = seriesFrom + j;
                const col = k.c >= k.o ? upC : downC;
                const x = xAt(i);
                if (type === 'bars') {
                  return (
                    <React.Fragment key={i}>
                      <Line x1={x} x2={x} y1={yAt(k.h)} y2={yAt(k.l)} stroke={col} strokeWidth={1.5} />
                      <Line x1={x - bodyW / 2} x2={x} y1={yAt(k.o)} y2={yAt(k.o)} stroke={col} strokeWidth={1.5} />
                      <Line x1={x} x2={x + bodyW / 2} y1={yAt(k.c)} y2={yAt(k.c)} stroke={col} strokeWidth={1.5} />
                    </React.Fragment>
                  );
                }
                const top = yAt(Math.max(k.o, k.c)); const bot = yAt(Math.min(k.o, k.c));
                return (
                  <React.Fragment key={i}>
                    <Line x1={x} x2={x} y1={yAt(k.h)} y2={yAt(k.l)} stroke={col} strokeWidth={1} />
                    <Rect x={x - bodyW / 2} y={top} width={bodyW} height={Math.max(1.5, bot - top)} fill={col} />
                  </React.Fragment>
                );
              })}

              {/* last price line (the price tag itself is drawn below, with the countdown) */}
              {last && P.lastLine ? (
                <Line x1={0} x2={plotW} y1={yAt(last.c)} y2={yAt(last.c)} stroke={up ? upC : downC} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
              ) : null}

              {/* ask price line */}
              {showAsk ? (
                <Line x1={0} x2={plotW} y1={askY} y2={askY} stroke={ASK_COLOR} strokeWidth={1} strokeDasharray="5 3" strokeOpacity={0.9} />
              ) : null}

              {/* open positions on this market */}
              {myPos.map((p) => {
                const y = yAt(p.entry);
                const col = p.dir === 'Long' ? upC : downC;
                return (
                  <React.Fragment key={`op${p.id}`}>
                    <Line x1={0} x2={plotW} y1={y} y2={y} stroke={col} strokeWidth={1.25} strokeDasharray="8 4" strokeOpacity={0.9} />
                    <SvgText x={60} y={y - 4} fill={col} fontSize={10} fontWeight="800">{`${p.dir === 'Long' ? 'BUY' : 'SELL'} ${p.size} @ ${fmt(p.entry)}`}</SvgText>
                  </React.Fragment>
                );
              })}

              {/* levels */}
              {!hideDrawings ? lines.map((l, i) => {
                const y = yAt(l.price);
                return (
                  <React.Fragment key={l.id || i}>
                    <Line x1={0} x2={plotW} y1={y} y2={y} stroke={c.text} strokeWidth={l.weight || 1} strokeDasharray={DASH[l.style]} />
                    <SvgText x={6} y={y - 4} fill={c.text} fontSize={10} fontWeight="700">{l.label || 'LEVEL'}</SvgText>
                  </React.Fragment>
                );
              }) : null}

              {/* position: reward zone, risk zone, entry / stop loss / take profit lines */}
              {showPos ? (() => {
                const x0 = Math.max(0, posX - step / 2);
                const w0 = Math.max(0, plotW - x0);
                const slInside = posY.s > posY.e ? posY.s - 5 : posY.s + 13;
                const tpInside = posY.t > posY.e ? posY.t - 5 : posY.t + 13;
                const gx = plotW - 66;
                const gripS = active === 'stop'; const gripT = active === 'target';
                return (
                  <>
                    <Rect x={x0} y={Math.min(posY.e, posY.t)} width={w0} height={Math.max(1, Math.abs(posY.t - posY.e))} fill={c.green} fillOpacity={gripT ? 0.24 : 0.13} />
                    <Rect x={x0} y={Math.min(posY.e, posY.s)} width={w0} height={Math.max(1, Math.abs(posY.s - posY.e))} fill={c.red} fillOpacity={gripS ? 0.26 : 0.14} />
                    <Line x1={x0} x2={plotW} y1={posY.e} y2={posY.e} stroke={c.white} strokeWidth={1.5} />
                    <Line x1={x0} x2={plotW} y1={posY.s} y2={posY.s} stroke={c.red} strokeWidth={gripS ? 3 : 1.75} strokeDasharray="6 4" />
                    <Line x1={x0} x2={plotW} y1={posY.t} y2={posY.t} stroke={c.green} strokeWidth={gripT ? 3 : 1.75} strokeDasharray="6 4" />
                    <SvgText x={x0 + 6} y={posY.e - 4} fill={c.text} fontSize={10} fontWeight="700">{`${position.dir === 'Long' ? 'BUY' : 'SELL'} ${fmt(position.entry)}`}</SvgText>
                    {P.sltp ? <SvgText x={x0 + 6} y={slInside} fill={c.red} fontSize={11} fontWeight="800">{position.slText || 'SL'}</SvgText> : null}
                    {P.sltp ? <SvgText x={x0 + 6} y={tpInside} fill={c.green} fontSize={11} fontWeight="800">{position.tpText || 'TP'}</SvgText> : null}
                    {/* grips */}
                    <Rect x={gx} y={posY.s - 10} width={60} height={20} rx={6} fill={c.red} fillOpacity={gripS ? 1 : 0.85} stroke={gripS ? c.white : 'none'} strokeWidth={1.5} />
                    <SvgText x={gx + 30} y={posY.s + 4} fill={c.black} fontSize={10} fontWeight="800" textAnchor="middle">≡ SL</SvgText>
                    <Rect x={gx} y={posY.t - 10} width={60} height={20} rx={6} fill={c.green} fillOpacity={gripT ? 1 : 0.85} stroke={gripT ? c.white : 'none'} strokeWidth={1.5} />
                    <SvgText x={gx + 30} y={posY.t + 4} fill={c.black} fontSize={10} fontWeight="800" textAnchor="middle">≡ TP</SvgText>
                  </>
                );
              })() : null}

              {/* alert line: press and hold, then drag */}
              {showAlert ? (
                <>
                  <Line x1={0} x2={plotW} y1={alertY} y2={alertY} stroke={c.blue} strokeWidth={gripA ? 3 : 1.75} strokeDasharray="6 4" />
                  <Rect x={plotW - 78} y={alertY - 10} width={72} height={20} rx={6} fill={c.blue} fillOpacity={gripA ? 1 : 0.9} stroke={gripA ? c.white : 'none'} strokeWidth={1.5} />
                  <SvgText x={plotW - 42} y={alertY + 4} fill="#FFFFFF" fontSize={10} fontWeight="800" textAnchor="middle">≡ ALERT</SvgText>
                </>
              ) : null}

              {/* zone being dragged */}
              {drag ? (
                <Rect x={0} y={Math.min(drag.y0, drag.y1)} width={plotW} height={Math.abs(drag.y1 - drag.y0)} fill={c.lime} fillOpacity={0.2} stroke={c.lime} strokeDasharray="4 3" />
              ) : null}
            </G>

            {/* entry time marker */}
            {showPos && posX >= 0 && posX <= plotW ? (
              <>
                <Line x1={posX} x2={posX} y1={padTop} y2={axisY} stroke={c.white} strokeOpacity={0.5} strokeDasharray="2 4" />
                <Rect x={clamp(posX - 46, 0, plotW - 92)} y={axisY + 3} width={92} height={18} rx={4} fill={c.white} />
                <SvgText x={clamp(posX - 46, 0, plotW - 92) + 46} y={axisY + 16} fill={c.black} fontSize={10} fontWeight="700" fontFamily={mono} textAnchor="middle">{fullTime(n - 1)}</SvgText>
              </>
            ) : null}

            {/* price labels for levels, kept on the right axis */}
            {!hideDrawings ? lines.map((l, i) => {
              const y = yAt(l.price);
              if (!inPlotY(y)) return null;
              return (
                <React.Fragment key={`lb${l.id || i}`}>
                  <Rect x={plotW + 1} y={y - 9} width={AX - 2} height={18} rx={4} fill={c.elevated2} stroke={c.borderStrong} />
                  <SvgText x={plotW + 6} y={y + 4} fill={c.text} fontSize={10} fontFamily={mono}>{fmt(l.price)}</SvgText>
                </React.Fragment>
              );
            }) : null}

            {/* ask price label on the axis */}
            {showAsk && inPlotY(askY) ? (
              <>
                <Rect x={plotW + 1} y={askY - 9} width={AX - 2} height={18} rx={4} fill={ASK_COLOR} />
                <SvgText x={plotW + 6} y={askY + 4} fill="#000000" fontSize={10} fontWeight="800" fontFamily={mono}>{fmt(ask)}</SvgText>
              </>
            ) : null}

            {/* position price labels on the axis */}
            {posAxis.map((p) => (inPlotY(p.y) ? (
              <React.Fragment key={p.key}>
                <Rect x={plotW + 1} y={p.y - 9} width={AX - 2} height={18} rx={4} fill={p.fill} />
                <SvgText x={plotW + 6} y={p.y + 4} fill={c.black} fontSize={10} fontWeight="800" fontFamily={mono}>{fmt(p.price)}</SvgText>
              </React.Fragment>
            ) : null))}

            {/* alert price label on the axis */}
            {showAlert && inPlotY(alertY) ? (
              <>
                <Rect x={plotW + 1} y={alertY - 9} width={AX - 2} height={18} rx={4} fill={c.blue} />
                <SvgText x={plotW + 6} y={alertY + 4} fill="#FFFFFF" fontSize={10} fontWeight="800" fontFamily={mono}>{fmt(alertLine.price)}</SvgText>
              </>
            ) : null}

            {/* crosshair */}
            {cross ? (
              <>
                <Line x1={0} x2={plotW} y1={cross.y} y2={cross.y} stroke={c.muted} strokeDasharray="3 3" />
                {tool === 'crosshair' ? <Line x1={cross.x} x2={cross.x} y1={padTop} y2={axisY} stroke={c.muted} strokeDasharray="3 3" /> : null}
                <Rect x={plotW + 1} y={cross.y - 9} width={AX - 2} height={18} rx={4} fill={c.white} />
                <SvgText x={plotW + 6} y={cross.y + 4} fill={c.black} fontSize={10} fontWeight="700" fontFamily={mono}>{fmt(priceAt(cross.y))}</SvgText>
                {tool === 'crosshair' ? (
                  <>
                    <Rect x={Math.max(0, Math.min(plotW - 56, cross.x - 28))} y={axisY + 3} width={56} height={18} rx={4} fill={c.white} />
                    <SvgText x={Math.max(0, Math.min(plotW - 56, cross.x - 28)) + 28} y={axisY + 16} fill={c.black} fontSize={10} fontWeight="700" fontFamily={mono} textAnchor="middle">{timeLabel(rawIdx(cross.x))}</SvgText>
                  </>
                ) : null}
              </>
            ) : null}
          </Svg>

          {/* pan and zoom layer: sits under the markers and is replaced by the drawing layer when a drawing tool is active */}
          {pannable && !interactive ? (
            <View
              style={{ position: 'absolute', left: 0, top: 0, width: w, height }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={onPanGrant}
              onResponderMove={onPanMove}
              onResponderRelease={onPanEnd}
              onResponderTerminate={onPanEnd}
            />
          ) : null}

          {/* current price and candle countdown */}
          {last ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: plotW + 1, top: 0, width: AX - 2, height }}>
              <PriceTag top={tagTop} color={up ? upC : downC} price={fmt(last.c)} tfMin={tfMin} count={P.countdown} />
            </View>
          ) : null}

          {/* OHLC readout at the top left of the chart: the last candle, or the candle under the crosshair */}
          {P.ohlc && pannable && readK ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: 56, top: topInset + 2, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {[['O', readK.o], ['H', readK.h], ['L', readK.l], ['C', readK.c]].map(([k, v]) => (
                <Text key={k} style={{ color: readCol, fontFamily: mono, fontSize: 11, fontWeight: '700' }}>{k} {fmt(v)}</Text>
              ))}
            </View>
          ) : null}

          {/* data window: a pop-up beside the crosshair with the values on that candle */}
          {P.dataWindow && pannable && cross && crossK ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: clamp(cross.x + 14, 56, Math.max(56, plotW - 150)), top: clamp(cross.y - 74, topInset + 4, Math.max(topInset + 4, height - 130)), width: 142, backgroundColor: c.elevated, borderRadius: 10, borderWidth: 1, borderColor: c.borderStrong, paddingHorizontal: 10, paddingVertical: 8, gap: 2 }}>
              <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>{fullTime(indexAt(cross.x))}</Text>
              {[['Open', crossK.o], ['High', crossK.h], ['Low', crossK.l], ['Close', crossK.c]].map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: c.muted, fontSize: 11 }}>{k}</Text>
                  <Text style={{ color: c.text, fontFamily: mono, fontSize: 11 }}>{fmt(v)}</Text>
                </View>
              ))}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: c.muted, fontSize: 11 }}>Change</Text>
                <Text style={{ color: crossK.c >= crossK.o ? upC : downC, fontFamily: mono, fontSize: 11, fontWeight: '700' }}>{crossK.o ? `${crossK.c >= crossK.o ? '+' : '−'}${Math.abs(((crossK.c - crossK.o) / crossK.o) * 100).toFixed(2)}%` : '—'}</Text>
              </View>
            </View>
          ) : null}

          {/* OHLC readout while using the crosshair (hidden when the OHLC or data window settings already show it) */}
          {tool === 'crosshair' && crossK && !P.ohlc && !P.dataWindow ? (
            <View pointerEvents="none" style={{ position: 'absolute', left: 8, bottom: BOTTOM + 8, flexDirection: 'row', gap: 10, backgroundColor: c.elevated, borderRadius: 8, borderWidth: 1, borderColor: c.border, paddingHorizontal: 8, paddingVertical: 4 }}>
              {[['O', crossK.o], ['H', crossK.h], ['L', crossK.l], ['C', crossK.c]].map(([k, v]) => (
                <Text key={k} style={{ color: c.text, fontFamily: mono, fontSize: 11 }}>{k} {fmt(v)}</Text>
              ))}
            </View>
          ) : null}

          {/* event markers */}
          {markers.map((m) => {
            const k = candles.findIndex((x) => x.i === m.i);
            const idx = k >= 0 ? k : m.i;
            if (idx < 0 || idx >= n) return null;
            const x = xAt(idx);
            if (x < 10 || x > plotW - 10) return null;
            const y = Math.max(padTop, yAt(candles[idx].h) - 20);
            if (y > axisY - 10) return null;
            const on = selectedMarker === m.id;
            return (
              <Pressable key={m.id} onPress={() => onMarker && onMarker(on ? null : m)} hitSlop={8} accessibilityLabel={m.title}
                style={{ position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20, borderRadius: 10, backgroundColor: on ? c.white : c.bg, borderWidth: 1.5, borderColor: c.text, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: on ? c.black : c.text, fontSize: 10, fontWeight: '800' }}>{m.letter}</Text>
              </Pressable>
            );
          })}

          {/* drawing layer: only captures touches when a drawing tool is active */}
          {interactive ? (
            <View
              style={{ position: 'absolute', left: 0, top: 0, width: plotW, height }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              onResponderGrant={onGrant}
              onResponderMove={onMove}
              onResponderRelease={onRelease}
              onResponderTerminate={onEnd}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
}