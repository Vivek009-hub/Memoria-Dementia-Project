/**
 * gemini.provider.js — Google Gemini AI Provider
 *
 * Extends BaseAIProvider using the @google/genai SDK.
 * Supports:
 *   - generateResponse()          : text generation via gemini-2.0-flash
 *   - generateStructuredResponse() : JSON-mode structured output
 *   - generateWithTools()          : agentic function-calling loop
 *
 * Security:
 *   - API key read from env only; never forwarded to client
 *   - All tool dispatch happens in agent.service.js on the backend
 */

import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from '../ai.provider.js';
import { AppError } from '../../../utils/AppError.js';

const MODEL = 'gemini-2.0-flash';

export class GeminiProvider extends BaseAIProvider {
  constructor(apiKey) {
    super();
    this.name = 'gemini';
    this.model = MODEL;
    this._client = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate a plain text response.
   */
  async generateResponse({ systemPrompt = '', userMessage = '', language = 'en' }) {
    try {
      const response = await this._client.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      });

      const text = response.text ?? '';
      const usage = response.usageMetadata ?? {};

      return {
        text,
        sources: [],
        usage: {
          inputTokens: usage.promptTokenCount ?? 0,
          outputTokens: usage.candidatesTokenCount ?? 0,
          estimatedCost: 0,
        },
        provider: this.name,
        model: this.model,
      };
    } catch (err) {
      throw new AppError(
        `Gemini API error: ${err.message}`,
        502,
        'AI_PROVIDER_ERROR'
      );
    }
  }

  /**
   * Generate a structured JSON response (JSON mode).
   */
  async generateStructuredResponse({ systemPrompt = '', userMessage = '', context = {} }) {
    try {
      const contextStr = JSON.stringify(context, null, 2);
      const fullMessage = `${userMessage}\n\nContext:\n${contextStr}`;

      const response = await this._client.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts: [{ text: fullMessage }] }],
        config: {
          systemInstruction:
            systemPrompt +
            '\n\nYou MUST respond with valid JSON only. No markdown, no extra text.',
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      });

      let data = {};
      try {
        data = JSON.parse(response.text ?? '{}');
      } catch {
        data = {};
      }

      return {
        data,
        usage: response.usageMetadata ?? {},
        provider: this.name,
        model: this.model,
      };
    } catch (err) {
      throw new AppError(
        `Gemini API error: ${err.message}`,
        502,
        'AI_PROVIDER_ERROR'
      );
    }
  }

  /**
   * Agentic turn — sends message with tools and conversation history.
   * Returns the raw Gemini response object for the agent loop to handle.
   *
   * @param {Object} params
   * @param {string}   params.systemPrompt
   * @param {Array}    params.history        - [{role, parts:[{text}]}]
   * @param {string}   params.userMessage
   * @param {Array}    params.tools          - Gemini function declarations
   * @returns {Promise<Object>}              Gemini GenerateContentResponse
   */
  async generateWithTools({ systemPrompt, history = [], userMessage, tools = [] }) {
    try {
      const contents = [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      const config = {
        systemInstruction: systemPrompt,
        temperature: 0.4,
        maxOutputTokens: 512,
      };

      if (tools.length > 0) {
        config.tools = [{ functionDeclarations: tools }];
      }

      const response = await this._client.models.generateContent({
        model: MODEL,
        contents,
        config,
      });

      return response;
    } catch (err) {
      throw new AppError(
        `Gemini API error: ${err.message}`,
        502,
        'AI_PROVIDER_ERROR'
      );
    }
  }
}
