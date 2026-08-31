/**
 * ai.service.js — Core Business Logic for Memora AI Assistance
 *
 * Coordinates memory retrieval, guardrail safety checks, provider abstraction,
 * prompt management, and interaction audit logging.
 */

import mockAIProvider from './mockAIProvider.js';
import AIInteraction from './aiInteraction.model.js';
import AIConversation from './aiConversation.model.js';
import {
  buildAuthorizedMemoryContext,
  buildCognitiveActivityContext,
  getAuthorizedMemories,
} from './ai.context.js';
import {
  sanitizePromptInput,
  isInjectionAttempt,
  isMedicalDiagnosticQuery,
  MEDICAL_SAFETY_DISCLAIMER,
  sanitizeOutput,
} from './ai.guardrails.js';
import { buildMemoryAssistantSystemPrompt } from './prompts/memoryAssistant.prompt.js';
import { buildChatSystemPrompt } from './prompts/chat.prompt.js';
import { buildRecommendationsSystemPrompt } from './prompts/recommendations.prompt.js';
import { AppError } from '../../utils/AppError.js';

function getAIProvider(_providerName = 'mock') {
  return mockAIProvider;
}

/**
 * Ask Memory Assistant a question grounded in authorized memories.
 */
export async function askMemoryAssistant(user, { message, language = 'en', patientId = null }) {
  const targetPatientId = patientId || user.id;

  // 1. Guardrail check: Medical diagnosis query
  if (isMedicalDiagnosticQuery(message)) {
    await AIInteraction.create({
      userId: user.id,
      patientId: targetPatientId,
      type: 'MEMORY_ASSISTANCE',
      language,
      status: 'BLOCKED_BY_GUARDRAIL',
      inputMetadata: { messageLength: message.length, reason: 'MEDICAL_DIAGNOSIS_QUERY' },
    });

    return {
      answer: MEDICAL_SAFETY_DISCLAIMER,
      sources: [],
      language,
      provider: 'mock',
      model: 'guardrail',
    };
  }

  // 2. Guardrail check: Prompt injection attack
  if (isInjectionAttempt(message)) {
    await AIInteraction.create({
      userId: user.id,
      patientId: targetPatientId,
      type: 'MEMORY_ASSISTANCE',
      language,
      status: 'BLOCKED_BY_GUARDRAIL',
      inputMetadata: { messageLength: message.length, reason: 'PROMPT_INJECTION_ATTEMPT' },
    });

    return {
      answer: 'I cannot fulfill this request as it violates security policies.',
      sources: [],
      language,
      provider: 'mock',
      model: 'guardrail',
    };
  }

  const cleanMessage = sanitizePromptInput(message);

  // 3. Retrieve authorized memory context
  const { rawMemories, delimitedText } = await buildAuthorizedMemoryContext(user, targetPatientId);

  // 4. Construct prompt and call AI provider
  const systemPrompt = buildMemoryAssistantSystemPrompt(language);
  const provider = getAIProvider('mock');

  const startTime = Date.now();
  const providerResult = await provider.generateResponse({
    systemPrompt,
    userMessage: cleanMessage,
    context: rawMemories,
    language,
  });
  const latencyMs = Date.now() - startTime;

  const safeAnswer = sanitizeOutput(providerResult.text);

  // 5. Log interaction
  await AIInteraction.create({
    userId: user.id,
    patientId: targetPatientId,
    type: 'MEMORY_ASSISTANCE',
    language,
    inputMetadata: { queryLength: cleanMessage.length, memoryCount: rawMemories.length },
    outputMetadata: {
      responseLength: safeAnswer.length,
      sourcesCount: providerResult.sources?.length || 0,
      latencyMs,
    },
    provider: providerResult.provider,
    model: providerResult.model,
    status: 'SUCCESS',
    tokenUsage: providerResult.usage,
  });

  return {
    answer: safeAnswer,
    sources: providerResult.sources || [],
    language,
    provider: providerResult.provider,
    model: providerResult.model,
  };
}

/**
 * Natural language memory search over authorized memory records.
 */
