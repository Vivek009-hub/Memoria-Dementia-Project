/**
 * analytics.service.js — Analytics business logic & database service
 */

import ActivityEvent from './activityEvent.model.js';
import GameSession from '../games/gameSession.model.js';
import ReminderLog from '../reminders/reminderLog.model.js';
import CommunityVote from '../community/communityVote.model.js';
import SessionRegistration from '../community/sessionRegistration.model.js';
import User from '../users/user.model.js';
import {
  aggregateGameMetrics,
  aggregateReminderMetrics,
  aggregateMemoryMetrics,
  aggregateCommunityMetrics,
  calculateEngagementScore,
} from './analytics.aggregator.js';

/**
 * Record an authoritative activity event.
 */
export async function recordActivityEvent({
  patientId,
  eventType,
  source,
  entityType = null,
  entityId = null,
  metadata = {},
}) {
  const event = await ActivityEvent.create({
    patientId,
    eventType,
    source,
    entityType,
    entityId,
    metadata,
    timestamp: new Date(),
  });
  return event;
}

/**
 * Get comprehensive patient overview dashboard data.
 */
export async function getPatientOverview(patientId, startDate, endDate) {
  const [games, reminders, memories, community] = await Promise.all([
    aggregateGameMetrics(patientId, startDate, endDate),
    aggregateReminderMetrics(patientId, startDate, endDate),
    aggregateMemoryMetrics(patientId, startDate, endDate),
    aggregateCommunityMetrics(patientId, startDate, endDate),
  ]);

  const engagementScore = calculateEngagementScore(games, reminders, memories, community);

  return {
    patientId,
    games,
    reminders,
    memories,
    community,
    engagement: {
      score: engagementScore,
    },
  };
}

/**
 * Get game analytics summary for a patient.
 */
export async function getGameAnalytics(patientId, startDate, endDate) {
  return await aggregateGameMetrics(patientId, startDate, endDate);
}

/**
 * Get paginated game session history.
 */
export async function getGameHistory(patientId, queryParams = {}, pagination = { page: 1, limit: 20 }) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const match = { patientId };
  if (queryParams.gameId) match.gameId = queryParams.gameId;
  if (queryParams.status) match.status = queryParams.status;
  if (queryParams.difficulty) match.difficulty = queryParams.difficulty;

  const [sessions, total] = await Promise.all([
    GameSession.find(match).populate('gameId', 'title category').sort({ completedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    GameSession.countDocuments(match),
  ]);

  return {
    data: sessions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get game performance trends over time.
 */
export async function getGameTrends(patientId, startDate, endDate) {
  const match = { patientId, status: 'COMPLETED' };
  if (startDate || endDate) {
    match.completedAt = {};
    if (startDate) match.completedAt.$gte = startDate;
    if (endDate) match.completedAt.$lte = endDate;
  }

  const sessions = await GameSession.find(match).sort({ completedAt: 1 }).lean();

  const dataPoints = sessions.map((s) => ({
    date: s.completedAt ? s.completedAt.toISOString().split('T')[0] : null,
    score: s.score || 0,
    accuracy: s.accuracy || 0,
    durationSeconds: s.durationSeconds || 0,
  }));

  return dataPoints;
}

/**
 * Get reminder adherence summary for a patient.
 */
export async function getReminderAnalytics(patientId, startDate, endDate) {
  return await aggregateReminderMetrics(patientId, startDate, endDate);
}

/**
 * Get reminder adherence trends over time.
 */
export async function getReminderTrends(patientId, startDate, endDate) {
  const match = { patientId };
  if (startDate || endDate) {
    match.scheduledAt = {};
    if (startDate) match.scheduledAt.$gte = startDate;
    if (endDate) match.scheduledAt.$lte = endDate;
  }

  const logs = await ReminderLog.find(match).sort({ scheduledAt: 1 }).lean();

  const groupMap = new Map();
  logs.forEach((log) => {
    const dayKey = log.scheduledAt ? log.scheduledAt.toISOString().split('T')[0] : 'unknown';
    if (!groupMap.has(dayKey)) {
      groupMap.set(dayKey, { total: 0, completed: 0, skipped: 0, missed: 0 });
    }
    const curr = groupMap.get(dayKey);
    curr.total += 1;
    if (log.status === 'COMPLETED') curr.completed += 1;
    if (log.status === 'SKIPPED') curr.skipped += 1;
    if (log.status === 'MISSED') curr.missed += 1;
  });

  const trends = [];
  groupMap.forEach((val, key) => {
    trends.push({
      date: key,
      ...val,
      completionRate: val.total > 0 ? Number((val.completed / val.total).toFixed(2)) : 0,
    });
  });

  return trends;
}

/**
 * Get memory analytics summary.
 */
export async function getMemoryAnalytics(patientId, startDate, endDate) {
  return await aggregateMemoryMetrics(patientId, startDate, endDate);
}

/**
 * Get community participation summary.
 */
export async function getCommunityAnalytics(patientId, startDate, endDate) {
  return await aggregateCommunityMetrics(patientId, startDate, endDate);
}

/**
 * Get overall engagement trends.
 */
export async function getEngagementTrends(patientId, startDate, endDate) {
  const match = { patientId };
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  const events = await ActivityEvent.find(match).sort({ timestamp: 1 }).lean();

  const dayMap = new Map();
  events.forEach((ev) => {
    const dayKey = ev.timestamp ? ev.timestamp.toISOString().split('T')[0] : 'unknown';
    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
  });

  const trends = [];
  dayMap.forEach((count, date) => {
    trends.push({ date, eventCount: count });
  });

  return trends;
}

// ── ADMIN PLATFORM ANALYTICS ─────────────────────────────────────────────────

export async function getAdminOverview(_startDate, _endDate) {
  const [totalPatients, totalGames, totalVotes, totalRegistrations] = await Promise.all([
    User.countDocuments({ role: 'PATIENT', isActive: true }),
    GameSession.countDocuments({ status: 'COMPLETED' }),
    CommunityVote.countDocuments(),
    SessionRegistration.countDocuments({ status: 'REGISTERED' }),
  ]);

  return {
    totalPatients,
    platformActivity: {
      totalGamesCompleted: totalGames,
      totalCommunityVotes: totalVotes,
      totalSessionRegistrations: totalRegistrations,
    },
  };
}

export async function getAdminGameMetrics() {
  const sessions = await GameSession.find({ status: 'COMPLETED' }).lean();
  const totalCompleted = sessions.length;
  let totalScore = 0;
  let totalAccuracy = 0;

  sessions.forEach((s) => {
    totalScore += s.score || 0;
    totalAccuracy += s.accuracy || 0;
  });

  return {
    totalCompletedGames: totalCompleted,
    platformAverageScore: totalCompleted > 0 ? Math.round(totalScore / totalCompleted) : 0,
    platformAverageAccuracy: totalCompleted > 0 ? Number((totalAccuracy / totalCompleted).toFixed(2)) : 0,
  };
}

export async function getAdminCommunityMetrics() {
  const [votes, registrations] = await Promise.all([
    CommunityVote.countDocuments(),
    SessionRegistration.countDocuments(),
  ]);

  return {
    totalCommunityVotes: votes,
    totalRegistrations: registrations,
  };
}
