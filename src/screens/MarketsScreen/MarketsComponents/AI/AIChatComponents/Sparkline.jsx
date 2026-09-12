import Svg, { Polyline } from "react-native-svg";

export default function Sparkline({
  data = [4, 6, 5, 8, 7, 10, 9, 13, 12, 16],
  width = 90,
  height = 34,
  color = "#4ADE80",
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}