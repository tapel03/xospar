import { useState } from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";

import AuthScreenLayout from "./AuthComponents/AuthScreenLayout";
import AuthBackButton from "./AuthComponents/AuthBackButton";
import AuthHeading from "./AuthComponents/AuthHeading";
import OtpInputRow from "./AuthComponents/OtpInputRow";
import AuthPrimaryButton from "./AuthComponents/AuthPrimaryButton";

export default function VerifyEmailScreen({ navigation }) {
  const route = useRoute();
  const { signUp, login } = useAuth();

  // `mode` tells this screen what to do once the code checks out:
  //  - "signup": create the account (from SignUpScreen's email path)
  //  - "signin": sign into the existing account (from LoginScreen's
  //     email path)
  //  - "reset" (default): the ForgotPassword flow, unchanged - moves
  //     on to setting a new password.
  const { mode = "reset", email = "", password = "" } = route.params || {};

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setSubmitting(true);

    // Mock verify - no backend wired up yet. In every case the code
    // itself isn't checked against anything real, just gates the
    // next step the same way a real OTP would.
    if (mode === "signup") {
      // Flips isAuthenticated + sends the user into onboarding -
      // RootNavigator reacts to that automatically.
      await signUp(email, password);
    } else if (mode === "signin") {
      await login(email, password);
    } else {
      navigation.navigate("CreateNewPassword");
    }

    setSubmitting(false);
  };

  return (
    <AuthScreenLayout>
      <AuthBackButton onPress={() => navigation.goBack()} />

      <AuthHeading
        title={"Verify\nYour Email"}
        subtitle={
          email
            ? `Please enter the 4 digit code\nsent to ${email}`
            : "Please enter the 4 digit code\nSent To your mail"
        }
      />

      <OtpInputRow value={code} onChange={setCode} />

      <Pressable style={styles.resendRow}>
        <Text style={styles.resendText}>Resend Code</Text>
      </Pressable>

      <AuthPrimaryButton
        label={submitting ? "Verifying..." : "Verify"}
        onPress={handleVerify}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  resendRow: {
    alignSelf: "center",
    marginBottom: 24,
  },

  resendText: {
    color: "#6B6B70",
    fontSize: 13,
  },
});