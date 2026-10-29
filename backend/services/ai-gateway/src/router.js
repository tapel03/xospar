// Model selection: Anthropic first when configured, Free.ai as the fallback. Tries the next
// provider if one fails.
import { createAnthropic } from './providers/anthropic.js';
import { createFreeAi } from './providers/freeai.js';

export function createAiRouter(aiConfig, overrides) {
  const providers = overrides || [createAnthropic(aiConfig), createFreeAi(aiConfig)];
  return {
    available: () => providers.filter((p) => p.enabled).map((p) => p.name),
    async chat(input) {
      const usable = providers.filter((p) => p.enabled);
      if (!usable.length) { const e = new Error('No AI provider is configured on the server'); e.code = 'ai_unconfigured'; e.status = 503; throw e; }
      let lastError;
      for (const p of usable) {
        try { return { reply: await p.chat(input), provider: p.name }; } catch (err) { lastError = err; }
      }
      const e = new Error(`AI providers failed: ${lastError?.message}`); e.code = 'ai_upstream'; e.status = 502; throw e;
    },
  };
}
