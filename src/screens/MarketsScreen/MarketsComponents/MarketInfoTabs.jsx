import { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAIChat } from "../../../hooks/useAIChat";

const TABS = [
  { key: "orderbook", label: "Order Book" },
  { key: "history", label: "History" },
  { key: "notes", label: "Notes" },
  { key: "info", label: "Info" },
  { key: "ai", label: "AI Assistant" },
];

// ============================================================================
// Fixed height for the tab content area. Edit THIS ONE NUMBER to resize the
// container - every tab (Order Book, History, Notes, Info, AI Assistant)
// shares this same height, so they'll never jump around when switching.
// ============================================================================
const CONTENT_HEIGHT = 250;

// How far (in px) a horizontal drag needs to travel before it's treated as
// a page swipe rather than a tap/scroll gesture.
const SWIPE_THRESHOLD = 50;

// =============================================================
// TAB CONTENT
// These are placeholders - swap the body of each component out
// for real content later. Every one receives the `asset` prop.
// Each is wrapped in its own ScrollView so content taller than
// CONTENT_HEIGHT scrolls instead of overflowing/clipping.
// =============================================================

const ORDER_BOOK_LEVEL_COUNT = 5;

// Real exchanges stream full order-book depth over a separate socket
// channel this app doesn't have access to on the free tiers it's wired
// to - so instead of showing the same fixed forex-style numbers for
// every asset, this builds a plausible-looking book of levels spaced out
// around the asset's *actual* current price, using a per-symbol seeded
// pattern so it stays stable (doesn't jump around) between renders.
function seedFromSymbol(symbol = "") {
  let seed = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    seed = (seed * 31 + symbol.charCodeAt(i)) % 100000;
  }
  return seed || 1;
}

function buildOrderBookLevels(midPrice, symbol) {
  if (!Number.isFinite(midPrice) || midPrice <= 0) {
    return { bids: [], asks: [] };
  }

  const decimals = midPrice < 10 ? 4 : midPrice < 1000 ? 2 : 2;
  const step = midPrice < 10 ? midPrice * 0.0006 : midPrice * 0.0004;
  const seed = seedFromSymbol(symbol);

  const bids = Array.from({ length: ORDER_BOOK_LEVEL_COUNT }, (_, i) => {
    const price = midPrice - step * (i + 1);
    const sizeSeed = (seed * (i + 3)) % 9000;
    return {
      price: price.toFixed(decimals),
      size: (1000 + sizeSeed).toLocaleString(),
    };
  });

  const asks = Array.from({ length: ORDER_BOOK_LEVEL_COUNT }, (_, i) => {
    const price = midPrice + step * (i + 1);
    const sizeSeed = (seed * (i + 5)) % 9000;
    return {
      price: price.toFixed(decimals),
      size: (900 + sizeSeed).toLocaleString(),
    };
  });

  return { bids, asks };
}

function OrderBookTab({ asset }) {
  const midPrice = typeof asset?.price === "number" ? asset.price : parseFloat(asset?.price);
  const { bids, asks } = useMemo(
    () => buildOrderBookLevels(midPrice, asset?.symbol),
    [midPrice, asset?.symbol]
  );

  if (!bids.length) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.placeholderScrollContent}
      >
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Order book isn't available for {asset?.symbol || "this asset"} yet.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      <View style={styles.orderBookHeader}>
        <Text style={[styles.orderBookHeaderText, styles.orderBookBidText]}>
          Bid
        </Text>

        <Text style={styles.orderBookHeaderText}>
          {asset?.symbol || "Price"}
        </Text>

        <Text style={[styles.orderBookHeaderText, styles.orderBookAskText]}>
          Ask
        </Text>
      </View>

      <View style={styles.orderBookColumns}>

        {/* BID SIDE */}
        <View style={styles.orderBookColumn}>
          {bids.map((level, index) => (
            <View key={`bid-${index}`} style={styles.orderBookRow}>
              <Text style={styles.orderBookSize}>{level.size}</Text>
              <Text style={[styles.orderBookPrice, styles.orderBookBidText]}>
                {level.price}
              </Text>
            </View>
          ))}
        </View>

        {/* ASK SIDE */}
        <View style={styles.orderBookColumn}>
          {asks.map((level, index) => (
            <View key={`ask-${index}`} style={styles.orderBookRow}>
              <Text style={[styles.orderBookPrice, styles.orderBookAskText]}>
                {level.price}
              </Text>
              <Text style={styles.orderBookSize}>{level.size}</Text>
            </View>
          ))}
        </View>

      </View>

    </ScrollView>
  );
}

function formatHistoryTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Real candle-by-candle history for the asset currently being viewed,
// newest first - built from the exact same `candles` the chart above is
// plotting (see useAssetCandles), so this always matches what's on screen.
function HistoryTab({ candles = [] }) {
  const rows = useMemo(() => candles.slice().reverse().slice(0, 40), [candles]);

  if (!rows.length) {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.placeholderScrollContent}
      >
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Trade and price history will appear here.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const decimals = rows[0].close < 10 ? 4 : 2;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {rows.map((point, index) => {
        const prev = rows[index + 1];
        const isUp = prev ? point.close >= prev.close : point.close >= point.open;

        return (
          <View key={point.time ?? index} style={styles.historyRow}>
            <Text style={styles.historyTime}>{formatHistoryTime(point.time)}</Text>
            <Text
              style={[
                styles.historyPrice,
                isUp ? styles.orderBookBidText : styles.orderBookAskText,
              ]}
            >
              {point.close.toFixed(decimals)}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function NotesTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.placeholderScrollContent}
    >
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Add personal notes for this asset here.
        </Text>
      </View>
    </ScrollView>
  );
}

function InfoTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.placeholderScrollContent}
    >
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          General background and details for this asset will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

// The AI Assistant tab is a self-contained chat - no navigation away from
// the modal. It opens directly into the conversation, right where the
// tab content sits. The message list itself is the scrollable area here.
// Backed by the real Anthropic-powered useAIChat hook, with a system
// prompt that tells the model which asset is currently being viewed.
//
// It can also be expanded into a full-screen Modal (tap the expand icon)
// for a roomier view, with a matching collapse icon to shrink it back
// down into the tab. Both the inline and full-screen views share the
// exact same chat state (via the single useAIChat instance below), so
// expanding/collapsing never loses or resets the conversation.
function AIAssistantTab({ asset }) {
  const [message, setMessage] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const systemPrompt =
    `You are MARKET AI, embedded in a trading app. The user is currently viewing ` +
    `${asset?.symbol || "an asset"} (${asset?.pair || asset?.name || "no further context given"}). ` +
    `Answer questions about this asset's price action, sentiment, and general trading concepts ` +
    `concisely. Only reference specific prices, levels, or news if the user includes them in ` +
    `their message - you do not have live market data. Never present responses as personalized ` +
    `financial advice.`;

  const { messages, sendMessage, isSending } = useAIChat({
    systemPrompt,
    initialMessage: `Hi! Ask me anything about ${asset?.symbol || "this asset"} — price action, sentiment, or recent news.`,
  });

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    sendMessage(message);
    setMessage("");
  };

  const expand = () => setFullscreen(true);
  const collapse = () => setFullscreen(false);

  // Shared between the inline tab view and the full-screen Modal, so
  // there's a single source of truth for how messages/input render.
  const chatBody = (
    <>
      <ScrollView
        style={styles.aiMessagesScroll}
        contentContainerStyle={styles.aiMessagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((item) => {
          const isUser = item.role === "user";

          return (
            <View
              key={item.id}
              style={[
                styles.aiMessageRow,
                isUser && styles.aiMessageRowUser,
              ]}
            >
              <View
                style={[
                  styles.aiBubble,
                  isUser ? styles.aiBubbleUser : styles.aiBubbleAssistant,
                ]}
              >
                <Text style={styles.aiBubbleText}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        })}

        {isSending && (
          <View style={styles.aiMessageRow}>
            <View style={[styles.aiBubble, styles.aiBubbleAssistant]}>
              <Text style={styles.aiBubbleText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.aiInputRow}>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about this asset..."
          placeholderTextColor="#59636D"
          style={styles.aiInput}
          onSubmitEditing={handleSend}
          editable={!isSending}
        />

        <Pressable
          style={[styles.aiSendButton, isSending && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={isSending}
        >
          <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
        </Pressable>

      </View>
    </>
  );

  return (
    <View style={styles.aiTabContainer}>

      <View style={styles.aiTabHeader}>
        <Text style={styles.aiTabHeaderTitle} numberOfLines={1}>
          AI Assistant
        </Text>

        <Pressable
          style={styles.aiExpandButton}
          onPress={expand}
          hitSlop={8}
        >
          <Ionicons name="expand-outline" size={17} color="#8B949E" />
        </Pressable>
      </View>

      {chatBody}

      {/* FULL SCREEN CHAT */}
      <Modal
        visible={fullscreen}
        animationType="slide"
        onRequestClose={collapse}
      >
        <KeyboardAvoidingView
          style={styles.aiFullscreenContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.aiFullscreenHeader}>

            <View style={styles.aiFullscreenTitleRow}>
              <Ionicons name="sparkles" size={16} color="#3A7BD5" />

              <Text style={styles.aiFullscreenTitle} numberOfLines={1}>
                {asset?.symbol || "AI Assistant"}
              </Text>
            </View>

            {/* Collapse - shrinks the chat back down into the tab. */}
            <Pressable
              style={styles.aiCollapseButton}
              onPress={collapse}
              hitSlop={8}
            >
              <Ionicons name="contract-outline" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {chatBody}
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const TAB_CONTENT = {
  orderbook: OrderBookTab,
  history: HistoryTab,
  notes: NotesTab,
  info: InfoTab,
  ai: AIAssistantTab,
};

export default function MarketInfoTabs({ asset, candles = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentWidth, setContentWidth] = useState(
    Dimensions.get("window").width
  );

  // Measured x/width of every rendered tab label, used to slide
  // the highlight pill under whichever tab is active.
  const tabLayouts = useRef([]);
  const indicatorReady = useRef(false);

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = useRef(new Animated.Value(0)).current;

  // Drives the horizontal slide of the content pane. 0 = settled.
  // A full swipe/tap transition animates this from ±contentWidth back to 0.
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Tracks the live finger position during an active drag, added on top
  // of slideAnim so the content visually follows the user's finger.
  const dragX = useRef(new Animated.Value(0)).current;

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const contentWidthRef = useRef(contentWidth);
  contentWidthRef.current = contentWidth;

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

  // direction: 1 = moving to the next tab (slide in from the right),
  //           -1 = moving to the previous tab (slide in from the left)
  const goToTab = (index, direction) => {
    if (index < 0 || index >= TABS.length || index === activeIndexRef.current) {
      // Snap back to center if there's nowhere to go (e.g. swiping past the ends).
      Animated.spring(dragX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 20,
        bounciness: 8,
      }).start();
      return;
    }

    moveIndicatorTo(index);

    const width = contentWidthRef.current || 1;

    // Slide the current content fully off-screen in the swipe direction...
    Animated.timing(slideAnim, {
      toValue: -direction * width,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setActiveIndex(index);

      // ...then place the new content just off-screen on the opposite
      // side and slide it into place.
      slideAnim.setValue(direction * width);
      dragX.setValue(0);

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  const selectTab = (index) => {
    if (index === activeIndexRef.current) return;
    const direction = index > activeIndexRef.current ? 1 : -1;
    goToTab(index, direction);
  };

  // Horizontal swipe gesture on the content area itself.
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),

      onPanResponderMove: (_, gesture) => {
        dragX.setValue(gesture.dx);
      },

      onPanResponderRelease: (_, gesture) => {
        const isSwipeLeft = gesture.dx < -SWIPE_THRESHOLD;
        const isSwipeRight = gesture.dx > SWIPE_THRESHOLD;

        if (isSwipeLeft) {
          // Swiping left reveals the next tab.
          goToTab(activeIndexRef.current + 1, 1);
        } else if (isSwipeRight) {
          // Swiping right reveals the previous tab.
          goToTab(activeIndexRef.current - 1, -1);
        } else {
          // Not far enough - snap back to the current tab.
          Animated.spring(dragX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const translateX = Animated.add(slideAnim, dragX);

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
          TAB CONTENT (horizontal slide transition)
          Fixed height (CONTENT_HEIGHT above) so switching tabs never
          changes the overall size of this container. Drag left/right
          anywhere on this area to move between tabs, just like the
          tab bar does.
      ========================== */}
      <View
        style={styles.contentWrapper}
        onLayout={(event) =>
          setContentWidth(event.nativeEvent.layout.width)
        }
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <ActiveContent asset={asset} candles={candles} />
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

  // <-- Edit CONTENT_HEIGHT at the top of the file to resize this container.
  contentWrapper: {
    height: CONTENT_HEIGHT,
    padding: 20,
    overflow: "hidden",
  },

  content: {
    flex: 1,
    width: "100%",
  },

  /* Order Book */
  orderBookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  orderBookHeaderText: {
    color: "#858E97",
    fontSize: 12,
    fontWeight: "700",
  },

  orderBookColumns: {
    flexDirection: "row",
    gap: 10,
  },

  orderBookColumn: {
    flex: 1,
  },

  orderBookRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  orderBookPrice: {
    fontSize: 13,
    fontWeight: "700",
  },

  orderBookSize: {
    color: "#D5D9DF",
    fontSize: 13,
  },

  orderBookBidText: {
    color: "#4ADE80",
  },

  orderBookAskText: {
    color: "#FF5A5F",
  },

  /* History */
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  historyTime: {
    color: "#858E97",
    fontSize: 13,
  },

  historyPrice: {
    fontSize: 13,
    fontWeight: "700",
  },

  placeholderScrollContent: {
    flexGrow: 1,
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#59636D",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  /* AI Assistant (inline chat) */
  aiTabContainer: {
    flex: 1,
    marginHorizontal: -20,
    marginVertical: -20,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  aiTabHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  aiTabHeaderTitle: {
    color: "#8B949E",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
    marginRight: 8,
  },

  aiExpandButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A1016",
    borderWidth: 1,
    borderColor: "#28333F",
  },

  aiMessagesScroll: {
    flex: 1,
  },

  aiMessagesContent: {
    paddingBottom: 10,
  },

  aiMessageRow: {
    width: "100%",
    marginBottom: 10,
    alignItems: "flex-start",
  },

  aiMessageRowUser: {
    alignItems: "flex-end",
  },

  aiBubble: {
    maxWidth: "82%",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  aiBubbleAssistant: {
    backgroundColor: "#1C2630",
    borderBottomLeftRadius: 4,
  },

  aiBubbleUser: {
    backgroundColor: "#3A7BD5",
    borderBottomRightRadius: 4,
  },

  aiBubbleText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
  },

  aiInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
  },

  aiInput: {
    flex: 1,
    height: 38,
    color: "#FFFFFF",
    fontSize: 13,
    backgroundColor: "#0A1016",
    borderWidth: 1,
    borderColor: "#28333F",
    borderRadius: 19,
    paddingHorizontal: 14,
  },

  aiSendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
  },

  /* AI Assistant (full screen) */
  aiFullscreenContainer: {
    flex: 1,
    backgroundColor: "#0B1119",
  },

  aiFullscreenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  aiFullscreenTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 10,
  },

  aiFullscreenTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
  },

  // Collapse - shrinks the full-screen chat back into the tab.
  aiCollapseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C2630",
  },
});