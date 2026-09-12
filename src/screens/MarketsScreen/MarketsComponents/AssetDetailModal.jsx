import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import MarketInfoTabs from "./MarketInfoTabs";

export default function AssetDetailModal({
  asset,
  visible,
  onClose,
  bookmarked = false,
  onToggleBookmark,
}) {
  // If there is no selected asset, don't display asset information.
  if (!asset) {
    return null;
  }

  return (
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
            <View style={styles.chartContainer}>

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

              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>
                  Market Chart
                </Text>
              </View>

            </View>

            {/* =========================
                MARKET INFORMATION
                Sliding/peel tab navigation: Market Information,
                History, Notes, Info, AI Assistant.
            ========================== */}
            <MarketInfoTabs asset={asset} />

          </ScrollView>

        </View>

      </View>
    </Modal>
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

  chartPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  chartText: {
    color: "#59636D",
    fontSize: 14,
  },
});