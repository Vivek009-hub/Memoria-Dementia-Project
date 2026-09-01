/**
 * ai.validation.js — Input validation for AI module
 */

import { AppError } from '../../utils/AppError.js';

export function validateMemoryAssistantInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { message, language } = body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new AppError('message is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (message.length > 1000) {
    throw new AppError('message cannot exceed 1000 characters', 422, 'VALIDATION_ERROR');
  }

  if (language !== undefined && language !== null && typeof language !== 'string') {
    throw new AppError('language must be a string identifier', 422, 'VALIDATION_ERROR');
  }
}

export function validateMemorySearchInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { query } = body;
  if (!query || typeof query !== 'string' || query.trim() === '') {
    throw new AppError('query is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (query.length > 500) {
    throw new AppError('query cannot exceed 500 characters', 422, 'VALIDATION_ERROR');
  }
}

export function validateChatInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { message } = body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new AppError('message is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (message.length > 2000) {
    throw new AppError('message cannot exceed 2000 characters', 422, 'VALIDATION_ERROR');
  }
}

// ── Prompt 1: Gemini Agent companion chat ────────────────────────────────────

export function validateCompanionChatInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { message, conversationId, language } = body;

  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw new AppError('message is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (message.length > 2000) {
    throw new AppError('message cannot exceed 2000 characters', 422, 'VALIDATION_ERROR');
  }

  if (conversationId !== undefined && conversationId !== null && typeof conversationId !== 'string') {
    throw new AppError('conversationId must be a string', 422, 'VALIDATION_ERROR');
  }

  if (language !== undefined && language !== null && typeof language !== 'string') {
    throw new AppError('language must be a string identifier', 422, 'VALIDATION_ERROR');
  }
}
