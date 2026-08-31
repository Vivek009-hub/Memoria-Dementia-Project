/**
 * ai.api.js — AI Assistant REST API Client (Phase F10 / B11)
 */
import { defaultApiClient } from './client.js';

export async function askMemoryAssistant(query, language = 'en', client = defaultApiClient) {
  return await client.post('/ai/memory-assistant', { message: query, query, language });
}

export async function sendChatMessage(messages, language = 'en', client = defaultApiClient) {
  const textMsg = typeof messages === 'string' ? messages : (Array.isArray(messages) ? messages[messages.length - 1]?.text : '');
  return await client.post('/ai/chat', { message: textMsg, messages, language });
}

export async function chatWithAssistant(prompt, patientId, language = 'en', client = defaultApiClient) {
  return await client.post('/ai/chat', { message: prompt, prompt, query: prompt, patientId, language });
}

export async function getRecommendations(client = defaultApiClient) {
  return await client.get('/ai/recommendations');
}
