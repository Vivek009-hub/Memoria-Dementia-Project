/**
 * gemini.provider.js — Google Gemini AI Provider
 *
 * Extends BaseAIProvider using the @google/genai SDK.
 * Model: gemini-3.6-flash (verified supported model for this environment)
 *
 * Security:
 *   - API key read from env only; never forwarded to client or logged.
 *   - Structured diagnostic logs record timing, status, and model without exposing secrets.
 */

import { GoogleGenAI } from '@google/genai';
import { BaseAIProvider } from '../ai.provider.js';
import { AppError } from '../../../utils/AppError.js';
import { logger } from '../../../utils/logger.js';

const MODEL = 'gemini-3.6-flash';

function classifyGeminiError(err) {
  const msg = (err.message || '').toLowerCase();
  const status = err.status || err.statusCode || 502;

  if (status === 429 || msg.includes('resource_exhausted') || msg.includes('rate')) {
    return new AppError('The AI service is experiencing high traffic. Please try again in a moment.', 429, 'RATE_LIMITED');
  }
  if (status === 401 || status === 403 || msg.includes('api key') || msg.includes('unauthorized') || msg.includes('invalid_argument')) {
    return new AppError('Unauthorized AI configuration. Please check server environment settings.', 502, 'INVALID_API_KEY');
  }
  if (status === 404 || msg.includes('not_found') || msg.includes('model')) {
    return new AppError('The requested AI model is unavailable.', 502, 'MODEL_NOT_FOUND');
  }
  return new AppError(`Unable to connect to AI service: ${err.message}`, 502, 'AI_PROVIDER_ERROR');
}

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
    const startTime = Date.now();
    logger.info({ model: this.model }, '[AI] AI_GEMINI_REQUEST_START');

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

      const durationMs = Date.now() - startTime;
      logger.info({ model: this.model, durationMs }, '[AI] AI_GEMINI_REQUEST_SUCCESS');

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
      const durationMs = Date.now() - startTime;
      logger.error({ model: this.model, durationMs, error: err.message }, '[AI] AI_GEMINI_REQUEST_FAILURE');
      throw classifyGeminiError(err);
    }
  }

  /**
   * Generate a structured JSON response (JSON mode).
   */
  async generateStructuredResponse({ systemPrompt = '', userMessage = '', context = {} }) {
    const startTime = Date.now();
    logger.info({ model: this.model }, '[AI] AI_GEMINI_REQUEST_START structured=true');

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

      const durationMs = Date.now() - startTime;
      logger.info({ model: this.model, durationMs }, '[AI] AI_GEMINI_REQUEST_SUCCESS structured=true');

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
      const durationMs = Date.now() - startTime;
      logger.error({ model: this.model, durationMs, error: err.message }, '[AI] AI_GEMINI_REQUEST_FAILURE structured=true');
      throw classifyGeminiError(err);
    }
  }

  /**
   * Agentic turn — sends message with tools and conversation history.
   */
  async generateWithTools({ systemPrompt, history = [], userMessage, tools = [] }) {
    const startTime = Date.now();
    logger.info({ model: this.model, toolsCount: tools.length }, '[AI] AI_GEMINI_REQUEST_START tools=true');

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

      const durationMs = Date.now() - startTime;
      logger.info({ model: this.model, durationMs }, '[AI] AI_GEMINI_REQUEST_SUCCESS tools=true');

      return response;
    } catch (err) {
      const durationMs = Date.now() - startTime;
      logger.error({ model: this.model, durationMs, error: err.message }, '[AI] AI_GEMINI_REQUEST_FAILURE tools=true');
      throw classifyGeminiError(err);
    }
  }
}
