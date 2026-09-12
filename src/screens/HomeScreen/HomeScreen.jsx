import { ScrollView, StyleSheet, View } from "react-native";

import TopStoriesCard from "./HomeComponets/TopStoriesCard";
import MarketSentimentOverview from "./HomeComponets/MarketSentimentOverview";
import RecentMarketImpact from "./HomeComponets/RecentMarketImpact";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <TopStoriesCard />

        <MarketSentimentOverview />

        <RecentMarketImpact />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 30,
    gap: 14,
  },
});
