import { View, Text, StyleSheet } from "react-native";

const POINTS = [
  { x: 0, y: 42 },
  { x: 8, y: 48 },
  { x: 16, y: 35 },
  { x: 24, y: 50 },
  { x: 32, y: 61 },
  { x: 40, y: 72 },
  { x: 48, y: 82 },
  { x: 56, y: 74 },
  { x: 64, y: 59 },
  { x: 72, y: 42 },
  { x: 80, y: 24 },
  { x: 88, y: 18 },
  { x: 96, y: 27 },
  { x: 100, y: 20 },
];

function ChartLine() {
  return (
    <View style={styles.chartLineArea}>

      {POINTS.slice(0, -1).map((point, index) => {
        const next = POINTS[index + 1];

        const dx = next.x - point.x;
        const dy = next.y - point.y;

        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={index}
            style={[
              styles.line,
              {
                left: `${point.x}%`,
                top: `${point.y}%`,
                width: `${length}%`,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}

      <View style={styles.tooltip}>
        <Text style={styles.tooltipTitle}>1. Long</Text>

        <View style={styles.tooltipRow}>
          <View style={styles.dotLong} />
          <Text style={styles.tooltipLabel}>Long</Text>
          <Text style={styles.tooltipValue}>43.42%</Text>
        </View>

        <View style={styles.tooltipRow}>
          <View style={styles.dotRatio} />
          <Text style={styles.tooltipLabel}>Long/Short</Text>
          <Text style={styles.tooltipValue}>1.1652</Text>
        </View>
      </View>

    </View>
  );
}

export default function LongShortRatio() {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Long/Short Ratio
        </Text>

        <View style={styles.period}>
          <Text style={styles.periodText}>1D</Text>
          <Text style={styles.arrow}>⌄</Text>
        </View>
      </View>

      <View style={styles.chart}>

        <View style={styles.horizontalLine} />
        <View style={[styles.horizontalLine, { top: "50%" }]} />
        <View style={[styles.horizontalLine, { top: "75%" }]} />

        <View style={[styles.verticalLine, { left: "25%" }]} />
        <View style={[styles.verticalLine, { left: "50%" }]} />
        <View style={[styles.verticalLine, { left: "75%" }]} />

        <View style={styles.area} />

        <ChartLine />

      </View>

      <View style={styles.dates}>
        <Text style={styles.date}>5 Jul</Text>
        <Text style={styles.date}>7 Jul</Text>
        <Text style={styles.date}>9 Jul</Text>
        <Text style={styles.date}>11 Jul</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 20,
    padding: 9,
    borderWidth: 1,
    borderColor: "#263441",
    borderRadius: 10,
    backgroundColor: "#080E15",
  },

  header: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  period: {
    height: 32,
    minWidth: 50,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#263441",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  periodText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  arrow: {
    color: "#8D969F",
    fontSize: 14,
    marginLeft: 5,
  },

  chart: {
    height: 175,
    position: "relative",
    overflow: "hidden",
    marginTop: 4,
  },

  horizontalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "25%",
    height: 1,
    backgroundColor: "#1D2934",
  },

  verticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#1D2934",
  },

  area: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
    backgroundColor: "#1B252E",
    opacity: 0.65,
  },

  chartLineArea: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  line: {
    position: "absolute",
    height: 2,
    backgroundColor: "#D7DDE2",
    transformOrigin: "left center",
  },

  tooltip: {
    position: "absolute",
    top: 20,
    left: "31%",
    width: 177,
    padding: 9,
    borderRadius: 8,
    backgroundColor: "#101923",
    borderWidth: 1,
    borderColor: "#263441",
  },

  tooltipTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },

  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  dotLong: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6EE7D5",
    marginRight: 6,
  },

  dotRatio: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8D99A7",
    marginRight: 6,
  },

  tooltipLabel: {
    color: "#B5BDC6",
    fontSize: 10,
    flex: 1,
  },

  tooltipValue: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  dates: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 5,
  },

  date: {
    color: "#A5ADB5",
    fontSize: 11,
  },
});