/**
 * conversation.tools.js — Controlled tools for conversation history
 *
 * Reads and writes to the existing AIConversation model.
 * All access scoped to the authenticated userId.
 */

import AIConversation from '../aiConversation.model.js';

/**
 * Retrieve the most recent N messages from the patient's active conversation.
 * Used to build the conversation context window for Gemini.
 *
 * @param {string} userId
 * @param {string|null} conversationId - If null, returns empty history
 * @param {number} [limit=10]
 * @returns {Array<{ role: string, parts: [{ text: string }] }>} Gemini history format
 */
export async function getRecentConversation(userId, conversationId, limit = 10) {
  if (!conversationId) return [];

  const conversation = await AIConversation.findOne({
    _id: conversationId,
    userId,
  })
    .select('messages')
    .lean();

  if (!conversation) return [];

  // Take last N messages and convert to Gemini history format
  const messages = conversation.messages.slice(-limit);

  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }],
  }));
}

/**
 * Find or create a conversation session for the patient.
 *
 * @param {string} userId
 * @param {string} patientId
 * @param {string|null} conversationId - Existing session ID or null
 * @returns {import('../aiConversation.model.js').default} Mongoose document
 */
export async function findOrCreateConversation(userId, patientId, conversationId) {
  if (conversationId) {
    const existing = await AIConversation.findOne({ _id: conversationId, userId });
    if (existing) return existing;
  }

  return AIConversation.create({
    userId,
    patientId,
    title: `Companion Chat ${new Date().toLocaleDateString()}`,
    messages: [],
  });
}

/**
 * Append a message to the conversation document.
 *
 * @param {import('../aiConversation.model.js').default} conversation
 * @param {'user'|'assistant'} sender
 * @param {string} text
 * @param {Array} [sources]
 */
export async function appendMessage(conversation, sender, text, sources = []) {
  conversation.messages.push({
    sender,
    text,
    sources,
    createdAt: new Date(),
  });
  await conversation.save();
}
