/**
 * providers/index.js — AI Provider Factory
 *
 * Returns GeminiProvider when GEMINI_API_KEY is present in the environment,
 * otherwise falls back to the MockAIProvider so the system keeps working
 * during development or when no key is configured.
 *
 * Usage:
 *   import { getProvider } from '../providers/index.js';
 *   const provider = getProvider();
 */

import { env } from '../../../config/env.js';
import { GeminiProvider } from './gemini.provider.js';
import mockAIProvider from '../mockAIProvider.js';

let _geminiInstance = null;

/**
 * @returns {import('../ai.provider.js').BaseAIProvider}
 */
export function getProvider() {
  if (env.geminiApiKey) {
    // Lazily create singleton so the key is read at call time, not module load
    if (!_geminiInstance) {
      _geminiInstance = new GeminiProvider(env.geminiApiKey);
    }
    return _geminiInstance;
  }
  return mockAIProvider;
}

export { GeminiProvider };
