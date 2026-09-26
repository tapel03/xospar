import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import InAppModalOverlay from "../../../components/InAppModalOverlay";

const MIN_LOT = 0.01;
const LOT_STEP = 0.01;

function toNumber(value) {
  const number = parseFloat(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function fmt(value, decimals) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "--";
}

// A simple vertical price ladder - horizontal dashed gridlines with price
// labels on the right, a highlighted "current price" line, and a marker
// for wherever the SL sits, echoing the Close/Modify position reference
// design's right-hand price scale.
function PriceLadder({ high, low, currentPrice, stopLoss, decimals, positive }) {
  const range = Math.max(high - low, 0.00001);
  const rowCount = 6;

  const rows = Array.from({ length: rowCount + 1 }, (_, i) => {
    const fraction = i / rowCount;
    return high - fraction * range;
  });

  const yFor = (price) => {
    const fraction = (high - price) / range;
    return Math.min(Math.max(fraction, 0), 1);
  };

  return (
    <View style={styles.ladder}>
      {rows.map((price, index) => (
        <View
          key={index}
          style={[styles.ladderRow, { top: `${(index / rowCount) * 100}%` }]}
        >
          <View style={styles.ladderLine} />
          <Text style={styles.ladderLabel}>{fmt(price, decimals)}</Text>
        </View>
      ))}

      {Number.isFinite(currentPrice) && (
        <View
          style={[
            styles.ladderRow,
            { top: `${yFor(currentPrice) * 100}%` },
          ]}
        >
          <Text style={styles.ladderPriceCaption}>Price</Text>
          <View style={[styles.ladderLine, styles.ladderLineSolid]} />
          <View
            style={[
              styles.ladderPill,
              { backgroundColor: positive ? "#178C7E" : "#D84B4B" },
            ]}
          >
            <Text style={styles.ladderPillText}>{fmt(currentPrice, decimals)}</Text>
          </View>
        </View>
      )}

      {Number.isFinite(stopLoss) && (
        <View style={[styles.ladderRow, { top: `${yFor(stopLoss) * 100}%` }]}>
          <View style={styles.ladderDot} />
          <View style={[styles.ladderLine, styles.ladderLineDashedOrange]} />
          <View style={[styles.ladderPill, styles.ladderPillSL]}>
            <Text style={styles.ladderPillText}>{fmt(stopLoss, decimals)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function PriceStepper({ label, tone, value, onChange, decimals, step }) {
  return (
    <View style={styles.stepperCard}>
      <View
        style={[
          styles.stepperTag,
          tone === "sl" ? styles.stepperTagSL : styles.stepperTagTP,
        ]}
      >
        <Text style={styles.stepperTagText}>{label}</Text>
      </View>

      <Text style={styles.stepperValue}>{fmt(value, decimals)}</Text>

      <View style={styles.stepperArrows}>
        <Pressable
          hitSlop={6}
          onPress={() => onChange(value + step)}
        >
          <Ionicons name="chevron-up" size={16} color="#111111" />
        </Pressable>

        <Pressable
          hitSlop={6}
          onPress={() => onChange(value - step)}
        >
          <Ionicons name="chevron-down" size={16} color="#111111" />
        </Pressable>
      </View>
    </View>
  );
}

// Slide-to-confirm control, echoing the reference design's "Close
// position" slider. Dragging (or tapping) past ~80% of the track fires
// onConfirm.
//
// FIX: the PanResponder is created once (via useRef), so its callbacks
// close over whatever `maxDrag` was on that very first render - which is
// always 0 before onLayout has fired. That made the knob barely move
// and never reach the confirm threshold. `maxDragRef` is kept up to
// date on every render and read from inside the gesture handlers
// instead, so the drag always uses the current track width.
function ConfirmSlider({ label, color, onConfirm }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const dragX = useRef(new Animated.Value(0)).current;
  const knobSize = 34;

  const maxDrag = Math.max(trackWidth - knobSize, 1);
  const maxDragRef = useRef(maxDrag);
  maxDragRef.current = maxDrag;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 4,

      onPanResponderMove: (_, gesture) => {
        const limit = maxDragRef.current;
        const next = Math.min(Math.max(gesture.dx, 0), limit);
        dragX.setValue(next);
      },

      onPanResponderRelease: (_, gesture) => {
        const limit = maxDragRef.current;
        const traveled = Math.min(Math.max(gesture.dx, 0), limit);

        if (limit > 0 && traveled / limit > 0.8) {
          Animated.timing(dragX, {
            toValue: limit,
            duration: 120,
            useNativeDriver: false,
          }).start(() => onConfirm());
        } else {
          Animated.spring(dragX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.sliderTrack, { backgroundColor: `${color}1A`, borderColor: color }]}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <Text style={[styles.sliderLabel, { color }]}>{label}</Text>

      <Animated.View
        style={[
          styles.sliderKnob,
          { backgroundColor: color, transform: [{ translateX: dragX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
      </Animated.View>
    </View>
  );
}

export default function OrderTicketModal({ visible, onClose, asset, side = "buy" }) {
  const isBuy = side === "buy";
  const accentColor = isBuy ? "#178C7E" : "#D84B4B";

  const midPrice = useMemo(() => toNumber(asset?.price), [asset?.price]);
  const decimals = midPrice < 10 ? 4 : midPrice < 1000 ? 3 : 2;

  // Simulated bid/ask spread around the asset's last price - the app has
  // no live execution price feed, so this approximates one for display.
  const spread = Math.max(midPrice * 0.00015, 0.00005);
  const bidPrice = midPrice - spread;
  const askPrice = midPrice + spread;
  const entryPrice = isBuy ? askPrice : bidPrice;

  const [tab, setTab] = useState("details");
  const [lotSize, setLotSize] = useState(0.05);
  const [stopLoss, setStopLoss] = useState(entryPrice);
  const [takeProfit, setTakeProfit] = useState(entryPrice);

  useEffect(() => {
    if (!visible) return;

    setTab("details");
    setLotSize(0.05);

    const slDistance = Math.max(midPrice * 0.006, 0.0005);
    const tpDistance = Math.max(midPrice * 0.01, 0.0008);

    setStopLoss(isBuy ? entryPrice - slDistance : entryPrice + slDistance);
    setTakeProfit(isBuy ? entryPrice + tpDistance : entryPrice - tpDistance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, side, asset?.symbol]);

  const priceStep = Math.max(midPrice * 0.0005, 0.0001);

  const estimatedPL = useMemo(() => {
    if (!Number.isFinite(stopLoss)) return 0;
    const direction = isBuy ? 1 : -1;
    return (stopLoss - entryPrice) * direction * lotSize * 1000;
  }, [stopLoss, entryPrice, isBuy, lotSize]);

  const ladderHigh = Math.max(entryPrice, stopLoss, takeProfit) + priceStep * 6;
  const ladderLow = Math.min(entryPrice, stopLoss, takeProfit) - priceStep * 6;

  const handleConfirm = () => {
    Alert.alert(
      isBuy ? "Buy order placed" : "Sell order placed",
      `${asset?.symbol || "Asset"} • ${lotSize.toFixed(2)} lots @ ${fmt(
        entryPrice,
        decimals
      )}`
    );
    onClose?.();
  };

  if (!asset) {
    return null;
  }

  return (
    <InAppModalOverlay visible={visible} onClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {/* HEADER */}
          <View style={styles.header}>
            <View>
              <Text style={styles.symbol}>{asset.symbol}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {asset.name || asset.pair || asset.symbol}
              </Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quote, { color: "#D84B4B" }]}>
                {fmt(bidPrice, decimals)}
              </Text>
              <Text style={[styles.quote, { color: "#178C7E" }]}>
                {fmt(askPrice, decimals)}
              </Text>
            </View>

            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={20} color="#111111" />
            </Pressable>
          </View>

          {/* TABS - "Details" / "Confirm", mirroring the reference
              design's "Close position / Modify position" pair. */}
          <View style={styles.tabRow}>
            <Pressable onPress={() => setTab("details")}>
              <Text
                style={[
                  styles.tabLabel,
                  tab === "details" && { color: accentColor },
                ]}
              >
                {isBuy ? "Buy order" : "Sell order"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setTab("confirm")}>
              <Text
                style={[
                  styles.tabLabel,
                  tab === "confirm" && { color: accentColor },
                ]}
              >
                Confirm
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {tab === "details" ? (
              <>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryLabel}>Entry price</Text>
                  <Text style={styles.summaryValue}>
                    {fmt(entryPrice, decimals)}
                  </Text>

                  <View style={styles.lotRow}>
                    <Text style={styles.lotLabel}>Lot size</Text>

                    <View style={styles.lotStepper}>
                      <Pressable
                        onPress={() =>
                          setLotSize((value) =>
                            Math.max(MIN_LOT, +(value - LOT_STEP).toFixed(2))
                          )
                        }
                        style={styles.lotButton}
                      >
                        <Ionicons name="remove" size={16} color="#111111" />
                      </Pressable>

                      <Text style={styles.lotValue}>{lotSize.toFixed(2)}</Text>

                      <Pressable
                        onPress={() =>
                          setLotSize((value) => +(value + LOT_STEP).toFixed(2))
                        }
                        style={styles.lotButton}
                      >
                        <Ionicons name="add" size={16} color="#111111" />
                      </Pressable>
                    </View>
                  </View>
                </View>

                <View style={styles.stepperRow}>
                  <PriceStepper
                    label="SL"
                    tone="sl"
                    value={stopLoss}
                    decimals={decimals}
                    step={priceStep}
                    onChange={setStopLoss}
                  />

                  <PriceStepper
                    label="TP"
                    tone="tp"
                    value={takeProfit}
                    decimals={decimals}
                    step={priceStep}
                    onChange={setTakeProfit}
                  />
                </View>

                <Text
                  style={[
                    styles.plText,
                    { color: estimatedPL >= 0 ? "#178C7E" : "#D84B4B" },
                  ]}
                >
                  {estimatedPL >= 0 ? "+" : ""}
                  {estimatedPL.toFixed(2)} USD at SL
                </Text>

                <PriceLadder
                  high={ladderHigh}
                  low={ladderLow}
                  currentPrice={entryPrice}
                  stopLoss={stopLoss}
                  decimals={decimals}
                  positive={isBuy}
                />

                <Pressable
                  style={[styles.primaryButton, { backgroundColor: accentColor }]}
                  onPress={() => setTab("confirm")}
                >
                  <Text style={styles.primaryButtonText}>
                    Review {isBuy ? "Buy" : "Sell"} Order
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.confirmSummary}>
                  <Text style={styles.confirmSymbol}>{asset.symbol}</Text>

                  <Text
                    style={[
                      styles.confirmSide,
                      { color: accentColor },
                    ]}
                  >
                    {isBuy ? "BUY" : "SELL"} {lotSize.toFixed(2)} lots
                  </Text>

                  <Text style={styles.confirmPrice}>
                    @ {fmt(entryPrice, decimals)}
                  </Text>

                  <View style={styles.confirmRow}>
                    <Text style={styles.confirmMeta}>SL {fmt(stopLoss, decimals)}</Text>
                    <Text style={styles.confirmMeta}>TP {fmt(takeProfit, decimals)}</Text>
                  </View>
                </View>

                <ConfirmSlider
                  label={`SLIDE TO ${isBuy ? "BUY" : "SELL"}`}
                  color={accentColor}
                  onConfirm={handleConfirm}
                />

                <PriceLadder
                  high={ladderHigh}
                  low={ladderLow}
                  currentPrice={entryPrice}
                  stopLoss={stopLoss}
                  decimals={decimals}
                  positive={isBuy}
                />
              </>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </InAppModalOverlay>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },

  sheet: {
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  handle: {
    width: 62,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginBottom: 14,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  symbol: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "700",
  },

  subtitle: {
    color: "#777777",
    fontSize: 12,
    marginTop: 2,
  },

  quoteRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    paddingRight: 8,
  },

  quote: {
    fontSize: 17,
    fontWeight: "700",
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },

  tabRow: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 14,
  },

  tabLabel: {
    color: "#9A9AA0",
    fontSize: 15,
    fontWeight: "700",
  },

  scroll: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingBottom: 6,
  },

  summaryCard: {
    borderWidth: 1,
    borderColor: "#EDEDED",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  summaryLabel: {
    color: "#777777",
    fontSize: 12,
  },

  summaryValue: {
    color: "#111111",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },

  lotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  lotLabel: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
  },

  lotStepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
  },

  lotButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },

  lotValue: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    minWidth: 46,
    textAlign: "center",
  },

  stepperRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },

  stepperCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },

  stepperTag: {
    width: 30,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  stepperTagSL: {
    backgroundColor: "#8A8A8A",
  },

  stepperTagTP: {
    backgroundColor: "#F5F5F5",
  },

  stepperTagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  stepperValue: {
    flex: 1,
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
  },

  stepperArrows: {
    gap: 2,
  },

  plText: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 14,
  },

  ladder: {
    height: 220,
    marginBottom: 18,
  },

  ladderRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  ladderLine: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    borderStyle: "dashed",
  },

  ladderLineSolid: {
    borderTopColor: "#59636D",
    borderStyle: "solid",
  },

  ladderLineDashedOrange: {
    borderTopColor: "#A3A3A3",
  },

  ladderLabel: {
    width: 62,
    textAlign: "right",
    color: "#8A949E",
    fontSize: 11,
  },

  ladderPriceCaption: {
    width: 40,
    color: "#59636D",
    fontSize: 11,
  },

  ladderPill: {
    marginLeft: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },

  ladderPillSL: {
    backgroundColor: "#A3A3A3",
  },

  ladderPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  ladderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A3A3A3",
    marginRight: -4,
  },

  primaryButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  confirmSummary: {
    alignItems: "center",
    paddingVertical: 18,
  },

  confirmSymbol: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  confirmSide: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 6,
  },

  confirmPrice: {
    color: "#555555",
    fontSize: 14,
    marginTop: 4,
  },

  confirmRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10,
  },

  confirmMeta: {
    color: "#777777",
    fontSize: 12,
  },

  sliderTrack: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
    marginBottom: 18,
  },

  sliderLabel: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  sliderKnob: {
    position: "absolute",
    left: 4,
    width: 34,
    height: 34,
    top: 9,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});