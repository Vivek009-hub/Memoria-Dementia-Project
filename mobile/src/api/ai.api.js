/**
 * ai.api.js — B11 AI Assistance API Integration
 *
 * Calls Memora B11 backend API — never directly accesses third-party AI provider keys.
 */

import { defaultApiClient } from './client.js';

export async function sendVoiceMessage(messageText, language = 'en', client = defaultApiClient) {
  return await client.post('/ai/chat', { message: messageText, language });
}
