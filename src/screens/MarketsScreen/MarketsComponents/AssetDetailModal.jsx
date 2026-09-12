import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

export default function AssetDetailModal({
  asset,
  visible,
  onClose,
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

              <Pressable style={styles.iconButton}>
                <Ionicons
                  name="star-outline"
                  size={27}
                  color="#FFFFFF"
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
            ========================== */}
            <View style={styles.infoCard}>

              <Text style={styles.infoTitle}>
                Market Information
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Asset
                </Text>

                <Text style={styles.infoValue}>
                  {asset.name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Pair
                </Text>

                <Text style={styles.infoValue}>
                  {asset.pair}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Allocation
                </Text>

                <Text style={styles.infoValue}>
                  {asset.allocation}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Market
                </Text>

                <Text style={styles.infoValue}>
                  Crypto
                </Text>
              </View>

            </View>

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
    height: "85%",
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
    height: 230,
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

  infoCard: {
    backgroundColor: "#0D151D",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 14,
    paddingHorizontal: 20,
    marginBottom: 22,
  },

  infoTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  infoRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  infoLabel: {
    color: "#858E97",
    fontSize: 14,
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

