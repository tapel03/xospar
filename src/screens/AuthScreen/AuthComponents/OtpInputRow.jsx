import { useRef } from "react";
import { View, TextInput, StyleSheet } from "react-native";

const DIGIT_COUNT = 4;

export default function OtpInputRow({ value, onChange }) {
  const inputRefs = useRef([]);

  const digits = Array.from({ length: DIGIT_COUNT }, (_, i) => value[i] || "");

  const handleChangeDigit = (text, index) => {
    // Only keep the last character typed, digits only.
    const digit = text.replace(/[^0-9]/g, "").slice(-1);

    const nextDigits = [...digits];
    nextDigits[index] = digit;
    onChange(nextDigits.join(""));

    if (digit && index < DIGIT_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChangeDigit(text, index)}
          onKeyPress={(event) => handleKeyPress(event, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.box}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },

  box: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#17171A",
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
