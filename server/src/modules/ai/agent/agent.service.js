/**
 * agent.service.js - Core Memora AI Agent (Agentic Function-Calling Loop)
 *
 * Architecture:
 *   Frontend -> POST /api/v1/ai/companion/chat
 *     -> agent.service.companionChat()
 *       -> Guardrail checks
 *       -> Build patient context (agent.context.js)
 *       -> Build system prompt (agent.prompt.js)
 *       -> Retrieve conversation history (conversation.tools.js)
 *       -> Gemini generateContent() with function calling
 *       -> Tool dispatch loop (backend only - LLM cannot access DB directly)
 *       -> sanitizeOutput()
 *       -> Save conversation turn
 *       -> Log AIInteraction
 *       -> Return { conversationId, message, toolsUsed }
 *
 * Security:
 *   - userId is ALWAYS from req.user.id (auth session) - never from LLM output.
 *   - All tool calls are dispatched server-side with the authenticated userId.
 *   - Gemini API key is never forwarded to the client.
 *   - Prompt injection attempts are blocked before Gemini is called.
 *   - Output is sanitized before returning to the client.
 *   - Max 5 tool-call iterations per request (prevents infinite loops).
 *
 * Per Prompt 1 sections 6, 8, 9, 10, 23-27.
 */

import pino from 'pino';
import { getProvider } from '../providers/index.js';
import { buildCompanionSystemPrompt } from './agent.prompt.js';
import { buildPatientContext } from './agent.context.js';
import {
  findOrCreateConversation,
  getRecentConversation,
  appendMessage,
} from '../tools/conversation.tools.js';
import {
  getPatientProfile,
  getPatientPreferences,
  getTodayRoutine,
  getActiveReminders,
  getRelevantMemories,
  createReminder,
  cancelReminder,
  GEMINI_TOOL_DECLARATIONS,
} from '../tools/index.js';
import {
  isInjectionAttempt,
  isMedicalDiagnosticQuery,
  sanitizePromptInput,
  sanitizeOutput,
  MEDICAL_SAFETY_DISCLAIMER,
} from '../ai.guardrails.js';
import AIInteraction from '../aiInteraction.model.js';
import { AppError } from '../../../utils/AppError.js';

const logger = pino({ name: 'agent.service' });

// Max function-calling iterations to prevent infinite loops
const MAX_TOOL_ITERATIONS = 5;

// Friendly fallback for Gemini failures
const GEMINI_FALLBACK =
  "I'm having a little trouble connecting right now. Please try again in a moment. I'm always here for you!";

// ---- Tool Dispatcher -------------------------------------------------------
// All tool calls are dispatched here on the backend with the authenticated userId.
// The LLM never directly calls DB operations or receives the userId to supply.

/**
 * @param {string} toolName
 * @param {Object} args - Arguments from Gemini (untrusted; userId NOT from here)
 * @param {string} userId - From authenticated session (ALWAYS trusted source)
 */
async function dispatchTool(toolName, args, userId) {
  logger.info({ toolName, argsKeys: Object.keys(args) }, 'AI tool called');

  switch (toolName) {
    case 'getPatientProfile':
      return getPatientProfile(userId);

    case 'getPatientPreferences':
      return getPatientPreferences(userId);

    case 'getTodayRoutine':
      return getTodayRoutine(userId);

    case 'getActiveReminders':
      return getActiveReminders(userId);

    case 'getRelevantMemories': {
      const query = typeof args.query === 'string' ? args.query.slice(0, 200) : '';
      return getRelevantMemories(userId, query);
    }

    case 'createReminder': {
      const title = typeof args.title === 'string' ? args.title.slice(0, 200) : '';
      const timeExpression = typeof args.timeExpression === 'string' ? args.timeExpression.slice(0, 100) : undefined;
      const delayMinutes = Number(args.delayMinutes) || undefined;
      const type = args.type || 'OTHER';
      return createReminder(userId, { title, timeExpression, delayMinutes, type });
    }

    case 'cancelReminder': {
      const reminderId = typeof args.reminderId === 'string' ? args.reminderId : null;
      if (!reminderId) {
        throw new AppError('reminderId is required to cancel a reminder', 400, 'VALIDATION_ERROR');
      }
      return cancelReminder(userId, reminderId);
    }

    default:
      logger.warn({ toolName }, 'Unknown tool called by agent - ignoring');
      return { error: 'Unknown tool: ' + toolName };
  }
}

