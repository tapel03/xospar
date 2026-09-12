import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen({ navigation }) {

  const handleSignUp = () => {
    navigation.replace("Main");
  };

  return (
    <View style={styles.container}>

      {/* BACK BUTTON */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
      </Pressable>

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Sign up to start tracking markets and news
      </Text>

      {/* FAKE INPUT BOXES — just for layout, not functional */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputBox}>
          <Ionicons name="person-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>John Doe</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputBox}>
          <Ionicons name="mail-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>you@example.com</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>••••••••</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputBox}>
          <Ionicons name="lock-closed-outline" size={18} color="#8C949E" />
          <Text style={styles.placeholderText}>••••••••</Text>
        </View>
      </View>

      {/* SIGN UP BUTTON */}
      <Pressable style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpText}>Create Account</Text>
      </Pressable>

      <Text style={styles.terms}>
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </Text>

      {/* LOGIN LINK */}
      <View style={styles.loginRow}>
        <Text style={styles.loginPrompt}>Already have an account? </Text>

        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Log In</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
  },

  subtitle: {
    color: "#8C949E",
    fontSize: 14,
    marginTop: 6,
    marginBottom: 28,
  },

  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },

  label: {
    color: "#C8CDD3",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  inputBox: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
  },

  placeholderText: {
    color: "#5F6B76",
    fontSize: 14,
  },

  signUpButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  signUpText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  terms: {
    color: "#5F6B76",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },

  loginPrompt: {
    color: "#8C949E",
    fontSize: 14,
  },

  loginLink: {
    color: "#3A7BD5",
    fontSize: 14,
    fontWeight: "700",
  },
});