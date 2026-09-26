import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import { useResponsive, MAX_CONTENT_WIDTH } from "../../hooks/useResponsive";
import PageIndicator from "../../components/PageIndicator";
import ExperienceIllustration from "../../components/ExperienceIllustration";

// Illustration shown on the "Which market are you interested in?" question.
const MARKETS_IMAGE = require("../../../assets/allset_illustration.png");

// Illustration shown on the "What is your goal?" question.
const GOAL_IMAGE = require("../../../assets/goal_illustration.png");

const QUESTIONS = [
  {
    id: "experience",
    title: "Describe\nyour experience",
    subtitle:
      "Tell us a bit about what you\nalready know and what you're\nlooking to learn.",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "markets",
    title: "Which market are\nyou interested in?",
    subtitle: "You can select multiple options.",
    options: ["Crypto", "Indices", "Forex", "Stocks"],
    multiple: true,
  },
  {
    id: "goal",
    title: "What is your goal?",
    subtitle: "Select the option that best describes\nyour main objective.",
    options: [
      "Grow portfolio",
      "Learn & improve",
      "Trade more consistently",
      "Manage risk better",
      "Build a trading strategy",
      "Stay on top of market news",
    ],
  },
];

const TOTAL_STEPS = 4;

// Dark theme palette (matches the auth / welcome screens).
const ACCENT = "#0A7AFF";
const BG = "#000000";
const CARD = "#17171A";
const BORDER = "#262626";
const TEXT = "#FFFFFF";
const TEXT_MUTED = "#8E8E93";
const SELECTED_BG = "#0B1A2E";
const INACTIVE_DOT = "#3A3A3D";

