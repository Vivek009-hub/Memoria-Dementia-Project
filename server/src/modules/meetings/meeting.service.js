/**
 * meeting.service.js — Business logic for Memora Meeting Circle
 *
 * Implements meeting lifecycle, authorization, join/leave tracking,
 * capacity enforcement, host controls, and attendance history.
 */

import mongoose from 'mongoose';
import Meeting from './meeting.model.js';
import MeetingParticipant from './meetingParticipant.model.js';
import MeetingAttendance from './meetingAttendance.model.js';
import CommunitySession from '../community/communitySession.model.js';
import SessionRegistration from '../community/sessionRegistration.model.js';
import mockMeetingProvider from './mockMeetingProvider.js';
import { AppError } from '../../utils/AppError.js';

// Cache of processed webhook event IDs for idempotency
const processedWebhookEvents = new Set();

/**
 * Helper to get the active provider adapter.
 */
function getProvider(_providerName = 'mock') {
  return mockMeetingProvider;
}

/**
 * Create or ensure a Meeting for an approved/scheduled CommunitySession.
 */
export async function createMeetingForSession(sessionId, user, meetingData = {}) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'SESSION_NOT_FOUND');
  }

  if (session.status === 'CANCELLED') {
    throw new AppError('Cannot create a meeting for a cancelled session', 400, 'SESSION_CANCELLED');
  }

  // Requester must be the session host, creator, or an Admin
  const isHost = session.hostId && session.hostId.toString() === user.id.toString();
  const isCreator = session.createdBy && session.createdBy.toString() === user.id.toString();
  const isAdmin = user.role === 'ADMIN';

  if (!isHost && !isCreator && !isAdmin) {
    throw new AppError(
      'You do not have permission to create a meeting for this session',
      403,
      'FORBIDDEN'
    );
  }

  // Check if meeting already exists
  let existingMeeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (existingMeeting) {
    if (existingMeeting.status !== 'CANCELLED') {
      return existingMeeting;
    }
  }

  const title = meetingData.title || session.title;
  const description = meetingData.description || session.description || '';
  const meetingType = meetingData.meetingType || session.meetingType || 'VIDEO';
  const maximumParticipants = meetingData.maximumParticipants || session.maximumParticipants || 20;
  const scheduledAt = meetingData.scheduledAt || session.scheduledAt || session.date || new Date();

  // Call provider abstraction
  const provider = getProvider('mock');
  const providerRes = await provider.createMeeting({
    title,
    meetingType,
    maximumParticipants,
  });

  const meeting = await Meeting.create({
    communitySessionId: session._id,
    title,
    description,
    hostId: session.hostId || user.id,
    scheduledAt,
    meetingType,
    maximumParticipants,
    status: 'SCHEDULED',
    provider: 'mock',
    providerMeetingId: providerRes.providerMeetingId,
    meetingUrl: providerRes.meetingUrl,
    createdBy: user.id,
  });

  // Register host as participant
  await MeetingParticipant.findOneAndUpdate(
    { meetingId: meeting._id, userId: meeting.hostId },
    {
      meetingId: meeting._id,
      userId: meeting.hostId,
      role: 'HOST',
      status: 'REGISTERED',
    },
    { upsert: true, new: true }
  );

  return meeting;
}

/**
 * Get meeting details by session ID.
 */
export async function getMeetingBySessionId(sessionId, _user) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }
  return meeting;
}

/**
 * Join a meeting for a Community Session.
 */
