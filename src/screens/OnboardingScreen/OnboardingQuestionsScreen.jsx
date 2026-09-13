import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useAuth } from "../../context/AuthContext";

const QUESTIONS = [
  {
    id: "experience",
    question: "How would you describe your trading experience?",
    options: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "markets",
    question: "Which markets are you most interested in?",
    options: ["Crypto", "Forex", "Stocks", "Indices"],
  },
  {
    id: "goal",
    question: "What's your main goal?",
    options: ["Learn the basics", "Grow a portfolio", "Day trade actively"],
  },
];

export default function OnboardingQuestionsScreen({ navigation }) {
  const { saveOnboardingAnswers } = useAuth();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const question = QUESTIONS[step];
  const isLastQuestion = step === QUESTIONS.length - 1;

  const selectOption = (option) => {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const advance = async () => {
    if (isLastQuestion) {
      await saveOnboardingAnswers(answers);
      navigation.navigate("Completion");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const skip = async () => {
    // Skipping discards any selection made on the current question
    // before moving on, so it behaves differently from "Next".
    const { [question.id]: _omit, ...rest } = answers;
    setAnswers(rest);

    if (isLastQuestion) {
      await saveOnboardingAnswers(rest);
      navigation.navigate("Completion");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const selected = answers[question.id];

  return (
    <View style={styles.container}>
      <View style={styles.progressRow}>
        {QUESTIONS.map((q, index) => (
          <View
            key={q.id}
            style={[
              styles.progressDot,
              index === step && styles.progressDotActive,
              index < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.options}>
        {question.options.map((option) => {
          const isSelected = selected === option;

          return (
            <Pressable
              key={option}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => selectOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={advance}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>
          {isLastQuestion ? "Finish" : "Next"}
        </Text>
      </Pressable>

      <Pressable style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },

  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1C2630",
  },

  progressDotActive: {
    backgroundColor: "#3A7BD5",
  },

  progressDotDone: {
    backgroundColor: "#3A7BD5",
    opacity: 0.5,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 28,
  },

  options: {
    gap: 12,
  },

  option: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1C2630",
    backgroundColor: "#101820",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  optionSelected: {
    borderColor: "#3A7BD5",
    backgroundColor: "#16202B",
  },

  optionText: {
    color: "#8B949E",
    fontSize: 15,
    fontWeight: "600",
  },

  optionTextSelected: {
    color: "#FFFFFF",
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  skipButton: {
    marginTop: 18,
    alignItems: "center",
  },

  skipText: {
    color: "#8B949E",
    fontSize: 14,
    fontWeight: "600",
  },
});