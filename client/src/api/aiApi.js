/**
 * aiApi.js — AI Cognitive & Memory Assistant API endpoints (B11)
 */

import { request } from './client.js';

export async function sendAIChatMessage(message, conversationId = null) {
  return await request('/ai/chat', {
    method: 'POST',
    body: { message, conversationId },
  });
}

export async function askAIMemoryAssistant(query, language = 'en') {
  return await request('/ai/memory-assistant', {
    method: 'POST',
    body: { query, language },
  });
}

export async function fetchAIRecommendations() {
  return await request('/ai/recommendations');
}

export async function fetchAIUsageStats() {
  return await request('/ai/usage');
}
