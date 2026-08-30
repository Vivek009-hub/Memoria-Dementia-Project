/**
 * mockAIProvider.js — Mock AI Provider Implementation
 *
 * Per Prompt §77 (Mock AI Provider).
 * Deterministic in-memory AI provider for unit tests and local development.
 */

import { BaseAIProvider } from './ai.provider.js';

export class MockAIProvider extends BaseAIProvider {
  constructor() {
    super();
    this.name = 'mock';
    this.model = 'mock-llm-v1';
  }

  async generateResponse(params) {
    const { systemPrompt = '', userMessage = '', context = [], language = 'en' } = params;

    let responseText = '';
    const sources = [];

    const lowerMessage = userMessage.toLowerCase();

    // 1. Check for medical / diagnostic query
    if (
      lowerMessage.includes('do i have dementia') ||
      lowerMessage.includes('diagnose me') ||
      lowerMessage.includes('is my dementia getting worse') ||
      lowerMessage.includes('medical diagnosis')
    ) {
      responseText =
        "I cannot diagnose medical conditions or assess disease progression. Please consult a qualified healthcare professional or your primary doctor for medical advice.";
    }
    // 2. Memory assistant query with context
    else if (Array.isArray(context) && context.length > 0) {
      const STOP_WORDS = new Set([
        'when',
        'what',
        'where',
        'who',
        'which',
        'visit',
        'visited',
        'tell',
        'show',
        'about',
        'have',
        'with',
        'from',
        'this',
        'that',
      ]);
      const queryWords = lowerMessage
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

      const matchingMemories =
        queryWords.length > 0
          ? context.filter((m) => {
              const title = (m.title || '').toLowerCase();
              const desc = (m.description || '').toLowerCase();
              const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '';
              const place = (m.relatedPlace || '').toLowerCase();

              return queryWords.some(
                (word) =>
                  title.includes(word) ||
                  desc.includes(word) ||
                  tags.includes(word) ||
                  place.includes(word)
              );
            })
          : [];

      if (matchingMemories.length > 0) {
        const primary = matchingMemories[0];
        responseText = `Based on your memory "${primary.title}": ${primary.description || primary.title}.`;
        if (primary.importantDate) {
          const dateStr = new Date(primary.importantDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          responseText += ` This event occurred on ${dateStr}.`;
        }
        for (const item of matchingMemories) {
          if (item._id) {
            sources.push({
              memoryId: item._id,
              title: item.title,
              type: item.type || 'PHOTO',
            });
          }
        }
      } else {
        responseText = "I couldn't find a memory about that in your recorded memories.";
      }
    }
    // 3. Memory query with no matching context -> anti-hallucination response
    else if (
      lowerMessage.includes('when did i') ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('where is') ||
      lowerMessage.includes('who is') ||
      lowerMessage.includes('memory')
    ) {
      responseText = "I couldn't find a memory about that in your recorded memories.";
    }
    // 4. Conversational fallback
    else {
      if (language === 'hi') {
        responseText = `नमस्ते! मैं मेमोरा AI सहायक हूँ। मैं आपकी यादों, खेलों और दिनचर्या में सहायता कर सकता हूँ।`;
      } else {
        responseText = `Hello! I am your Memora assistant. I'm here to help with your memories, routines, and daily activities.`;
      }
    }

    return {
      text: responseText,
      sources,
      usage: {
        inputTokens: Math.ceil((systemPrompt.length + userMessage.length) / 4),
        outputTokens: Math.ceil(responseText.length / 4),
        estimatedCost: 0.0001,
      },
      provider: this.name,
      model: this.model,
    };
  }

  async generateStructuredResponse(params) {
    const { userMessage = '', context = {} } = params;
    const lowerMessage = userMessage.toLowerCase();

    let data = {};

    if (context.availableGames && Array.isArray(context.availableGames)) {
      const suggestedGame = context.availableGames[0] || {
        _id: 'mock_game_id',
        title: 'Memory Match',
      };

      data = {
        recommendations: [
          {
            type: 'GAME',
            id: suggestedGame._id,
            title: suggestedGame.title,
            reason: 'You have completed similar memory activities comfortably before.',
            encouragement: 'Try this fun activity today whenever you feel like it.',
          },
        ],
      };
    } else {
      data = {
        intent: lowerMessage.includes('memory') ? 'MEMORY_SEARCH' : 'GENERAL_CHAT',
        query: userMessage,
        confidence: 0.95,
      };
    }

    return {
      data,
      usage: {
        inputTokens: 50,
        outputTokens: 50,
        estimatedCost: 0.0001,
      },
      provider: this.name,
      model: this.model,
    };
  }
}

export default new MockAIProvider();
