import { http } from '../../services/http/client';

/**
 * Replaces the old freeAiService.js / anthropicService.js. The AI key and model live on the server.
 * @param {{ messages: {role:'user'|'assistant', text:string}[], persona?: 'market'|'asset'|'mentor', context?: {symbol?: string} }} req
 * @returns {Promise<{ reply: string, provider: string, remaining: number }>}
 */
export const aiApi = {
  chat: (req) => http.post('/v1/ai/chat', req, { timeoutMs: 35000 }),
};
