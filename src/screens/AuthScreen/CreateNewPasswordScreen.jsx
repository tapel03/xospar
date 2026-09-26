import { useState } from "react";

import AuthScreenLayout from "./AuthComponents/AuthScreenLayout";
import AuthBackButton from "./AuthComponents/AuthBackButton";
import AuthHeading from "./AuthComponents/AuthHeading";
import AuthField from "./AuthComponents/AuthField";
import AuthPrimaryButton from "./AuthComponents/AuthPrimaryButton";

export default function CreateNewPasswordScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    setSubmitting(true);
    // Mock save - no backend wired up yet, sends the user back to Login
    // to sign in with their new password.
    navigation.navigate("Login");
    setSubmitting(false);
  };

  return (
    <AuthScreenLayout>
      <AuthBackButton onPress={() => navigation.goBack()} />

      <AuthHeading
        title={"Create\nNew password"}
        subtitle={"Your new password must be different\nfrom previously used password"}
      />

      <AuthField
        icon="lock-closed-outline"
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <AuthField
        icon="lock-closed-outline"
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <AuthPrimaryButton
        label={submitting ? "Saving..." : "Save"}
        onPress={handleSave}
        disabled={submitting}
      />
    </AuthScreenLayout>
  );
}
