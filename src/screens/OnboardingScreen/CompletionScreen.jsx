import { useMemo } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import { useResponsive, MAX_CONTENT_WIDTH } from "../../hooks/useResponsive";
import PageIndicator from "../../components/PageIndicator";

// Illustration shown in the card at the top of the screen.
const COMPLETION_IMAGE = require("../../../assets/completion_illustration.png");

// Card shape (width / height). Lower = taller card = more of the image
// shown. 1122 / 1402 (~0.8) is the image's own shape, which shows all of it.
const IMAGE_ASPECT_RATIO = 0.9;

const TOTAL_STEPS = 4;

// Dark theme palette (matches the auth / welcome screens).
const ACCENT = "#0A7AFF";
const ACCENT_LIGHT = "#5B9BFF";
const BG = "#000000";
const BORDER = "#262626";
const TEXT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const INACTIVE_DOT = "#3A3A3D";

export default function CompletionScreen({ route }) {
  const { completeOnboarding, onboardingAnswers } = useAuth();
  const insets = useSafeAreaInsets();
  const { sw, sh } = useResponsive();

  const answers = route?.params?.answers || onboardingAnswers || {};
  const markets = Array.isArray(answers.markets)
    ? answers.markets
    : answers.markets
      ? [answers.markets]
      : [];

  const d = useMemo(() => {
    const buttonHeight = Math.max(48, sh(48));

    return {
      frame: {
        maxWidth: MAX_CONTENT_WIDTH,
        paddingTop: insets.top + sh(8),
        paddingBottom: insets.bottom + sh(14),
        paddingHorizontal: sw(24),
      },
      stepLabel: { fontSize: sw(12) },
      pager: { marginTop: sh(14) },
      scrollContent: { paddingBottom: sh(12) },
      title: {
        marginTop: sh(24),
        fontSize: sw(28),
        lineHeight: Math.round(sw(28) * 1.15),
      },
      subtitle: {
        marginTop: sh(10),
        fontSize: sw(13),
        lineHeight: Math.round(sw(13) * 1.4),
      },
      imageCard: { marginTop: sh(20) },
      planBadge: { marginTop: sh(20) },
      planBadgeText: { fontSize: sw(11) },
      summaryFontSize: sw(13),
      summaryGap: sh(10),
      footer: { paddingTop: sh(12) },
      finishButton: { height: buttonHeight, borderRadius: buttonHeight / 2 },
      finishText: { fontSize: sw(14) },
    };
  }, [sw, sh, insets.top, insets.bottom]);

  return (
    <View style={styles.container}>
      <View style={[styles.frame, d.frame]}>
        <View style={styles.header}>
          <Text style={[styles.stepLabel, d.stepLabel]}>4 / 4</Text>
        </View>

        <PageIndicator
          total={TOTAL_STEPS}
          current={TOTAL_STEPS - 1}
          activeColor={ACCENT}
          inactiveColor={INACTIVE_DOT}
          style={d.pager}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={d.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          <Text style={[styles.title, d.title]}>You're all set!</Text>
          <Text style={[styles.subtitle, d.subtitle]}>
            Here's your personalized plan. You can always change{`\n`}these later in settings.
          </Text>

          {/* Image-only card - the image fills it edge to edge. */}
          <View style={[styles.imageCard, d.imageCard]}>
            <Image
              source={COMPLETION_IMAGE}
              style={styles.image}
              resizeMode="cover"
            />
          </View>

          {/* Plan summary - sits on the page background, outside the card. */}
          <View style={[styles.planBadge, d.planBadge]}>
            <Ionicons name="sparkles-outline" size={13} color={ACCENT_LIGHT} />
            <Text style={[styles.planBadgeText, d.planBadgeText]}>Your plan</Text>
          </View>

          <SummaryRow
            label="Experience"
            value={answers.experience || "Not selected"}
            fontSize={d.summaryFontSize}
            marginTop={d.summaryGap}
          />
          <SummaryRow
            label="Markets"
            value={markets.length ? markets.join(", ") : "Not selected"}
            fontSize={d.summaryFontSize}
            marginTop={d.summaryGap}
          />
          <SummaryRow
            label="Goal"
            value={answers.goal || "Not selected"}
            fontSize={d.summaryFontSize}
            marginTop={d.summaryGap}
          />
        </ScrollView>

        <View style={d.footer}>
          <Pressable
            style={[styles.finishButton, d.finishButton]}
            onPress={completeOnboarding}
          >
            <Text style={[styles.finishText, d.finishText]}>Finish</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SummaryRow({ label, value, fontSize, marginTop }) {
  return (
    <View style={[styles.summaryRow, { marginTop }]}>
      <Ionicons name="checkmark-circle" size={fontSize + 3} color={ACCENT_LIGHT} />
      <Text style={[styles.summaryText, { fontSize }]}>
        {label}: {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  frame: { flex: 1, width: "100%", alignSelf: "center" },

  header: { alignItems: "center", minHeight: 34, justifyContent: "center" },
  stepLabel: { fontWeight: "600", color: TEXT_MUTED },

  scroll: { flex: 1 },

  title: { fontWeight: "800", color: TEXT, letterSpacing: -0.7 },
  subtitle: { color: TEXT_MUTED },

  imageCard: {
    width: "100%",
    aspectRatio: IMAGE_ASPECT_RATIO,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  image: { width: "100%", height: "100%" },

  planBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  planBadgeText: { fontWeight: "700", color: ACCENT_LIGHT },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryText: { flex: 1, color: TEXT },

  finishButton: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: { color: "#000000", fontWeight: "700" },
});