import { anthropicClient } from "./httpClient";
import { ANTHROPIC_MODEL, ANTHROPIC_MAX_TOKENS, MARKET_AI_SYSTEM_PROMPT } from "./config";

/**
 * Sends a chat message to Claude via Anthropic's Messages API and returns
 * the assistant's reply as plain text.
 *
 * `messages` is the full running conversation so far, each item shaped
 * as { role: "user" | "assistant", text: string }.
 */
export async function sendChatMessage({ messages, systemPrompt = MARKET_AI_SYSTEM_PROMPT }) {
  const response = await anthropicClient.post("/messages", {
    model: ANTHROPIC_MODEL,
    max_tokens: ANTHROPIC_MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((message) => ({
      role: message.role === "user" ? "user" : "assistant",
      content: message.text,
    })),
  });

  const textBlock = response.data?.content?.find((block) => block.type === "text");

  return textBlock?.text?.trim() || "Sorry, I couldn't generate a response just now.";
}