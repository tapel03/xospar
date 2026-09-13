
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useAIChat } from "../../hooks/useAIChat";

export default function ChatScreen({ navigation }) {
  const [message, setMessage] = useState("");

  const { messages, sendMessage, isSending } = useAIChat({
    initialMessage:
      "Hello! I'm MARKET AI. Ask me about markets, forex, stocks, commodities or crypto.",
  });

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }

    sendMessage(message);
    setMessage("");
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,
          isUser && styles.userMessageRow,
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
          <Text
            style={[
              styles.messageText,
              isUser && styles.userMessageText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      {/* =========================
          CHAT HEADER
      ========================= */}

      <View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={18}
              color="#FFFFFF"
            />
          </View>

          <View>
            <Text style={styles.headerTitle}>
              MARKET AI
            </Text>

            <Text style={styles.headerSubtitle}>
              {isSending ? "Thinking..." : "AI Market Analysis"}
            </Text>
          </View>
        </View>

      </View>


      {/* =========================
          CHAT MESSAGES
      ========================= */}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesContainer}
      />


      {/* =========================
          MESSAGE INPUT
      ========================= */}

      <View style={styles.inputArea}>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Ask MARKET AI..."
          placeholderTextColor="#737C86"
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
            size={20}
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

  /* =========================
     HEADER
  ========================== */

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1C252C",
    backgroundColor: "#101820",
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  aiIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#737C86",
    fontSize: 11,
    marginTop: 2,
  },


  /* =========================
     MESSAGES
  ========================== */

  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },

  messageRow: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  userMessageRow: {
    alignItems: "flex-end",
  },

  messageBubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },

  aiBubble: {
    backgroundColor: "#1C2630",
    borderBottomLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: "#3A7BD5",
    borderBottomRightRadius: 4,
  },

  messageText: {
    color: "#DDDDDD",
    fontSize: 14,
    lineHeight: 20,
  },

  userMessageText: {
    color: "#FFFFFF",
  },


  /* =========================
     INPUT
  ========================== */

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#1C252C",
    backgroundColor: "#101820",
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 110,
    backgroundColor: "#1C2630",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 8,
  },

  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#3A7BD5",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.6,
  },

})
;