import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { useAIChat } from "../../hooks/useAIChat";

const BG = "#000000";
const CARD = "#17171A";
const BORDER = "#262626";
const TEXT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";

// Brand accents (matches BrandMark.jsx / AuthWelcomeScreen's logo mark),
// cycled across the suggestion chips so each one picks up a different
// accent instead of all looking identical.
const ACCENTS = ["#3A7BD5", "#8F7CFF", "#FF9D7C"];

const SUGGESTIONS = [
  { icon: "flash-outline", label: "Analyze BTC trend" },
  { icon: "globe-outline", label: "Explain today's market mood" },
  { icon: "trending-up-outline", label: "What's moving Gold today?" },
  { icon: "bookmark-outline", label: "Summarize my watch list" },
];

// Small inline logo mark for the chat header - a scaled-down version of
// the triangle/circle/blob cluster used elsewhere (BrandMark.jsx,
// AuthWelcomeScreen's LogoLockup), kept local here rather than adding a
// size prop to the shared component.
function MiniLogoMark() {
  return (
    <View style={styles.logoMark}>
      <View style={styles.logoSquare} />
      <View style={styles.logoCircle} />
      <View style={styles.logoBlob} />
    </View>
  );
}

export default function ChatScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);

  const [inputText, setInputText] = useState("");
  const [voiceVisible, setVoiceVisible] = useState(false);

  const { messages, sendMessage, isSending } = useAIChat({
    initialMessage:
      "Hi! I'm MARKET AI. Ask me about markets, forex, stocks, commodities or crypto.",
  });

  // Landing hero shows until the person has actually sent something -
  // the initial assistant greeting above doesn't count.
  const hasSentMessage = messages.some((message) => message.role === "user");

  // ---------------------------------------------------------------
  // VOICE RECORDING (expo-audio) - same pattern as StrategyCoachPanel.
  // Recording works; there is no speech-to-text service wired into this
  // app yet, so a captured note is not transcribed automatically.
  // ---------------------------------------------------------------
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  useEffect(() => {
    async function prepareAudio() {
      const permission = await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    }

    prepareAudio();
  }, []);

  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!voiceVisible) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [voiceVisible, pulse]);

  const orbScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });

  const startVoice = async () => {
    setVoiceVisible(true);

    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      Alert.alert("Microphone error", "Couldn't start recording.");
      setVoiceVisible(false);
    }
  };

  const cancelVoice = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }
    } catch (error) {
      // Nothing to clean up.
    }

    setVoiceVisible(false);
  };

  const finishVoice = async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }
    } catch (error) {
      // Nothing to clean up.
    }

    setVoiceVisible(false);

    Alert.alert(
      "Voice note captured",
      "Voice-to-text isn't set up yet, so I can't turn that into a question automatically. Type it below and I'll answer."
    );

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ---------------------------------------------------------------
  // TEXT MESSAGES
  // ---------------------------------------------------------------
  const handleSendText = (text) => {
    const trimmed = (text || "").trim();

    if (!trimmed || isSending) {
      return;
    }

    sendMessage(trimmed);
    setInputText("");
  };

  const handleChipPress = (label) => {
    handleSendText(label);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Ionicons name="sparkles" size={13} color="#FFFFFF" />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const composerTrailingIcon = inputText.trim().length > 0 ? "arrow-up" : "mic";

  const handleComposerTrailingPress = () => {
    if (inputText.trim().length > 0) {
      handleSendText(inputText);
    } else {
      startVoice();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {hasSentMessage ? (
          <Pressable
            style={styles.closeChatButton}
            onPress={() => navigation.goBack()}
            hitSlop={10}
          >
            <Ionicons name="close" size={16} color={TEXT_MUTED} />
            <Text style={styles.closeChatText}>Close chat</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={10}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={TEXT} />
            </Pressable>

            <View style={styles.headerIdentity}>
              <MiniLogoMark />

              <View>
                <Text style={styles.headerTitle}>MARKET AI</Text>
                <Text style={styles.headerSubtitle}>Welcome back</Text>
              </View>
            </View>

            <View style={styles.backButton} />
          </>
        )}
      </View>

      {/* BODY */}
      {hasSentMessage ? (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
          ListFooterComponent={
            isSending ? (
              <View style={styles.messageRow}>
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                </View>
                <View style={[styles.bubble, styles.assistantBubble]}>
                  <Text style={styles.bubbleText}>Thinking...</Text>
                </View>
              </View>
            ) : null
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.heroContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heroHeading}>
            {"What do you want\nto know today?"}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {SUGGESTIONS.map((item, index) => (
              <Pressable
                key={item.label}
                style={styles.chip}
                onPress={() => handleChipPress(item.label)}
              >
                <Ionicons
                  name={item.icon}
                  size={17}
                  color={ACCENTS[index % ACCENTS.length]}
                />

                <Text style={styles.chipLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </ScrollView>
      )}

      {/* MODEL SELECTOR - landing only, matches the reference's pill
          above the composer. Non-functional for now (single model). */}
      {!hasSentMessage && (
        <Pressable
          style={styles.modelPill}
          onPress={() =>
            Alert.alert("MARKET AI", "Model switching isn't available yet.")
          }
        >
          <Ionicons name="options-outline" size={14} color={TEXT_MUTED} />
          <Text style={styles.modelPillText}>MARKET AI</Text>
          <Ionicons name="chevron-down" size={13} color={TEXT_MUTED} />
        </Pressable>
      )}

      {/* COMPOSER */}
      <View style={[styles.composerRow, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          ref={inputRef}
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            hasSentMessage
              ? "Ask AI a question"
              : "Ask AI a question or describe your idea"
          }
          placeholderTextColor={TEXT_MUTED}
          style={styles.composerInput}
          multiline
          editable={!isSending}
          onSubmitEditing={() => handleSendText(inputText)}
        />

        <Pressable
          style={[
            styles.composerTrailing,
            composerTrailingIcon === "arrow-up" && styles.composerTrailingActive,
          ]}
          onPress={handleComposerTrailingPress}
          disabled={isSending}
        >
          <Ionicons name={composerTrailingIcon} size={19} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* VOICE OVERLAY */}
      {voiceVisible && (
        <View style={styles.voiceOverlay}>
          <Pressable
            style={[styles.closeChatButton, { marginTop: insets.top + 10 }]}
            onPress={cancelVoice}
            hitSlop={10}
          >
            <Ionicons name="close" size={16} color={TEXT_MUTED} />
            <Text style={styles.closeChatText}>Close chat</Text>
          </Pressable>

          <View style={styles.orbWrapper}>
            <Animated.View
              style={[
                styles.orbRingOuter,
                { opacity: ringOpacity, transform: [{ scale: orbScale }] },
              ]}
            />
            <Animated.View
              style={[styles.orbRingInner, { transform: [{ scale: orbScale }] }]}
            />
            <View style={styles.orbCore} />
          </View>

          <Text style={styles.voiceStatus}>
            {recorderState.isRecording ? "MARKET AI is listening..." : "Getting ready..."}
          </Text>

          <Pressable style={styles.voiceStopButton} onPress={finishVoice}>
            <Ionicons name="mic" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  headerIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerTitle: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  closeChatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
  },

  closeChatText: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "600",
  },

  logoMark: {
    width: 26,
    height: 26,
  },

  logoSquare: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 13,
    height: 13,
    borderRadius: 4,
    backgroundColor: "#3A7BD5",
    transform: [{ rotate: "8deg" }],
  },

  logoCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#8F7CFF",
  },

  logoBlob: {
    position: "absolute",
    bottom: 0,
    left: 5,
    width: 13,
    height: 13,
    borderRadius: 5,
    backgroundColor: "#FF9D7C",
    transform: [{ rotate: "-6deg" }],
  },

  /* LANDING HERO */
  heroContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 18,
  },

  heroHeading: {
    color: TEXT,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 18,
  },

  chipsRow: {
    gap: 10,
    paddingRight: 20,
  },

  chip: {
    width: 132,
    minHeight: 84,
    borderRadius: 14,
    padding: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    justifyContent: "space-between",
  },

  chipLabel: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  /* MODEL PILL */
  modelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },

  modelPillText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: "600",
  },

  /* MESSAGES */
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  messageRowUser: {
    justifyContent: "flex-end",
  },

  assistantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  assistantBubble: {
    backgroundColor: CARD,
    borderBottomLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: "#3A7BD5",
    borderBottomRightRadius: 4,
  },

  bubbleText: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 20,
  },

  /* COMPOSER */
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },

  composerInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 23,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: TEXT,
    fontSize: 14,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },

  composerTrailing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8A8A8A",
  },

  composerTrailingActive: {
    backgroundColor: "#3A7BD5",
  },

  /* VOICE OVERLAY */
  voiceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  orbWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  orbRingOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#3A7BD5",
  },

  orbRingInner: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#8F7CFF",
    opacity: 0.55,
  },

  orbCore: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF9D7C",
  },

  voiceStatus: {
    color: TEXT_MUTED,
    fontSize: 13,
    marginBottom: 30,
  },

  voiceStopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A7BD5",
    marginBottom: 30,
  },
});