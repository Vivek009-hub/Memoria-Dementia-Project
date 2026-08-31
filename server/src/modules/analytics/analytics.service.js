/**
 * analytics.service.js — Analytics business logic, Admin metrics & Traffic service
 */

import ActivityEvent from './activityEvent.model.js';
import GameSession from '../games/gameSession.model.js';
import ReminderLog from '../reminders/reminderLog.model.js';
import CommunityVote from '../community/communityVote.model.js';
import SessionRegistration from '../community/sessionRegistration.model.js';
import CommunitySession from '../community/communitySession.model.js';
import User from '../users/user.model.js';
import TrafficLog from './trafficLog.model.js';
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
export async function getGameHistory(
  patientId,
  queryParams = {},
  pagination = { page: 1, limit: 20 }
) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const match = { patientId };
  if (queryParams.gameId) match.gameId = queryParams.gameId;
  if (queryParams.status) match.status = queryParams.status;
  if (queryParams.difficulty) match.difficulty = queryParams.difficulty;

  const [sessions, total] = await Promise.all([
    GameSession.find(match)
      .populate('gameId', 'title category')
      .sort({ completedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
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

// ── ADMIN PLATFORM ANALYTICS & OVERVIEW ──────────────────────────────────────

/**
 * Real backend calculation for Admin Overview dashboard stat cards.
 */
export async function getAdminOverview() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600 * 1000);

  const [
    totalUsers,
    totalPatients,
    totalCaregivers,
    totalHosts,
    upcomingEventsCount,
    recentActiveUsersCount,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'PATIENT' }),
    User.countDocuments({ role: 'CAREGIVER' }),
    User.countDocuments({ role: 'HOST' }),
    CommunitySession.countDocuments({ status: 'SCHEDULED' }),
    User.countDocuments({ lastLoginAt: { $gte: twentyFourHoursAgo } }),
  ]);

  return {
    totalUsers,
    totalPatients,
    patients: totalPatients,
    caregivers: totalCaregivers,
    hosts: totalHosts,
    upcomingEvents: upcomingEventsCount,
    activeUsers: recentActiveUsersCount,
  };
}

/**
 * Admin: Activity Audit Log retrieval with pagination.
 */
export async function getAdminActivityLogs({ page = 1, limit = 20, eventType = '' } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const query = {};
  if (eventType) {
    query.eventType = eventType;
  }

  const [events, total] = await Promise.all([
    ActivityEvent.find(query)
      .populate('patientId', 'name email role')
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    ActivityEvent.countDocuments(query),
  ]);

  const formattedEvents = events.map((ev) => ({
    id: ev._id.toString(),
    timestamp: ev.timestamp || ev.createdAt,
    actor: ev.userId?.name || ev.patientId?.name || 'System / Admin',
    actorEmail: ev.userId?.email || ev.patientId?.email || null,
    actorRole: ev.userId?.role || ev.patientId?.role || 'SYSTEM',
    action: ev.eventType,
    category: ev.category || ev.source || 'GENERAL',
    metadata: ev.metadata || {},
  }));

  return {
    events: formattedEvents,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Admin: Operational Traffic Metrics calculation (Today, 7 Days, 30 Days).
 */
export async function getAdminTrafficMetrics({ range = 'today' } = {}) {
  const now = new Date();
  let startDate = new Date();

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else {
    startDate.setHours(0, 0, 0, 0);
  }

  const filter = { timestamp: { $gte: startDate } };

  const [totalRequests, errors4xx, errors5xx, avgResTimeResult, activeUsersDistinct] =
    await Promise.all([
      TrafficLog.countDocuments(filter),
      TrafficLog.countDocuments({ ...filter, statusCode: { $gte: 400, $lt: 500 } }),
      TrafficLog.countDocuments({ ...filter, statusCode: { $gte: 500 } }),
      TrafficLog.aggregate([
        { $match: filter },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTimeMs' } } },
      ]),
      TrafficLog.distinct('userId', { ...filter, userId: { $ne: null } }),
    ]);

  const avgResponseTimeMs =
    avgResTimeResult.length > 0 ? Math.round(avgResTimeResult[0].avgResponseTime) : 0;

  // Build aggregate time series for visual chart
  let groupFormat = '%Y-%m-%d';
  if (range === 'today') {
    groupFormat = '%Y-%m-%d %H:00';
  }

  const chartAggregation = await TrafficLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dateToString: { format: groupFormat, date: '$timestamp' } },
        requests: { $sum: 1 },
        errors: {
          $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const chartData = chartAggregation.map((item) => ({
    label: item._id,
    requests: item.requests,
    errors: item.errors,
  }));

  return {
    range,
    totalRequests,
    activeUsers: activeUsersDistinct.length,
    errors4xx,
    errors5xx,
    totalErrors: errors4xx + errors5xx,
    avgResponseTimeMs,
    chartData,
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
    platformAverageAccuracy:
      totalCompleted > 0 ? Number((totalAccuracy / totalCompleted).toFixed(2)) : 0,
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
