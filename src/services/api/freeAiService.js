import { EXPO_PUBLIC_FREE_AI_API_KEY } from "./config";

const API_KEY = EXPO_PUBLIC_FREE_AI_API_KEY;
const BASE_URL = "https://api.free.ai";
const MODEL = "qwen7b"; // Free.ai's default model (free tier)

/**
 * Send a chat message to Free.ai API and get a response.
 * @param {Array} messages - Array of message objects with role and text
 * @param {string} systemPrompt - System prompt to guide the model (optional)
 * @returns {Promise<string>} The AI's response text
 */
export async function sendChatMessage({ messages, systemPrompt }) {
  if (!API_KEY) {
    throw new Error(
      "Free.ai API key not found. Add EXPO_PUBLIC_FREE_AI_API_KEY to your .env file"
    );
  }

  try {
    // Format messages for Free.ai API
    // Free.ai expects: { role: "user" | "assistant", content: "text" }
    const formattedMessages = [];

    // Add system prompt as first message if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Add conversation history
    messages.forEach((msg) => {
      formattedMessages.push({
        role: msg.role,
        content: msg.text,
      });
    });

    const response = await fetch(`${BASE_URL}/v1/chat/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        model: MODEL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Free.ai API error (${response.status}): ${errorData.error?.message || "Unknown error"}`
      );
    }

    const data = await response.json();

    // Extract the assistant's response from Free.ai's response format
    // Free.ai returns: { choices: [{ message: { content: "..." } }] }
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response content from Free.ai API");
    }

    return reply;
  } catch (error) {
    console.error("Free.ai API error:", error);
    throw error;
  }
}

/**
 * Test the API connection (optional utility)
 */
export async function testFreeAiConnection() {
  try {
    const response = await sendChatMessage({
      messages: [{ role: "user", text: "Hello" }],
    });
    console.log("✅ Free.ai API connection successful:", response);
    return true;
  } catch (error) {
    console.error("❌ Free.ai API connection failed:", error);
    return false;
  }
}