export async function searchMemoriesNL(user, { query, language = 'en', patientId = null }) {
  const targetPatientId = patientId || user.id;

  if (isInjectionAttempt(query)) {
    throw new AppError('Invalid search query', 400, 'INVALID_QUERY');
  }

  const cleanQuery = sanitizePromptInput(query);
  const memories = await getAuthorizedMemories(user, targetPatientId);

  const lowerQuery = cleanQuery.toLowerCase();
  const matches = memories.filter((m) => {
    const title = (m.title || '').toLowerCase();
    const desc = (m.description || '').toLowerCase();
    const place = (m.relatedPlace || '').toLowerCase();
    const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '';

    return (
      title.includes(lowerQuery) ||
      desc.includes(lowerQuery) ||
      place.includes(lowerQuery) ||
      tags.includes(lowerQuery) ||
      lowerQuery.split(' ').some((w) => w.length > 3 && (title.includes(w) || desc.includes(w)))
    );
  });

  await AIInteraction.create({
    userId: user.id,
    patientId: targetPatientId,
    type: 'MEMORY_SEARCH',
    language,
    inputMetadata: { queryLength: cleanQuery.length },
    outputMetadata: { matchesFound: matches.length },
    status: 'SUCCESS',
  });

  return {
    query: cleanQuery,
    totalMatches: matches.length,
    matches: matches.map((m) => ({
      id: m._id,
      title: m.title,
      description: m.description,
      type: m.type,
      importantDate: m.importantDate,
      relatedPlace: m.relatedPlace,
    })),
  };
}

/**
 * Conversational companion assistant with chat session memory.
 */
export async function chat(user, { conversationId, message, language = 'en', patientId = null }) {
  const targetPatientId = patientId || user.id;

  // Medical query guardrail check
  if (isMedicalDiagnosticQuery(message)) {
    return {
      conversationId: conversationId || null,
      answer: MEDICAL_SAFETY_DISCLAIMER,
      sources: [],
      language,
    };
  }

  const cleanMessage = sanitizePromptInput(message);

  let conversation;
  if (conversationId) {
    conversation = await AIConversation.findOne({ _id: conversationId, userId: user.id });
    if (!conversation) {
      throw new AppError('Conversation session not found', 404, 'RESOURCE_NOT_FOUND');
    }
  } else {
    conversation = await AIConversation.create({
      userId: user.id,
      patientId: targetPatientId,
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
    });
  }

  // Push user message
  conversation.messages.push({
    sender: 'user',
    text: cleanMessage,
    createdAt: new Date(),
  });

  const systemPrompt = buildChatSystemPrompt(language);
  const provider = getAIProvider('mock');

  const providerResult = await provider.generateResponse({
    systemPrompt,
    userMessage: cleanMessage,
    language,
  });

  const safeAnswer = sanitizeOutput(providerResult.text);

  // Push assistant response
  conversation.messages.push({
    sender: 'assistant',
    text: safeAnswer,
    sources: providerResult.sources || [],
    createdAt: new Date(),
  });

  await conversation.save();

  await AIInteraction.create({
    userId: user.id,
    patientId: targetPatientId,
    type: 'CHAT',
    language,
    inputMetadata: { messageLength: cleanMessage.length },
    outputMetadata: { responseLength: safeAnswer.length },
    status: 'SUCCESS',
    tokenUsage: providerResult.usage,
  });

  return {
    conversationId: conversation._id,
    answer: safeAnswer,
    sources: providerResult.sources || [],
    messages: conversation.messages,
  };
}

/**
 * Get personalized game & activity recommendations based on B10 cognitive analytics.
 */
export async function getPersonalizedRecommendations(user, { language = 'en', patientId = null }) {
  const targetPatientId = patientId || user.id;

  const context = await buildCognitiveActivityContext(user, targetPatientId);
  const systemPrompt = buildRecommendationsSystemPrompt();
  const provider = getAIProvider('mock');

  const providerResult = await provider.generateStructuredResponse({
    systemPrompt,
    userMessage: 'Recommend suitable cognitive activities for the patient.',
    context,
  });

  await AIInteraction.create({
    userId: user.id,
    patientId: targetPatientId,
    type: 'GAME_RECOMMENDATION',
    language,
    inputMetadata: { availableGamesCount: context.availableGames.length },
    outputMetadata: { recommendationsCount: providerResult.data?.recommendations?.length || 0 },
    status: 'SUCCESS',
  });

  return providerResult.data?.recommendations || [];
}

/**
 * Get aggregated safe AI usage statistics for user.
 */
export async function getAIUsageStats(user) {
  const interactions = await AIInteraction.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const totalRequests = interactions.length;
  const successCount = interactions.filter((i) => i.status === 'SUCCESS').length;
  const blockedCount = interactions.filter((i) => i.status === 'BLOCKED_BY_GUARDRAIL').length;

  return {
    totalRequests,
    successCount,
    blockedCount,
    recentInteractions: interactions.map((i) => ({
      id: i._id,
      type: i.type,
      status: i.status,
      provider: i.provider,
      createdAt: i.createdAt,
    })),
  };
}
