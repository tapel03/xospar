import { useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator, Text } from "react-native";

import Header from "./NewsComponents/Header";
import Tabs from "./NewsComponents/Tabs";
import NewsCard from "./NewsComponents/NewsCard";
import SentimentCard from "./NewsComponents/SentimentCard";
import MarketImpactCard from "./NewsComponents/MarketImpactCard";
import InsightCard from "./NewsComponents/InsightCard";
import PricePredictionCard from "./NewsComponents/PricePredictionCard";

import AlertFormModal from "../MarketsScreen/MarketsComponents/AlertFormModal";
import { useMarketNews } from "../../hooks/useMarketNews";

export default function NewsScreen() {
  const { stories, loading } = useMarketNews();

  // Which story (if any) the "Create Alert" bell was tapped on - passed
  // into AlertFormModal's `story` prop so the alert form knows to hide
  // the price/target/day-time fields that don't apply to a news story.
  const [alertStory, setAlertStory] = useState(null);

  const topStories = stories.slice(0, 8);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <Tabs />

      {loading && topStories.length === 0 ? (
        <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
      ) : null}

      {!loading && topStories.length === 0 ? (
        <Text style={styles.emptyText}>
          No market news available right now.
        </Text>
      ) : null}

      {/* Real market news - each card's bell creates an alert tied to
          that specific story (see storyId/storyTitle/storyUrl on the
          alert record in AlertsContext). */}
      {topStories.map((story) => (
        <NewsCard
          key={story.id}
          headline={story.title}
          source={story.source}
          timeAgo={story.time}
          onCreateAlert={() => setAlertStory(story)}
        />
      ))}

      <SentimentCard />
      <MarketImpactCard />
      <InsightCard />
      <PricePredictionCard />

      <AlertFormModal
        visible={alertStory !== null}
        onClose={() => setAlertStory(null)}
        asset={null}
        alert={null}
        story={alertStory}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  loader: {
    marginTop: 30,
  },

  emptyText: {
    color: "#8B949E",
    fontSize: 13,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
});