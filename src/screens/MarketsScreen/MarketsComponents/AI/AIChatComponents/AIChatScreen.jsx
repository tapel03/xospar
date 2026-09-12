import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import ChatHeader from "./AIChatComponents/ChatHeader";
import MessageBubble from "./AIChatComponents/MessageBubble";
import CategoryCardRow from "./AIChatComponents/CategoryCardRow";
import ChatInputBar from "./AIChatComponents/ChatInputBar";

const INITIAL_MESSAGES = [
  {
    id: "1",
    role: "user",
    text: "Give me a forecast for the SUI coin",
    time: "15:01",
  },
  {
    id: "2",
    role: "assistant",
    text:
      "Sui's (SUI) is currently trading at $7.55, with a 24h change of +2.8%. Based on recent trends and volume inflows, short-term momentum appears bullish.",
    time: "15:01",
  },
  {
    id: "3",
    role: "user",
    text: "Thanks! Can you recomend which coin I should buy?",
    time: "15:05",
  },
  {
    id: "4",
    role: "assistant",
    text:
      "Certainly! Here are the crypto categories currently showing the strongest momentum and growth potential:",
    time: "15:05",
    showCategories: true,
  },
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  const handleSend = (text) => {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { id: String(prev.length + 1), role: "user", text, time },
    ]);

    // Placeholder response — wire this up to a real AI backend when ready.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          role: "assistant",
          text: "I'm not connected to a live model yet, but I'll be able to answer that soon.",
          time,
        },
      ]);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ChatHeader />

      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <MessageBubble
              role={message.role}
              text={message.text}
              time={message.time}
            />
            {message.showCategories && <CategoryCardRow />}
          </View>
        ))}
      </ScrollView>

      <ChatInputBar onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1119",
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingTop: 14,
    paddingBottom: 20,
  },
});