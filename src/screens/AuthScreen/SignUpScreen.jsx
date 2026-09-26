import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

import AuthScreenLayout from "./AuthComponents/AuthScreenLayout";
import AuthBackButton from "./AuthComponents/AuthBackButton";
import AuthHeading from "./AuthComponents/AuthHeading";
import AuthField from "./AuthComponents/AuthField";
import AuthPrimaryButton from "./AuthComponents/AuthPrimaryButton";
import OrDivider from "./AuthComponents/OrDivider";
import SocialButton from "./AuthComponents/SocialButton";
import AuthSwitchLink from "./AuthComponents/AuthSwitchLink";

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Email/password path goes to the verification-code screen next -
  // the account is only actually created once that code is confirmed.
  const handleSignUp = () => {
    if (!email.trim()) return;

    navigation.navigate("VerifyEmail", {
      mode: "signup",
      email: email.trim(),
      password,
    });
  };

  // Social sign-up skips the code screen entirely.
  const handleSocialSignUp = async (provider) => {
    setSubmitting(true);
    await signUp(`${provider}-user@example.com`, "");
    setSubmitting(false);
  };

  return (
    <AuthScreenLayout>
      <AuthBackButton onPress={() => navigation.goBack()} />

      <AuthHeading title={"Let`s get\nStarted"} />

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

      <AuthField
        icon="lock-closed-outline"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <AuthPrimaryButton
        label="Sign up"
        onPress={handleSignUp}
        disabled={submitting || !email.trim()}
      />

      <OrDivider />

      <SocialButton
        icon="logo-apple"
        label="Continue with Apple"
        onPress={() => handleSocialSignUp("apple")}
      />
      <SocialButton
        icon="logo-google"
        label="Continue with Google"
        onPress={() => handleSocialSignUp("google")}
      />

      <AuthSwitchLink
        prompt="Already have an account?"
        actionLabel="Login"
        onPress={() => navigation.navigate("Login")}
      />
    </AuthScreenLayout>
  );
}