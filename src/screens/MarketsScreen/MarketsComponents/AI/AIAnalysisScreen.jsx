
import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAIChat } from "../../../../hooks/useAIChat";

export default function AIAnalysisScreen({ navigation }) {
  // Stores whatever the user types
  const [message, setMessage] = useState("");

  const { messages, sendMessage, isSending } = useAIChat({
    initialMessage:
      "Hello! I'm your MarketPulse AI. Ask me about markets, forex, stocks, commodities or crypto.",
  });

  // Runs when the user presses Send
  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    sendMessage(message);
    setMessage("");
  };

  // Controls how each message looks
  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,
          isUser
            ? styles.userMessageContainer
            : styles.aiMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser
              ? styles.userBubble
              : styles.aiBubble,
          ]}
        >
          <Text style={styles.messageText}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* Header */}
      <View style={styles.header}>

        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />
        </Pressable>

        {/* AI title */}
        <View style={styles.headerTitleContainer}>
          <Ionicons
            name="sparkles"
            size={20}
            color="#3A7BD5"
          />

          <Text style={styles.headerTitle}>
            MarketPulse AI
          </Text>
        </View>

        {/* Empty space to keep title centred */}
        <View style={styles.headerButton} />

      </View>

      {/* Chat messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Message input */}
      <View style={styles.inputContainer}>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask about the market..."
          placeholderTextColor="#777777"
          style={styles.input}
          multiline
          editable={!isSending}
        />

        <Pressable
          onPress={handleSend}
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          disabled={isSending}
        >
          <Ionicons
            name="arrow-up"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  /* Top chat header */
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 7,
  },

  /* Area containing messages */
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },

  messageContainer: {
    width: "100%",
    marginBottom: 12,
  },

  userMessageContainer: {
    alignItems: "flex-end",
  },

  aiMessageContainer: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },

  userBubble: {
    backgroundColor: "#3A7BD5",
    borderBottomRightRadius: 4,
  },

  aiBubble: {
    backgroundColor: "#1C2630",
    borderBottomLeftRadius: 4,
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },

  /* Bottom input area */
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
    backgroundColor: "#000000",
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: "#1C2630",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: "#FFFFFF",
    fontSize: 14,
  },

  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#3A7BD5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },
});