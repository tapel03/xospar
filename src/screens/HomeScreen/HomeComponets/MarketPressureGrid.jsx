import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";

const TIMEFRAMES = ["DAILY", "WEEKLY", "MONTHLY"];

const DOT_COUNT = 16;
const MAX_HEIGHT = 16;

export default function MarketPressureGrid() {
  const [timeframe, setTimeframe] = useState("MONTHLY");

  const [sellerStrength, setSellerStrength] = useState(6);
  const [buyerStrength, setBuyerStrength] = useState(8);

  /*
   * Each dot gets its own animated vertical movement.
   */
  const sellerAnimations = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0))
  ).current;

  const buyerAnimations = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0))
  ).current;

  /*
   * Generate the natural wave shape.
   */
const getWaveHeight = (index, side, strength) => {
  const centerDistance =
    side === "seller"
      ? DOT_COUNT - 1 - index
      : index;

  const normalized =
    centerDistance / (DOT_COUNT - 1);

  // Main wave shape
  const wave =
    Math.sin(normalized * Math.PI);

  // Natural unevenness
  const variation =
    Math.sin(index * 1.45) * 0.8;

  // Create occasional tall pressure spikes
  const spikePositions =
    side === "seller"
      ? [5, 10, 13]
      : [2, 7, 11];

  const isSpike =
    spikePositions.includes(index);

  const spikeHeight = isSpike
    ? 5 + Math.random() * 3
    : 0;

  const height =
    wave * strength +
    variation +
    spikeHeight;

  return Math.max(
    1,
    Math.min(MAX_HEIGHT, Math.round(height))
  );
};

  /*
   * Animate each side independently.
   *
   * The dots move UP and DOWN rather than
   * travelling horizontally.
   */
  useEffect(() => {
    const animations = [];

    sellerAnimations.forEach((animation, index) => {
      const movement =
        1.5 +
        Math.random() * 3;

      const duration =
        700 +
        Math.random() * 900;

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: movement,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),

          Animated.timing(animation, {
            toValue: -movement,
            duration: duration * 1.15,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      animations.push(loop);
      loop.start();
    });

    buyerAnimations.forEach((animation, index) => {
      const movement =
        1.5 +
        Math.random() * 3;

      const duration =
        650 +
        Math.random() * 950;

      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: movement,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),

          Animated.timing(animation, {
            toValue: -movement,
            duration: duration * 1.1,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );

      animations.push(loop);
      loop.start();
    });

    return () => {
      animations.forEach((animation) => {
        animation.stop();
      });
    };
  }, [timeframe]);

  /*
   * Slowly change the pressure balance so the
   * visualization doesn't feel completely static.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setSellerStrength((current) => {
        const change =
          Math.random() > 0.5 ? 1 : -1;

        return Math.max(
          3,
          Math.min(10, current + change)
        );
      });

      setBuyerStrength((current) => {
        const change =
          Math.random() > 0.5 ? 1 : -1;

        return Math.max(
          3,
          Math.min(10, current + change)
        );
      });
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  /*
   * Overall pressure.
   */
  const total =
    sellerStrength + buyerStrength;

  const pressure = Math.round(
    (buyerStrength / total) * 100
  );

  const pressureLabel =
    pressure > 60
      ? "BUYING PRESSURE"
      : pressure < 40
        ? "SELLING PRESSURE"
        : "BALANCED";

  return (
    <View style={styles.container}>

      {/* =====================================
          HEADER
      ====================================== */}

      <View style={styles.header}>

        <View>
          <Text style={styles.eyebrow}>
            MARKET PRESSURE
          </Text>

          <View style={styles.valueRow}>
            <Text style={styles.value}>
              +{pressure}
            </Text>

            <Text style={styles.percent}>
              %
            </Text>
          </View>
        </View>

        <View style={styles.timeframes}>
          {TIMEFRAMES.map((item) => {
            const active =
              timeframe === item;

            return (
              <Pressable
                key={item}
                onPress={() =>
                  setTimeframe(item)
                }
                style={styles.timeframeButton}
              >
                <Text
                  style={[
                    styles.timeframe,
                    active &&
                      styles.timeframeActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

      </View>

      <View style={styles.divider} />

      {/* =====================================
          WAVE
      ====================================== */}

      <View style={styles.waveContainer}>

        <View style={styles.labelsRow}>

          <Text style={styles.sideLabel}>
            SELLERS
          </Text>

          <Text style={styles.sideLabel}>
            BUYERS
          </Text>

        </View>

        <View style={styles.wave}>

          {/* =================================
              SELLER SIDE
          ================================= */}

          <View style={styles.side}>

            {sellerAnimations.map(
              (animation, index) => {

                const height =
                  getWaveHeight(
                    index,
                    "seller",
                    sellerStrength
                  );

                return (
                  <Animated.View
                    key={`seller-${index}`}
                    style={[
                      styles.column,
                      {
                        transform: [
                          {
                            translateY:
                              animation,
                          },
                        ],
                      },
                    ]}
                  >
                    {Array.from({
                      length: height,
                    }).map((_, dotIndex) => (
                      <View
                        key={dotIndex}
                        style={[
                          styles.dot,
                          dotIndex >
                            height * 0.55 &&
                            styles.dotDark,
                        ]}
                      />
                    ))}
                  </Animated.View>
                );
              }
            )}

          </View>

          {/* =================================
              CENTER
          ================================= */}

          <View style={styles.centerLine}>
            <View style={styles.centerDot} />
          </View>

          {/* =================================
              BUYER SIDE
          ================================= */}

          <View style={styles.side}>

            {buyerAnimations.map(
              (animation, index) => {

                const height =
                  getWaveHeight(
                    index,
                    "buyer",
                    buyerStrength
                  );

                return (
                  <Animated.View
                    key={`buyer-${index}`}
                    style={[
                      styles.column,
                      {
                        transform: [
                          {
                            translateY:
                              animation,
                          },
                        ],
                      },
                    ]}
                  >
                    {Array.from({
                      length: height,
                    }).map((_, dotIndex) => (
                      <View
                        key={dotIndex}
                        style={[
                          styles.dot,
                          dotIndex >
                            height * 0.55 &&
                            styles.dotDark,
                        ]}
                      />
                    ))}
                  </Animated.View>
                );
              }
            )}

          </View>

        </View>

      </View>

      {/* =====================================
          FOOTER
      ====================================== */}

      <View style={styles.footer}>

        <View>
          <Text style={styles.footerLabel}>
            SELLING
          </Text>

          <Text style={styles.footerValue}>
            {100 - pressure}%
          </Text>
        </View>

        <View style={styles.current}>

          <Text style={styles.currentLabel}>
            CURRENT
          </Text>

          <Text style={styles.currentValue}>
            {pressureLabel}
          </Text>

        </View>

        <View style={styles.buying}>

          <Text style={styles.footerLabel}>
            BUYING
          </Text>

          <Text style={styles.footerValue}>
            {pressure}%
          </Text>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "#151515",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
  },

  /* =====================================
     HEADER
  ====================================== */

  header: {
    minHeight: 94,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  eyebrow: {
    color: "#858585",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.8,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  value: {
    color: "#D4D4D4",
    fontSize: 38,
    fontWeight: "300",
    letterSpacing: -1.5,
  },

  percent: {
    color: "#777777",
    fontSize: 20,
    fontWeight: "300",
    marginLeft: 2,
  },

  /* =====================================
     TIMEFRAMES
  ====================================== */

  timeframes: {
    flexDirection: "row",
    gap: 14,
    paddingTop: 3,
  },

  timeframeButton: {
    paddingVertical: 4,
  },

  timeframe: {
    color: "#5F5F5F",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  timeframeActive: {
    color: "#D0D0D0",
  },

  /* =====================================
     DIVIDER
  ====================================== */

  divider: {
    height: 1,
    backgroundColor: "#282828",
  },

  /* =====================================
     WAVE
  ====================================== */
waveContainer: {
  height: 230,
  paddingHorizontal: 14,
  paddingTop: 16,
},

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },

  sideLabel: {
    color: "#5F5F5F",
    fontSize: 8,
    letterSpacing: 0.8,
  },

wave: {
  flex: 1,
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "center",
  paddingBottom: 28,
},

side: {
  flex: 1,
  height: 175,

    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
  },

  column: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },

dot: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: "#858585",
},

dotDark: {
  backgroundColor: "#505050",
},

  /* =====================================
     CENTER
  ====================================== */

centerLine: {
  width: 1,
  height: 160,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  centerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#A0A0A0",
  },

  /* =====================================
     FOOTER
  ====================================== */

  footer: {
    minHeight: 65,
    paddingHorizontal: 18,
    paddingBottom: 15,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  footerLabel: {
    color: "#606060",
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  footerValue: {
    color: "#A5A5A5",
    fontSize: 12,
  },

  current: {
    alignItems: "center",
  },

  currentLabel: {
    color: "#5F5F5F",
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 3,
  },

  currentValue: {
    color: "#BDBDBD",
    fontSize: 9,
    letterSpacing: 0.4,
  },

  buying: {
    alignItems: "flex-end",
  },

});