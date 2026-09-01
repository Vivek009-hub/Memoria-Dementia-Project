/**
 * tts.provider.js — Text-To-Speech Provider Abstraction Interface
 *
 * Provides a unified backend interface for text-to-speech audio synthesis.
 *
 * In standard operation: The mobile client synthesizes voice locally via SpeechSynthesis / platform TTS engine.
 * This backend abstraction allows returning audio URL / base64 speech stream if a server-side engine
 * (e.g. ElevenLabs, Google Cloud Text-to-Speech, Amazon Polly) is configured.
 */

export class BaseTTSProvider {
  /**
   * Synthesize text into speech metadata or audio stream.
   * @param {string} _text
   * @param {Object} [_options]
   * @returns {Promise<{ audioUrl?: string, audioFormat?: string, text: string, language: string }>}
   */
  async synthesize(_text, _options = {}) {
    throw new Error('synthesize() must be implemented by concrete TTS provider subclass');
  }
}

/**
 * Client-side / Web Speech API TTS Abstraction Provider
 */
export class ClientNativeTTSProvider extends BaseTTSProvider {
  constructor() {
    super();
    this.name = 'client-native-tts';
  }

  async synthesize(text, options = {}) {
    // Client-side synthesis: return text payload with optimal speech rate & pitch parameters
    return {
      text,
      language: options.language || 'en',
      speechRate: options.speechRate || 0.85, // Slower rate tailored for elderly clarity
      pitch: 1.0,
      clientSynthesize: true,
    };
  }
}

export default new ClientNativeTTSProvider();
