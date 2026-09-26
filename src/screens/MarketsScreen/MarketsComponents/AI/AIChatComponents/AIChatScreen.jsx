import { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInputBar from "./ChatInputBar";

import { useAIChat } from "../../../../../hooks/useAIChat";

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

// NOTE: this screen isn't currently wired into any navigator (there's no
// "AIChat" route registered) - it's kept here in case you want to reuse
// this alternate chat layout somewhere. Wired up for real API calls the
// same way as the other chat screens; the previous hardcoded demo
// conversation (SUI forecast + category cards) has been removed since
// it doesn't apply once real responses come from the model.
export default function AIChatScreen() {
  const { messages, sendMessage, isSending } = useAIChat({
    initialMessage: "Hi! Ask me about markets, forex, stocks, commodities or crypto.",
  });

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
          <MessageBubble
            key={message.id}
            role={message.role}
            text={message.text}
            time={formatTime(message.createdAt)}
          />
        ))}

        {isSending && (
          <MessageBubble role="assistant" text="Thinking..." time="" />
        )}
      </ScrollView>

      <ChatInputBar onSend={sendMessage} />
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