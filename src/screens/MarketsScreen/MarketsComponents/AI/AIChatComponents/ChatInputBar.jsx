import { useState } from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChatInputBar({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setText("");
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.iconButton}>
        <Ionicons name="hardware-chip-outline" size={18} color="#8C949E" />
      </Pressable>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Enter a message..."
        placeholderTextColor="#8C949E"
        style={styles.input}
        onSubmitEditing={handleSend}
      />

      <Pressable style={styles.sendButton} onPress={handleSend}>
        <Ionicons name="send" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#0B1119",
    borderTopWidth: 1,
    borderTopColor: "#1B2732",
    gap: 8,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C2630",
  },

  input: {
    flex: 1,
    height: 40,
    color: "#FFFFFF",
    fontSize: 14,
    backgroundColor: "#1C2630",
    borderRadius: 20,
    paddingHorizontal: 16,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A7BD5",
  },
});