// ---- Main Agent Entry Point ------------------------------------------------

/**
 * Run a single patient conversation turn through the Memora AI agent.
 *
 * @param {Object} user - req.user from auth middleware
 * @param {Object} params
 * @param {string}      params.message        - Patient's message (raw)
 * @param {string|null} params.conversationId - Existing conversation session ID
 * @param {string}      [params.language='en']
 * @returns {Promise<{ conversationId: string, message: string, toolsUsed: string[], metadata: Object }>}
 */
export async function companionChat(user, { message, conversationId = null, language = 'en' }) {
  const userId = user.id;
  const startTime = Date.now();
  const toolsUsed = [];

  logger.info({ userId, conversationId }, 'AI companion chat request received');

  // -- Guardrail: Medical diagnostic query -----------------------------------
  if (isMedicalDiagnosticQuery(message)) {
    logger.info({ userId }, 'Medical diagnostic query blocked by guardrail');
    await AIInteraction.create({
      userId,
      patientId: userId,
      type: 'CHAT',
      language,
      status: 'BLOCKED_BY_GUARDRAIL',
      inputMetadata: { reason: 'MEDICAL_DIAGNOSIS_QUERY', messageLength: message.length },
    }).catch(() => {});

    return {
      conversationId,
      message: MEDICAL_SAFETY_DISCLAIMER,
      toolsUsed: [],
      metadata: { blocked: true, reason: 'MEDICAL_DIAGNOSIS_QUERY' },
    };
  }

  // -- Guardrail: Prompt injection -------------------------------------------
  if (isInjectionAttempt(message)) {
    logger.warn({ userId }, 'Prompt injection attempt blocked by guardrail');
    await AIInteraction.create({
      userId,
      patientId: userId,
      type: 'CHAT',
      language,
      status: 'BLOCKED_BY_GUARDRAIL',
      inputMetadata: { reason: 'PROMPT_INJECTION_ATTEMPT', messageLength: message.length },
    }).catch(() => {});

    return {
      conversationId,
      message: "I'm not able to help with that request. Is there something else I can do for you?",
      toolsUsed: [],
      metadata: { blocked: true, reason: 'PROMPT_INJECTION_ATTEMPT' },
    };
  }

  const cleanMessage = sanitizePromptInput(message);

  try {
    // -- Build patient context for system prompt -----------------------------
    let patientContext = '';
    try {
      patientContext = await buildPatientContext(userId);
    } catch (err) {
      logger.warn({ err: err.message }, 'Could not build patient context - continuing without it');
    }

    // -- Build system prompt -------------------------------------------------
    const systemPrompt = buildCompanionSystemPrompt(patientContext, language);

    // -- Find or create conversation session ---------------------------------
    const conversation = await findOrCreateConversation(userId, userId, conversationId);
    const sessionId = conversation._id.toString();

    // -- Retrieve recent conversation history --------------------------------
    const history = await getRecentConversation(userId, sessionId, 10);

    // -- Get AI provider (Gemini or mock) ------------------------------------
    const provider = getProvider();
    const hasGemini = provider.name === 'gemini';

    logger.info({ provider: provider.name, model: provider.model, userId }, `Executing companion chat turn with ${provider.name} provider`);

    // -- Agentic loop --------------------------------------------------------
    let finalText = null;
    let iterations = 0;

    if (hasGemini) {
      // Real Gemini agentic loop with function calling.
      // contents array grows each turn: user -> model+toolCalls -> toolResults -> model -> ...
      const contents = [
        ...history,
        { role: 'user', parts: [{ text: cleanMessage }] },
      ];

      while (iterations < MAX_TOOL_ITERATIONS) {
        iterations++;

        const response = await provider._client.models.generateContent({
          model: provider.model || 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.4,
            maxOutputTokens: 512,
            tools: [{ functionDeclarations: GEMINI_TOOL_DECLARATIONS }],
          },
        });

        const candidate = response.candidates?.[0];
        if (!candidate) {
          logger.warn({ userId }, 'Gemini returned no candidates');
          finalText = GEMINI_FALLBACK;
          break;
        }

        const parts = candidate.content?.parts ?? [];
        const functionCalls = parts.filter((p) => p.functionCall);
        const textParts = parts.filter((p) => typeof p.text === 'string' && p.text.trim());

        if (functionCalls.length === 0) {
          // No tool calls - this is the final text response
          finalText = textParts.map((p) => p.text).join('\n').trim();
          break;
        }

        // -- Dispatch all tool calls from this turn --------------------------
        const toolResults = [];
        for (const part of functionCalls) {
          const { name, args } = part.functionCall;
          toolsUsed.push(name);
          logger.info({ toolName: name, userId }, 'Tool dispatched');

          let result;
          try {
            result = await dispatchTool(name, args || {}, userId);
            logger.info({ toolName: name }, 'Tool completed successfully');
          } catch (toolErr) {
            logger.error({ toolName: name, err: toolErr.message }, 'Tool execution failed');
            result = { error: toolErr.message };
          }

          toolResults.push({
            functionResponse: {
              name,
              response: { result },
            },
          });
        }

        // Append model turn (with tool calls) and tool results to contents
        contents.push({ role: 'model', parts });
        contents.push({ role: 'user', parts: toolResults });
      }

      if (!finalText) {
        finalText = GEMINI_FALLBACK;
      }
    } else {
      // Mock provider path - simple non-agentic call
      const result = await provider.generateResponse({
        systemPrompt,
        userMessage: cleanMessage,
        language,
      });
      finalText = result.text;
    }

    const safeResponse = sanitizeOutput(finalText || GEMINI_FALLBACK);
    const latencyMs = Date.now() - startTime;

    // -- Persist conversation turn -------------------------------------------
    await appendMessage(conversation, 'user', cleanMessage);
    await appendMessage(conversation, 'assistant', safeResponse);

    // -- Audit log -----------------------------------------------------------
    await AIInteraction.create({
      userId,
      patientId: userId,
      type: 'CHAT',
      language,
      status: 'SUCCESS',
      inputMetadata: {
        messageLength: cleanMessage.length,
        toolsUsed,
        iterations,
      },
      outputMetadata: {
        responseLength: safeResponse.length,
        latencyMs,
      },
      provider: provider.name,
      model: provider.model,
    }).catch((err) => logger.error({ err: err.message }, 'Failed to log AI interaction'));

    logger.info(
      { userId, latencyMs, toolsUsed, provider: provider.name },
      'AI companion chat completed'
    );

    return {
      conversationId: sessionId,
      message: safeResponse,
      toolsUsed,
      metadata: {
        provider: provider.name,
        latencyMs,
        language,
      },
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    logger.error({ userId, err: err.message, latencyMs }, 'AI companion chat failed');

    // Log failure
    await AIInteraction.create({
      userId,
      patientId: userId,
      type: 'CHAT',
      language,
      status: 'FAILED',
      inputMetadata: { messageLength: cleanMessage.length },
      outputMetadata: { latencyMs, error: err.code || 'UNKNOWN' },
    }).catch(() => {});

    // Friendly patient-facing fallback - no internal error details exposed
    return {
      conversationId,
      message: GEMINI_FALLBACK,
      toolsUsed,
      metadata: { error: true, latencyMs },
    };
  }
}