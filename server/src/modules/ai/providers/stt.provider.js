/**
 * stt.provider.js — Speech-To-Text Provider Abstraction Interface
 *
 * Provides a unified backend interface for transcription providers.
 *
 * In standard operation: The mobile app uses Web Speech API / Native mobile speech recognition
 * for zero-latency local speech-to-text.
 * This backend abstraction allows plugging server-side STT engines (e.g. Whisper, Google Cloud Speech, Deepgram)
 * without changing backend or mobile routing logic.
 */

export class BaseSTTProvider {
  /**
   * Transcribe raw audio buffer or stream into text.
   * @param {Buffer|ArrayBuffer} _audioBuffer
   * @param {Object} [_options]
   * @returns {Promise<{ transcript: string, confidence: number, language: string }>}
   */
  async transcribe(_audioBuffer, _options = {}) {
    throw new Error('transcribe() must be implemented by concrete STT provider subclass');
  }
}

/**
 * Web / Client-Side Fallback STT Provider
 */
export class ClientNativeSTTProvider extends BaseSTTProvider {
  constructor() {
    super();
    this.name = 'client-native-stt';
  }

  async transcribe(_audioBuffer, options = {}) {
    // When transcribing happens client-side, the transcript is sent as text
    return {
      transcript: options.transcript || '',
      confidence: 1.0,
      language: options.language || 'en',
    };
  }
}

export default new ClientNativeSTTProvider();
