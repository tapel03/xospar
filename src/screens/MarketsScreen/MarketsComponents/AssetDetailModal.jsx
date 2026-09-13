import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import MarketInfoTabs from "./MarketInfoTabs";
import AssetPriceChart from "./AssetPriceChart";
import AlertFormModal from "./AlertFormModal";
import { useAssetCandles } from "../../../hooks/useAssetCandles";
import { useAlerts } from "../../../context/AlertsContext";

export default function AssetDetailModal({
  asset,
  visible,
  onClose,
  bookmarked = false,
  onToggleBookmark,
}) {
  // "line" or "candlestick" - controls which chart style is shown.
  const [chartType, setChartType] = useState("line");
  const [chartWidth, setChartWidth] = useState(0);

  // Alert form (bell icon) state - editingAlert is set when the bell
  // opens straight into an already-due alert instead of a blank one.
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const { dueAlertForSymbol } = useAlerts();

  // asset.category is set by whichever screen opened this modal
  // (Crypto/Forex/Stocks/Indices) - see MarketCategoryDetailScreen.
  const { candles, status } = useAssetCandles(asset, asset?.category);

  // If there is no selected asset, don't display asset information.
  if (!asset) {
    return null;
  }

  // If this asset already has an alert whose time has passed, tapping the
  // bell should jump straight into it instead of opening a new blank form.
  const dueAlert = dueAlertForSymbol(asset.symbol);

  const handleAlertPress = () => {
    setEditingAlert(dueAlert || null);
    setAlertModalVisible(true);
  };

  const handleAlertModalClose = () => {
    setAlertModalVisible(false);
    setEditingAlert(null);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>

          <View style={styles.modal}>

            {/* Drag handle */}
            <View style={styles.handle} />

            {/* =========================
                HEADER
            ========================== */}
            <View style={styles.header}>

              <View style={styles.assetHeader}>

                <View style={styles.assetIcon}>
                  <Text style={styles.assetIconText}>
                    {asset.icon}
                  </Text>
                </View>

                <View>
                  <Text style={styles.assetName}>
                    {asset.symbol}
                  </Text>

                  <Text style={styles.assetPair}>
                    {asset.pair}
                  </Text>
                </View>

              </View>

              <View style={styles.headerButtons}>

                {/* Alert bell - opens the create-alert form for this asset,
                    or jumps straight into an already-due alert if one exists. */}
                <Pressable
                  style={styles.iconButton}
                  onPress={handleAlertPress}
                >
                  <Ionicons
                    name={dueAlert ? "notifications" : "notifications-outline"}
                    size={24}
                    color={dueAlert ? "#FF5A5F" : "#FFFFFF"}
                  />
                  {dueAlert && <View style={styles.alertDot} />}
                </Pressable>

                {/* Bookmark toggle - stays in sync with the Watch List
                    no matter which asset or category this modal opened from. */}
                <Pressable
                  style={styles.iconButton}
                  onPress={onToggleBookmark}
                >
                  <Ionicons
                    name={bookmarked ? "bookmark" : "bookmark-outline"}
                    size={27}
                    color={bookmarked ? "#F2C94C" : "#FFFFFF"}
                  />
                </Pressable>

                <Pressable
                  style={styles.iconButton}
                  onPress={onClose}
                >
                  <Ionicons
                    name="close"
                    size={28}
                    color="#FFFFFF"
                  />
                </Pressable>

              </View>

            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >

              {/* =========================
                  CHART AREA
              ========================== */}
              <View
                style={styles.chartContainer}
                onLayout={(event) =>
                  setChartWidth(event.nativeEvent.layout.width - 32)
                }
              >

                {/* Small line / candlestick toggle - top left of the chart */}
                <View style={styles.chartTypeToggle}>

                  <Pressable
                    style={[
                      styles.chartTypeButton,
                      chartType === "line" && styles.chartTypeButtonActive,
                    ]}
                    onPress={() => setChartType("line")}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="analytics-outline"
                      size={14}
                      color={chartType === "line" ? "#000000" : "#8A949E"}
                    />
                  </Pressable>

                  <Pressable
                    style={[
                      styles.chartTypeButton,
                      chartType === "candlestick" && styles.chartTypeButtonActive,
                    ]}
                    onPress={() => setChartType("candlestick")}
                    hitSlop={6}
                  >
                    <Ionicons
                      name="bar-chart-outline"
                      size={14}
                      color={chartType === "candlestick" ? "#000000" : "#8A949E"}
                    />
                  </Pressable>

                </View>

                <Text style={styles.chartPrice}>
                  {asset.price}
                </Text>

                <Text
                  style={[
                    styles.chartChange,
                    {
                      color: asset.positive
                        ? "#4ADE80"
                        : "#FF5A5F",
                    },
                  ]}
                >
                  {asset.positive ? "↑ " : "↓ "}
                  {asset.change}
                </Text>

                <View style={styles.chartBody}>
                  {status === "loading" && (
                    <ActivityIndicator color="#3A7BD5" />
                  )}

                  {status === "ready" && chartWidth > 0 && (
                    <AssetPriceChart
                      candles={candles}
                      mode={chartType}
                      width={chartWidth}
                    />
                  )}

                  {status === "unsupported" && (
                    <Text style={styles.chartText}>
                      Chart data isn't available for {asset.symbol} yet.
                    </Text>
                  )}

                  {status === "error" && (
                    <Text style={styles.chartText}>
                      Couldn't load chart data. Pull down to try again later.
                    </Text>
                  )}
                </View>

              </View>

              {/* =========================
                  MARKET INFORMATION
                  Sliding/peel tab navigation: Order Book, History,
                  Notes, Info, AI Assistant.
              ========================== */}
              <MarketInfoTabs asset={asset} />

            </ScrollView>

          </View>

        </View>
      </Modal>

      <AlertFormModal
        visible={alertModalVisible}
        onClose={handleAlertModalClose}
        asset={asset}
        alert={editingAlert}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },

  modal: {
    height: "95%",
    backgroundColor: "#080D12",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#28333F",
    overflow: "hidden",
  },

  handle: {
    width: 62,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#59636D",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  assetHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  assetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#27313B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  assetIconText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
  },

  assetName: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
  },

  assetPair: {
    color: "#8A949E",
    fontSize: 13,
    marginTop: 3,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },

  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#0D151D",
    borderWidth: 1,
    borderColor: "#28333F",
    justifyContent: "center",
    alignItems: "center",
  },

  alertDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF5A5F",
    borderWidth: 1,
    borderColor: "#080D12",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  chartContainer: {
    height: 510,
    backgroundColor: "#0D151D",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },

  chartTypeToggle: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    backgroundColor: "#0A1016",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 8,
    padding: 2,
    zIndex: 1,
  },

  chartTypeButton: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  chartTypeButtonActive: {
    backgroundColor: "#D9E0E4",
  },

  chartPrice: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  chartChange: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  chartBody: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  chartText: {
    color: "#59636D",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});