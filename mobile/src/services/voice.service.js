/**
 * voice.service.js — Speech Interaction & Safety Voice Command Confirmation
 *
 * Safety Rule:
 * Voice commands must NOT directly execute sensitive actions without explicit confirmation.
 */

class VoiceService {
  constructor() {
    this.isListening = false;
    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  speak(text) {
    if (!text) return;
    // Platform text-to-speech engine abstraction
    return { spoken: true, text, language: this.currentLanguage };
  }

  processVoiceCommand(transcript) {
    const text = (transcript || '').toLowerCase().trim();

    if (text.includes('sos') || text.includes('help') || text.includes('emergency')) {
      return {
        action: 'CONFIRM_SOS',
        requiresConfirmation: true,
        prompt: 'Do you want to send an emergency SOS?',
      };
    }

    if (text.includes('reminder') || text.includes('schedule')) {
      return {
        action: 'NAVIGATE_REMINDERS',
        requiresConfirmation: false,
      };
    }

    if (text.includes('memory') || text.includes('photo')) {
      return {
        action: 'NAVIGATE_MEMORIES',
        requiresConfirmation: false,
      };
    }

    return {
      action: 'AI_CHAT',
      query: transcript,
      requiresConfirmation: false,
    };
  }
}

export const voiceService = new VoiceService();
