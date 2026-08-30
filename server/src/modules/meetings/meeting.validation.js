/**
 * meeting.validation.js — Input validation for Meeting Circle module
 *
 * Throws AppError on validation failure.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { MEETING_TYPES } from './meeting.model.js';

export function validateObjectId(id, fieldName = 'id') {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

export function validateCreateMeeting(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { title, description, meetingType, maximumParticipants, scheduledAt } = body;

  if (title !== undefined && title !== null) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new AppError('title must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    if (title.length > 200) {
      throw new AppError('title cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
    }
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (description.length > 2000) {
      throw new AppError('description cannot exceed 2000 characters', 422, 'VALIDATION_ERROR');
    }
  }

  if (meetingType !== undefined && meetingType !== null) {
    if (!MEETING_TYPES.includes(meetingType)) {
      throw new AppError(
        `meetingType must be one of: ${MEETING_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (maximumParticipants !== undefined && maximumParticipants !== null) {
    if (typeof maximumParticipants !== 'number' || maximumParticipants < 1) {
      throw new AppError(
        'maximumParticipants must be an integer >= 1',
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (scheduledAt !== undefined && scheduledAt !== null) {
    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      throw new AppError('scheduledAt must be a valid date', 422, 'VALIDATION_ERROR');
    }
  }
}

export function validatePaginationParams(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  return { page, limit };
}
