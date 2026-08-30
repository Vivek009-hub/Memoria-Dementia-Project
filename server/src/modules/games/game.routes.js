/**
 * game.routes.js — Routes for /api/v1/games
 *
 * IMPORTANT — route ordering:
 *   Static paths (/history, /sessions/*, /patients/*) are defined BEFORE
 *   the dynamic /:gameId catch-all to prevent Express treating "history",
 *   "sessions", and "patients" as gameId values.
 *
 * Authorization summary:
 *   GET  /games                           — any authenticated user
 *   GET  /games/history                   — PATIENT (own history)
 *   GET  /games/sessions/:sessionId       — any authenticated user (ownership enforced in service)
 *   POST /games/sessions/:id/complete     — PATIENT only
 *   GET  /games/patients/:id/history      — CAREGIVER + viewCognitiveActivity permission
 *   POST /games/:gameId/sessions          — PATIENT only
 *   GET  /games/:gameId                   — any authenticated user
 *   POST /games                           — ADMIN only
 *   PATCH /games/:gameId                  — ADMIN only
 *   DELETE /games/:gameId                 — ADMIN only
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole, requirePatientAccess } from '../../middleware/authorization.middleware.js';
import * as gameController from './game.controller.js';

const router = Router();

// All game routes require authentication
router.use(requireAuth);

// ── Static routes (must come before /:gameId) ────────────────────────────────

// GET /api/v1/games/history — patient's own game history
router.get('/history', requireRole('PATIENT'), gameController.getHistory);

// GET /api/v1/games/sessions/:sessionId — fetch a specific session
router.get('/sessions/:sessionId', gameController.getSession);

// POST /api/v1/games/sessions/:sessionId/complete — patient completes a session
router.post(
  '/sessions/:sessionId/complete',
  requireRole('PATIENT'),
  gameController.completeSession
);

// GET /api/v1/games/patients/:patientId/history — caregiver views patient history
router.get(
  '/patients/:patientId/history',
  requirePatientAccess('viewCognitiveActivity'),
  gameController.caregiverGetHistory
);

// ── Dynamic /:gameId routes ──────────────────────────────────────────────────

// GET /api/v1/games — list active games (all authenticated users)
// POST /api/v1/games — admin creates a new game definition
// These two share the same path so we define them together before /:gameId
router
  .route('/')
  // GET — any authenticated user
  .get(gameController.listGames)
  // POST — ADMIN only (create game)
  .post(requireRole('ADMIN'), gameController.adminCreateGame);

// POST /api/v1/games/:gameId/sessions — patient starts a session
router.post('/:gameId/sessions', requireRole('PATIENT'), gameController.startSession);

// GET /api/v1/games/:gameId — get game detail (any authenticated user)
// PATCH /api/v1/games/:gameId — admin updates game
// DELETE /api/v1/games/:gameId — admin soft-deletes game
router
  .route('/:gameId')
  .get(gameController.getGame)
  .patch(requireRole('ADMIN'), gameController.adminUpdateGame)
  .delete(requireRole('ADMIN'), gameController.adminDeleteGame);

export default router;
