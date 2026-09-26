import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={17} color="#6B6B70" style={styles.icon} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6B6B70"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    backgroundColor: "#17171A",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
  },

  icon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    height: "100%",
  },
});
