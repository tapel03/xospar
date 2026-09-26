import { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import HomeHeader from "./HomeComponets/HomeHeader";
import GlobalMarketMood from "./HomeComponets/GlobalMarketMood";
import TopStoriesCard from "./HomeComponets/TopStoriesCard";
import RecentMarketImpact from "./HomeComponets/RecentMarketImpact";
import MarketMapCard from "./HomeComponets/MarketMapCard";
import QuickTools from "./HomeComponets/QuickTools";
import MarketPriceList from "./HomeComponets/MarketPriceList";
import AIChatFAB from "./HomeComponets/AIChatFAB";

import { useMarketNews } from "../../hooks/useMarketNews";
import { computeMarketMood } from "../../utils/marketMood";

export default function HomeScreen({ navigation }) {
  const {
    stories,
    loading,
    refreshing,
  } = useMarketNews();

  // Derived live from the same news feed TopStoriesCard uses - no extra
  // request, just a client-side read on current global risk sentiment.
  const marketMood = useMemo(() => computeMarketMood(stories), [stories]);

  // -----------------------------------------
  // HEADER BUTTONS
  // -----------------------------------------

  // Bell -> Alerts tab
  const openAlerts = () => {
    navigation.getParent()?.navigate("Alerts");
  };

  // Profile avatar -> Profile inside More
  const openProfile = () => {
    navigation
      .getParent()
      ?.navigate("More", {
        screen: "Profile",
      });
  };

  // Search icon
  //
  // This is kept as your existing navigation target.
  // The Search screen can be connected to the Home navigator
  // when that screen is available.
  const openSearch = () => {
    navigation.navigate("Search");
  };

  // -----------------------------------------
  // GLOBAL MARKET MOOD
  // -----------------------------------------

  // Opens the Global Events screen. Triggered only by the button at
  // the bottom of the GlobalMarketMood card, not by tapping the card.
  const openGlobalEvents = () => {
    navigation.navigate("GlobalEvents");
  };

  // -----------------------------------------
  // QUICK TOOLS
  // -----------------------------------------

  // Opens the selected calculator/tool.
  const openQuickTool = (tool) => {
    navigation.navigate("QuickTool", {
      tool,
    });
  };

  // -----------------------------------------
  // AI CHAT
  // -----------------------------------------

  // Floating action button -> full MARKET AI chat screen.
  const openChat = () => {
    navigation.navigate("Chat");
  };

  return (
    <View style={styles.container}>

      {/* -----------------------------------------
          HOME HEADER
          ----------------------------------------- */}

      <HomeHeader
        name="John"
        onPressAvatar={openProfile}
        onPressBell={openAlerts}
        onPressSearch={openSearch}
      />

      {/* -----------------------------------------
          HOME CONTENT
          ----------------------------------------- */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* -----------------------------------------
            TOP STORIES
            ----------------------------------------- */}

        <TopStoriesCard
          navigation={navigation}
          stories={stories}
          loading={loading}
          refreshing={refreshing}
        />



        {/* -----------------------------------------
            GLOBAL MARKET MOOD

            No longer wrapped in a Pressable - the card itself is
            static. Navigation into Global Events happens through the
            "View Global Events" button rendered at the bottom of the
            card (see onPressDetails).
            ----------------------------------------- */}

        <GlobalMarketMood
          mood={marketMood?.mood}
          description={marketMood?.description}
          metrics={marketMood?.metrics}
          loading={loading && !marketMood}
          onPressDetails={openGlobalEvents}
        />

        {/* -----------------------------------------
            QUICK TOOLS
            ----------------------------------------- */}

        <QuickTools
          onSelectTool={openQuickTool}
        />

        {/* -----------------------------------------
            MARKET MAP
            ----------------------------------------- */}



        {/* -----------------------------------------
            RECENT MARKET IMPACT
            ----------------------------------------- */}

        {/* -----------------------------------------
            MARKET PRICE LIST
            ----------------------------------------- */}

        <MarketPriceList />

      </ScrollView>

      {/* -----------------------------------------
          FLOATING AI CHAT BUTTON

          Sits outside the ScrollView so it stays fixed in place while
          the page scrolls, above the bottom tab bar.
          ----------------------------------------- */}

      <AIChatFAB onPress={openChat} />

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

    // Keeps the Home cards separated vertically.
    gap: 14,
  },
});