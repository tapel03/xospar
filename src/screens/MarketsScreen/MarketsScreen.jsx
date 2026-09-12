
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
import { useWatchlist } from "../../context/WatchlistContext";

export default function MarketsScreen() {
  const [selectedAsset, setSelectedAsset] = useState(null);

  // watchlistAssets is shared across the whole Markets stack, so anything
  // bookmarked from a category detail screen (Crypto/Forex/Indices/Stocks)
  // shows up here automatically.
  const { watchlistAssets, isBookmarked, toggleBookmark } = useWatchlist();

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
            Watch List
          </Text>
        </View>

        {watchlistAssets.length === 0 && (
          <Text style={styles.emptyText}>
            No assets in your watch list yet. Tap the bookmark icon on any
            asset to add it here.
          </Text>
        )}

        {watchlistAssets.map((asset) => (
          <MarketRow
            key={asset.symbol}
            asset={asset}
            bookmarked={isBookmarked(asset.symbol)}
            onToggleBookmark={() => toggleBookmark(asset)}
            onPress={() => setSelectedAsset(asset)}
          />
        ))}

        <LongShortRatio />

      </ScrollView>

      <AssetDetailModal
        asset={selectedAsset}
        visible={selectedAsset !== null}
        onClose={() => setSelectedAsset(null)}
        bookmarked={selectedAsset ? isBookmarked(selectedAsset.symbol) : false}
        onToggleBookmark={() =>
          selectedAsset && toggleBookmark(selectedAsset)
        }
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

  emptyText: {
    color: "#8B949E",
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});

