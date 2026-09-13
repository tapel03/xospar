import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useAuth } from "../../context/AuthContext";

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignUp = async () => {
    setSubmitting(true);
    // Mock sign up - no validation, no fields required.
    // RootNavigator sends the user into onboarding automatically once this resolves.
    await signUp(email.trim(), password);
    setSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Build your trading system. Follow your rules. Learn from every trade.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#59636D"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#59636D"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#59636D"
            secureTextEntry
            style={styles.input}
          />
        </View>

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Creating account..." : "Sign Up"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.linkRow}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextStrong}>Log In</Text>
          </Text>
        </Pressable>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },

  subtitle: {
    color: "#8B949E",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    color: "#8B949E",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    height: 50,
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#1C2630",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },

  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  linkRow: {
    marginTop: 22,
    alignItems: "center",
  },

  linkText: {
    color: "#8B949E",
    fontSize: 13,
  },

  linkTextStrong: {
    color: "#3A7BD5",
    fontWeight: "700",
  },
});