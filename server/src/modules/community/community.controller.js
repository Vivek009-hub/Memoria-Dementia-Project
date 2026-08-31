/**
 * community.controller.js — Request handlers for Community Sessions & Proposals
 */

import * as communityService from './community.service.js';
import {
  validateObjectId,
  validateCreateProposal,
  validateUpdateProposal,
  validateScheduleSession,
  validateUpdateSession,
  validatePaginationParams,
} from './community.validation.js';

// ── PROPOSALS & VOTING HANDLERS ─────────────────────────────────────────────

export async function createProposal(req, res, next) {
  try {
    validateCreateProposal(req.body);
    const proposal = await communityService.createProposal(req.user.id, req.body);
    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
}

export async function updateProposal(req, res, next) {
  try {
    const { ideaId } = req.params;
    validateObjectId(ideaId, 'ideaId');
    validateUpdateProposal(req.body);
    const proposal = await communityService.updateProposal(ideaId, req.body);
    res.status(200).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
}

export async function getVotingProposals(req, res, next) {
  try {
    const pagination = validatePaginationParams(req.query);
    const result = await communityService.getVotingProposals(
      { ...req.query, ...pagination },
      req.user?.id || null
    );
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function voteForProposal(req, res, next) {
  try {
    const { ideaId } = req.params;
    validateObjectId(ideaId, 'ideaId');
    const result = await communityService.voteForProposal(ideaId, req.user.id);
    res.status(200).json({
      success: true,
      data: result.proposal,
      hasVoted: result.hasVoted,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeVote(req, res, next) {
  try {
    const { ideaId } = req.params;
    validateObjectId(ideaId, 'ideaId');
    const result = await communityService.removeVote(ideaId, req.user.id);
    res.status(200).json({
      success: true,
      data: result.proposal,
      hasVoted: result.hasVoted,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVotingResults(req, res, next) {
  try {
    const pagination = validatePaginationParams(req.query);
    const result = await communityService.getVotingResults({
      ...req.query,
      ...pagination,
    });
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function approveProposal(req, res, next) {
  try {
    const { ideaId } = req.params;
    validateObjectId(ideaId, 'ideaId');
    const proposal = await communityService.approveProposal(ideaId, req.user.id);
    res.status(200).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
}

export async function toggleVotingStatus(req, res, next) {
  try {
    const { ideaId } = req.params;
    const { isOpen } = req.body;
    validateObjectId(ideaId, 'ideaId');
    const proposal = await communityService.toggleVotingStatus(ideaId, Boolean(isOpen));
    res.status(200).json({ success: true, data: proposal });
  } catch (err) {
    next(err);
  }
}

// ── SCHEDULE & REGISTRATION HANDLERS ────────────────────────────────────────

export async function scheduleSession(req, res, next) {
  try {
    const { ideaId } = req.params;
    if (ideaId) {
      validateObjectId(ideaId, 'ideaId');
    }
    validateScheduleSession(req.body);
    const session = await communityService.scheduleSession(ideaId || null, req.user.id, req.body);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function getSchedule(req, res, next) {
  try {
    const pagination = validatePaginationParams(req.query);
    const result = await communityService.getSchedule(
      { ...req.query, ...pagination },
      req.user?.id || null
    );
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionById(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const session = await communityService.getSessionById(sessionId, req.user?.id || null);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function registerForSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const result = await communityService.registerForSession(sessionId, req.user.id);
    res.status(200).json({
      success: true,
      data: result.session,
      userRegistration: result.registration,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelRegistration(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const result = await communityService.cancelRegistration(sessionId, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getMyRegistrations(req, res, next) {
  try {
    const pagination = validatePaginationParams(req.query);
    const result = await communityService.getMyRegistrations(req.user.id, {
      ...req.query,
      ...pagination,
    });
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// ── ADMIN EVENT MANAGEMENT HANDLERS ─────────────────────────────────────────

export async function adminUpdateSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    validateUpdateSession(req.body);
    const session = await communityService.adminUpdateSession(sessionId, req.body);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function adminCancelSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const session = await communityService.adminCancelSession(sessionId);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function adminCloseRegistration(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const session = await communityService.adminCloseRegistration(sessionId);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

export async function adminGetRegistrations(req, res, next) {
  try {
    const { sessionId } = req.params;
    validateObjectId(sessionId, 'sessionId');
    const pagination = validatePaginationParams(req.query);
    const result = await communityService.adminGetRegistrations(sessionId, {
      ...req.query,
      ...pagination,
    });
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}
