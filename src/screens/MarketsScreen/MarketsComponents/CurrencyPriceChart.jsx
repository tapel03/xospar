import { Fragment, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Line,
  Polyline,
  Polygon,
  Rect,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

const CHART_HEIGHT = 230;
const PADDING = { top: 26, bottom: 6, left: 50, right: 10 };

const LINE_COLOR_UP = "#12B886";
const LINE_COLOR_DOWN = "#FF5A5F";
const GRID_TEXT_COLOR = "#9AA1A9";
const CANDLE_UP_COLOR = "#12B886";
const CANDLE_DOWN_COLOR = "#FF5A5F";

/**
 * Light/white-themed presentational chart used by the redesigned asset
 * detail modal. Takes the same candle shape as AssetPriceChart.jsx
 * ({ time, open, high, low, close }[]) but with a different visual
 * language to match the currency pair reference design: y-axis labels on
 * the left, a dashed "current price" line with a glowing dot at the
 * latest close, a soft gradient fill under the line in line mode, and
 * time labels along the bottom. AssetPriceChart.jsx itself is left
 * untouched since AlertFormModal's dark-themed chart preview still uses it.
 */
export default function CurrencyPriceChart({
  candles = [],
  mode = "line",
  width = 300,
  height = CHART_HEIGHT,
}) {
  const { minPrice, maxPrice } = useMemo(() => {
    if (!candles.length) return { minPrice: 0, maxPrice: 0 };

    const highs = candles.map((c) => c.high ?? c.close);
    const lows = candles.map((c) => c.low ?? c.close);

    return { minPrice: Math.min(...lows), maxPrice: Math.max(...highs) };
  }, [candles]);

  if (!candles.length || width <= 0) {
    return null;
  }

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const innerHeight = height - PADDING.top - PADDING.bottom;

  // Pad the visible price range slightly so the line/candles don't touch
  // the very top/bottom edge of the chart.
  const rawRange = maxPrice - minPrice || Math.max(maxPrice * 0.001, 0.0001);
  const pad = rawRange * 0.12;
  const topValue = maxPrice + pad;
  const bottomValue = minPrice - pad;
  const priceRange = topValue - bottomValue || 1;

  const xFor = (index) =>
    PADDING.left + (index / Math.max(candles.length - 1, 1)) * innerWidth;

  const yFor = (price) =>
    PADDING.top + innerHeight - ((price - bottomValue) / priceRange) * innerHeight;

  const firstPoint = candles[0];
  const lastPoint = candles[candles.length - 1];
  const lastX = xFor(candles.length - 1);
  const lastY = yFor(lastPoint.close);

  const linePoints = candles
    .map((point, index) => `${xFor(index)},${yFor(point.close)}`)
    .join(" ");

  const baselineY = PADDING.top + innerHeight;
  const areaPoints = `${linePoints} ${lastX},${baselineY} ${xFor(0)},${baselineY}`;

  const isUpOverall = lastPoint.close >= firstPoint.close;
  const lineColor = isUpOverall ? LINE_COLOR_UP : LINE_COLOR_DOWN;

  const decimals = maxPrice < 10 ? 4 : 2;

  // 4 evenly spaced y-axis price labels across the visible range.
  const yLabelFractions = [0, 0.33, 0.66, 1];

  // Up to 7 evenly spaced x-axis time labels, echoing the reference
  // design's bottom time row.
  const xLabelCount = Math.min(7, candles.length);
  const xLabelIndexes = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / Math.max(xLabelCount - 1, 1)) * (candles.length - 1))
  );

  const formatXLabel = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <View style={{ width, height: height + 22 }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="currencyChartAreaFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity={0.22} />
            <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {yLabelFractions.map((fraction) => {
          const price = topValue - fraction * priceRange;
          const y = PADDING.top + fraction * innerHeight;

          return (
            <SvgText
              key={fraction}
              x={PADDING.left - 8}
              y={y + 4}
              fontSize={11}
              fill={GRID_TEXT_COLOR}
              textAnchor="end"
            >
              {price.toFixed(decimals)}
            </SvgText>
          );
        })}

        {/* Dashed marker line at the latest close, echoing the reference
            design's "current price" callout line. */}
        <Line
          x1={PADDING.left}
          x2={width - PADDING.right}
          y1={lastY}
          y2={lastY}
          stroke="#C9CDD2"
          strokeWidth={1}
          strokeDasharray="4,5"
        />

        {mode === "line" ? (
          <>
            <Polygon points={areaPoints} fill="url(#currencyChartAreaFill)" stroke="none" />
            <Polyline
              points={linePoints}
              fill="none"
              stroke={lineColor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ) : (
          candles.map((point, index) => {
            const x = xFor(index);
            const isUp = point.close >= point.open;
            const color = isUp ? CANDLE_UP_COLOR : CANDLE_DOWN_COLOR;
            const bodyTop = yFor(Math.max(point.open, point.close));
            const bodyBottom = yFor(Math.min(point.open, point.close));
            const candleWidth = Math.max((innerWidth / candles.length) * 0.6, 2);

            return (
              <Fragment key={point.time ?? index}>
                <Line
                  x1={x}
                  x2={x}
                  y1={yFor(point.high)}
                  y2={yFor(point.low)}
                  stroke={color}
                  strokeWidth={1}
                />
                <Rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={Math.max(bodyBottom - bodyTop, 1)}
                  fill={color}
                />
              </Fragment>
            );
          })
        )}

        {/* Soft glow + solid dot marking the latest price point. */}
        <Circle cx={lastX} cy={lastY} r={10} fill={lineColor} fillOpacity={0.18} />
        <Circle cx={lastX} cy={lastY} r={4} fill={lineColor} stroke="#FFFFFF" strokeWidth={1.5} />
      </Svg>

      <View style={styles.xLabelsRow}>
        {xLabelIndexes.map((index) => (
          <Text key={index} style={styles.xLabel}>
            {formatXLabel(candles[index].time)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  xLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginTop: 6,
  },

  xLabel: {
    color: "#9AA1A9",
    fontSize: 10,
    fontWeight: "500",
  },
});