import { useCallback, useState } from "react";

import { sendChatMessage } from "../services/api/freeAiService";

/**
 * Shared chat hook used by every AI chat surface in the app (Home Chat,
 * AI Analysis, Markets AI Chat, and the per-asset AI tab). Keeps the
 * request/response logic in one place instead of duplicating it per screen.
 *
 * Now powered by Free.ai API (qwen7b model).
 *
 * Pass a custom `systemPrompt` to give the assistant context specific to
 * where it's being used (e.g. which asset the user is currently viewing).
 */
export function useAIChat({ systemPrompt, initialMessage } = {}) {
  const [messages, setMessages] = useState(() =>
    initialMessage
      ? [{ id: "welcome", role: "assistant", text: initialMessage, createdAt: Date.now() }]
      : []
  );
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();

      if (!trimmed || isSending) {
        return;
      }

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        text: trimmed,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsSending(true);
      setError(null);

      try {
        const history = [...messages, userMessage];
        const reply = await sendChatMessage({ messages: history, systemPrompt });

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-ai`,
            role: "assistant",
            text: reply,
            createdAt: Date.now(),
          },
        ]);
      } catch (err) {
        setError(err);

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-error`,
            role: "assistant",
            text: "Something went wrong reaching Free.ai. Please try again.",
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending, systemPrompt]
  );

  return { messages, sendMessage, isSending, error };
}