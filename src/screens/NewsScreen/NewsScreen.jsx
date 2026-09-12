import { ScrollView, StyleSheet } from "react-native";

import Header from "./NewsComponents/Header";
import Tabs from "./NewsComponents/Tabs";
import NewsCard from "./NewsComponents/NewsCard";
import SentimentCard from "./NewsComponents/SentimentCard";
import MarketImpactCard from "./NewsComponents/MarketImpactCard";
import InsightCard from "./NewsComponents/InsightCard";
import PricePredictionCard from "./NewsComponents/PricePredictionCard";

export default function NewsScreen() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <Tabs />
      <NewsCard />
      <SentimentCard />
      <MarketImpactCard />
      <InsightCard />
      <PricePredictionCard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },
});
