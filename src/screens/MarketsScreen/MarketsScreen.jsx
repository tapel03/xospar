
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

import MarketHeader from "./MarketsComponents/MarketHeader.jsx";
import MarketOverview from "./MarketsComponents/MarketOverview.jsx";
import MarketRow from "./MarketsComponents/MarketRow.jsx";
import LongShortRatio from "./MarketsComponents/LongShortRatio.jsx";
import AssetDetailModal from "./MarketsComponents/AssetDetailModal.jsx";

const ASSETS = [
  {
    symbol: "USDT",
    name: "Tether",
    pair: "USDT / USD",
    price: "1.000",
    value: "125.322",
    allocation: "1.5%",
    change: "-0.3%",
    positive: false,
    icon: "₮",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    pair: "ETH / USD",
    price: "2,568.20",
    value: "112.325",
    allocation: "2.8%",
    change: "-5.2%",
    positive: false,
    icon: "Ξ",
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    pair: "UNI / USD",
    price: "5,234.68",
    value: "—",
    allocation: "10%",
    change: "+8.4%",
    positive: true,
    icon: "U",
  },
];

export default function MarketsScreen() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        <MarketHeader />

        <MarketOverview />

        <View style={styles.assetsHeader}>
          <Text style={styles.assetsTitle}>
            Assets
          </Text>
        </View>

        {ASSETS.map((asset) => (
          <MarketRow
            key={asset.symbol}
            asset={asset}
            onPress={() => setSelectedAsset(asset)}
          />
        ))}

        <LongShortRatio />

      </ScrollView>

      <AssetDetailModal
        asset={selectedAsset}
        visible={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    paddingBottom: 30,
  },

  assetsHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 5,
  },

  assetsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
});

