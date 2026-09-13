import { Fragment, useMemo } from "react";
import { View } from "react-native";
import Svg, { Line, Polyline, Rect, Text as SvgText } from "react-native-svg";

const CHART_HEIGHT = 260;
const PADDING = { top: 10, bottom: 10, left: 8, right: 46 };

/**
 * Renders a line or candlestick chart from an array of
 * { time, open, high, low, close } points. Purely presentational - all
 * data fetching lives in useAssetCandles.
 */
export default function AssetPriceChart({ candles = [], mode = "line", width = 300 }) {
  const { minPrice, maxPrice } = useMemo(() => {
    if (!candles.length) {
      return { minPrice: 0, maxPrice: 0 };
    }

    const highs = candles.map((c) => c.high ?? c.close);
    const lows = candles.map((c) => c.low ?? c.close);

    return { minPrice: Math.min(...lows), maxPrice: Math.max(...highs) };
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

  return (
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
  );
}