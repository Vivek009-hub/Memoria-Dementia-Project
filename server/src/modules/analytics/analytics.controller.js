/**
 * analytics.controller.js — Request handlers for Analytics & Progress endpoints
 */

import * as analyticsService from './analytics.service.js';
import {
  validateObjectId,
  validateTimeframeQuery,
  validatePaginationParams,
} from './analytics.validation.js';

// ── PATIENT & CAREGIVER HANDLERS ─────────────────────────────────────────────

export async function getMeOverview(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const overview = await analyticsService.getPatientOverview(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}

export async function getPatientOverview(req, res, next) {
  try {
    const { patientId } = req.params;
    validateObjectId(patientId, 'patientId');
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const overview = await analyticsService.getPatientOverview(patientId, startDate, endDate);
    res.status(200).json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}

export async function getGameSummary(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const summary = await analyticsService.getGameAnalytics(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getGameHistory(req, res, next) {
  try {
    const pagination = validatePaginationParams(req.query);
    const history = await analyticsService.getGameHistory(req.user.id, req.query, pagination);
    res.status(200).json({
      success: true,
      data: history.data,
      pagination: history.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getGameTrends(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const trends = await analyticsService.getGameTrends(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
}

export async function getReminderSummary(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const summary = await analyticsService.getReminderAnalytics(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getReminderTrends(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const trends = await analyticsService.getReminderTrends(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
}

export async function getMemorySummary(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const summary = await analyticsService.getMemoryAnalytics(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getCommunitySummary(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const summary = await analyticsService.getCommunityAnalytics(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

export async function getEngagementTrends(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const trends = await analyticsService.getEngagementTrends(req.user.id, startDate, endDate);
    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
}

// ── ADMIN HANDLERS ───────────────────────────────────────────────────────────

export async function getAdminOverview(req, res, next) {
  try {
    const { startDate, endDate } = validateTimeframeQuery(req.query);
    const overview = await analyticsService.getAdminOverview(startDate, endDate);
    res.status(200).json({ success: true, data: overview });
  } catch (err) {
    next(err);
  }
}

export async function getAdminGames(req, res, next) {
  try {
    const metrics = await analyticsService.getAdminGameMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}

export async function getAdminCommunity(req, res, next) {
  try {
    const metrics = await analyticsService.getAdminCommunityMetrics();
    res.status(200).json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
}