export default function OnboardingQuestionsScreen({ navigation }) {
  const { saveOnboardingAnswers, completeOnboarding } = useAuth();
  const insets = useSafeAreaInsets();
  const { sw, sh } = useResponsive();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const scrollRef = useRef(null);

  const question = QUESTIONS[step];
  const isGoal = question.id === "goal";
  const isExperience = question.id === "experience";
  const isMarkets = question.id === "markets";

  const selected = answers[question.id];
  const hasSelection = Array.isArray(selected)
    ? selected.length > 0
    : Boolean(selected);

  // Each question has a different height, so always start the next one
  // from the top instead of inheriting the previous scroll position.
  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  // Every size that depends on the screen lives here, so the static
  // StyleSheet below only holds colors/borders/alignment.
  const d = useMemo(() => {
    const optionHeight = Math.max(48, sh(54));
    // Market cards (Crypto / Indices / Forex / Stocks) - made larger.
    const marketHeight = Math.max(92, sh(100));
    const illustrationHeight = sh(116);
    // The experience question gets a taller illustration (growth ladder).
    const experienceIllustrationHeight = Math.max(160, sh(176));
    // The markets image is portrait and only has 4 short cards below it,
    // so it can be tall.
    const marketsIllustrationHeight = Math.max(220, sh(270));
    // The goal question has 6 option rows below it, but the picture
    // should still read as the main visual - so the image gets more
    // height and the option rows below get shrunk down (smaller height,
    // tighter gaps) rather than the other way around.
    const goalIllustrationHeight = Math.max(210, sh(250));
    const goalOptionHeight = Math.max(38, sh(42));
    const goalOptionGap = sh(6);
    const buttonHeight = Math.max(48, sh(48));

    return {
      frame: {
        maxWidth: MAX_CONTENT_WIDTH,
        paddingTop: insets.top + sh(8),
        paddingBottom: insets.bottom + sh(14),
        paddingHorizontal: sw(24),
      },
      stepLabel: { fontSize: sw(12) },
      skipText: { fontSize: sw(12) },
      pager: { marginTop: sh(14) },
      scrollContent: { paddingBottom: sh(12) },
      copyBlock: { marginTop: sh(22) },
      title: { fontSize: sw(26), lineHeight: Math.round(sw(26) * 1.12) },
      subtitle: {
        marginTop: sh(8),
        fontSize: sw(13),
        lineHeight: Math.round(sw(13) * 1.4),
      },
      illustration: { height: illustrationHeight, marginTop: sh(18) },
      illustrationIconSize: Math.min(sw(52), illustrationHeight - 24),
      experienceIllustrationHeight,
      experienceIllustration: { marginTop: sh(18) },
      marketsIllustration: {
        height: marketsIllustrationHeight,
        marginTop: sh(14),
      },
      goalIllustration: {
        height: goalIllustrationHeight,
        marginTop: sh(10),
      },
      options: { marginTop: sh(14) },
      goalOptions: { marginTop: sh(10), gap: goalOptionGap },
      option: { minHeight: optionHeight, paddingHorizontal: sw(16) },
      goalOption: {
        minHeight: goalOptionHeight,
        paddingHorizontal: sw(16),
      },
      marketOption: {
        minHeight: marketHeight,
        paddingHorizontal: sw(18),
        paddingVertical: sh(12),
      },
      marketIcon: { fontSize: sw(26) },
      marketText: { fontSize: sw(15) },
      optionText: { fontSize: sw(13) },
      goalOptionText: { fontSize: sw(12.5) },
      footer: { paddingTop: sh(10) },
      nextButton: { height: buttonHeight, borderRadius: buttonHeight / 2 },
      nextText: { fontSize: sw(14) },
    };
  }, [sw, sh, insets.top, insets.bottom]);

  const selectOption = (option) => {
    setAnswers((prev) => {
      if (!question.multiple) {
        return { ...prev, [question.id]: option };
      }

      const current = Array.isArray(prev[question.id]) ? prev[question.id] : [];
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];

      return { ...prev, [question.id]: next };
    });
  };

  const advance = async () => {
    if (!hasSelection) return;

    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    await saveOnboardingAnswers(answers);
    navigation.navigate("Completion", { answers });
  };

  const goBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const skipAll = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.frame, d.frame]}>
        {/* HEADER - both side slots are flex:1, so the step label stays
            truly centered whatever the width of "Skip for now" is. */}
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Pressable onPress={goBack} hitSlop={12} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={TEXT} />
            </Pressable>
          </View>

          <Text style={[styles.stepLabel, d.stepLabel]}>
            {step + 1} / {TOTAL_STEPS}
          </Text>

          <View style={[styles.headerSide, styles.headerSideRight]}>
            <Pressable onPress={skipAll} hitSlop={10}>
              <Text style={[styles.skipAllText, d.skipText]}>Skip for now</Text>
            </Pressable>
          </View>
        </View>

        <PageIndicator
          total={TOTAL_STEPS}
          current={step}
          activeColor={ACCENT}
          inactiveColor={INACTIVE_DOT}
          style={d.pager}
        />

        {/* Only this middle section scrolls (on short screens), so the
            header and the Next button are always on screen. */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={d.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          <View style={d.copyBlock}>
            <Text style={[styles.title, d.title]}>{question.title}</Text>
            <Text style={[styles.subtitle, d.subtitle]}>{question.subtitle}</Text>
          </View>

          {isExperience ? (
            // Growth-ladder illustration that reacts to the selected level.
            <ExperienceIllustration
              level={selected}
              height={d.experienceIllustrationHeight}
              style={d.experienceIllustration}
            />
          ) : isMarkets ? (
            // Money-hand image for the markets question. "contain" keeps
            // the whole picture visible; its black background blends
            // into the screen.
            <View style={[styles.imageIllustration, d.marketsIllustration]}>
              <Image
                source={MARKETS_IMAGE}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          ) : isGoal ? (
            // Scooter-portrait image for the goal question. Given more
            // height than the option rows below it, so it reads as the
            // main visual on this screen.
            <View style={[styles.imageIllustration, d.goalIllustration]}>
              <Image
                source={GOAL_IMAGE}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={[styles.illustration, d.illustration]}>
              <Ionicons
                name="trending-up-outline"
                size={d.illustrationIconSize}
                color={TEXT}
              />
            </View>
          )}

          <View
            style={[
              question.multiple
                ? d.options
                : isGoal
                  ? d.goalOptions
                  : d.options,
              question.multiple ? styles.marketGrid : styles.optionColumn,
            ]}
          >
            {question.options.map((option) => {
              const isSelected = question.multiple
                ? Array.isArray(selected) && selected.includes(option)
                : selected === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => selectOption(option)}
                  style={[
                    question.multiple ? styles.marketOption : styles.option,
                    question.multiple
                      ? d.marketOption
                      : isGoal
                        ? d.goalOption
                        : d.option,
                    isGoal && styles.optionWithRadio,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  {question.multiple && (
                    <Text style={[styles.marketIcon, d.marketIcon]}>
                      {option === "Crypto"
                        ? "₿"
                        : option === "Indices"
                          ? "⌁"
                          : option === "Forex"
                            ? "$"
                            : "↗"}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.optionText,
                      isGoal ? d.goalOptionText : d.optionText,
                      question.multiple && d.marketText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>

                  {isGoal && (
                    <View
                      style={[
                        styles.radio,
                        styles.goalRadio,
                        isSelected && styles.radioSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={d.footer}>
          <Pressable
            onPress={advance}
            disabled={!hasSelection}
            style={[
              styles.nextButton,
              d.nextButton,
              !hasSelection && styles.nextButtonDisabled,
            ]}
          >
            <Text style={[styles.nextText, d.nextText]}>Next</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  // Centered column - on a tablet the content stops at MAX_CONTENT_WIDTH
  // instead of stretching edge to edge.
  frame: { flex: 1, width: "100%", alignSelf: "center" },

  header: { flexDirection: "row", alignItems: "center", minHeight: 34 },
  headerSide: { flex: 1 },
  headerSideRight: { alignItems: "flex-end" },
  backButton: { alignSelf: "flex-start" },
  stepLabel: { fontWeight: "600", color: TEXT_MUTED },
  skipAllText: { fontWeight: "600", color: TEXT_MUTED },

  scroll: { flex: 1 },

  title: { fontWeight: "800", color: TEXT, letterSpacing: -0.7 },
  subtitle: { color: TEXT_MUTED },

  illustration: {
    borderRadius: 10,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },

  // Shared by the markets and goal images - black to match each
  // image's own background, full width, centered.
  imageIllustration: {
    width: "100%",
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationImage: { width: "100%", height: "100%" },

  // Single-column answers (experience, goal)
  optionColumn: { gap: 10 },
  option: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    justifyContent: "center",
    backgroundColor: CARD,
  },
  // Leaves room for the radio so long labels never run under it.
  optionWithRadio: { paddingRight: 40 },

  // 2-column grid (markets). Two 48% cards leave a 4% gutter that
  // space-between distributes, so the pair always fits on one row no
  // matter how wide or narrow the screen is.
  marketGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  marketOption: {
    width: "48%",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: CARD,
  },
  marketIcon: { color: TEXT, marginBottom: 6 },

  optionSelected: { borderColor: ACCENT, backgroundColor: SELECTED_BG },
  optionText: { fontWeight: "600", color: TEXT },
  optionTextSelected: { color: TEXT },

  radio: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#57575B",
    alignItems: "center",
    justifyContent: "center",
  },
  // Slightly smaller radio for the goal question's compact rows.
  goalRadio: { width: 16, height: 16, borderRadius: 8, marginTop: -8 },
  radioSelected: { borderColor: ACCENT },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },

  nextButton: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextText: { color: "#000000", fontWeight: "700" },
});