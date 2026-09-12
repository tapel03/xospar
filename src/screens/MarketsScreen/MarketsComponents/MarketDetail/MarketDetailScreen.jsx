import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";

import MarketTopBar from "./MarketTopBar";
import PriceChart from "./PriceChart";
import ChartVolume from "./ChartVolume";
import BuySellVolume from "./BuySellVolume";
import VolumeComparison from "./VolumeComparison";

export default function MarketDetailScreen() {
  return (
    <View style={styles.container}>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        <MarketTopBar />

        <PriceChart />

        <ChartVolume />

        <BuySellVolume />

        <VolumeComparison />

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});