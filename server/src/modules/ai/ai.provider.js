/**
 * ai.provider.js — AI Provider Interface
 *
 * Per Prompt §5 (AI Provider Abstraction).
 * Abstract contract for LLM / AI engine integrations.
 */

export class BaseAIProvider {
  /**
   * Generate text response from AI provider.
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userMessage
   * @param {Array<Object>|Object} [params.context]
   * @param {string} [params.language='en']
   * @param {number} [params.temperature=0.3]
   * @returns {Promise<{ text: string, usage: { inputTokens: number, outputTokens: number, estimatedCost: number }, provider: string, model: string }>}
   */
  async generateResponse(_params) {
    throw new Error('generateResponse must be implemented by subclass');
  }

  /**
   * Generate structured JSON response from AI provider.
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userMessage
   * @param {Object} [params.context]
   * @param {Object} params.responseSchema
   * @returns {Promise<{ data: Object, usage: Object, provider: string, model: string }>}
   */
  async generateStructuredResponse(_params) {
    throw new Error('generateStructuredResponse must be implemented by subclass');
  }
}
