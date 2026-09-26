import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import MarketPressureGrid from "./MarketPressureGrid";

export default function MarketSentimentOverview({
  pairs = [],
  defaultPair = null,
}) {
  const [selectedPair, setSelectedPair] = useState(
    defaultPair || pairs[0] || null
  );

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={styles.card}>
      {/* =====================================================
          MARKET SENTIMENT
      ===================================================== */}

      <Text style={styles.sectionTitle}>
        Market Sentiment Overview
      </Text>

      <View style={styles.gaugeContainer}>
        <View style={styles.circle}>
          <Text style={styles.bullish}>
            BULLISH
          </Text>

          <Text style={styles.score}>
            62
          </Text>

          <Text style={styles.total}>
            /100
          </Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.row}>
            <View style={styles.greenDot} />

            <Text style={styles.label}>
              Positive
            </Text>

            <Text style={styles.value}>
              62%
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.grayDot} />

            <Text style={styles.label}>
              Neutral
            </Text>

            <Text style={styles.value}>
              23%
            </Text>
          </View>

          <View style={styles.row}>
            <View style={styles.redDot} />

            <Text style={styles.label}>
              Negative
            </Text>

            <Text style={styles.value}>
              15%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* =====================================================
          MARKET PRESSURE
      ===================================================== */}

      <View style={styles.pressureHeader}>
        <Text style={styles.pressureTitle}>
          MARKET PRESSURE
        </Text>

        <Text style={styles.pressureSubtitle}>
          Select a pair
        </Text>
      </View>

      {/* PAIR SELECTOR */}
      <View style={styles.pickerWrapper}>
        <Pressable
          style={styles.picker}
          onPress={() => setPickerOpen((prev) => !prev)}
        >
          <View>
            <Text style={styles.pickerLabel}>
              PAIR
            </Text>

            <Text style={styles.pickerValue}>
              {selectedPair?.name ||
                selectedPair?.symbol ||
                "Select pair"}
            </Text>
          </View>

          <Text style={styles.arrow}>
            {pickerOpen ? "▲" : "▼"}
          </Text>
        </Pressable>

        {/* DROPDOWN */}
        {pickerOpen && (
          <View style={styles.dropdown}>
            {pairs.map((pair) => {
              const isSelected =
                selectedPair?.symbol === pair.symbol;

              return (
                <Pressable
                  key={pair.symbol}
                  style={[
                    styles.dropdownItem,
                    isSelected &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedPair(pair);
                    setPickerOpen(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.dropdownName,
                        isSelected &&
                          styles.dropdownNameSelected,
                      ]}
                    >
                      {pair.name}
                    </Text>

                    <Text style={styles.dropdownSymbol}>
                      {pair.symbol}
                    </Text>
                  </View>

                  {isSelected && (
                    <Text style={styles.check}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* PRESSURE GRID */}
      <MarketPressureGrid
        pair={selectedPair}
      />

      <View style={styles.divider} />

      {/* NEWS */}
      <Text style={styles.subHeading}>
        News Impact Heatmap
      </Text>

      <View style={styles.mapContainer}>
        <Text style={styles.placeholderText}>
          News impact heatmap
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#101820",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1C2630",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 16,
  },

  gaugeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 7,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  bullish: {
    color: "#FFFFFF",
    fontSize: 11,
    letterSpacing: 1,
  },

  score: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "700",
  },

  total: {
    color: "#888888",
    fontSize: 12,
  },

  stats: {
    flex: 1,
    marginLeft: 20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },

  grayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#888888",
    marginRight: 8,
  },

  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    marginRight: 8,
  },

  label: {
    flex: 1,
    color: "#AAAAAA",
    fontSize: 12,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#1C2630",
    marginVertical: 18,
  },

  pressureHeader: {
    marginBottom: 10,
  },

  pressureTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  pressureSubtitle: {
    color: "#777F84",
    fontSize: 10,
    marginTop: 3,
  },

  pickerWrapper: {
    position: "relative",
    zIndex: 20,
    marginBottom: 12,
  },

  picker: {
    minHeight: 54,
    backgroundColor: "#080D12",
    borderWidth: 1,
    borderColor: "#26313A",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  pickerLabel: {
    color: "#68737C",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },

  pickerValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  arrow: {
    color: "#FFFFFF",
    fontSize: 12,
  },

  dropdown: {
    position: "absolute",
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#26313A",
    borderRadius: 10,
    overflow: "hidden",
    zIndex: 100,
    elevation: 10,
  },

  dropdownItem: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1C2630",
  },

  dropdownItemSelected: {
    backgroundColor: "#17232B",
  },

  dropdownName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  dropdownNameSelected: {
    color: "#4ADE80",
  },

  dropdownSymbol: {
    color: "#68737C",
    fontSize: 9,
    marginTop: 2,
  },

  check: {
    color: "#4ADE80",
    fontSize: 16,
    fontWeight: "700",
  },

  subHeading: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  mapContainer: {
    height: 120,
    backgroundColor: "#080D12",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#68737C",
    fontSize: 12,
  },
});