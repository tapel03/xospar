import { Text, Pressable, StyleSheet } from "react-native";

export default function AuthPrimaryButton({ label, onPress, disabled = false }) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  label: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
  },
});
