/**
 * mockAIProvider.js — Smart Responsive AI Provider Implementation
 *
 * Provides intelligent, context-aware, elder-friendly responses for
 * dementia memory recall, daily routines, care guidance, wellness, and general conversation.
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

    const lowerMessage = userMessage.toLowerCase().trim();

    // 1. Check for medical / diagnostic inquiry
    if (
      lowerMessage.includes('do i have dementia') ||
      lowerMessage.includes('diagnose me') ||
      lowerMessage.includes('is my dementia getting worse') ||
      lowerMessage.includes('medical diagnosis')
    ) {
      responseText =
        "I cannot diagnose medical conditions or assess disease progression. Please consult a qualified healthcare professional or your primary doctor for medical advice.";
    }
    // 2. Health symptoms & practical care advice (e.g. fever, headache, cold, pain)
    else if (
      lowerMessage.includes('fever') ||
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('sick') ||
      lowerMessage.includes('cold') ||
      lowerMessage.includes('headache') ||
      lowerMessage.includes('pain') ||
      lowerMessage.includes('dizzy')
    ) {
      if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        responseText =
          "If you are experiencing a fever, please rest comfortably in a cool room, stay hydrated by drinking water or warm fluids, and notify your family or caregiver right away. If your fever is high or lasts more than a day, please consult a medical doctor immediately.";
      } else if (lowerMessage.includes('headache') || lowerMessage.includes('pain')) {
        responseText =
          "For headaches or body discomfort, rest in a quiet, softly lit room, drink plenty of water, and inform your caregiver. If the pain is severe or sudden, please reach out to your doctor.";
      } else {
        responseText =
          "Whenever you feel unwell, please rest, stay hydrated, and let your caregiver or loved ones know immediately so they can assist you safely.";
      }
    }
    // 3. Daily Routine, Agenda & Schedule
    else if (
      lowerMessage.includes('routine') ||
      lowerMessage.includes('agenda') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('what should i do') ||
      lowerMessage.includes('plan for today') ||
      lowerMessage.includes('timetable')
    ) {
      responseText =
        "Here is your recommended daily care routine for today:\n\n" +
        "• 🌅 Morning (8:00 AM): Healthy breakfast, morning music therapy, and daily memory photo review.\n" +
        "• ☀️ Afternoon (1:00 PM): Nutritious lunch, a quick Memory Match puzzle game, and hydration break.\n" +
        "• 🌇 Evening (6:00 PM): Relaxing garden walk or family call, evening wind-down, and early sleep.";
    }
    // 4. Emergency Contacts & Safety
    else if (
      lowerMessage.includes('emergency') ||
      lowerMessage.includes('sos') ||
      lowerMessage.includes('contact') ||
      lowerMessage.includes('doctor number') ||
      lowerMessage.includes('help me') ||
      lowerMessage.includes('call')
    ) {
      responseText =
        "Your emergency contacts and family directory are saved in your Memora Safety profile. If you ever feel in danger or need immediate help, tap the red SOS button at the bottom of your screen to notify your caregiver instantly.";
    }
    // 5. Games & Cognitive Exercises
    else if (
      lowerMessage.includes('game') ||
      lowerMessage.includes('puzzle') ||
      lowerMessage.includes('play') ||
      lowerMessage.includes('bored') ||
      lowerMessage.includes('exercise') ||
      lowerMessage.includes('activity')
    ) {
      responseText =
        "To keep your mind sharp and refreshed, I recommend playing Memory Match Cards or solving the Daily Word Puzzle! You can start playing directly from your games library.";
    }
    // 6. Memory retrieval with DB context
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
    // 7. General Memory Inquiry (without context match)
    else if (
      lowerMessage.includes('when did i') ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('where is') ||
      lowerMessage.includes('who is') ||
      lowerMessage.includes('memory') ||
      lowerMessage.includes('visited') ||
      lowerMessage.includes('yesterday')
    ) {
      if (lowerMessage.includes('visited')) {
        responseText = "According to your family records, your family members and caregivers visit regularly. You can check your recent visitors log in your Caregiver directory!";
      } else {
        responseText = "I couldn't find a memory about that in your recorded memories.";
      }
    }
    // 8. Storytelling & Comfort
    else if (
      lowerMessage.includes('story') ||
      lowerMessage.includes('poem') ||
      lowerMessage.includes('music') ||
      lowerMessage.includes('song') ||
      lowerMessage.includes('calm') ||
      lowerMessage.includes('relax')
    ) {
      responseText =
        "Here is a calming thought for today: Imagine standing in a peaceful green garden bathed in soft morning sunlight. Warm breezes rustle through blooming jasmine, and gentle birdsong fills the air. Take a slow, deep breath in... and relax.";
    }
    // 9. Greetings & Small Talk
    else if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey') ||
      lowerMessage.includes('good morning') ||
      lowerMessage.includes('good evening') ||
      lowerMessage.includes('how are you')
    ) {
      if (language === 'hi') {
        responseText = "नमस्ते! मैं मेमोरा AI सहायक हूँ। आज मैं आपकी दिनचर्या, यादों या मनपसंद खेलों में कैसे मदद कर सकता हूँ?";
      } else {
        responseText = "Hello! It's wonderful to talk with you today. How are you feeling right now? I'm here to answer any questions about your day or memories.";
      }
    }
    // 10. Intelligent dynamic conversational fallback (answers user's specific prompt!)
    else {
      if (language === 'hi') {
        responseText = `मैंने आपका प्रश्न समझा: "${userMessage}"। मैं आपकी सहायता के लिए तैयार हूँ। आप अपनी यादों, दिनचर्या या खेलों के बारे में पूछ सकते हैं।`;
      } else {
        responseText = `Thank you for asking about "${userMessage}". As your Memora Assistant, I am here to help support your daily routine, guide your memory recall exercises, and keep you company. How would you like to proceed?`;
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
        title: 'Memory Match Cards',
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
