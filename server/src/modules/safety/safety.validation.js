/**
 * safety.validation.js — Input validation for Safety & Emergency endpoints
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';

export function validateObjectId(id, fieldName = 'id') {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

export function validateCoordinates(latitude, longitude, accuracy) {
  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    throw new AppError('latitude must be a number between -90 and 90', 422, 'INVALID_LOCATION');
  }
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    throw new AppError('longitude must be a number between -180 and 180', 422, 'INVALID_LOCATION');
  }
  if (accuracy !== undefined && accuracy !== null) {
    if (typeof accuracy !== 'number' || accuracy < 0) {
      throw new AppError('accuracy must be a non-negative number', 422, 'INVALID_LOCATION');
    }
  }
}

export function validateLocationInput(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { latitude, longitude, accuracy } = body;

  if (latitude === undefined || longitude === undefined) {
    throw new AppError('latitude and longitude are required', 422, 'INVALID_LOCATION');
  }

  validateCoordinates(latitude, longitude, accuracy);
}

export function validateSOSTrigger(body = {}) {
  if (body.location) {
    const { latitude, longitude, accuracy } = body.location;
    if (latitude !== undefined && longitude !== undefined) {
      validateCoordinates(latitude, longitude, accuracy);
    }
  }
  if (body.clientEventId && typeof body.clientEventId !== 'string') {
    throw new AppError('clientEventId must be a string', 422, 'VALIDATION_ERROR');
  }
}

export function validateGeofenceCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { name, centerLatitude, centerLongitude, radiusMeters } = body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('name is required and cannot be empty', 422, 'VALIDATION_ERROR');
  }
  if (name.length > 100) {
    throw new AppError('name cannot exceed 100 characters', 422, 'VALIDATION_ERROR');
  }

  if (centerLatitude === undefined || centerLongitude === undefined) {
    throw new AppError('centerLatitude and centerLongitude are required', 422, 'INVALID_GEOFENCE');
  }

  validateCoordinates(centerLatitude, centerLongitude, 0);

  if (
    radiusMeters === undefined ||
    typeof radiusMeters !== 'number' ||
    radiusMeters < 10 ||
    radiusMeters > 100000
  ) {
    throw new AppError(
      'radiusMeters must be a number between 10 and 100,000 meters',
      422,
      'INVALID_GEOFENCE'
    );
  }
}

export function validateGeofenceUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { name, centerLatitude, centerLongitude, radiusMeters, isActive } = body;

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    throw new AppError('name cannot be empty', 422, 'VALIDATION_ERROR');
  }

  if (centerLatitude !== undefined || centerLongitude !== undefined) {
    const lat = centerLatitude !== undefined ? centerLatitude : 0;
    const lng = centerLongitude !== undefined ? centerLongitude : 0;
    validateCoordinates(lat, lng, 0);
  }

  if (radiusMeters !== undefined) {
    if (typeof radiusMeters !== 'number' || radiusMeters < 10 || radiusMeters > 100000) {
      throw new AppError(
        'radiusMeters must be a number between 10 and 100,000 meters',
        422,
        'INVALID_GEOFENCE'
      );
    }
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
  }
}

export function validateFallEvent(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body is required', 400, 'INVALID_REQUEST');
  }

  const { confidence, location } = body;

  if (confidence !== undefined && confidence !== null) {
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new AppError('confidence must be a number between 0 and 1', 422, 'VALIDATION_ERROR');
    }
  }

  if (location) {
    const { latitude, longitude, accuracy } = location;
    if (latitude !== undefined && longitude !== undefined) {
      validateCoordinates(latitude, longitude, accuracy);
    }
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
