/**
 * community.validation.js — Input validation for Community Sessions & Proposals
 *
 * Plain validation functions throwing AppError on invalid input.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { SESSION_TYPES, PROPOSAL_STATUSES } from './communityProposal.model.js';
import {
  MEETING_TYPES,
  REGISTRATION_STATUSES,
  SESSION_STATUSES,
} from './communitySession.model.js';

export function validateObjectId(id, fieldName = 'id') {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

export function validateTimezone(tz) {
  if (!tz || typeof tz !== 'string' || tz.trim() === '') {
    throw new AppError('timezone is required', 422, 'VALIDATION_ERROR');
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
  } catch {
    throw new AppError(
      `timezone "${tz}" is not a valid IANA timezone identifier`,
      422,
      'VALIDATION_ERROR'
    );
  }
}

export function validateCreateProposal(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { title, description, sessionType, votingStartsAt, votingEndsAt, imageUrl } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('title is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }
  if (title.length > 200) {
    throw new AppError('title cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (description.length > 2000) {
      throw new AppError('description cannot exceed 2000 characters', 422, 'VALIDATION_ERROR');
    }
  }

  if (sessionType !== undefined && sessionType !== null) {
    if (!SESSION_TYPES.includes(sessionType)) {
      throw new AppError(
        `sessionType must be one of: ${SESSION_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  let start = null;
  let end = null;

  if (votingStartsAt) {
    start = new Date(votingStartsAt);
    if (isNaN(start.getTime())) {
      throw new AppError('votingStartsAt must be a valid ISO date', 422, 'VALIDATION_ERROR');
    }
  }

  if (votingEndsAt) {
    end = new Date(votingEndsAt);
    if (isNaN(end.getTime())) {
      throw new AppError('votingEndsAt must be a valid ISO date', 422, 'VALIDATION_ERROR');
    }
  }

  if (start && end && end <= start) {
    throw new AppError('votingEndsAt must be after votingStartsAt', 422, 'VALIDATION_ERROR');
  }

  if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== 'string') {
    throw new AppError('imageUrl must be a string', 422, 'VALIDATION_ERROR');
  }
}

export function validateUpdateProposal(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { title, description, sessionType, status, votingStartsAt, votingEndsAt } = body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new AppError('title cannot be empty', 422, 'VALIDATION_ERROR');
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

  if (sessionType !== undefined) {
    if (!SESSION_TYPES.includes(sessionType)) {
      throw new AppError(
        `sessionType must be one of: ${SESSION_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (status !== undefined) {
    if (!PROPOSAL_STATUSES.includes(status)) {
      throw new AppError(
        `status must be one of: ${PROPOSAL_STATUSES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (votingStartsAt && votingEndsAt) {
    const start = new Date(votingStartsAt);
    const end = new Date(votingEndsAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Voting timestamps must be valid dates', 422, 'VALIDATION_ERROR');
    }
    if (end <= start) {
      throw new AppError('votingEndsAt must be after votingStartsAt', 422, 'VALIDATION_ERROR');
    }
  }
}

export function validateScheduleSession(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  // Normalize fallback field mappings from different modal forms
  if (!body.date) {
    if (body.scheduledDate) {
      body.date = body.scheduledDate;
    } else if (body.scheduledAt) {
      body.date = body.scheduledAt.split(' ')[0] || body.scheduledAt;
    }
  }

  if (!body.startTime) {
    if (body.scheduledTime) {
      body.startTime = body.scheduledTime;
    } else if (body.scheduledAt && body.scheduledAt.includes(' ')) {
      body.startTime = body.scheduledAt.split(' ').slice(1).join(' ');
    } else {
      body.startTime = '10:00 AM';
    }
  }

  if (body.maximumParticipants === undefined && body.maxCapacity !== undefined) {
    body.maximumParticipants = Number(body.maxCapacity);
  }

  if (!body.featuredPerson && body.hostName) {
    body.featuredPerson = {
      name: body.hostName,
      role: body.hostRole || 'Host',
    };
  }

  const {
    title,
    description,
    sessionType,
    date,
    startTime,
    endTime,
    durationMinutes,
    scheduledAt,
    timezone,
    hostId,
    featuredPerson,
    maximumParticipants,
    meetingType,
  } = body;

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (description.length > 2000) {
      throw new AppError('description cannot exceed 2000 characters', 422, 'VALIDATION_ERROR');
    }
  }

  if (endTime !== undefined && endTime !== null && typeof endTime !== 'string') {
    throw new AppError('endTime must be a string', 422, 'VALIDATION_ERROR');
  }

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new AppError('title is required', 422, 'VALIDATION_ERROR');
  }

  if (!date) {
    throw new AppError('date is required', 422, 'VALIDATION_ERROR');
  }
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new AppError('date must be a valid date', 422, 'VALIDATION_ERROR');
  }

  if (!startTime || typeof startTime !== 'string' || startTime.trim() === '') {
    throw new AppError('startTime is required', 422, 'VALIDATION_ERROR');
  }

  if (scheduledAt) {
    const scheduledObj = new Date(scheduledAt);
    if (isNaN(scheduledObj.getTime())) {
      throw new AppError('scheduledAt must be a valid date', 422, 'VALIDATION_ERROR');
    }
  }

  if (timezone) {
    validateTimezone(timezone);
  }

  if (hostId) {
    validateObjectId(hostId, 'hostId');
  }

  if (maximumParticipants !== undefined && maximumParticipants !== null) {
    if (typeof maximumParticipants !== 'number' || maximumParticipants <= 0) {
      throw new AppError('maximumParticipants must be a positive number', 422, 'VALIDATION_ERROR');
    }
  }

  if (durationMinutes !== undefined && durationMinutes !== null) {
    if (typeof durationMinutes !== 'number' || durationMinutes <= 0) {
      throw new AppError('durationMinutes must be a positive number', 422, 'VALIDATION_ERROR');
    }
  }

  if (sessionType !== undefined) {
    if (!SESSION_TYPES.includes(sessionType)) {
      throw new AppError(
        `sessionType must be one of: ${SESSION_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (meetingType !== undefined) {
    if (!MEETING_TYPES.includes(meetingType)) {
      throw new AppError(
        `meetingType must be one of: ${MEETING_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
  }

  if (featuredPerson !== undefined && featuredPerson !== null) {
    if (typeof featuredPerson !== 'object') {
      throw new AppError('featuredPerson must be an object', 422, 'VALIDATION_ERROR');
    }
  }
}

export function validateUpdateSession(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const {
    title,
    description,
    sessionType,
    date,
    startTime,
    timezone,
    hostId,
    maximumParticipants,
    meetingType,
    registrationStatus,
    status,
  } = body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    throw new AppError('title cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
  }

  if (date !== undefined && isNaN(new Date(date).getTime())) {
    throw new AppError('date must be a valid date', 422, 'VALIDATION_ERROR');
  }

  if (startTime !== undefined && (typeof startTime !== 'string' || startTime.trim() === '')) {
    throw new AppError('startTime cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (timezone !== undefined) {
    validateTimezone(timezone);
  }

  if (hostId !== undefined && hostId !== null) {
    validateObjectId(hostId, 'hostId');
  }

  if (maximumParticipants !== undefined) {
    if (typeof maximumParticipants !== 'number' || maximumParticipants <= 0) {
      throw new AppError('maximumParticipants must be a positive number', 422, 'VALIDATION_ERROR');
    }
  }

  if (sessionType !== undefined && !SESSION_TYPES.includes(sessionType)) {
    throw new AppError(
      `sessionType must be one of: ${SESSION_TYPES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  if (meetingType !== undefined && !MEETING_TYPES.includes(meetingType)) {
    throw new AppError(
      `meetingType must be one of: ${MEETING_TYPES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  if (registrationStatus !== undefined && !REGISTRATION_STATUSES.includes(registrationStatus)) {
    throw new AppError(
      `registrationStatus must be one of: ${REGISTRATION_STATUSES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  if (status !== undefined && !SESSION_STATUSES.includes(status)) {
    throw new AppError(
      `status must be one of: ${SESSION_STATUSES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }
}

export function validatePaginationParams(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  return { page, limit };
}
