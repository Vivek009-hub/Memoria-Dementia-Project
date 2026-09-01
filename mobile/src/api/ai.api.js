/**
 * ai.api.js — B11 AI Assistance API Integration
 *
 * Grounded memory companion calling Memora B11 REST API endpoints.
 * Never connects directly to 3rd-party LLM providers from the browser.
 */

import { defaultApiClient } from './client.js';

/**
 * Ask B11 Grounded Memory Assistant a question.
 * @param {string} message - Patient query
 * @param {string} [language='en'] - Selected language
 * @param {Object} [client=defaultApiClient]
 */
export async function askMemoryAssistant(message, language = 'en', client = defaultApiClient) {
  return await client.post('/ai/memory-assistant', { message, language });
}

/**
 * Search patient memories using natural language.
 * @param {string} query - Natural language search query
 * @param {Object} [client=defaultApiClient]
 */
export async function searchMemoriesNL(query, client = defaultApiClient) {
  return await client.post('/ai/memory-search', { query });
}

/**
 * Send chat message to Gemini agentic companion.
 * @param {string} message - Patient message
 * @param {string} [conversationId] - Session ID
 * @param {string} [language='en'] - Preferred language
 * @param {Object} [client=defaultApiClient]
 */
export async function sendCompanionChat(message, conversationId = null, language = 'en', client = defaultApiClient) {
  return await client.post('/ai/companion/chat', { message, conversationId, language });
}

/**
 * Send chat message to elder AI companion.
 * @param {string} message - User chat message
 * @param {Object} [client=defaultApiClient]
 */
export async function sendChatMessage(message, client = defaultApiClient) {
  return await client.post('/ai/chat', { message });
}

/**
 * Get personalized activity and cognitive game recommendations.
 * @param {Object} [client=defaultApiClient]
 */
export async function getRecommendations(client = defaultApiClient) {
  return await client.get('/ai/recommendations');
}

/**
 * Get AI usage statistics for authenticated user.
 * @param {Object} [client=defaultApiClient]
 */
export async function getAIUsage(client = defaultApiClient) {
  return await client.get('/ai/usage');
}

// Backward compatibility alias
export const sendVoiceMessage = askMemoryAssistant;
