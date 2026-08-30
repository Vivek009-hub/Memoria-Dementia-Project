/**
 * game.validation.js — Input validation for /api/v1/games endpoints
 *
 * Plain functions — no Express dependency. Follows the existing pattern
 * established in caregivers.validation.js.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { GAME_CATEGORIES, GAME_DIFFICULTIES } from './game.model.js';

/**
 * Validate a MongoDB ObjectId string.
 *
 * @param {string} id
 * @param {string} [fieldName]
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

/**
 * Validate query parameters for GET /games.
 *
 * @param {object} query - req.query
 * @returns {{ category?: string, difficulty?: string }}
 */
export function validateGameListQuery(query) {
  const filters = {};

  if (query.category !== undefined) {
    if (!GAME_CATEGORIES.includes(query.category)) {
      throw new AppError(
        `category must be one of: ${GAME_CATEGORIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    filters.category = query.category;
  }

  if (query.difficulty !== undefined) {
    if (!GAME_DIFFICULTIES.includes(query.difficulty)) {
      throw new AppError(
        `difficulty must be one of: ${GAME_DIFFICULTIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    filters.difficulty = query.difficulty;
  }

  return filters;
}

/**
 * Validate POST /games (admin: create game).
 *
 * @param {object} body
 * @returns {object} validated data
 */
export function validateGameCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    throw new AppError('title is required', 422, 'VALIDATION_ERROR');
  }

  if (!body.category || !GAME_CATEGORIES.includes(body.category)) {
    throw new AppError(
      `category must be one of: ${GAME_CATEGORIES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  if (!body.difficulty || !GAME_DIFFICULTIES.includes(body.difficulty)) {
    throw new AppError(
      `difficulty must be one of: ${GAME_DIFFICULTIES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  const data = {
    title: body.title.trim(),
    category: body.category,
    difficulty: body.difficulty,
  };

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.instructions !== undefined) {
    if (typeof body.instructions !== 'string') {
      throw new AppError('instructions must be a string', 422, 'VALIDATION_ERROR');
    }
    data.instructions = body.instructions.trim();
  }

  if (body.configuration !== undefined) {
    if (typeof body.configuration !== 'object' || Array.isArray(body.configuration)) {
      throw new AppError('configuration must be a plain object', 422, 'VALIDATION_ERROR');
    }
    data.configuration = body.configuration;
  }

  if (body.supportedLanguages !== undefined) {
    if (
      !Array.isArray(body.supportedLanguages) ||
      body.supportedLanguages.some((l) => typeof l !== 'string')
    ) {
      throw new AppError('supportedLanguages must be an array of strings', 422, 'VALIDATION_ERROR');
    }
    data.supportedLanguages = body.supportedLanguages;
  }

  if (body.media !== undefined) {
    if (typeof body.media !== 'object' || Array.isArray(body.media)) {
      throw new AppError('media must be a plain object', 422, 'VALIDATION_ERROR');
    }
    data.media = {};
    if (body.media.thumbnailUrl !== undefined) {
      if (typeof body.media.thumbnailUrl !== 'string') {
        throw new AppError('media.thumbnailUrl must be a string', 422, 'VALIDATION_ERROR');
      }
      data.media.thumbnailUrl = body.media.thumbnailUrl.trim();
    }
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.isActive = body.isActive;
  }

  return data;
}

/**
 * Validate PATCH /games/:gameId (admin: update game).
 *
 * @param {object} body
 * @returns {object} validated update data (at least one field required)
 */
export function validateGameUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const data = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      throw new AppError('title must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.category !== undefined) {
    if (!GAME_CATEGORIES.includes(body.category)) {
      throw new AppError(
        `category must be one of: ${GAME_CATEGORIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.category = body.category;
  }

  if (body.difficulty !== undefined) {
    if (!GAME_DIFFICULTIES.includes(body.difficulty)) {
      throw new AppError(
        `difficulty must be one of: ${GAME_DIFFICULTIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.difficulty = body.difficulty;
  }

  if (body.instructions !== undefined) {
    if (typeof body.instructions !== 'string') {
      throw new AppError('instructions must be a string', 422, 'VALIDATION_ERROR');
    }
    data.instructions = body.instructions.trim();
  }

  if (body.configuration !== undefined) {
    if (typeof body.configuration !== 'object' || Array.isArray(body.configuration)) {
      throw new AppError('configuration must be a plain object', 422, 'VALIDATION_ERROR');
    }
    data.configuration = body.configuration;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return data;
}

/**
 * Validate POST /games/:gameId/sessions (patient: start session).
 *
 * @param {object} body
 * @returns {{ difficulty: string, metadata?: object }}
 */
export function validateSessionStart(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.difficulty || !GAME_DIFFICULTIES.includes(body.difficulty)) {
    throw new AppError(
      `difficulty is required and must be one of: ${GAME_DIFFICULTIES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  const data = { difficulty: body.difficulty };

  if (body.metadata !== undefined) {
    if (typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
      throw new AppError('metadata must be a plain object', 422, 'VALIDATION_ERROR');
    }
    data.metadata = body.metadata;
  }

  return data;
}

/**
 * Validate POST /games/sessions/:sessionId/complete (patient: complete session).
 *
 * Accepted fields: score, accuracy, responseTimeMs, hintsUsed, mistakes, metadata.
 * All numeric fields must be non-negative. accuracy is clamped to 0–100.
 *
 * @param {object} body
 * @returns {object} validated result data
 */
export function validateSessionComplete(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const data = {};

  const numericFields = ['score', 'accuracy', 'responseTimeMs', 'hintsUsed', 'mistakes'];

  for (const field of numericFields) {
    if (body[field] !== undefined) {
      const val = body[field];
      if (typeof val !== 'number' || !Number.isFinite(val)) {
        throw new AppError(`${field} must be a finite number`, 422, 'VALIDATION_ERROR');
      }
      if (val < 0) {
        throw new AppError(`${field} cannot be negative`, 422, 'VALIDATION_ERROR');
      }
      data[field] = val;
    }
  }

  if (data.accuracy !== undefined && data.accuracy > 100) {
    throw new AppError('accuracy cannot exceed 100', 422, 'VALIDATION_ERROR');
  }

  if (body.metadata !== undefined) {
    if (typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
      throw new AppError('metadata must be a plain object', 422, 'VALIDATION_ERROR');
    }
    data.metadata = body.metadata;
  }

  return data;
}
