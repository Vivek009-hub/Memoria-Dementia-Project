/**
 * community.service.js — Business logic for Community Sessions & Proposals
 */

import CommunityProposal from './communityProposal.model.js';
import CommunityVote from './communityVote.model.js';
import CommunitySession from './communitySession.model.js';
import SessionRegistration from './sessionRegistration.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitNotificationEvent } from '../notifications/notification.events.js';

// ── PROPOSAL & VOTING SERVICES ───────────────────────────────────────────────

/**
 * Admin creates a new session proposal/idea.
 */
export async function createProposal(userId, data) {
  const { title, description, sessionType, votingStartsAt, votingEndsAt, imageUrl } = data;

  const proposal = await CommunityProposal.create({
    title,
    description: description || '',
    sessionType: sessionType || 'OTHER',
    imageUrl: imageUrl || null,
    status: 'VOTING',
    votingStartsAt: votingStartsAt ? new Date(votingStartsAt) : new Date(),
    votingEndsAt: votingEndsAt ? new Date(votingEndsAt) : null,
    createdBy: userId,
  });

  return proposal;
}

/**
 * Admin updates an existing proposal.
 */
export async function updateProposal(ideaId, data) {
  const proposal = await CommunityProposal.findById(ideaId);
  if (!proposal) {
    throw new AppError('Proposal not found', 404, 'NOT_FOUND');
  }

  if (data.title !== undefined) proposal.title = data.title;
  if (data.description !== undefined) proposal.description = data.description;
  if (data.sessionType !== undefined) proposal.sessionType = data.sessionType;
  if (data.imageUrl !== undefined) proposal.imageUrl = data.imageUrl;
  if (data.status !== undefined) proposal.status = data.status;
  if (data.votingStartsAt !== undefined)
    proposal.votingStartsAt = data.votingStartsAt ? new Date(data.votingStartsAt) : null;
  if (data.votingEndsAt !== undefined)
    proposal.votingEndsAt = data.votingEndsAt ? new Date(data.votingEndsAt) : null;

  await proposal.save();
  return proposal;
}

/**
 * Admin opens or closes voting for a session proposal.
 */
export async function toggleVotingStatus(ideaId, isOpen) {
  const proposal = await CommunityProposal.findById(ideaId);
  if (!proposal) {
    throw new AppError('Proposal not found', 404, 'NOT_FOUND');
  }

  proposal.status = isOpen ? 'VOTING' : 'CLOSED';
  await proposal.save();
  return proposal;
}

/**
 * Patient / Public lists active voting proposals.
 */
