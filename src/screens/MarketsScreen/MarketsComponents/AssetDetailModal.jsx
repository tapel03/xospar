// src/screens/MarketsScreen/MarketsComponents/AssetDetailModal.jsx

import { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  PanResponder,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import MarketInfoTabs from "./MarketInfoTabs";
import AssetPriceChart from "./AssetPriceChart";
import AlertFormModal from "./AlertFormModal";
import OrderTicketModal from "./OrderTicketModal";
import ChartOptionsReels from "./ChartOptionsReels";
import StrategyCoachPanel from "./StrategyCoachPanel";
import InAppModalOverlay from "../../../components/InAppModalOverlay";
import { useAssetCandles } from "../../../hooks/useAssetCandles";
import { useAlerts } from "../../../context/AlertsContext";
import {
  CHART_RANGES,
  DEFAULT_CHART_RANGE,
} from "../../../services/api/candleRanges";

// The white sheet's timeframe strip only shows the six largest
// timeframes, largest first: 1M, 1W, 1D, 4H, 2H, 1H. CHART_RANGES is
// ordered smallest -> largest ("1m"..."1M"), so take the last 6 and
// reverse them rather than hardcoding a second list.
const TOP_SIX_RANGES = CHART_RANGES.slice(-6).reverse();

// How far (in px) a horizontal drag needs to travel before it's treated
// as a swipe to the next/previous asset card.
const SWIPE_THRESHOLD = 60;

// Breakpoints used to scale the pills themselves (font size, height,
// horizontal padding) so they still read clearly on a small phone
// without wasting space on a tablet-sized screen. A little space is
// reserved for the expand button too, since it now shares this row.
// NOTE: heights trimmed down from the original (34/36/38/40) to shrink
// the overall chart+timeframe container.
function getTimeframeSizing(containerWidth) {
  if (containerWidth < 340) {
    return { fontSize: 10, height: 24, paddingHorizontal: 4, gap: 4 };
  }

  if (containerWidth < 400) {
    return { fontSize: 11, height: 26, paddingHorizontal: 6, gap: 6 };
  }

  if (containerWidth < 500) {
    return { fontSize: 12, height: 28, paddingHorizontal: 8, gap: 8 };
  }

  return { fontSize: 13, height: 30, paddingHorizontal: 10, gap: 8 };
}

// Fraction of the window the non-fullscreen sheet occupies. Applied as
// an explicit pixel value (via useWindowDimensions) rather than a "95%"
// string, because a percentage height only resolves correctly if every
// ancestor in the tree has a concrete height - which isn't guaranteed
// through InAppModalOverlay's absolutely-positioned wrapper. A plain
// number sidesteps that entirely.
const SHEET_HEIGHT_FRACTION = 0.95;

// Fallback/floor for the chart body - used before the real measurements
// below have landed, and so the chart never gets squeezed to nothing.
const MIN_CHART_BODY_HEIGHT = 260;

// Margins around the measured blocks that `onLayout` does NOT include
// (onLayout reports the content+padding box, not margins) - kept in one
// place so they stay in sync with the style objects below.
const PRICE_SECTION_MARGIN = 8 + 5; // priceSection: marginTop + marginBottom
const CHART_SECTION_MARGIN_TOP = 8; // chartSection: marginTop
const TIMEFRAME_ROW_MARGIN_TOP = 6; // timeframeRow: marginTop
const ORDER_ROW_MARGIN = 20 + 16; // orderButtonsRow: marginTop + marginBottom
const SCROLL_CONTENT_H_PADDING_TOP = 0; // scrollContent has no explicit paddingTop

export default function AssetDetailModal({
  asset,
  visible,
  onClose,
  bookmarked = false,
  onToggleBookmark,
  // Optional - lets the modal swipe between cards within whatever list
  // it was opened from (e.g. the Watch List, or a single Forex/Crypto/
  // Stocks/Indices category list). When omitted, swiping is disabled and
  // the modal behaves exactly as before.
  assets = [],
  currentIndex = -1,
  onNavigate,
}) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const [chartType, setChartType] = useState("line");
  const [chartWidth, setChartWidth] = useState(0);
  const [chartRange, setChartRange] = useState(
    DEFAULT_CHART_RANGE
  );

  const [chartFullscreen, setChartFullscreen] =
    useState(false);

  const [alertModalVisible, setAlertModalVisible] =
    useState(false);

  const [editingAlert, setEditingAlert] =
    useState(null);

  // Buy/Sell - opens the order ticket bottom sheet configured for
  // whichever side was tapped.
  const [orderModalVisible, setOrderModalVisible] =
    useState(false);

  const [orderSide, setOrderSide] = useState("buy");

  // Real, measured heights of the self-sized chrome around the chart in
  // the non-fullscreen sheet (handle+header, price block, timeframe
  // row, Buy/Sell row). Each of these sizes itself from its own content
  // regardless of any ancestor's height resolution, so they're reliable
  // even where percentage/flex-based sizing further up the tree isn't.
  const [topChromeHeight, setTopChromeHeight] = useState(0);
  const [priceSectionHeight, setPriceSectionHeight] = useState(0);
  const [timeframeRowHeight, setTimeframeRowHeight] = useState(0);
  const [orderRowHeight, setOrderRowHeight] = useState(0);

  const { dueAlertForSymbol } = useAlerts();

  const {
    candles,
    status,
  } = useAssetCandles(
    asset,
    asset?.category,
    chartRange
  );

  // Kept in refs so the PanResponder's callbacks (created once) always
  // see the latest list/index/handler rather than whatever was current
  // the first time this component rendered.
  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  const swipePanResponder = useRef(
    PanResponder.create({
      // Only capture clearly horizontal drags so vertical scrolling in
      // the content below (and the overlay's own drag-to-close gesture)
      // keep working normally.
      onMoveShouldSetPanResponder: (_, gesture) =>
        assetsRef.current.length > 1 &&
        Math.abs(gesture.dx) > 24 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,

      onPanResponderRelease: (_, gesture) => {
        const list = assetsRef.current;
        const index = currentIndexRef.current;
        const navigate = onNavigateRef.current;

        if (!navigate || index < 0 || list.length < 2) {
          return;
        }

        if (gesture.dx <= -SWIPE_THRESHOLD && index < list.length - 1) {
          // Swiped left - next card.
          navigate(index + 1);
        } else if (gesture.dx >= SWIPE_THRESHOLD && index > 0) {
          // Swiped right - previous card.
          navigate(index - 1);
        }
      },
    })
  ).current;

  if (!asset) {
    return null;
  }

  const canNavigate = assets.length > 1 && currentIndex >= 0;

  const dueAlert = dueAlertForSymbol(asset.symbol);

  // Scale pill sizing off the actual chart section width (falls back to
  // the window width until the first onLayout fires), so the strip
  // adapts to whatever device/orientation the modal is rendered in.
  const timeframeSizing = getTimeframeSizing(
    chartWidth > 0 ? chartWidth : windowWidth
  );

  // The sheet's own height, computed directly from the window rather
  // than a "95%" string - this is the fix for the gap: a percentage
  // height only works if every ancestor View resolves to a concrete
  // height, which isn't reliable through the modal overlay stack, so
  // the earlier percentage/flex/onLayout-of-a-flexed-View attempts
  // could end up measuring/rendering against an unreliable base. A
  // number computed from useWindowDimensions has no such dependency.
  const sheetHeight = Math.round(windowHeight * SHEET_HEIGHT_FRACTION);

  // Everything below the handle+header, computed algebraically from the
  // (now guaranteed-correct) sheet height rather than measured via a
  // flexed wrapper View.
  const availableContentHeight =
    topChromeHeight > 0
      ? sheetHeight - topChromeHeight
      : sheetHeight * 0.88; // reasonable placeholder before first layout

  const hasFullMeasurements =
    topChromeHeight > 0 &&
    priceSectionHeight > 0 &&
    timeframeRowHeight > 0 &&
    orderRowHeight > 0;

  const measuredRemainder =
    availableContentHeight -
    SCROLL_CONTENT_H_PADDING_TOP -
    (priceSectionHeight + PRICE_SECTION_MARGIN) -
    CHART_SECTION_MARGIN_TOP -
    (timeframeRowHeight + TIMEFRAME_ROW_MARGIN_TOP) -
    (orderRowHeight + ORDER_ROW_MARGIN);

  const chartBodyHeight = hasFullMeasurements
    ? Math.max(MIN_CHART_BODY_HEIGHT, measuredRemainder)
    : MIN_CHART_BODY_HEIGHT;

  const handleAlertPress = () => {
    setEditingAlert(dueAlert || null);
    setAlertModalVisible(true);
  };

  const handleAlertModalClose = () => {
    setAlertModalVisible(false);
    setEditingAlert(null);
  };

  const handleChartFullscreen = () => {
    setChartFullscreen((current) => !current);
  };

  const handleBuyPress = () => {
    setOrderSide("buy");
    setOrderModalVisible(true);
  };

  const handleSellPress = () => {
    setOrderSide("sell");
    setOrderModalVisible(true);
  };

  const handleOrderModalClose = () => {
    setOrderModalVisible(false);
  };

  return (
    <>
      <InAppModalOverlay
        visible={visible}
        onClose={
          chartFullscreen
            ? handleChartFullscreen
            : onClose
        }
      >
        <View
          style={[
            styles.overlay,
            chartFullscreen &&
              styles.fullscreenOverlay,
          ]}
        >
          <View
            style={[
              styles.modal,
              // Explicit pixel height instead of a percentage string -
              // see `sheetHeight` above for why. Skipped in fullscreen,
              // which already uses height: "100%".
              !chartFullscreen && { height: sheetHeight },
              chartFullscreen &&
                styles.fullscreenModal,
            ]}
          >

            {!chartFullscreen && (
              <View
                style={styles.swipeArea}
                {...swipePanResponder.panHandlers}
              >
                {/* Handle + header together, measured as one block so
                    `availableContentHeight` above knows exactly how
                    much of the (now-guaranteed) sheetHeight is left for
                    everything else. */}
                <View
                  onLayout={(event) =>
                    setTopChromeHeight(
                      event.nativeEvent.layout.height
                    )
                  }
                >
                  <View style={styles.handle} />

                  <View style={styles.header}>

                    <View style={styles.assetHeader}>

                      <View style={styles.assetIcon}>
                        <Text style={styles.assetIconText}>
                          {asset.icon}
                        </Text>
                      </View>

                      <View style={styles.titleContainer}>

                        <View style={styles.titleRow}>

                          <Text
                            style={styles.assetName}
                            numberOfLines={1}
                          >
                            {asset.name ||
                              asset.pair ||
                              asset.symbol}
                          </Text>

                          <Ionicons
                            name="chevron-down"
                            size={20}
                            color="#111111"
                            style={
                              styles.dropdownIcon
                            }
                          />

                        </View>

                        <Text style={styles.assetPair}>
                          {asset.symbol}
                        </Text>

                      </View>

                    </View>

                    {/* Alerts - the header's top-right action. Tapping it
                        opens the alert form; the badge lights up red when
                        an alert for this asset is due. */}
                    <Pressable
                      style={styles.moreButton}
                      onPress={handleAlertPress}
                      hitSlop={10}
                    >
                      <Ionicons
                        name={
                          dueAlert
                            ? "notifications"
                            : "notifications-outline"
                        }
                        size={24}
                        color={
                          dueAlert
                            ? "#D84B4B"
                            : "#111111"
                        }
                      />

                      {dueAlert && (
                        <View
                          style={styles.headerAlertDot}
                        />
                      )}
                    </Pressable>

                  </View>
                </View>

                {/* Given an explicit height (availableContentHeight)
                    computed from the window + measured chrome above,
                    instead of flex:1 - guarantees this actually equals
                    "everything left in the sheet after the header", no
                    matter what any ancestor's height resolves to. */}
                <View style={{ height: availableContentHeight }}>
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={
                      styles.scrollContent
                    }
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                  >

                    {/* =========================
                        PRICE
                    ========================== */}

                    <View
                      style={styles.priceSection}
                      onLayout={(event) =>
                        setPriceSectionHeight(
                          event.nativeEvent.layout.height
                        )
                      }
                    >

                      <View style={styles.priceRow}>

                        <Text style={styles.price}>
                          {asset.price}
                        </Text>

                        <Text style={styles.currency}>
                          {asset.currency ||
                            (asset.symbol?.includes("CAD")
                              ? "CAD"
                              : "")}
                        </Text>

                      </View>

                      <View style={styles.changeRow}>

                        <Text
                          style={[
                            styles.change,
                            {
                              color: asset.positive
                                ? "#178C7E"
                                : "#D84B4B",
                            },
                          ]}
                        >
                          {asset.positive ? "+" : ""}
                          {asset.change}
                        </Text>

                        <Text style={styles.today}>
                          today
                        </Text>

                      </View>

                      {canNavigate && (
                        <Text style={styles.swipeHint}>
                          {currentIndex + 1} of {assets.length} · swipe for more
                        </Text>
                      )}

                    </View>

                    {/* =========================
                        CHART

                        `chartBody`'s height comes from `chartBodyHeight`
                        above - the sheet's real height (computed from
                        the window, not a percentage) minus the real
                        measured heights of the handle/header, price
                        block, timeframe row and Buy/Sell row - so this
                        card always reaches exactly down to the Buy/Sell
                        row with no gap.
                    ========================== */}

                    <View
                      style={styles.chartSection}
                      onLayout={(event) => {
                        setChartWidth(
                          event.nativeEvent.layout.width
                        );
                      }}
                    >

                      <View
                        style={[
                          styles.chartBody,
                          { height: chartBodyHeight },
                        ]}
                      >

                        {status === "loading" && (
                          <ActivityIndicator
                            size="small"
                            color="#218F82"
                          />
                        )}

                        {status === "ready" &&
                          chartWidth > 0 && (
                            <AssetPriceChart
                              candles={candles}
                              mode={chartType}
                              width={chartWidth}
                              showRangeLabels
                              showTimeLabels
                            />
                          )}

                        {status === "unsupported" && (
                          <Text style={styles.chartText}>
                            Chart data isn't available
                            for {asset.symbol} yet.
                          </Text>
                        )}

                        {status === "error" && (
                          <Text style={styles.chartText}>
                            Couldn't load chart data.
                          </Text>
                        )}

                      </View>

                      {/* ============================================
                          SINGLE ROW: 6 timeframe pills + expand button.
                          DO NOT split this into two Views - the whole
                          point is that every child below is a sibling
                          inside this one flexDirection:"row" container.
                      ============================================ */}
                      <View
                        style={[
                          styles.timeframeRow,
                          { gap: timeframeSizing.gap },
                        ]}
                        onLayout={(event) =>
                          setTimeframeRowHeight(
                            event.nativeEvent.layout.height
                          )
                        }
                      >
                        {TOP_SIX_RANGES.map((rangeOption) => {
                          const active =
                            rangeOption === chartRange;

                          return (
                            <Pressable
                              key={rangeOption}
                              style={[
                                styles.timeframePill,
                                {
                                  height: timeframeSizing.height,
                                  paddingHorizontal:
                                    timeframeSizing.paddingHorizontal,
                                },
                                active &&
                                  styles.timeframePillActive,
                              ]}
                              onPress={() =>
                                setChartRange(rangeOption)
                              }
                            >
                              <Text
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                style={[
                                  styles.timeframePillText,
                                  { fontSize: timeframeSizing.fontSize },
                                  active &&
                                    styles.timeframePillTextActive,
                                ]}
                              >
                                {rangeOption}
                              </Text>
                            </Pressable>
                          );
                        })}

                        <Pressable
                          style={[
                            styles.controlButton,
                            {
                              height: timeframeSizing.height,
                              width: timeframeSizing.height,
                              borderRadius: timeframeSizing.height / 2,
                            },
                          ]}
                          onPress={handleChartFullscreen}
                        >
                          <Ionicons
                            name="scan-outline"
                            size={Math.round(
                              timeframeSizing.height * 0.55
                            )}
                            color="#111111"
                          />
                        </Pressable>
                      </View>
                      {/* ============================================
                          END SINGLE ROW
                      ============================================ */}

                    </View>

                    {/* =========================
                        BUY / SELL
                    ========================== */}

                    <View
                      style={styles.orderButtonsRow}
                      onLayout={(event) =>
                        setOrderRowHeight(
                          event.nativeEvent.layout.height
                        )
                      }
                    >

                      <Pressable
                        style={[
                          styles.orderButton,
                          styles.sellButton,
                        ]}
                        onPress={handleSellPress}
                      >
                        <Text style={styles.orderButtonLabel}>
                          Sell
                        </Text>

                        <Text style={styles.orderButtonPrice}>
                          {asset.price}
                        </Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.orderButton,
                          styles.buyButton,
                        ]}
                        onPress={handleBuyPress}
                      >
                        <Text style={styles.orderButtonLabel}>
                          Buy
                        </Text>

                        <Text style={styles.orderButtonPrice}>
                          {asset.price}
                        </Text>
                      </Pressable>

                    </View>

                    {/* =========================
                        MARKET INFORMATION
                    ========================== */}

                    <MarketInfoTabs
                      asset={asset}
                      candles={candles}
                    />

                    {/* =========================
                        TRADING STRATEGY COACH
                    ========================== */}

                    <StrategyCoachPanel
                      asset={asset}
                      candles={candles}
                    />

                  </ScrollView>
                </View>
              </View>
            )}

            {/* =================================================
                FULLSCREEN CHART

                Layout, top to bottom:
                  1. Chart (with a floating collapse control pinned to
                     its bottom-right corner)
                  2. ONE single row: Sell | Buy (flexible, wider) |
                     chart-type/timeframe picker (compact, fixed width)
                  3. App navigation bar (outside this modal, unchanged)
            ================================================== */}

            {chartFullscreen && (
              <View
                style={styles.fullscreenChartContainer}
              >

                <View
                  style={styles.fullscreenHeader}
                >

                  <Pressable
                    style={
                      styles.fullscreenBackButton
                    }
                    onPress={
                      handleChartFullscreen
                    }
                    hitSlop={10}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={26}
                      color="#FFFFFF"
                    />
                  </Pressable>

                  <View
                    style={styles.fullscreenAsset}
                  >

                    <View
                      style={
                        styles.fullscreenAssetIcon
                      }
                    >
                      <Text
                        style={
                          styles.fullscreenAssetIconText
                        }
                      >
                        {asset.icon}
                      </Text>
                    </View>

                    <View>

                      <Text
                        style={
                          styles.fullscreenAssetName
                        }
                      >
                        {asset.name ||
                          asset.pair ||
                          asset.symbol}
                      </Text>

                      <Text
                        style={
                          styles.fullscreenAssetSymbol
                        }
                      >
                        {asset.symbol}
                      </Text>

                    </View>

                  </View>

                  <Pressable
                    style={
                      styles.fullscreenHeaderButton
                    }
                    onPress={handleAlertPress}
                  >
                    <Ionicons
                      name={
                        dueAlert
                          ? "notifications"
                          : "notifications-outline"
                      }
                      size={23}
                      color={
                        dueAlert
                          ? "#FF5A5F"
                          : "#FFFFFF"
                      }
                    />

                    {dueAlert && (
                      <View
                        style={
                          styles.fullscreenAlertDot
                        }
                      />
                    )}
                  </Pressable>

                </View>

                <View
                  style={
                    styles.fullscreenPriceSection
                  }
                >
                  <Text
                    style={styles.fullscreenPrice}
                  >
                    {asset.price}
                  </Text>

                  <Text
                    style={[
                      styles.fullscreenChange,
                      {
                        color: asset.positive
                          ? "#4ADE80"
                          : "#FF5A5F",
                      },
                    ]}
                  >
                    {asset.positive ? "+" : ""}
                    {asset.change} today
                  </Text>
                </View>

                <View
                  style={styles.fullscreenChart}
                  onLayout={(event) => {
                    setChartWidth(
                      event.nativeEvent.layout.width
                    );
                  }}
                >

                  {status === "loading" && (
                    <ActivityIndicator
                      size="large"
                      color="#4ADE80"
                    />
                  )}

                  {status === "ready" &&
                    chartWidth > 0 && (
                      <AssetPriceChart
                        candles={candles}
                        mode={chartType}
                        width={chartWidth}
                        showRangeLabels
                        showTimeLabels
                      />
                    )}

                  {status === "unsupported" && (
                    <Text
                      style={
                        styles.fullscreenChartText
                      }
                    >
                      Chart data isn't available
                      for {asset.symbol} yet.
                    </Text>
                  )}

                  {status === "error" && (
                    <Text
                      style={
                        styles.fullscreenChartText
                      }
                    >
                      Couldn't load chart data.
                    </Text>
                  )}

                  {/* Floating collapse control - sits on top of the
                      chart itself, anchored to the bottom-right corner,
                      instead of sharing a row with the pickers below. */}
                  <Pressable
                    style={styles.fullscreenCollapseButton}
                    onPress={handleChartFullscreen}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="contract-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                  </Pressable>

                </View>

                {/* SINGLE ROW - Buy/Sell now take the flexible/larger
                    share of the row's width; the chart-type/timeframe
                    picker is the smaller, fixed-width element (sizes
                    swapped from before). */}
                <View
                  style={styles.fullscreenControlsRow}
                >

                  <View style={styles.fullscreenReelsWrapperCompact}>
                    <ChartOptionsReels
                      compact
                      chartType={chartType}
                      onChangeChartType={setChartType}
                      range={chartRange}
                      onChangeRange={setChartRange}
                    />
                  </View>

                  <Pressable
                    style={[
                      styles.wideOrderButton,
                      styles.sellButton,
                    ]}
                    onPress={handleSellPress}
                  >
                    <Text style={styles.wideOrderButtonLabel}>
                      Sell
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.wideOrderButton,
                      styles.buyButton,
                    ]}
                    onPress={handleBuyPress}
                  >
                    <Text style={styles.wideOrderButtonLabel}>
                      Buy
                    </Text>
                  </Pressable>

                </View>

              </View>
            )}

          </View>
        </View>
      </InAppModalOverlay>

      <AlertFormModal
        visible={alertModalVisible}
        onClose={handleAlertModalClose}
        asset={asset}
        alert={editingAlert}
      />

      <OrderTicketModal
        visible={orderModalVisible}
        onClose={handleOrderModalClose}
        asset={asset}
        side={orderSide}
      />
    </>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.20)",
  },

  modal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  swipeArea: {
    flex: 1,
  },

  fullscreenOverlay: {
    backgroundColor: "#0A0A0A",
  },

  fullscreenModal: {
    height: "100%",
    width: "100%",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: "#0A0A0A",
  },

  fullscreenChartContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingTop: 10,
  },

  fullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  fullscreenBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
  },

  fullscreenAsset: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },

  fullscreenAssetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    marginRight: 10,
  },

  fullscreenAssetIconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  fullscreenAssetName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  fullscreenAssetSymbol: {
    color: "#8B949E",
    fontSize: 12,
    marginTop: 2,
  },

  fullscreenHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
  },

  fullscreenAlertDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#8A8A8A",
  },

  fullscreenPriceSection: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
  },

  fullscreenPrice: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "600",
  },

  fullscreenChange: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  // Reduced from flex:1/minHeight:240 to a fixed, smaller height so the
  // fullscreen chart container takes up noticeably less vertical space.
  fullscreenChart: {
    flex:1,
    justifyContent: "center",
    backgroundColor: "#071019",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#182630",
    paddingVertical: 8,
  },

  fullscreenChartText: {
    color: "#8B949E",
    fontSize: 14,
    textAlign: "center",
  },

  // Floats on top of the chart, pinned to its bottom-right corner.
  // `fullscreenChart` is a normal View, so its default position
  // ("relative") is what this absolute child anchors against.
  fullscreenCollapseButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 26, 36, 0.85)",
    borderWidth: 1,
    borderColor: "#262626",
  },

  // Single row: Sell + Buy + chart-type/timeframe picker, all as
  // siblings sharing one baseline directly above the nav bar.
  fullscreenControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#0A0A0A",
  },

  // The picker is now the smaller, fixed-width element in the row
  // (previously it was `flex: 1` and the order buttons were fixed-width -
  // this swaps that relationship).
  fullscreenReelsWrapperCompact: {
    width: 120,
  },

  // Buy/Sell now take the flexible/larger share of the row's width.
  wideOrderButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  wideOrderButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  handle: {
    width: 64,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 10,
  },

  assetHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  assetIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  assetIconText: {
    fontSize: 40,
  },

  titleContainer: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  assetName: {
    color: "#111111",
    fontSize: 21,
    fontWeight: "600",
    flexShrink: 1,
  },

  dropdownIcon: {
    marginLeft: 7,
  },

  assetPair: {
    color: "#777777",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 3,
  },

  moreButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  headerAlertDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8A8A8A",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  priceSection: {
    marginTop: 8,
    marginBottom: 5,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  price: {
    color: "#111111",
    fontSize: 46,
    fontWeight: "500",
    letterSpacing: -1.5,
  },

  currency: {
    color: "#222222",
    fontSize: 17,
    fontWeight: "500",
    marginLeft: 8,
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  change: {
    fontSize: 17,
    fontWeight: "600",
  },

  today: {
    color: "#777777",
    fontSize: 15,
    marginLeft: 9,
  },

  swipeHint: {
    color: "#9AA1A9",
    fontSize: 11,
    marginTop: 8,
  },

  chartSection: {
    marginTop: 8,
  },

  // Height is set inline per-render from `chartBodyHeight`, computed
  // from the window-derived sheet height minus the real measured
  // heights of the handle/header, price block, timeframe row and
  // Buy/Sell row - see the calculation above.
  chartBody: {
    alignItems: "center",
    justifyContent: "center",
  },

  chartText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },

  /* Timeframe strip, under the chart - top 6 ranges PLUS the expand
     button, all as siblings in ONE row so they sit on the same
     horizontal line. flexWrap is explicitly "nowrap" so this row can
     never break onto two lines, whatever the container width. The
     pills stretch (flex: 1 each) to fill the space left after the
     fixed-size expand button. Sizing (height/padding/font) comes from
     getTimeframeSizing() based on the measured container width.
     marginTop/paddingVertical trimmed to tighten the row against the
     chart above it. */
  timeframeRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginTop: 6,
  },

  timeframePill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  timeframePillActive: {
    backgroundColor: "#111111",
    borderColor: "#111111",
  },

  timeframePillText: {
    color: "#555555",
    fontWeight: "600",
  },

  timeframePillTextActive: {
    color: "#FFFFFF",
  },

  controlButton: {
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  orderButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    marginBottom: 16,
  },

  orderButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  sellButton: {
    backgroundColor: "#8A8A8A",
  },

  buyButton: {
    backgroundColor: "#F5F5F5",
  },

  orderButtonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  orderButtonPrice: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.85,
    marginTop: 2,
  },
});
