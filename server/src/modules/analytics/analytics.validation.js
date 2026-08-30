/**
 * analytics.validation.js — Input validation for Analytics & Progress endpoints
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';

export function validateObjectId(id, fieldName = 'id') {
  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

export function validateTimeframeQuery(query = {}) {
  const { timeframe = '30d', from, to } = query;

  let startDate = null;
  let endDate = new Date();

  if (timeframe === '7d') {
    startDate = new Date(Date.now() - 7 * 86400000);
  } else if (timeframe === '30d') {
    startDate = new Date(Date.now() - 30 * 86400000);
  } else if (timeframe === '90d') {
    startDate = new Date(Date.now() - 90 * 86400000);
  } else if (timeframe === 'custom' || from || to) {
    if (from) {
      startDate = new Date(from);
      if (isNaN(startDate.getTime())) {
        throw new AppError('"from" must be a valid ISO date', 422, 'VALIDATION_ERROR');
      }
    }
    if (to) {
      endDate = new Date(to);
      if (isNaN(endDate.getTime())) {
        throw new AppError('"to" must be a valid ISO date', 422, 'VALIDATION_ERROR');
      }
    }
    if (startDate && endDate && startDate > endDate) {
      throw new AppError('"from" date cannot be after "to" date', 422, 'VALIDATION_ERROR');
    }
  } else {
    // Default to 30d
    startDate = new Date(Date.now() - 30 * 86400000);
  }

  return { startDate, endDate, timeframe };
}

export function validatePaginationParams(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 20;
  if (limit > 100) limit = 100;

  return { page, limit };
}
