import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { getCandleByTimeframe } from "../../services/api/finnhubService";

const TIMEFRAMES = ["1H", "4H", "1D", "1W", "1M"];
const SCREEN_WIDTH = 350;

export function CandlestickChart({ symbol = "BTCUSD" }) {
  const [timeframe, setTimeframe] = useState("1D");
  const [candleData, setCandleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("candle"); // "candle" or "line"
  const [timezone, setTimezone] = useState("UTC");

  // Fetch candle data when timeframe changes
  useEffect(() => {
    fetchCandleData();
  }, [timeframe]);

  const fetchCandleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandleByTimeframe(symbol, timeframe);
      setCandleData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    if (timezone === "UTC") {
      return date.toUTCString().substring(0, 16);
    }
    return date.toLocaleString().substring(0, 16);
  };

  // Prepare data for line chart (using close prices)
  const getLineChartData = () => {
    if (!candleData || !candleData.c) return null;

    const labels = candleData.t
      .slice(-10) // Last 10 candles
      .map((t) => {
        const date = new Date(t * 1000);
        return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      });

    const data = candleData.c.slice(-10).map((price) => parseFloat(price));

    return {
      labels,
      datasets: [
        {
          data,
          strokeWidth: 2,
          color: () => "#00FF88", // Green
        },
      ],
    };
  };

  // Prepare data for bar chart (volume)
  const getVolumeChartData = () => {
    if (!candleData || !candleData.v) return null;

    const labels = candleData.t
      .slice(-10)
      .map(() => "");

    const data = candleData.v.slice(-10).map((vol) => vol / 1000000); // In millions

    return {
      labels,
      datasets: [
        {
          data,
          color: () => "rgba(0, 255, 136, 0.5)",
        },
      ],
    };
  };

  // Get current stats
  const getCurrentStats = () => {
    if (!candleData || !candleData.c) return null;

    const close = candleData.c[candleData.c.length - 1];
    const open = candleData.o[0];
    const high = Math.max(...candleData.h);
    const low = Math.min(...candleData.l);
    const change = ((close - open) / open) * 100;

    return { close, open, high, low, change };
  };

  const stats = getCurrentStats();
  const lineChartData = getLineChartData();
  const volumeChartData = getVolumeChartData();

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCandleData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Symbol and Price */}
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{symbol}</Text>
          {stats && (
            <Text style={styles.price}>${formatPrice(stats.close)}</Text>
          )}
        </View>
        {stats && (
          <Text style={[styles.change, { color: stats.change >= 0 ? "#00FF88" : "#FF4444" }]}>
            {stats.change >= 0 ? "+" : ""}{stats.change.toFixed(2)}%
          </Text>
        )}
      </View>

      {/* Timeframe Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeframeScroll}>
        <View style={styles.timeframeContainer}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[styles.timeframeButton, timeframe === tf && styles.timeframeActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.timeframeText, timeframe === tf && styles.timeframeTextActive]}>
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Chart Type & Timezone Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, chartType === "candle" && styles.controlButtonActive]}
          onPress={() => setChartType("candle")}
        >
          <Text style={styles.controlButtonText}>📊 Candle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, chartType === "line" && styles.controlButtonActive]}
          onPress={() => setChartType("line")}
        >
          <Text style={styles.controlButtonText}>📈 Line</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setTimezone(timezone === "UTC" ? "LOCAL" : "UTC")}
        >
          <Text style={styles.controlButtonText}>🕐 {timezone}</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <ActivityIndicator size="large" color="#00FF88" style={styles.loader} />
      ) : null}

      {/* Charts */}
      {lineChartData && !loading && (
        <View>
          {chartType === "line" && (
            <View style={styles.chartWrapper}>
              <LineChart
                data={lineChartData}
                width={SCREEN_WIDTH}
                height={220}
                chartConfig={{
                  backgroundColor: "#1a1a1a",
                  backgroundGradientFrom: "#1a1a1a",
                  backgroundGradientTo: "#1a1a1a",
                  color: () => "#00FF88",
                  strokeWidth: 2,
                  decimalPlaces: 2,
                }}
                bezier
                style={styles.chart}
              />
            </View>
          )}

          {chartType === "candle" && (
            <View style={styles.chartWrapper}>
              <Text style={styles.chartLabel}>Candlestick Data (Line View)</Text>
              <LineChart
                data={lineChartData}
                width={SCREEN_WIDTH}
                height={220}
                chartConfig={{
                  backgroundColor: "#1a1a1a",
                  backgroundGradientFrom: "#1a1a1a",
                  backgroundGradientTo: "#1a1a1a",
                  color: () => "#00FF88",
                  strokeWidth: 2,
                  decimalPlaces: 2,
                }}
                style={styles.chart}
              />
            </View>
          )}
        </View>
      )}

      {/* Volume Chart */}
      {volumeChartData && !loading && (
        <View style={styles.chartWrapper}>
          <Text style={styles.chartLabel}>Volume</Text>
          <BarChart
            data={volumeChartData}
            width={SCREEN_WIDTH}
            height={150}
            chartConfig={{
              backgroundColor: "#1a1a1a",
              backgroundGradientFrom: "#1a1a1a",
              backgroundGradientTo: "#1a1a1a",
              color: () => "rgba(0, 255, 136, 0.6)",
              barRadius: 4,
            }}
            style={styles.chart}
          />
        </View>
      )}

      {/* Stats */}
      {stats && !loading && (
        <View style={styles.statsContainer}>
          <StatBox label="High" value={`$${formatPrice(stats.high)}`} />
          <StatBox label="Low" value={`$${formatPrice(stats.low)}`} />
          <StatBox label="Open" value={`$${formatPrice(stats.open)}`} />
          <StatBox label="Close" value={`$${formatPrice(stats.close)}`} />
        </View>
      )}
    </View>
  );
}

// Stats Box Component
function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0a0a0a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00FF88",
    marginTop: 4,
  },
  change: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timeframeScroll: {
    marginBottom: 12,
  },
  timeframeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "transparent",
  },
  timeframeActive: {
    backgroundColor: "#00FF88",
    borderColor: "#00FF88",
  },
  timeframeText: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
  },
  timeframeTextActive: {
    color: "#000",
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  controlButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "transparent",
  },
  controlButtonActive: {
    backgroundColor: "#00FF88",
    borderColor: "#00FF88",
  },
  controlButtonText: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
  },
  chartWrapper: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    padding: 8,
  },
  chartLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
  loader: {
    marginVertical: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 75,
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#333",
  },
  statLabel: {
    color: "#888",
    fontSize: 10,
  },
  statValue: {
    color: "#00FF88",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  error: {
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#00FF88",
    borderRadius: 6,
    alignItems: "center",
  },
  retryText: {
    color: "#000",
    fontWeight: "bold",
  },
});