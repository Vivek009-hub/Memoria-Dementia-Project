/**
 * memory.validation.js — Input validation for /api/v1/memories endpoints
 *
 * Plain vanilla functions — no external Joi dependency. Follows established
 * project pattern in game.validation.js and reminder.validation.js.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { MEMORY_TYPES } from './memory.model.js';

const DATE_PRECISIONS = ['exact', 'month', 'year', 'unknown'];

/**
 * Validate a MongoDB ObjectId string.
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

/**
 * Helper to check valid HTTP/HTTPS URL syntax or local relative upload path
 */
function isValidUrl(val) {
  if (typeof val !== 'string') return false;
  if (val.startsWith('/uploads/')) return true;
  try {
    const u = new URL(val);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Memory Validations ────────────────────────────────────────────────────────

export function validateCreateMemory(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    throw new AppError('title is required', 422, 'VALIDATION_ERROR');
  }
  if (body.title.trim().length > 200) {
    throw new AppError('title must be at most 200 characters', 422, 'VALIDATION_ERROR');
  }

  if (!body.type || !MEMORY_TYPES.includes(body.type)) {
    throw new AppError(`type must be one of: ${MEMORY_TYPES.join(', ')}`, 422, 'VALIDATION_ERROR');
  }

  const data = {
    title: body.title.trim(),
    type: body.type,
  };

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.description.length > 5000) {
      throw new AppError('description must be at most 5000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.mediaUrl !== undefined && body.mediaUrl !== null && body.mediaUrl !== '') {
    if (!isValidUrl(body.mediaUrl)) {
      throw new AppError('mediaUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
    }
    if (body.mediaUrl.length > 2048) {
      throw new AppError('mediaUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
    }
    data.mediaUrl = body.mediaUrl.trim();
  }

  if (body.thumbnailUrl !== undefined && body.thumbnailUrl !== null && body.thumbnailUrl !== '') {
    if (!isValidUrl(body.thumbnailUrl)) {
      throw new AppError('thumbnailUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
    }
    if (body.thumbnailUrl.length > 2048) {
      throw new AppError('thumbnailUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
    }
    data.thumbnailUrl = body.thumbnailUrl.trim();
  }

  if (body.relatedPersonId !== undefined && body.relatedPersonId !== null) {
    validateObjectId(body.relatedPersonId, 'relatedPersonId');
    data.relatedPersonId = body.relatedPersonId;
  }

  if (body.relatedPlace !== undefined && body.relatedPlace !== null) {
    if (typeof body.relatedPlace !== 'string') {
      throw new AppError('relatedPlace must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.relatedPlace.length > 300) {
      throw new AppError('relatedPlace must be at most 300 characters', 422, 'VALIDATION_ERROR');
    }
    data.relatedPlace = body.relatedPlace.trim();
  }

  if (body.importantDate !== undefined && body.importantDate !== null) {
    const d = new Date(body.importantDate);
    if (isNaN(d.getTime())) {
      throw new AppError('importantDate must be a valid ISO date', 422, 'VALIDATION_ERROR');
    }
    data.importantDate = d.toISOString();
  }

  if (body.datePrecision !== undefined && body.datePrecision !== null) {
    if (!DATE_PRECISIONS.includes(body.datePrecision)) {
      throw new AppError(
        `datePrecision must be one of: ${DATE_PRECISIONS.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.datePrecision = body.datePrecision;
  }

  if (body.language !== undefined && body.language !== null) {
    if (typeof body.language !== 'string' || body.language.length > 10) {
      throw new AppError('language must be a string up to 10 characters', 422, 'VALIDATION_ERROR');
    }
    data.language = body.language.trim();
  }

  if (body.tags !== undefined && body.tags !== null) {
    if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== 'string')) {
      throw new AppError('tags must be an array of strings', 422, 'VALIDATION_ERROR');
    }
    if (body.tags.length > 20) {
      throw new AppError('tags must contain at most 20 items', 422, 'VALIDATION_ERROR');
    }
    data.tags = body.tags;
  }

  return data;
}

export function validateUpdateMemory(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const data = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      throw new AppError('title cannot be empty', 422, 'VALIDATION_ERROR');
    }
    if (body.title.trim().length > 200) {
      throw new AppError('title must be at most 200 characters', 422, 'VALIDATION_ERROR');
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.description && body.description.length > 5000) {
      throw new AppError('description must be at most 5000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description ? body.description.trim() : null;
  }

  if (body.type !== undefined) {
    if (!MEMORY_TYPES.includes(body.type)) {
      throw new AppError(
        `type must be one of: ${MEMORY_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.type = body.type;
  }

  if (body.mediaUrl !== undefined) {
    if (body.mediaUrl !== null && body.mediaUrl !== '') {
      if (!isValidUrl(body.mediaUrl)) {
        throw new AppError('mediaUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
      }
      if (body.mediaUrl.length > 2048) {
        throw new AppError('mediaUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
      }
      data.mediaUrl = body.mediaUrl.trim();
    } else {
      data.mediaUrl = null;
    }
  }

  if (body.thumbnailUrl !== undefined) {
    if (body.thumbnailUrl !== null && body.thumbnailUrl !== '') {
      if (!isValidUrl(body.thumbnailUrl)) {
        throw new AppError('thumbnailUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
      }
      if (body.thumbnailUrl.length > 2048) {
        throw new AppError('thumbnailUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
      }
      data.thumbnailUrl = body.thumbnailUrl.trim();
    } else {
      data.thumbnailUrl = null;
    }
  }

  if (body.relatedPersonId !== undefined) {
    if (body.relatedPersonId !== null) {
      validateObjectId(body.relatedPersonId, 'relatedPersonId');
      data.relatedPersonId = body.relatedPersonId;
    } else {
      data.relatedPersonId = null;
    }
  }

  if (body.relatedPlace !== undefined) {
    if (body.relatedPlace !== null) {
      if (typeof body.relatedPlace !== 'string' || body.relatedPlace.length > 300) {
        throw new AppError('relatedPlace must be at most 300 characters', 422, 'VALIDATION_ERROR');
      }
      data.relatedPlace = body.relatedPlace.trim();
    } else {
      data.relatedPlace = null;
    }
  }

  if (body.importantDate !== undefined) {
    if (body.importantDate !== null) {
      const d = new Date(body.importantDate);
      if (isNaN(d.getTime())) {
        throw new AppError('importantDate must be a valid ISO date', 422, 'VALIDATION_ERROR');
      }
      data.importantDate = d.toISOString();
    } else {
      data.importantDate = null;
    }
  }

  if (body.datePrecision !== undefined) {
    if (!DATE_PRECISIONS.includes(body.datePrecision)) {
      throw new AppError(
        `datePrecision must be one of: ${DATE_PRECISIONS.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.datePrecision = body.datePrecision;
  }

  if (body.language !== undefined) {
    if (typeof body.language !== 'string' || body.language.length > 10) {
      throw new AppError('language must be a string up to 10 characters', 422, 'VALIDATION_ERROR');
    }
    data.language = body.language.trim();
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== 'string')) {
      throw new AppError('tags must be an array of strings', 422, 'VALIDATION_ERROR');
    }
    if (body.tags.length > 20) {
      throw new AppError('tags must contain at most 20 items', 422, 'VALIDATION_ERROR');
    }
    data.tags = body.tags;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('update body must contain at least one field', 422, 'VALIDATION_ERROR');
  }

  return data;
}

export function validateListMemoriesQuery(query = {}) {
  const result = {
    page: 1,
    limit: 20,
  };

  if (query.patientId) {
    result.patientId = query.patientId;
  }

  if (query.type !== undefined) {
    if (!MEMORY_TYPES.includes(query.type)) {
      throw new AppError(
        `type must be one of: ${MEMORY_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    result.type = query.type;
  }

  if (query.isActive !== undefined) {
    if (query.isActive === 'true' || query.isActive === true) result.isActive = true;
    else if (query.isActive === 'false' || query.isActive === false) result.isActive = false;
    else throw new AppError('isActive must be boolean', 422, 'VALIDATION_ERROR');
  }

  if (query.relatedPersonId !== undefined) {
    validateObjectId(query.relatedPersonId, 'relatedPersonId');
    result.relatedPersonId = query.relatedPersonId;
  }

  if (query.from !== undefined) {
    const d = new Date(query.from);
    if (isNaN(d.getTime()))
      throw new AppError('from must be a valid date', 422, 'VALIDATION_ERROR');
    result.from = d.toISOString();
  }

  if (query.to !== undefined) {
    const d = new Date(query.to);
    if (isNaN(d.getTime())) throw new AppError('to must be a valid date', 422, 'VALIDATION_ERROR');
    if (result.from && new Date(query.to) < new Date(result.from)) {
      throw new AppError('to must be after from', 422, 'VALIDATION_ERROR');
    }
    result.to = d.toISOString();
  }

  if (query.page !== undefined) {
    const p = parseInt(query.page, 10);
    if (isNaN(p) || p < 1)
      throw new AppError('page must be an integer >= 1', 422, 'VALIDATION_ERROR');
    result.page = p;
  }

  if (query.limit !== undefined) {
    const l = parseInt(query.limit, 10);
    if (isNaN(l) || l < 1)
      throw new AppError('limit must be an integer >= 1', 422, 'VALIDATION_ERROR');
    if (l > 100) throw new AppError('limit must be at most 100', 422, 'VALIDATION_ERROR');
    result.limit = l;
  }

  return result;
}

// ── Family Member Validations ─────────────────────────────────────────────────

export function validateCreateFamilyMember(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    throw new AppError('name is required', 422, 'VALIDATION_ERROR');
  }
  if (body.name.trim().length > 100) {
    throw new AppError('name must be at most 100 characters', 422, 'VALIDATION_ERROR');
  }

  const data = {
    name: body.name.trim(),
  };

  if (body.relationship !== undefined && body.relationship !== null) {
    if (typeof body.relationship !== 'string' || body.relationship.length > 100) {
      throw new AppError('relationship must be at most 100 characters', 422, 'VALIDATION_ERROR');
    }
    data.relationship = body.relationship.trim();
  }

  if (body.photoUrl !== undefined && body.photoUrl !== null && body.photoUrl !== '') {
    if (!isValidUrl(body.photoUrl)) {
      throw new AppError('photoUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
    }
    if (body.photoUrl.length > 2048) {
      throw new AppError('photoUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
    }
    data.photoUrl = body.photoUrl.trim();
  }

  if (body.description !== undefined && body.description !== null) {
    if (typeof body.description !== 'string' || body.description.length > 2000) {
      throw new AppError('description must be at most 2000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.language !== undefined && body.language !== null) {
    if (typeof body.language !== 'string' || body.language.length > 10) {
      throw new AppError('language must be a string up to 10 characters', 422, 'VALIDATION_ERROR');
    }
    data.language = body.language.trim();
  }

  return data;
}

export function validateUpdateFamilyMember(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const data = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      throw new AppError('name cannot be empty', 422, 'VALIDATION_ERROR');
    }
    if (body.name.trim().length > 100) {
      throw new AppError('name must be at most 100 characters', 422, 'VALIDATION_ERROR');
    }
    data.name = body.name.trim();
  }

  if (body.relationship !== undefined) {
    if (
      body.relationship !== null &&
      (typeof body.relationship !== 'string' || body.relationship.length > 100)
    ) {
      throw new AppError('relationship must be at most 100 characters', 422, 'VALIDATION_ERROR');
    }
    data.relationship = body.relationship ? body.relationship.trim() : null;
  }

  if (body.photoUrl !== undefined) {
    if (body.photoUrl !== null && body.photoUrl !== '') {
      if (!isValidUrl(body.photoUrl)) {
        throw new AppError('photoUrl must be a valid http/https URL', 422, 'VALIDATION_ERROR');
      }
      if (body.photoUrl.length > 2048) {
        throw new AppError('photoUrl must be at most 2048 characters', 422, 'VALIDATION_ERROR');
      }
      data.photoUrl = body.photoUrl.trim();
    } else {
      data.photoUrl = null;
    }
  }

  if (body.description !== undefined) {
    if (
      body.description !== null &&
      (typeof body.description !== 'string' || body.description.length > 2000)
    ) {
      throw new AppError('description must be at most 2000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description ? body.description.trim() : null;
  }

  if (body.language !== undefined) {
    if (typeof body.language !== 'string' || body.language.length > 10) {
      throw new AppError('language must be a string up to 10 characters', 422, 'VALIDATION_ERROR');
    }
    data.language = body.language.trim();
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.isActive = body.isActive;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('update body must contain at least one field', 422, 'VALIDATION_ERROR');
  }

  return data;
}

export function validateListFamilyMembersQuery(query = {}) {
  const result = {
    page: 1,
    limit: 20,
  };

  if (query.patientId) {
    result.patientId = query.patientId;
  }

  if (query.isActive !== undefined) {
    if (query.isActive === 'true' || query.isActive === true) result.isActive = true;
    else if (query.isActive === 'false' || query.isActive === false) result.isActive = false;
    else throw new AppError('isActive must be boolean', 422, 'VALIDATION_ERROR');
  }

  if (query.page !== undefined) {
    const p = parseInt(query.page, 10);
    if (isNaN(p) || p < 1)
      throw new AppError('page must be an integer >= 1', 422, 'VALIDATION_ERROR');
    result.page = p;
  }

  if (query.limit !== undefined) {
    const l = parseInt(query.limit, 10);
    if (isNaN(l) || l < 1)
      throw new AppError('limit must be an integer >= 1', 422, 'VALIDATION_ERROR');
    if (l > 100) throw new AppError('limit must be at most 100', 422, 'VALIDATION_ERROR');
    result.limit = l;
  }

  return result;
}

// ── Express Middleware Factories ──────────────────────────────────────────────

export function validateBody(fn) {
  return (req, _res, next) => {
    try {
      req.body = fn(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function validateQuery(fn) {
  return (req, _res, next) => {
    try {
      req.query = fn(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}