export async function joinMeeting(sessionId, user) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'SESSION_NOT_FOUND');
  }

  if (session.status === 'CANCELLED') {
    throw new AppError('This session has been cancelled', 400, 'SESSION_CANCELLED');
  }

  // Determine user role for meeting
  const isHost =
    (session.hostId && session.hostId.toString() === user.id.toString()) || user.role === 'ADMIN';
  const participantRole = isHost ? 'HOST' : 'PATIENT';

  if (!isHost) {
    // Non-host users must be registered for the Community Session
    const registration = await SessionRegistration.findOne({
      sessionId: session._id,
      patientId: user.id,
    });

    if (!registration || registration.status === 'CANCELLED') {
      throw new AppError(
        'You must be registered for this session to join the meeting',
        403,
        'FORBIDDEN'
      );
    }
  }

  // Find or auto-create meeting if not yet created but host is joining
  let meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    if (isHost) {
      meeting = await createMeetingForSession(sessionId, user);
    } else {
      throw new AppError(
        'Meeting has not been initialized for this session yet',
        404,
        'MEETING_NOT_INITIALIZED'
      );
    }
  }

  // Check meeting status
  if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(meeting.status)) {
    throw new AppError(
      `Meeting is ${meeting.status.toLowerCase()} and cannot be joined`,
      400,
      'MEETING_CLOSED'
    );
  }

  // Check existing participant record
  const existingParticipant = await MeetingParticipant.findOne({
    meetingId: meeting._id,
    userId: user.id,
  });

  const isAlreadyJoined = existingParticipant && existingParticipant.status === 'JOINED';

  // Capacity check under race conditions if user is not already active in room
  if (!isAlreadyJoined) {
    // Use atomic update to enforce max capacity safely
    const updatedMeeting = await Meeting.findOneAndUpdate(
      {
        _id: meeting._id,
        activeParticipantCount: { $lt: meeting.maximumParticipants },
      },
      { $inc: { activeParticipantCount: 1 } },
      { new: true }
    );

    if (!updatedMeeting) {
      throw new AppError('Meeting has reached maximum capacity', 400, 'MEETING_FULL');
    }
    meeting = updatedMeeting;
  }

  // Generate provider join token
  const provider = getProvider(meeting.provider);
  const joinCredentials = await provider.createParticipantToken({
    providerMeetingId: meeting.providerMeetingId,
    userId: user.id,
    role: participantRole,
    displayName: user.name || 'Participant',
  });

  // Update participant status
  const now = new Date();
  const participant = await MeetingParticipant.findOneAndUpdate(
    { meetingId: meeting._id, userId: user.id },
    {
      meetingId: meeting._id,
      userId: user.id,
      role: participantRole,
      status: 'JOINED',
      joinedAt: existingParticipant?.joinedAt || now,
      leftAt: null,
    },
    { upsert: true, new: true }
  );

  // Record attendance log
  await MeetingAttendance.create({
    meetingId: meeting._id,
    userId: user.id,
    role: participantRole,
    joinedAt: now,
    status: 'JOINED',
  });

  // Transition SCHEDULED -> READY if joining before live
  if (meeting.status === 'SCHEDULED') {
    meeting.status = 'READY';
    await meeting.save();
  }

  return {
    meeting: {
      id: meeting._id,
      title: meeting.title,
      meetingType: meeting.meetingType,
      status: meeting.status,
      hostId: meeting.hostId,
      activeParticipantCount: meeting.activeParticipantCount,
    },
    participant: {
      id: participant._id,
      role: participant.role,
      status: participant.status,
    },
    joinCredentials,
  };
}

/**
 * Leave a meeting.
 */
export async function leaveMeeting(sessionId, user) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }

  const participant = await MeetingParticipant.findOne({
    meetingId: meeting._id,
    userId: user.id,
  });

  if (!participant || participant.status !== 'JOINED') {
    return { success: true, message: 'User is not currently active in meeting' };
  }

  const now = new Date();
  participant.status = 'LEFT';
  participant.leftAt = now;
  await participant.save();

  // Atomically decrement active participant count
  await Meeting.updateOne(
    { _id: meeting._id, activeParticipantCount: { $gt: 0 } },
    { $inc: { activeParticipantCount: -1 } }
  );

  // Update attendance log duration
  const activeAttendance = await MeetingAttendance.findOne({
    meetingId: meeting._id,
    userId: user.id,
    status: 'JOINED',
  }).sort({ joinedAt: -1 });

  if (activeAttendance) {
    activeAttendance.status = 'LEFT';
    activeAttendance.leftAt = now;
    const duration = Math.max(
      0,
      Math.floor((now.getTime() - activeAttendance.joinedAt.getTime()) / 1000)
    );
    activeAttendance.durationSeconds = duration;
    await activeAttendance.save();
  }

  return { success: true, message: 'Left meeting successfully' };
}

/**
 * Host starts the meeting.
 */
export async function startMeeting(sessionId, user) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }

  const isHost = meeting.hostId.toString() === user.id.toString() || user.role === 'ADMIN';
  if (!isHost) {
    throw new AppError('Only the designated host can start the meeting', 403, 'FORBIDDEN');
  }

  if (meeting.status === 'LIVE') {
    return meeting;
  }

  if (['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(meeting.status)) {
    throw new AppError(
      `Cannot start a meeting that is ${meeting.status.toLowerCase()}`,
      400,
      'INVALID_STATE_TRANSITION'
    );
  }

  const provider = getProvider(meeting.provider);
  await provider.startMeeting(meeting.providerMeetingId);

  meeting.status = 'LIVE';
  meeting.startedAt = meeting.startedAt || new Date();
  await meeting.save();

  // Update community session status
  await CommunitySession.findByIdAndUpdate(sessionId, { status: 'LIVE' });

  return meeting;
}

/**
 * Host ends the meeting.
 */
