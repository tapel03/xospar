import { Fragment, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Line, Polyline, Rect, Text as SvgText } from "react-native-svg";

const CHART_HEIGHT = 260;
const PADDING = { top: 10, bottom: 10, left: 8, right: 46 };
const TIME_LABELS_HEIGHT = 20;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// "fine" -> just the clock time (used for intraday timeframes like
// 1m/5m/1h/4h). "coarse" -> date + time (used for 1D/1W/1M-style
// ranges), e.g. "14 Sep 00:00", matching how most trading platforms
// label longer ranges along the bottom axis.
function formatAxisTime(timestamp, granularity = "coarse") {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (granularity === "fine") {
    return `${hh}:${mm}`;
  }

  return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${hh}:${mm}`;
}

/**
 * Renders a line or candlestick chart from an array of
 * { time, open, high, low, close } points. Purely presentational - all
 * data fetching lives in useAssetCandles.
 */
export default function AssetPriceChart({
  candles = [],
  mode = "line",
  width = 300,
  pricePrefix = "",
  showRangeLabels = true,
  showTimeLabels = false,
  timeGranularity = "coarse",
}) {
  const { minPrice, maxPrice, minIndex, maxIndex } = useMemo(() => {
    if (!candles.length) {
      return { minPrice: 0, maxPrice: 0, minIndex: 0, maxIndex: 0 };
    }

    const highs = candles.map((c) => c.high ?? c.close);
    const lows = candles.map((c) => c.low ?? c.close);

    const low = Math.min(...lows);
    const high = Math.max(...highs);

    return {
      minPrice: low,
      maxPrice: high,
      minIndex: lows.indexOf(low),
      maxIndex: highs.indexOf(high),
    };
  }, [candles]);

  if (!candles.length || width <= 0) {
    return null;
  }

  const innerWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const priceRange = maxPrice - minPrice || 1;

  const xFor = (index) =>
    PADDING.left + (index / Math.max(candles.length - 1, 1)) * innerWidth;

  const yFor = (price) =>
    PADDING.top + innerHeight - ((price - minPrice) / priceRange) * innerHeight;

  const linePoints = candles
    .map((point, index) => `${xFor(index)},${yFor(point.close)}`)
    .join(" ");

  const gridFractions = [0, 0.25, 0.5, 0.75, 1];
  const decimals = maxPrice < 10 ? 4 : 2;

  const highLabelX = xFor(maxIndex);
  const highLabelY = yFor(maxPrice);
  const lowLabelX = xFor(minIndex);
  const lowLabelY = yFor(minPrice);

  // Flip the label to the opposite side of its marker whenever it would
  // otherwise run off the left/right edge of the chart.
  const highLabelAlignRight = highLabelX > width / 2;
  const lowLabelAlignRight = lowLabelX > width / 2;

  // Up to 5 evenly spaced time labels along the bottom edge, formatted
  // according to `timeGranularity` (see formatAxisTime above) - mirrors
  // the "right side = price, bottom side = time" layout of standard
  // trading-platform charts.
  const xLabelCount = showTimeLabels ? Math.min(5, candles.length) : 0;
  const xLabelIndexes = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / Math.max(xLabelCount - 1, 1)) * (candles.length - 1))
  );

  const totalHeight = CHART_HEIGHT + (showTimeLabels ? TIME_LABELS_HEIGHT : 0);

  return (
    <View style={{ width, height: totalHeight }}>
    <Svg width={width} height={CHART_HEIGHT}>
      {gridFractions.map((fraction) => {
        const y = PADDING.top + fraction * innerHeight;
        const price = maxPrice - fraction * priceRange;

        return (
          <Fragment key={fraction}>
            <Line
              x1={PADDING.left}
              x2={width - PADDING.right}
              y1={y}
              y2={y}
              stroke="#1C252C"
              strokeWidth={1}
            />
            <SvgText x={width - PADDING.right + 6} y={y + 4} fontSize={10} fill="#8B949E">
              {price.toFixed(decimals)}
            </SvgText>
          </Fragment>
        );
      })}

      {mode === "line" ? (
        <Polyline
          points={linePoints}
          fill="none"
          stroke="#3A7BD5"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : (
        candles.map((point, index) => {
          const x = xFor(index);
          const isUp = point.close >= point.open;
          const color = isUp ? "#4ADE80" : "#FF5A5F";
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
    </Svg>

      {showRangeLabels && (
        <>
          <Text
            style={[
              styles.rangeLabel,
              styles.highLabel,
              {
                top: Math.max(highLabelY - 22, 0),
                [highLabelAlignRight ? "right" : "left"]:
                  highLabelAlignRight
                    ? width - highLabelX + 8
                    : highLabelX + 8,
              },
            ]}
          >
            {pricePrefix}
            {maxPrice.toFixed(decimals)}
          </Text>

          <Text
            style={[
              styles.rangeLabel,
              styles.lowLabel,
              {
                top: Math.min(lowLabelY + 8, CHART_HEIGHT - 18),
                [lowLabelAlignRight ? "right" : "left"]:
                  lowLabelAlignRight ? width - lowLabelX + 8 : lowLabelX + 8,
              },
            ]}
          >
            {pricePrefix}
            {minPrice.toFixed(decimals)}
          </Text>
        </>
      )}

      {showTimeLabels && xLabelIndexes.length > 0 && (
        <View style={styles.xLabelsRow}>
          {xLabelIndexes.map((index, i) => (
            <Text key={`${index}-${i}`} style={styles.xLabel}>
              {formatAxisTime(candles[index]?.time, timeGranularity)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  rangeLabel: {
    position: "absolute",
    fontSize: 11,
    fontWeight: "700",
    color: "#D5D9DF",
  },

  highLabel: {},

  lowLabel: {},

  xLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 4,
  },

  xLabel: {
    color: "#8B949E",
    fontSize: 10,
    fontWeight: "500",
  },
});
