/**
 * @typedef {'market'|'asset'|'mentor'} AiPersona
 * @typedef {{ role: 'user'|'assistant', text: string }} AiMessage
 * @typedef {{ messages: AiMessage[], persona?: AiPersona, context?: { symbol?: string } }} AiChatRequest
 * @typedef {{ reply: string, provider: string, remaining: number }} AiChatResponse
 */
export const AI_PERSONAS = ['market', 'asset', 'mentor'];
export const AI_MAX_MESSAGES = 20;
export const AI_MAX_CHARS = 4000;
