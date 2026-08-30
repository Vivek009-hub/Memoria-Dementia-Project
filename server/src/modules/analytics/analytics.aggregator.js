/**
 * analytics.aggregator.js — Pure calculation engine for Analytics metrics
 */

import GameSession from '../games/gameSession.model.js';
import ReminderLog from '../reminders/reminderLog.model.js';
import Memory from '../memories/memory.model.js';
import CommunityVote from '../community/communityVote.model.js';
import SessionRegistration from '../community/sessionRegistration.model.js';
import ActivityEvent from './activityEvent.model.js';

/**
 * Calculate game performance analytics for a patient over a time range.
 */
export async function aggregateGameMetrics(patientId, startDate, endDate) {
  const match = { patientId };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = startDate;
    if (endDate) match.createdAt.$lte = endDate;
  }

  const sessions = await GameSession.find(match).lean();

  const played = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const completed = completedSessions.length;
  const abandoned = sessions.filter((s) => s.status === 'ABANDONED').length;

  let totalScore = 0;
  let totalAccuracy = 0;
  let bestScore = 0;

  completedSessions.forEach((s) => {
    const score = s.score || 0;
    const accuracy = s.accuracy || 0;
    totalScore += score;
    totalAccuracy += accuracy;
    if (score > bestScore) bestScore = score;
  });

  const avgScore = completed > 0 ? Math.round(totalScore / completed) : 0;
  const avgAccuracy = completed > 0 ? Number((totalAccuracy / completed).toFixed(2)) : 0;
  const completionRate = played > 0 ? Number((completed / played).toFixed(2)) : 0;

  return {
    played,
    completed,
    abandoned,
    avgScore,
    avgAccuracy,
    bestScore,
    completionRate,
  };
}

/**
 * Calculate reminder adherence analytics for a patient over a time range.
 */
export async function aggregateReminderMetrics(patientId, startDate, endDate) {
  const match = { patientId };
  if (startDate || endDate) {
    match.scheduledAt = {};
    if (startDate) match.scheduledAt.$gte = startDate;
    if (endDate) match.scheduledAt.$lte = endDate;
  }

  const logs = await ReminderLog.find(match).lean();

  const total = logs.length;
  const completed = logs.filter((l) => l.status === 'COMPLETED').length;
  const skipped = logs.filter((l) => l.status === 'SKIPPED').length;
  const missed = logs.filter((l) => l.status === 'MISSED').length;
  const completionRate = total > 0 ? Number((completed / total).toFixed(2)) : 0;

  return {
    total,
    completed,
    skipped,
    missed,
    completionRate,
  };
}

/**
 * Calculate memory usage analytics for a patient over a time range.
 */
export async function aggregateMemoryMetrics(patientId, startDate, endDate) {
  const activeCount = await Memory.countDocuments({ patientId, isActive: true });

  const eventMatch = { patientId, source: 'MEMORIES' };
  if (startDate || endDate) {
    eventMatch.timestamp = {};
    if (startDate) eventMatch.timestamp.$gte = startDate;
    if (endDate) eventMatch.timestamp.$lte = endDate;
  }

  const [createdEvents, viewedEvents] = await Promise.all([
    ActivityEvent.countDocuments({ ...eventMatch, eventType: 'MEMORY_CREATED' }),
    ActivityEvent.countDocuments({ ...eventMatch, eventType: 'MEMORY_VIEWED' }),
  ]);

  return {
    created: createdEvents,
    viewed: viewedEvents,
    activeCount,
  };
}

/**
 * Calculate community participation analytics for a patient.
 */
export async function aggregateCommunityMetrics(patientId, startDate, endDate) {
  const voteMatch = { patientId };
  const regMatch = { patientId };

  if (startDate || endDate) {
    voteMatch.createdAt = {};
    regMatch.createdAt = {};
    if (startDate) {
      voteMatch.createdAt.$gte = startDate;
      regMatch.createdAt.$gte = startDate;
    }
    if (endDate) {
      voteMatch.createdAt.$lte = endDate;
      regMatch.createdAt.$lte = endDate;
    }
  }

  const [votes, regs] = await Promise.all([
    CommunityVote.countDocuments(voteMatch),
    SessionRegistration.find(regMatch).lean(),
  ]);

  const registrations = regs.length;
  const attendances = regs.filter((r) => r.status === 'ATTENDED').length;

  return {
    votes,
    registrations,
    attendances,
  };
}

/**
 * Calculate overall deterministic activity index / engagement score.
 */
export function calculateEngagementScore(games, reminders, memories, community) {
  let score = 0;
  score += (games.completed || 0) * 10;
  score += (reminders.completed || 0) * 5;
  score += (memories.created || 0) * 8 + (memories.viewed || 0) * 2;
  score += (community.votes || 0) * 3 + (community.registrations || 0) * 5 + (community.attendances || 0) * 10;
  return score;
}
