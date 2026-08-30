/**
 * game.controller.js — Request handlers for /api/v1/games
 *
 * Thin layer: reads req.*, calls service, returns standardized JSON.
 * Business logic belongs in game.service.js.
 */

import * as gameService from './game.service.js';
import {
  validateObjectId,
  validateGameListQuery,
  validateGameCreate,
  validateGameUpdate,
  validateSessionStart,
  validateSessionComplete,
} from './game.validation.js';

// ── Game Catalog ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/games
 * Available to all authenticated users. Admins may optionally see inactive games.
 */
export async function listGames(req, res, next) {
  try {
    const filters = validateGameListQuery(req.query);
    const includeInactive = req.user.role === 'ADMIN' && req.query.includeInactive === 'true';
    const games = await gameService.listGames(filters, includeInactive);
    res.status(200).json({ success: true, data: games });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/games/:gameId
 * Active games are visible to all authenticated users.
 * Admins may view inactive games.
 */
export async function getGame(req, res, next) {
  try {
    validateObjectId(req.params.gameId, 'gameId');
    const includeInactive = req.user.role === 'ADMIN';
    const game = await gameService.getGame(req.params.gameId, includeInactive);
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

// ── Session Lifecycle ────────────────────────────────────────────────────────

/**
 * POST /api/v1/games/:gameId/sessions
 * PATIENT only — starts a new game session for the authenticated patient.
 */
export async function startSession(req, res, next) {
  try {
    validateObjectId(req.params.gameId, 'gameId');
    const data = validateSessionStart(req.body);
    const session = await gameService.startSession(req.user.id, req.params.gameId, data);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/games/sessions/:sessionId
 * Authenticated user can fetch their own session. ADMINs can fetch any.
 */
export async function getSession(req, res, next) {
  try {
    validateObjectId(req.params.sessionId, 'sessionId');
    const session = await gameService.getSession(req.params.sessionId, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/games/sessions/:sessionId/complete
 * PATIENT only — completes their own game session with results.
 */
export async function completeSession(req, res, next) {
  try {
    validateObjectId(req.params.sessionId, 'sessionId');
    const resultData = validateSessionComplete(req.body);
    const session = await gameService.completeSession(
      req.params.sessionId,
      req.user.id,
      resultData
    );
    res.status(200).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/games/history
 * PATIENT only — returns the authenticated patient's own game history.
 */
export async function getHistory(req, res, next) {
  try {
    const filters = {};
    if (req.query.gameId) {
      validateObjectId(req.query.gameId, 'gameId');
      filters.gameId = req.query.gameId;
    }
    const sessions = await gameService.getHistory(req.user.id, filters);
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/games/patients/:patientId/history
 * CAREGIVER — access patient's game history if authorized (viewCognitiveActivity).
 * requirePatientAccess('viewCognitiveActivity') middleware runs before this handler.
 */
export async function caregiverGetHistory(req, res, next) {
  try {
    validateObjectId(req.params.patientId, 'patientId');
    const filters = {};
    if (req.query.gameId) {
      validateObjectId(req.query.gameId, 'gameId');
      filters.gameId = req.query.gameId;
    }
    const sessions = await gameService.getHistory(req.params.patientId, filters);
    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

// ── Admin Game Management ────────────────────────────────────────────────────

/**
 * POST /api/v1/games  (admin-only)
 * Create a new game definition.
 */
export async function adminCreateGame(req, res, next) {
  try {
    const data = validateGameCreate(req.body);
    const game = await gameService.adminCreateGame(req.user.id, data);
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/games/:gameId  (admin-only)
 * Update an existing game definition (use isActive: false to deactivate).
 */
export async function adminUpdateGame(req, res, next) {
  try {
    validateObjectId(req.params.gameId, 'gameId');
    const data = validateGameUpdate(req.body);
    const game = await gameService.adminUpdateGame(req.params.gameId, data);
    res.status(200).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/games/:gameId  (admin-only)
 * Soft-delete: sets isActive = false. Historical sessions remain intact.
 */
export async function adminDeleteGame(req, res, next) {
  try {
    validateObjectId(req.params.gameId, 'gameId');
    await gameService.adminDeleteGame(req.params.gameId);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
