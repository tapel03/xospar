// Ported from Savanai anthropicService.js. The key now stays on the server and the model is configurable.
import { fetchJson } from '../../../../libs/http/index.js';

export function createAnthropic(ai) {
  return {
    name: 'anthropic',
    enabled: Boolean(ai.anthropicKey),
    async chat({ system, messages }) {
      const data = await fetchJson(`${ai.anthropicBaseUrl}/messages`, {
        provider: 'anthropic', timeoutMs: 30000, method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': ai.anthropicKey, 'anthropic-version': ai.anthropicVersion },
        body: JSON.stringify({ model: ai.model, max_tokens: ai.maxTokens, system, messages: messages.map((m) => ({ role: m.role, content: m.text })) }),
      });
      return data?.content?.find((b) => b.type === 'text')?.text ?? '';
    },
  };
}
