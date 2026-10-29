import { marketAi } from './marketAi.js';
import { assetAi } from './assetAi.js';
import { strategyCoach } from './strategyCoach.js';

export function systemPromptFor(persona, context = {}) {
  if (persona === 'asset') return assetAi(context);
  if (persona === 'mentor') return strategyCoach();
  return marketAi();
}
