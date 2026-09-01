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

import pino from 'pino';
import { env } from '../../../config/env.js';
import { GeminiProvider } from './gemini.provider.js';
import mockAIProvider from '../mockAIProvider.js';

const logger = pino({ name: 'ai.provider.factory' });
let _geminiInstance = null;
let _loggedState = null;

/**
 * Check whether a valid Gemini API key is configured in environment.
 * @returns {boolean}
 */
export function isGeminiConfigured() {
  return Boolean(env.geminiApiKey && typeof env.geminiApiKey === 'string' && env.geminiApiKey.trim().length > 0);
}

/**
 * Get active AI Provider instance (GeminiProvider if configured, otherwise MockAIProvider).
 * @returns {import('../ai.provider.js').BaseAIProvider}
 */
export function getProvider() {
  if (isGeminiConfigured()) {
    if (!_geminiInstance) {
      _geminiInstance = new GeminiProvider(env.geminiApiKey.trim());
    }
    if (_loggedState !== 'GEMINI') {
      logger.info({ model: _geminiInstance.model }, 'AI Provider active: Google Gemini (gemini-3.6-flash)');
      _loggedState = 'GEMINI';
    }
    return _geminiInstance;
  }

  if (_loggedState !== 'MOCK') {
    logger.warn('AI Provider active: MockAIProvider (GEMINI_API_KEY is not set in environment; running in Development Mock Mode)');
    _loggedState = 'MOCK';
  }
  return mockAIProvider;
}

export { GeminiProvider };