export async function getVotingProposals(queryParams = {}, patientId = null) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = { status: 'VOTING' };
  if (queryParams.sessionType) {
    filter.sessionType = queryParams.sessionType;
  }

  const [proposals, total] = await Promise.all([
    CommunityProposal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    CommunityProposal.countDocuments(filter),
  ]);

  let userVotesMap = new Set();
  if (patientId) {
    const proposalIds = proposals.map((p) => p._id);
    const votes = await CommunityVote.find({
      proposalId: { $in: proposalIds },
      patientId,
    }).lean();
    userVotesMap = new Set(votes.map((v) => v.proposalId.toString()));
  }

  const data = proposals.map((p) => ({
    ...p,
    hasVoted: patientId ? userVotesMap.has(p._id.toString()) : false,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Patient submits a vote for a proposal.
 */
export async function voteForProposal(ideaId, patientId) {
  const proposal = await CommunityProposal.findById(ideaId);
  if (!proposal) {
    throw new AppError('Session idea not found', 404, 'NOT_FOUND');
  }

  if (proposal.status !== 'VOTING') {
    throw new AppError(
      `Cannot vote on a proposal in status '${proposal.status}'`,
      409,
      'INVALID_STATUS'
    );
  }

  const now = new Date();
  if (proposal.votingStartsAt && now < proposal.votingStartsAt) {
    throw new AppError('Voting has not opened yet for this idea', 409, 'VOTING_NOT_OPEN');
  }
  if (proposal.votingEndsAt && now > proposal.votingEndsAt) {
    throw new AppError('Voting period has expired for this idea', 409, 'VOTING_EXPIRED');
  }

  // Pre-check for duplicate vote
  const existingVote = await CommunityVote.findOne({ proposalId: ideaId, patientId });
  if (existingVote) {
    throw new AppError('You have already voted for this session idea', 409, 'DUPLICATE_VOTE');
  }

  try {
    await CommunityVote.create({
      proposalId: ideaId,
      patientId,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('You have already voted for this session idea', 409, 'DUPLICATE_VOTE');
    }
    throw err;
  }

  const updatedProposal = await CommunityProposal.findByIdAndUpdate(
    ideaId,
    { $inc: { voteCount: 1 } },
    { new: true }
  );

  return {
    proposal: updatedProposal,
    hasVoted: true,
  };
}

/**
 * Patient removes their vote for a proposal.
 */
export async function removeVote(ideaId, patientId) {
  const proposal = await CommunityProposal.findById(ideaId);
  if (!proposal) {
    throw new AppError('Session idea not found', 404, 'NOT_FOUND');
  }

  if (proposal.status !== 'VOTING') {
    throw new AppError('Cannot remove vote from an inactive proposal', 409, 'INVALID_STATUS');
  }

  const deleted = await CommunityVote.findOneAndDelete({ proposalId: ideaId, patientId });
  if (!deleted) {
    throw new AppError('You have not voted for this session idea', 404, 'NOT_FOUND');
  }

  const updatedProposal = await CommunityProposal.findByIdAndUpdate(
    ideaId,
    { $inc: { voteCount: -1 } },
    { new: true }
  );

  return {
    proposal: updatedProposal,
    hasVoted: false,
  };
}

/**
 * Admin retrieves all voting results & proposals.
 */
export async function getVotingResults(queryParams = {}) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (queryParams.status) {
    filter.status = queryParams.status;
  }
  if (queryParams.sessionType) {
    filter.sessionType = queryParams.sessionType;
  }

  const [proposals, total] = await Promise.all([
    CommunityProposal.find(filter)
      .sort({ voteCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommunityProposal.countDocuments(filter),
  ]);

  return {
    data: proposals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Admin approves a session proposal.
 */
export async function approveProposal(ideaId, adminId) {
  const proposal = await CommunityProposal.findById(ideaId);
  if (!proposal) {
    throw new AppError('Session idea not found', 404, 'NOT_FOUND');
  }

  if (['APPROVED', 'CONVERTED_TO_SESSION', 'COMPLETED', 'CANCELLED'].includes(proposal.status)) {
    throw new AppError(
      `Cannot approve a proposal currently in '${proposal.status}' status`,
      409,
      'INVALID_STATUS'
    );
  }

  proposal.status = 'APPROVED';
  proposal.approvedBy = adminId;
  proposal.approvedAt = new Date();

  await proposal.save();

  // B9 — Notify all patients who voted for this proposal
  const votes = await CommunityVote.find({ proposalId: proposal._id }).lean();
  if (votes.length > 0) {
    const voterUserIds = votes.map((v) => v.patientId.toString());
    emitNotificationEvent('CommunitySessionApproved', {
      proposalId: proposal._id.toString(),
      sessionTitle: proposal.title,
      voterUserIds,
    });
  }

  return proposal;
}

// ── SCHEDULE & REGISTRATION SERVICES ────────────────────────────────────────

/**
 * Admin schedules an approved proposal into an official CommunitySession.
 */
export async function scheduleSession(ideaId, adminId, data) {
  let proposal = null;
  if (ideaId) {
    proposal = await CommunityProposal.findById(ideaId);
    if (!proposal) {
      throw new AppError('Session idea not found', 404, 'NOT_FOUND');
    }
    if (['CONVERTED_TO_SESSION', 'CANCELLED'].includes(proposal.status)) {
      throw new AppError(
        `Proposal cannot be scheduled because it is already '${proposal.status}'`,
        409,
        'INVALID_STATUS'
      );
    }
  }

  const dateObj = new Date(data.date);
  const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : dateObj;

  const session = await CommunitySession.create({
    proposalId: proposal ? proposal._id : null,
    title: data.title || (proposal ? proposal.title : ''),
    description: data.description || (proposal ? proposal.description : ''),
    sessionType: data.sessionType || (proposal ? proposal.sessionType : 'OTHER'),
    sessionImageUrl: data.sessionImageUrl || (proposal ? proposal.imageUrl : null),
    date: dateObj,
    startTime: data.startTime,
    endTime: data.endTime || null,
    durationMinutes: data.durationMinutes || 60,
    scheduledAt,
    timezone: data.timezone || 'Asia/Kolkata',
    hostId: data.hostId || null,
    featuredPerson: data.featuredPerson || {},
    maximumParticipants: data.maximumParticipants || 20,
    registeredCount: 0,
    meetingType: data.meetingType || 'VIDEO',
    meetingUrl: data.meetingUrl || null,
    registrationStatus: 'OPEN',
    status: 'SCHEDULED',
    createdBy: adminId,
  });

  if (proposal) {
    proposal.status = 'CONVERTED_TO_SESSION';
    proposal.communitySessionId = session._id;
    await proposal.save();

    // B9 — Notify voters who voted for the original proposal
    const votes = await CommunityVote.find({ proposalId: proposal._id }).lean();
    if (votes.length > 0) {
      const voterUserIds = votes.map((v) => v.patientId.toString());
      emitNotificationEvent('CommunitySessionScheduled', {
        sessionId: session._id.toString(),
        sessionTitle: session.title,
        sessionDate: session.date ? session.date.toISOString().split('T')[0] : null,
        targetUserIds: voterUserIds,
      });
    }
  }

  return session;
}

/**
 * Patients / Public view scheduled sessions.
 */
export async function getSchedule(queryParams = {}, patientId = null) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = { status: 'SCHEDULED' };
  if (queryParams.sessionType) filter.sessionType = queryParams.sessionType;
  if (queryParams.meetingType) filter.meetingType = queryParams.meetingType;
  if (queryParams.registrationStatus) filter.registrationStatus = queryParams.registrationStatus;

  const [sessions, total] = await Promise.all([
    CommunitySession.find(filter).sort({ scheduledAt: 1 }).skip(skip).limit(limit).lean(),
    CommunitySession.countDocuments(filter),
  ]);

  let patientRegistrationsMap = new Map();
  if (patientId) {
    const sessionIds = sessions.map((s) => s._id);
    const regs = await SessionRegistration.find({
      sessionId: { $in: sessionIds },
      patientId,
    }).lean();
    patientRegistrationsMap = new Map(regs.map((r) => [r.sessionId.toString(), r.status]));
  }

  const data = sessions.map((s) => {
    const regStatus = patientId ? patientRegistrationsMap.get(s._id.toString()) : null;
    return {
      ...s,
      userRegistration: regStatus
        ? { isRegistered: regStatus === 'REGISTERED', status: regStatus }
        : { isRegistered: false, status: null },
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single session by ID.
 */
export async function getSessionById(sessionId, patientId = null) {
  const session = await CommunitySession.findById(sessionId).lean();
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  let userRegistration = { isRegistered: false, status: null };
  if (patientId) {
    const reg = await SessionRegistration.findOne({ sessionId, patientId }).lean();
    if (reg) {
      userRegistration = { isRegistered: reg.status === 'REGISTERED', status: reg.status };
    }
  }

  return {
    ...session,
    userRegistration,
  };
}

/**
 * Patient pre-registers for a scheduled event.
 */
export async function registerForSession(sessionId, patientId) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  if (session.status !== 'SCHEDULED') {
    throw new AppError(
      `Cannot register for a session in '${session.status}' status`,
      409,
      'INVALID_STATUS'
    );
  }

  if (session.registrationStatus !== 'OPEN') {
    const errorCode =
      session.registrationStatus === 'FULL' ? 'SESSION_FULL' : 'REGISTRATION_CLOSED';
    throw new AppError(
      `Registration for this session is ${session.registrationStatus.toLowerCase()}`,
      409,
      errorCode
    );
  }

  // Pre-check for existing registration
  const existingReg = await SessionRegistration.findOne({ sessionId, patientId });
  if (existingReg) {
    if (existingReg.status === 'REGISTERED') {
      throw new AppError(
        'You are already registered for this session',
        409,
        'DUPLICATE_REGISTRATION'
      );
    }
    // Re-activating cancelled registration
    existingReg.status = 'REGISTERED';
    existingReg.cancelledAt = null;
    existingReg.registeredAt = new Date();
    await existingReg.save();
  } else {
    // Atomic check and increment for capacity race condition protection
    const updatedSession = await CommunitySession.findOneAndUpdate(
      {
        _id: sessionId,
        status: 'SCHEDULED',
        registrationStatus: 'OPEN',
        registeredCount: { $lt: session.maximumParticipants },
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedSession) {
      // Re-read to provide correct error
      const current = await CommunitySession.findById(sessionId);
      if (current && current.registeredCount >= current.maximumParticipants) {
        await CommunitySession.findByIdAndUpdate(sessionId, { registrationStatus: 'FULL' });
        throw new AppError('Session participant capacity has been reached', 409, 'SESSION_FULL');
      }
      throw new AppError('Unable to register for session', 409, 'REGISTRATION_FAILED');
    }

    try {
      await SessionRegistration.create({
        sessionId,
        patientId,
        status: 'REGISTERED',
      });
    } catch (err) {
      // Rollback count if DB constraint failed
      await CommunitySession.findByIdAndUpdate(sessionId, { $inc: { registeredCount: -1 } });
      if (err.code === 11000) {
        throw new AppError(
          'You are already registered for this session',
          409,
          'DUPLICATE_REGISTRATION'
        );
      }
      throw err;
    }

    // Check if max capacity was reached
    if (updatedSession.registeredCount >= updatedSession.maximumParticipants) {
      await CommunitySession.findByIdAndUpdate(sessionId, { registrationStatus: 'FULL' });
    }
  }

  const finalSession = await CommunitySession.findById(sessionId).lean();
  return {
    session: finalSession,
    registration: { isRegistered: true, status: 'REGISTERED' },
  };
}

/**
 * Patient cancels registration.
 */
export async function cancelRegistration(sessionId, patientId) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  const reg = await SessionRegistration.findOne({ sessionId, patientId, status: 'REGISTERED' });
  if (!reg) {
    throw new AppError('Active registration not found for this session', 404, 'NOT_FOUND');
  }

  reg.status = 'CANCELLED';
  reg.cancelledAt = new Date();
  await reg.save();

  // Atomically decrement count and re-open status if it was FULL
  const updatedSession = await CommunitySession.findByIdAndUpdate(
    sessionId,
    { $inc: { registeredCount: -1 } },
    { new: true }
  );

  if (
    updatedSession.registeredCount < updatedSession.maximumParticipants &&
    updatedSession.registrationStatus === 'FULL'
  ) {
    await CommunitySession.findByIdAndUpdate(sessionId, { registrationStatus: 'OPEN' });
  }

  return {
    sessionId,
    status: 'CANCELLED',
  };
}

/**
 * Get patient's registrations.
 */
export async function getMyRegistrations(patientId, queryParams = {}) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [regs, total] = await Promise.all([
    SessionRegistration.find({ patientId, status: 'REGISTERED' })
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SessionRegistration.countDocuments({ patientId, status: 'REGISTERED' }),
  ]);

  return {
    data: regs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ── ADMIN EVENT MANAGEMENT ───────────────────────────────────────────────────

export async function adminUpdateSession(sessionId, data) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  if (data.title !== undefined) session.title = data.title;
  if (data.description !== undefined) session.description = data.description;
  if (data.sessionType !== undefined) session.sessionType = data.sessionType;
  if (data.date !== undefined) session.date = new Date(data.date);
  if (data.startTime !== undefined) session.startTime = data.startTime;
  if (data.endTime !== undefined) session.endTime = data.endTime;
  if (data.durationMinutes !== undefined) session.durationMinutes = data.durationMinutes;
  if (data.timezone !== undefined) session.timezone = data.timezone;
  if (data.hostId !== undefined) session.hostId = data.hostId;
  if (data.featuredPerson !== undefined) session.featuredPerson = data.featuredPerson;
  if (data.maximumParticipants !== undefined)
    session.maximumParticipants = data.maximumParticipants;
  if (data.meetingType !== undefined) session.meetingType = data.meetingType;
  if (data.registrationStatus !== undefined) session.registrationStatus = data.registrationStatus;
  if (data.status !== undefined) session.status = data.status;

  await session.save();
  return session;
}

export async function adminCancelSession(sessionId) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  session.status = 'CANCELLED';
  session.registrationStatus = 'CLOSED';
  await session.save();

  // B9 — Notify all REGISTERED participants about cancellation
  const registrations = await SessionRegistration.find({
    sessionId: session._id,
    status: 'REGISTERED',
  }).lean();

  if (registrations.length > 0) {
    const targetUserIds = registrations.map((r) => r.patientId.toString());
    emitNotificationEvent('CommunitySessionCancelled', {
      sessionId: session._id.toString(),
      sessionTitle: session.title,
      targetUserIds,
    });
  }

  return session;
}

export async function adminCloseRegistration(sessionId) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  session.registrationStatus = 'CLOSED';
  await session.save();

  return session;
}

export async function adminGetRegistrations(sessionId, queryParams = {}) {
  const session = await CommunitySession.findById(sessionId);
  if (!session) {
    throw new AppError('Community session not found', 404, 'NOT_FOUND');
  }

  const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const [regs, total] = await Promise.all([
    SessionRegistration.find({ sessionId })
      .populate('patientId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    SessionRegistration.countDocuments({ sessionId }),
  ]);

  return {
    data: regs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
