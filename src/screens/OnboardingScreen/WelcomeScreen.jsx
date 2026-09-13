import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";

export default function WelcomeScreen({ navigation }) {
  const { completeOnboarding } = useAuth();

  return (
    <View style={styles.container}>

      <View style={styles.iconCircle}>
        <Ionicons name="trending-up" size={40} color="#3A7BD5" />
      </View>

      <Text style={styles.title}>Welcome to MARKET</Text>

      <Text style={styles.body}>
        Build your trading system.{"\n"}
        Follow your rules.{"\n"}
        Learn from every trade.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate("OnboardingQuestions")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>

      {/* Makes it clear the user doesn't have to complete setup now -
          this drops them straight into the main app. */}
      <Pressable style={styles.skipButton} onPress={completeOnboarding}>
        <Text style={styles.skipText}>Skip setup</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },

  body: {
    color: "#8B949E",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 40,
  },

  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  skipButton: {
    marginTop: 18,
    paddingVertical: 8,
  },

  skipText: {
    color: "#8B949E",
    fontSize: 14,
    fontWeight: "600",
  },
});