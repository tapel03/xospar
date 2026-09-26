import { useState } from "react";

import AuthScreenLayout from "./AuthComponents/AuthScreenLayout";
import AuthBackButton from "./AuthComponents/AuthBackButton";
import AuthHeading from "./AuthComponents/AuthHeading";
import AuthField from "./AuthComponents/AuthField";
import AuthPrimaryButton from "./AuthComponents/AuthPrimaryButton";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSend = async () => {
    setSubmitting(true);
    // Mock send - no backend wired up yet, just moves the flow forward
    // into the email-verification step.
    navigation.navigate("VerifyEmail", { email: email.trim() });
    setSubmitting(false);
  };

  return (
    <AuthScreenLayout>
      <AuthBackButton onPress={() => navigation.goBack()} />

      <AuthHeading
        title={"Forget\nPassword?"}
        subtitle="Enter your email address"
      />

      <AuthField
        icon="mail-outline"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <AuthPrimaryButton
        label={submitting ? "Sending..." : "Send"}
        onPress={handleSend}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}
