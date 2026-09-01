/**
 * ai.controller.js — Express controller handlers for AI Cognitive & Memory Assistance
 */

import * as aiService from './ai.service.js';
import {
  validateMemoryAssistantInput,
  validateMemorySearchInput,
  validateChatInput,
  validateCompanionChatInput,
} from './ai.validation.js';

export async function askMemoryAssistant(req, res, next) {
  try {
    validateMemoryAssistantInput(req.body);
    const result = await aiService.askMemoryAssistant(req.user, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function searchMemoriesNL(req, res, next) {
  try {
    validateMemorySearchInput(req.body);
    const result = await aiService.searchMemoriesNL(req.user, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function chat(req, res, next) {
  try {
    validateChatInput(req.body);
    const result = await aiService.chat(req.user, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const result = await aiService.getPersonalizedRecommendations(req.user, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUsage(req, res, next) {
  try {
    const result = await aiService.getAIUsageStats(req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ── Prompt 1: Gemini Agent companion chat ────────────────────────────────────

export async function companionChat(req, res, next) {
  try {
    validateCompanionChatInput(req.body);
    const result = await aiService.companionChat(req.user, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
