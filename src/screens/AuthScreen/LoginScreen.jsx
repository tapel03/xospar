import { useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";

import { useAuth } from "../../context/AuthContext";

import AuthScreenLayout from "./AuthComponents/AuthScreenLayout";
import AuthBackButton from "./AuthComponents/AuthBackButton";
import AuthHeading from "./AuthComponents/AuthHeading";
import AuthField from "./AuthComponents/AuthField";
import AuthPrimaryButton from "./AuthComponents/AuthPrimaryButton";
import OrDivider from "./AuthComponents/OrDivider";
import SocialButton from "./AuthComponents/SocialButton";
import AuthSwitchLink from "./AuthComponents/AuthSwitchLink";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Email/password path always goes through the verification-code
  // screen next - the account isn't actually signed in until that
  // code is confirmed (see VerifyEmailScreen).
  const handleLogin = () => {
    if (!email.trim()) return;

    navigation.navigate("VerifyEmail", {
      mode: "signin",
      email: email.trim(),
      password,
    });
  };

  // Social sign-in skips the code screen entirely - RootNavigator
  // reacts to isAuthenticated automatically once this resolves.
  const handleSocialLogin = async (provider) => {
    setSubmitting(true);
    await login(`${provider}-user@example.com`, "");
    setSubmitting(false);
  };

  return (
    <AuthScreenLayout>
      <AuthBackButton onPress={() => navigation.goBack()} />

      <AuthHeading title={"Hey,\nWelcome Back"} />

      <AuthField
        icon="mail-outline"
        placeholder="Email id"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <AuthField
        icon="lock-closed-outline"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.forgotRow}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={styles.forgotText}>Forget password?</Text>
      </Pressable>

      <AuthPrimaryButton
        label="Sign In"
        onPress={handleLogin}
        disabled={submitting || !email.trim()}
      />

      <OrDivider />

      <SocialButton
        icon="logo-apple"
        label="Continue with Apple"
        onPress={() => handleSocialLogin("apple")}
      />
      <SocialButton
        icon="logo-google"
        label="Continue with Google"
        onPress={() => handleSocialLogin("google")}
      />

      <AuthSwitchLink
        prompt="Don't have an account?"
        actionLabel="Sign up"
        onPress={() => navigation.navigate("SignUp")}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },

  forgotText: {
    color: "#6B6B70",
    fontSize: 13,
  },
});