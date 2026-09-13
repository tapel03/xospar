import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../context/AuthContext";

export default function CompletionScreen() {
  const { completeOnboarding } = useAuth();

  return (
    <View style={styles.container}>

      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-circle" size={48} color="#4ADE80" />
      </View>

      <Text style={styles.title}>You're ready.</Text>

      <Text style={styles.body}>
        You can start trading now and complete your profile whenever you're
        ready.
      </Text>

      <Pressable style={styles.button} onPress={completeOnboarding}>
        <Text style={styles.buttonText}>Go to App</Text>
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
    lineHeight: 22,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 36,
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
});