export async function endMeeting(sessionId, user) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }

  const isHost = meeting.hostId.toString() === user.id.toString() || user.role === 'ADMIN';
  if (!isHost) {
    throw new AppError('Only the designated host can end the meeting', 403, 'FORBIDDEN');
  }

  if (meeting.status === 'COMPLETED') {
    return meeting;
  }

  const provider = getProvider(meeting.provider);
  await provider.endMeeting(meeting.providerMeetingId);

  const now = new Date();
  meeting.status = 'COMPLETED';
  meeting.endedAt = now;
  meeting.activeParticipantCount = 0;
  await meeting.save();

  // Mark all active participants as LEFT
  await MeetingParticipant.updateMany(
    { meetingId: meeting._id, status: 'JOINED' },
    { status: 'LEFT', leftAt: now }
  );

  // Close open attendance records
  const openAttendance = await MeetingAttendance.find({
    meetingId: meeting._id,
    status: 'JOINED',
  });

  for (const record of openAttendance) {
    record.status = 'LEFT';
    record.leftAt = now;
    record.durationSeconds = Math.max(
      0,
      Math.floor((now.getTime() - record.joinedAt.getTime()) / 1000)
    );
    await record.save();
  }

  // Update community session status
  await CommunitySession.findByIdAndUpdate(sessionId, { status: 'COMPLETED' });

  return meeting;
}

/**
 * Host removes a participant from the meeting.
 */
export async function removeParticipant(sessionId, hostUser, targetUserId) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }

  const isHost = meeting.hostId.toString() === hostUser.id.toString() || hostUser.role === 'ADMIN';
  if (!isHost) {
    throw new AppError('Only the host can remove participants', 403, 'FORBIDDEN');
  }

  const participant = await MeetingParticipant.findOne({
    meetingId: meeting._id,
    userId: targetUserId,
  });

  if (!participant) {
    throw new AppError('Participant not found in meeting', 404, 'RESOURCE_NOT_FOUND');
  }

  const provider = getProvider(meeting.provider);
  await provider.removeParticipant(meeting.providerMeetingId, targetUserId);

  const now = new Date();
  const wasJoined = participant.status === 'JOINED';

  participant.status = 'REMOVED';
  participant.leftAt = now;
  await participant.save();

  if (wasJoined) {
    await Meeting.updateOne(
      { _id: meeting._id, activeParticipantCount: { $gt: 0 } },
      { $inc: { activeParticipantCount: -1 } }
    );

    const activeAttendance = await MeetingAttendance.findOne({
      meetingId: meeting._id,
      userId: targetUserId,
      status: 'JOINED',
    });

    if (activeAttendance) {
      activeAttendance.status = 'REMOVED';
      activeAttendance.leftAt = now;
      activeAttendance.durationSeconds = Math.max(
        0,
        Math.floor((now.getTime() - activeAttendance.joinedAt.getTime()) / 1000)
      );
      await activeAttendance.save();
    }
  }

  return participant;
}

/**
 * Get attendance records for a meeting session (Host/Admin access).
 */
export async function getAttendanceHistory(sessionId, user) {
  const meeting = await Meeting.findOne({ communitySessionId: sessionId });
  if (!meeting) {
    throw new AppError('Meeting not found for this session', 404, 'RESOURCE_NOT_FOUND');
  }

  const isHost = meeting.hostId.toString() === user.id.toString() || user.role === 'ADMIN';
  if (!isHost) {
    throw new AppError('Only hosts or admins can view full attendance logs', 403, 'FORBIDDEN');
  }

  const attendanceRecords = await MeetingAttendance.find({ meetingId: meeting._id })
    .populate('userId', 'name role profileImageUrl')
    .sort({ joinedAt: -1 });

  return attendanceRecords;
}

/**
 * Get meeting history for a patient or user.
 */
export async function getPatientMeetingHistory(userId) {
  const participantRecords = await MeetingParticipant.find({ userId })
    .populate({
      path: 'meetingId',
      select: 'title description meetingType status scheduledAt startedAt endedAt provider',
    })
    .sort({ createdAt: -1 });

  return participantRecords;
}

/**
 * Handle incoming webhooks from meeting engine provider.
 */
export async function handleWebhook(providerName, payload = {}, headers = {}) {
  // Signature check placeholder
  const signature = headers['x-webhook-signature'] || headers['signature'];
  if (providerName !== 'mock' && !signature) {
    throw new AppError('Missing webhook signature', 401, 'UNAUTHORIZED_WEBHOOK');
  }

  const eventId = payload.eventId || payload.id || `${Date.now()}_${Math.random()}`;
  if (processedWebhookEvents.has(eventId)) {
    return { success: true, message: 'Event already processed (idempotent)' };
  }

  processedWebhookEvents.add(eventId);

  const { eventType, providerMeetingId, userId } = payload;
  const safeProviderMeetingId =
    typeof providerMeetingId === 'string' ? providerMeetingId.trim() : null;

  if (safeProviderMeetingId) {
    const meeting = await Meeting.findOne({ providerMeetingId: safeProviderMeetingId });
    if (meeting) {
      if (eventType === 'participant.joined' && userId) {
        // Safe idempotent join update
      } else if (eventType === 'participant.left' && userId) {
        // Safe idempotent leave update
      } else if (eventType === 'meeting.ended') {
        meeting.status = 'COMPLETED';
        meeting.endedAt = new Date();
        await meeting.save();
      }
    }
  }

  return { success: true, message: 'Webhook event processed successfully' };
}
