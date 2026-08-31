/**
 * meetingCircle.validation.js — Input validation for Meeting Circle endpoints
 */

import { AppError } from '../../utils/AppError.js';
import { CIRCLE_VISIBILITIES } from './meetingCircle.model.js';

/**
 * Validate input for POST /meeting-circles (Create Circle)
 */
export function validateCircleCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { name, description, visibility } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Circle name is required', 422, 'VALIDATION_ERROR');
  }

  if (name.trim().length > 150) {
    throw new AppError('Circle name cannot exceed 150 characters', 422, 'VALIDATION_ERROR');
  }

  let cleanDescription = '';
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new AppError('Description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (description.length > 1000) {
      throw new AppError('Description cannot exceed 1000 characters', 422, 'VALIDATION_ERROR');
    }
    cleanDescription = description.trim();
  }

  let cleanVisibility = 'DISCOVERABLE';
  if (visibility !== undefined && visibility !== null) {
    if (!CIRCLE_VISIBILITIES.includes(visibility)) {
      throw new AppError(
        `Visibility must be one of: ${CIRCLE_VISIBILITIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    cleanVisibility = visibility;
  }

  // Maximum participants is strictly 6 and cannot be overridden by client
  return {
    name: name.trim(),
    description: cleanDescription,
    visibility: cleanVisibility,
    maxParticipants: 6,
  };
}

/**
 * Validate input for PATCH /meeting-circles/:circleId (Update Circle)
 */
export function validateCircleUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const updates = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      throw new AppError('Circle name cannot be empty', 422, 'VALIDATION_ERROR');
    }
    if (body.name.trim().length > 150) {
      throw new AppError('Circle name cannot exceed 150 characters', 422, 'VALIDATION_ERROR');
    }
    updates.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new AppError('Description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.description.length > 1000) {
      throw new AppError('Description cannot exceed 1000 characters', 422, 'VALIDATION_ERROR');
    }
    updates.description = body.description.trim();
  }

  if (body.visibility !== undefined) {
    if (!CIRCLE_VISIBILITIES.includes(body.visibility)) {
      throw new AppError(
        `Visibility must be one of: ${CIRCLE_VISIBILITIES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    updates.visibility = body.visibility;
  }

  // Reject any attempts to alter maxParticipants
  if (body.maxParticipants !== undefined && body.maxParticipants !== 6) {
    throw new AppError('Maximum participants is fixed at 6', 422, 'VALIDATION_ERROR');
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid update fields provided', 422, 'VALIDATION_ERROR');
  }

  return updates;
}

/**
 * Validate input for POST /meeting-circles/:circleId/report (Report Participant)
 */
export function validateParticipantReport(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { participantId, reason, comments } = body;

  if (!participantId || typeof participantId !== 'string') {
    throw new AppError('participantId is required', 422, 'VALIDATION_ERROR');
  }

  if (!reason || typeof reason !== 'string' || reason.trim() === '') {
    throw new AppError('Report reason is required', 422, 'VALIDATION_ERROR');
  }

  return {
    reportedUserId: participantId,
    reason: reason.trim(),
    comments: typeof comments === 'string' ? comments.trim() : '',
  };
}
