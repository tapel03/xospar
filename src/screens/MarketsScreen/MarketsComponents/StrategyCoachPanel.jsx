import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { sendChatMessage } from "../../../services/api/freeAiService";
import { useStrategyAlerts } from "../../../hooks/useStrategyAlerts";

export default function StrategyCoachPanel({
  asset,
  candles = [],
}) {
  const [strategyText, setStrategyText] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Once the user's strategy has been analyzed, they can turn this on to
  // have MARKET AI watch this asset's live candles and automatically
  // raise an alert the moment a relevant pattern shows up (resistance/
  // support break, bullish/bearish engulfing, etc) - see
  // useStrategyAlerts / technicalPatterns.js.
  const [liveAlertsEnabled, setLiveAlertsEnabled] = useState(false);

  const hasStrategy = Boolean(analysis);

  useStrategyAlerts({
    asset,
    candles,
    enabled: liveAlertsEnabled && hasStrategy,
  });

  // Turning live alerts back off whenever the strategy analysis is
  // cleared (or the asset changes) avoids silently monitoring an asset
  // the user never asked to be alerted on.
  useEffect(() => {
    setLiveAlertsEnabled(false);
  }, [asset?.symbol]);

  // The recorder is managed by Expo.
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const recorderState = useAudioRecorderState(recorder);

  /*
   * Ask for microphone permission once when this component loads.
   */
  useEffect(() => {
    async function prepareAudio() {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        console.log("Microphone permission was denied.");
        return;
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    }

    prepareAudio();
  }, []);

  /*
   * Pick a document such as:
   * PDF, TXT, DOC, DOCX, etc.
   */
  const handlePickDocument = async () => {
    try {
      const result =
        await DocumentPicker.getDocumentAsync({
          type: "*/*",
          copyToCacheDirectory: true,
          multiple: false,
        });

      if (result.canceled) {
        return;
      }

      const file = result.assets?.[0];

      if (!file) {
        return;
      }

      setAttachment({
        type: "document",
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
      });
    } catch (error) {
      Alert.alert(
        "Document error",
        "The document could not be selected."
      );
    }
  };

  /*
   * Pick an image containing a trading setup,
   * chart screenshot, handwritten rules, etc.
   */
  const handlePickImage = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      const image = result.assets?.[0];

      if (!image) {
        return;
      }

      setAttachment({
        type: "image",
        name: image.fileName || "Trading strategy image",
        uri: image.uri,
        mimeType: image.mimeType || "image/jpeg",
      });
    } catch (error) {
      Alert.alert(
        "Image error",
        "The image could not be selected."
      );
    }
  };

  /*
   * Start a WhatsApp-style voice recording.
   */
  const startRecording = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (error) {
      Alert.alert(
        "Recording error",
        "The voice recording could not be started."
      );
    }
  };

  /*
   * Stop the recording and keep the audio file attached
   * to the current strategy.
   */
  const stopRecording = async () => {
    try {
      await recorder.stop();

      if (recorder.uri) {
        setAttachment({
          type: "audio",
          name: "Trading strategy voice note",
          uri: recorder.uri,
          mimeType: "audio/m4a",
        });
      }
    } catch (error) {
      Alert.alert(
        "Recording error",
        "The recording could not be saved."
      );
    }
  };

  /*
   * Remove the current attachment.
   */
  const removeAttachment = () => {
    setAttachment(null);
  };

  /*
   * This sends the written strategy to the existing AI service.
   *
   * The prompt specifically tells the AI to treat the user's own
   * rules as the authority when judging future trades.
   */
  const handleAnalyzeStrategy = async () => {
    if (!strategyText.trim() && !attachment) {
      Alert.alert(
        "Add your strategy",
        "Write your trading rules or attach a strategy file first."
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    const strategyContent = strategyText.trim()
      ? strategyText.trim()
      : "The strategy was supplied as an attachment. The attachment must be converted into text before its contents can be analyzed.";

    const recentCandles = candles
      .slice(-20)
      .map((candle) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

    const prompt = `
You are MARKET AI acting as a personal trading-rules coach.

The user's objective is NOT for you to invent a new strategy.
You must judge decisions against the user's OWN trading rules.

ASSET:
${asset?.symbol || "Unknown"}

USER'S TRADING PLAN:
${strategyContent}

ATTACHMENT:
${
  attachment
    ? `${attachment.type}: ${attachment.name}`
    : "None"
}

RECENT MARKET DATA:
${JSON.stringify(recentCandles)}

Your job is to:

1. Identify the user's rules.
2. Organize the rules into clear conditions.
3. Identify what would qualify as a valid setup.
4. Identify what would violate the user's rules.
5. When a trade is described later, compare it against these exact rules.
6. Clearly say:
   - RULE FOLLOWED
   - RULE BROKEN
   - UNCLEAR / NOT ENOUGH INFORMATION
7. Never silently change the user's rules.
8. Do not tell the user that a trade is good merely because it may make money.
9. If information is missing, say what is missing.

For the current strategy, provide:
- Strategy summary
- Entry rules
- Stop-loss rules
- Take-profit rules
- Risk-management rules
- Conditions where NO trade should be taken
- What would constitute breaking the user's own plan
`;

    try {
      const response = await sendChatMessage({
        messages: [
          {
            role: "user",
            text: prompt,
          },
        ],
      });

      setAnalysis(response);
    } catch (error) {
      setAnalysis(
        "I couldn't analyze the strategy right now. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* =========================
          SECTION HEADER
      ========================== */}

      <View style={styles.sectionHeader}>

        <View style={styles.aiIcon}>
          <Ionicons
            name="sparkles"
            size={18}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Trading Strategy Coach
          </Text>

          <Text style={styles.subtitle}>
            Teach MARKET AI your rules
          </Text>
        </View>

      </View>

      {/* =========================
          EXPLANATION
      ========================== */}

      <Text style={styles.description}>
        Write your trading plan, upload it, attach a
        chart image, or record your strategy using your
        voice. MARKET AI will use your rules when
        reviewing your trading decisions.
      </Text>

      {/* =========================
          STRATEGY TEXT
      ========================== */}

      <TextInput
        value={strategyText}
        onChangeText={setStrategyText}
        placeholder={
          "Example:\n\nI only enter after a breakout and retest...\nRisk no more than 1%...\nDo not trade after two consecutive losses..."
        }
        placeholderTextColor="#6F7882"
        multiline
        textAlignVertical="top"
        style={styles.strategyInput}
      />

      {/* =========================
          ATTACHMENT
      ========================== */}

      {attachment && (
        <View style={styles.attachmentCard}>

          {attachment.type === "image" ? (
            <Image
              source={{ uri: attachment.uri }}
              style={styles.attachmentImage}
            />
          ) : (
            <View style={styles.attachmentIcon}>
              <Ionicons
                name={
                  attachment.type === "audio"
                    ? "mic"
                    : "document-text"
                }
                size={22}
                color="#FFFFFF"
              />
            </View>
          )}

          <View style={styles.attachmentInfo}>
            <Text
              style={styles.attachmentName}
              numberOfLines={2}
            >
              {attachment.name}
            </Text>

            <Text style={styles.attachmentType}>
              {attachment.type === "audio"
                ? "Voice recording"
                : attachment.type === "image"
                ? "Image"
                : "Document"}
            </Text>
          </View>

          <Pressable
            onPress={removeAttachment}
            hitSlop={10}
          >
            <Ionicons
              name="close-circle"
              size={22}
              color="#8B949E"
            />
          </Pressable>

        </View>
      )}

      {/* =========================
          ACTION BUTTONS
      ========================== */}

      <View style={styles.actionRow}>

        {/* DOCUMENT */}
        <Pressable
          style={styles.actionButton}
          onPress={handlePickDocument}
        >
          <Ionicons
            name="document-attach-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.actionText}>
            File
          </Text>
        </Pressable>

        {/* IMAGE */}
        <Pressable
          style={styles.actionButton}
          onPress={handlePickImage}
        >
          <Ionicons
            name="image-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.actionText}>
            Image
          </Text>
        </Pressable>

        {/* VOICE */}
        <Pressable
          style={[
            styles.voiceButton,
            recorderState.isRecording &&
              styles.voiceButtonRecording,
          ]}
          onPress={
            recorderState.isRecording
              ? stopRecording
              : startRecording
          }
        >
          <Ionicons
            name={
              recorderState.isRecording
                ? "stop"
                : "mic-outline"
            }
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.actionText}>
            {recorderState.isRecording
              ? "Stop"
              : "Voice"}
          </Text>
        </Pressable>

      </View>

      {recorderState.isRecording && (
        <View style={styles.recordingStatus}>

          <View style={styles.recordingDot} />

          <Text style={styles.recordingText}>
            Recording your trading strategy...
          </Text>

        </View>
      )}

      {/* =========================
          ANALYZE BUTTON
      ========================== */}

      <Pressable
        style={[
          styles.analyzeButton,
          isAnalyzing &&
            styles.analyzeButtonDisabled,
        ]}
        onPress={handleAnalyzeStrategy}
        disabled={isAnalyzing}
      >
        <Ionicons
          name="sparkles"
          size={18}
          color="#FFFFFF"
        />

        <Text style={styles.analyzeText}>
          {isAnalyzing
            ? "Analyzing strategy..."
            : "Analyze My Trading Plan"}
        </Text>
      </Pressable>

      {/* =========================
          AI RESULT
      ========================== */}

      {!!analysis && (
        <View style={styles.analysisCard}>

          <View style={styles.analysisHeader}>

            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#4ADE80"
            />

            <Text style={styles.analysisTitle}>
              Your Trading Rules
            </Text>

          </View>

          <Text style={styles.analysisText}>
            {analysis}
          </Text>

        </View>
      )}

      {/* =========================
          LIVE PATTERN ALERTS

          Only offered once a strategy has actually been analyzed -
          this is the "once all strategies are inserted into the
          system" trigger: from here on, MARKET AI watches this
          asset's live candles and raises an alert itself (resistance/
          support breaks, bullish/bearish engulfing candles, etc)
          instead of waiting for the user to notice.
      ========================== */}

      {hasStrategy && (
        <View style={styles.liveAlertsRow}>

          <View style={styles.liveAlertsTextContainer}>
            <View style={styles.liveAlertsTitleRow}>
              <Ionicons
                name="notifications-outline"
                size={16}
                color="#FFFFFF"
              />

              <Text style={styles.liveAlertsTitle}>
                Live Pattern Alerts
              </Text>
            </View>

            <Text style={styles.liveAlertsSubtitle}>
              {liveAlertsEnabled
                ? `Watching ${asset?.symbol || "this asset"} for resistance/support breaks and engulfing candles.`
                : `Get an alert the moment ${asset?.symbol || "this asset"} breaks a level or forms an engulfing candle.`}
            </Text>
          </View>

          <Switch
            value={liveAlertsEnabled}
            onValueChange={setLiveAlertsEnabled}
            trackColor={{ false: "#263441", true: "#3A7BD5" }}
            thumbColor="#FFFFFF"
          />

        </View>
      )}

      {/* =========================
          FUTURE TRADE CHECK
      ========================== */}

      <View style={styles.ruleReminder}>

        <Ionicons
          name="alert-circle-outline"
          size={18}
          color="#F2C94C"
        />

        <Text style={styles.ruleReminderText}>
          MARKET AI should judge your future trades
          against your own plan — not replace it with
          another strategy.
        </Text>

      </View>

    </View>
  );
}

// Styles

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#0B1219",
    borderWidth: 1,
    borderColor: "#262626",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  subtitle: {
    color: "#7E8994",
    fontSize: 12,
    marginTop: 3,
  },

  description: {
    color: "#8B949E",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 13,
    marginBottom: 14,
  },

  strategyInput: {
    minHeight: 145,
    borderRadius: 14,
    backgroundColor: "#080E14",
    borderWidth: 1,
    borderColor: "#262626",
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },

  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#101922",
    borderWidth: 1,
    borderColor: "#262626",
  },

  attachmentImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },

  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A2A38",
    marginRight: 10,
  },

  attachmentInfo: {
    flex: 1,
  },

  attachmentName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  attachmentType: {
    color: "#78838D",
    fontSize: 11,
    marginTop: 3,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  actionButton: {
    flex: 1,
    minHeight: 44,
    marginRight: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#101922",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  voiceButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#101922",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  voiceButtonRecording: {
    backgroundColor: "#5A1F25",
    borderColor: "#8B3139",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  recordingStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 4,
  },

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8A8A8A",
    marginRight: 7,
  },

  recordingText: {
    color: "#FF8A8E",
    fontSize: 12,
  },

  analyzeButton: {
    height: 50,
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  analyzeButtonDisabled: {
    opacity: 0.6,
  },

  analyzeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  analysisCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#21412F",
  },

  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  analysisTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  analysisText: {
    color: "#C5CDD4",
    fontSize: 13,
    lineHeight: 20,
  },

  liveAlertsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#1E3A4C",
  },

  liveAlertsTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  liveAlertsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  liveAlertsTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  liveAlertsSubtitle: {
    color: "#8B949E",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },

  ruleReminder: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#19170F",
    borderWidth: 1,
    borderColor: "#38331E",
  },

  ruleReminderText: {
    flex: 1,
    color: "#A9A294",
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },
});
