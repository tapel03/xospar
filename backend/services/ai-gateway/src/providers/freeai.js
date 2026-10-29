// Ported from Savanai freeAiService.js (Free.ai, qwen7b by default).
import { fetchJson } from '../../../../libs/http/index.js';

export function createFreeAi(ai) {
  return {
    name: 'freeai',
    enabled: Boolean(ai.freeAiKey),
    async chat({ system, messages }) {
      const data = await fetchJson(`${ai.freeAiBaseUrl}/v1/chat/`, {
        provider: 'freeai', timeoutMs: 30000, method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${ai.freeAiKey}` },
        body: JSON.stringify({ model: ai.freeAiModel, messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: m.text }))] }),
      });
      return data?.choices?.[0]?.message?.content ?? '';
    },
  };
}
