// Input/output checks for the AI gateway. Education-only rules live in the prompts; this
// enforces shape and size so a client can't send arbitrary payloads to a paid model.
import { AI_PERSONAS, AI_MAX_MESSAGES, AI_MAX_CHARS } from '@edgeline/shared-types';
import { getAsset } from '../../../db/seeds/assets.js';

export class AiRequestError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}

export function validateChatRequest(body) {
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) throw new AiRequestError('bad_messages', 'messages must be a non-empty array');
  const raw = body.messages.slice(-AI_MAX_MESSAGES);
  const cleaned = [];
  for (const m of raw) {
    const role = m?.role === 'user' ? 'user' : m?.role === 'assistant' || m?.role === 'ai' ? 'assistant' : null;
    const text = typeof (m?.text ?? m?.content) === 'string' ? (m.text ?? m.content).trim() : '';
    if (!role || !text) continue;
    if (text.length > AI_MAX_CHARS) throw new AiRequestError('too_long', `a message is longer than ${AI_MAX_CHARS} characters`, 413);
    // Providers want alternating turns that start with a user turn.
    if (cleaned.length && cleaned[cleaned.length - 1].role === role) cleaned[cleaned.length - 1].text += `\n${text}`;
    else cleaned.push({ role, text });
  }
  while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== 'user') throw new AiRequestError('bad_messages', 'the last message must come from the user');

  const persona = AI_PERSONAS.includes(body.persona) ? body.persona : 'market';
  const asset = body.context?.symbol ? getAsset(String(body.context.symbol)) : null;
  return { messages: cleaned, persona, context: asset ? { symbol: asset.sym, name: asset.name } : {} };
}

export const checkReply = (text) => (typeof text === 'string' && text.trim() ? text.trim() : "Sorry, I couldn't generate a response just now.");
