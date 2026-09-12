import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TABS = [
  { key: "market", label: "Market Information" },
  { key: "history", label: "History" },
  { key: "notes", label: "Notes" },
  { key: "info", label: "Info" },
  { key: "ai", label: "AI Assistant" },
];

// =============================================================
// TAB CONTENT
// These are placeholders - swap the body of each component out
// for real content later. Every one receives the `asset` prop.
// =============================================================

function MarketInformationTab({ asset }) {
  return (
    <View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Asset</Text>
        <Text style={styles.infoValue}>{asset?.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Pair</Text>
        <Text style={styles.infoValue}>{asset?.pair}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Allocation</Text>
        <Text style={styles.infoValue}>{asset?.allocation}</Text>
      </View>

      <View style={[styles.infoRow, styles.infoRowLast]}>
        <Text style={styles.infoLabel}>Market</Text>
        <Text style={styles.infoValue}>Crypto</Text>
      </View>
    </View>
  );
}

function HistoryTab() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        Trade and price history will appear here.
      </Text>
    </View>
  );
}

function NotesTab() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        Add personal notes for this asset here.
      </Text>
    </View>
  );
}

function InfoTab() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        General background and details for this asset will appear here.
      </Text>
    </View>
  );
}

function AIAssistantTab({ asset }) {
  const navigation = useNavigation();

  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>
        Ask the AI Assistant about this asset here.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.aiChatButton,
          pressed && styles.aiChatButtonPressed,
        ]}
        onPress={() =>
          navigation.navigate("AIAnalysis", { asset })
        }
      >
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />

        <Text style={styles.aiChatButtonText}>
          Open AI Chat
        </Text>
      </Pressable>
    </View>
  );
}

const TAB_CONTENT = {
  market: MarketInformationTab,
  history: HistoryTab,
  notes: NotesTab,
  info: InfoTab,
  ai: AIAssistantTab,
};

export default function MarketInfoTabs({ asset }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);

  // Measured x/width of every rendered tab label, used to slide
  // the highlight pill under whichever tab is active.
  const tabLayouts = useRef([]);
  const indicatorReady = useRef(false);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Drives the "peel" transition of the content pane:
  // -1 = entering from the left, 0 = settled, 1 = leaving to the right.
  const peelAnim = useRef(new Animated.Value(0)).current;

  const moveIndicatorTo = (index) => {
    const layout = tabLayouts.current[index];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x,
        useNativeDriver: false,
        speed: 18,
        bounciness: 6,
      }),
      Animated.spring(indicatorWidth, {
        toValue: layout.width,
        useNativeDriver: false,
        speed: 18,
        bounciness: 6,
      }),
    ]).start();
  };

  const handleTabLayout = (index) => (event) => {
    const { x, width } = event.nativeEvent.layout;
    tabLayouts.current[index] = { x, width };

    // Snap the indicator under the default tab as soon as we know its size.
    if (index === 0 && !indicatorReady.current) {
      indicatorX.setValue(x);
      indicatorWidth.setValue(width);
      indicatorReady.current = true;
    }
  };

  const selectTab = (index) => {
    if (index === activeIndex) return;

    const direction = index > activeIndex ? 1 : -1;

    moveIndicatorTo(index);

    // Peel the current section away...
    Animated.timing(peelAnim, {
      toValue: direction,
      duration: 190,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex(index);

      // ...then peel the new section back in from the opposite side.
      peelAnim.setValue(-direction);
      Animated.spring(peelAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 7,
      }).start();
    });
  };

  const translateX = peelAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [
      -(contentWidth || 1) * 0.5,
      0,
      (contentWidth || 1) * 0.5,
    ],
  });

  const rotateY = peelAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["10deg", "0deg", "-10deg"],
  });

  const scale = peelAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.94, 1, 0.94],
  });

  const opacity = peelAnim.interpolate({
    inputRange: [-1, -0.4, 0, 0.4, 1],
    outputRange: [0.3, 0.85, 1, 0.85, 0.3],
  });

  const ActiveContent = TAB_CONTENT[TABS[activeIndex].key];

  return (
    <View style={styles.container}>

      {/* =========================
          TAB BAR
      ========================== */}
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <Animated.View
            style={[
              styles.indicator,
              {
                width: indicatorWidth,
                transform: [{ translateX: indicatorX }],
              },
            ]}
          />

          {TABS.map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <Pressable
                key={tab.key}
                onLayout={handleTabLayout(index)}
                onPress={() => selectTab(index)}
                style={styles.tab}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* =========================
          TAB CONTENT (peel transition)
      ========================== */}
      <View
        style={styles.contentWrapper}
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [
                { perspective: 800 },
                { translateX },
                { rotateY },
                { scale },
              ],
            },
          ]}
        >
          <ActiveContent asset={asset} />
        </Animated.View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0D151D",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 14,
    marginBottom: 22,
    overflow: "hidden",
  },

  tabBarWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 14,
  },

  tab: {
    paddingVertical: 18,
    paddingHorizontal: 12,
  },

  tabLabel: {
    color: "#858E97",
    fontSize: 13,
    fontWeight: "600",
  },

  tabLabelActive: {
    color: "#FFFFFF",
  },

  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3A7BD5",
  },

  contentWrapper: {
    padding: 20,
    overflow: "hidden",
  },

  content: {
    width: "100%",
  },

  infoRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  infoRowLast: {
    borderBottomWidth: 0,
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

  placeholder: {
    paddingVertical: 30,
    alignItems: "center",
  },

  placeholderText: {
    color: "#59636D",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  aiChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A7BD5",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 18,
  },

  aiChatButtonPressed: {
    opacity: 0.75,
  },

  aiChatButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});