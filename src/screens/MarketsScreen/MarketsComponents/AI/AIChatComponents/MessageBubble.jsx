import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MessageBubble({ role = "assistant", text, time }) {
  const isUser = role === "user";

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.rowUser : styles.rowAssistant,
      ]}
    >
      {!isUser && (
        <View style={styles.avatar}>
          <Ionicons name="hardware-chip-outline" size={14} color="#FFFFFF" />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
        ]}
      >
        <Text style={styles.text}>{text}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.time}>{time}</Text>
          {isUser && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color="#5BC6F0"
              style={styles.check}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
    paddingHorizontal: 16,
  },

  rowUser: {
    justifyContent: "flex-end",
  },

  rowAssistant: {
    justifyContent: "flex-start",
  },

  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  bubble: {
    maxWidth: "78%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  bubbleUser: {
    backgroundColor: "#1E4A6B",
    borderBottomRightRadius: 4,
  },

  bubbleAssistant: {
    backgroundColor: "#1C2630",
    borderBottomLeftRadius: 4,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
  },

  time: {
    color: "#8C949E",
    fontSize: 10,
  },

  check: {
    marginLeft: 4,
  },
});