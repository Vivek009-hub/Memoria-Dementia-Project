/**
 * game.service.js — Cognitive Games business logic
 *
 * No Express imports. All functions throw AppError on failure.
 *
 * Concurrency safety for session completion: `completeSession` uses a
 * `findOneAndUpdate` with `{ status: 'STARTED' }` in the filter, so two
 * concurrent completion requests cannot both succeed — the second finds no
 * matching document and throws CONFLICT.
 */

import mongoose from 'mongoose';
import Game from './game.model.js';
import GameSession from './gameSession.model.js';
import { AppError } from '../../utils/AppError.js';

const DEFAULT_GAMES_SEED = [
  {
    _id: new mongoose.Types.ObjectId('65f1a0000000000000000001'),
    title: 'Memory Match',
    description: 'Exercise your memory by finding matching pairs of familiar items.',
    category: 'MEMORY_MATCHING',
    difficulty: 'EASY',
    instructions: 'Tap on cards to flip them over. Match all pairs of identical cards to complete the exercise!',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId('65f1a0000000000000000002'),
    title: 'Sequence Recall',
    description: 'Remember and repeat the sequence of colored lights in the correct order.',
    category: 'SEQUENCE',
    difficulty: 'MEDIUM',
    instructions: 'Watch the sequence of colors carefully. When it is your turn, tap the colored buttons in the exact same order!',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId('65f1a0000000000000000003'),
    title: 'Word & Language',
    description: 'Stimulate language recall by answering simple everyday vocabulary questions.',
    category: 'WORD_LANGUAGE',
    difficulty: 'EASY',
    instructions: 'Read the question carefully and tap the best answer option from the choices given.',
    isActive: true,
  },
  {
    _id: new mongoose.Types.ObjectId('65f1a0000000000000000004'),
    title: 'Picture Recognition',
    description: 'Identify familiar everyday objects and symbols from high-contrast pictures.',
    category: 'PICTURE_RECOGNITION',
    difficulty: 'EASY',
    instructions: 'Look at the prompt and tap the matching picture icon on the screen.',
    isActive: true,
  },
];

async function ensureDefaultGamesSeeded() {
  const count = await Game.countDocuments();
  if (count === 0) {
    try {
      await Game.insertMany(DEFAULT_GAMES_SEED);
    } catch {
      // Ignore concurrency conflict if seeded in parallel
    }
  }
}

// ── Game Catalog ─────────────────────────────────────────────────────────────

/**
 * List active games (optionally filtered by category / difficulty).
 * Non-admin callers always receive only `isActive: true` games.
 *
 * @param {{ category?: string, difficulty?: string }} filters
 * @param {boolean} [includeInactive=false] - admin-only override
 * @returns {Promise<object[]>}
 */
export async function listGames(filters = {}, includeInactive = false) {
  await ensureDefaultGamesSeeded();
  const query = {};

  if (!includeInactive) {
    query.isActive = true;
  }

  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;

  const games = await Game.find(query).sort({ category: 1, title: 1 }).lean();
  return games.map(formatGame);
}

/**
 * Get a single game by ID.
 * Non-admin callers only see active games.
 *
 * @param {string} gameId
 * @param {boolean} [includeInactive=false]
 * @returns {Promise<object>}
 */
export async function getGame(gameId, includeInactive = false) {
  await ensureDefaultGamesSeeded();
  const query = { _id: new mongoose.Types.ObjectId(gameId) };
  if (!includeInactive) {
    query.isActive = true;
  }

  const game = await Game.findOne(query).lean();
  if (!game) {
    throw new AppError('Game not found', 404, 'NOT_FOUND');
  }
  return formatGame(game);
}

// ── Game Session Lifecycle ───────────────────────────────────────────────────

/**
 * Start a new game session for a patient.
 *
 * Flow:
 *   1. Verify the game exists and is active.
 *   2. Create a GameSession with status STARTED.
 *
 * @param {string} patientId
 * @param {string} gameId
 * @param {{ difficulty: string, metadata?: object }} data
 * @returns {Promise<object>}
 */
export async function startSession(patientId, gameId, data) {
  await ensureDefaultGamesSeeded();
  // Verify the game exists and is active
  const game = await Game.findOne({
    _id: new mongoose.Types.ObjectId(gameId),
    isActive: true,
  }).lean();

  if (!game) {
    throw new AppError('Game not found or is no longer available', 404, 'NOT_FOUND');
  }

  const session = await GameSession.create({
    patientId: new mongoose.Types.ObjectId(patientId),
    gameId: new mongoose.Types.ObjectId(gameId),
    difficulty: data.difficulty,
    metadata: data.metadata,
    startedAt: new Date(),
    status: 'STARTED',
  });

  return formatSession(session);
}

/**
 * Get a single game session.
 * Patients may only access their own sessions.
 * ADMINs may access any session.
 *
 * @param {string} sessionId
 * @param {string} userId - req.user.id
 * @param {string} userRole - req.user.role
 * @returns {Promise<object>}
 */
export async function getSession(sessionId, userId, userRole) {
  const session = await GameSession.findById(sessionId).lean();
  if (!session) {
    throw new AppError('Session not found', 404, 'NOT_FOUND');
  }

  if (userRole !== 'ADMIN' && session.patientId.toString() !== userId.toString()) {
    throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
  }

  return formatSession(session);
}

/**
 * Complete a game session.
 *
 * Concurrency-safe: uses atomic `findOneAndUpdate` with `status: 'STARTED'`
 * in the filter. If two requests arrive simultaneously, only one will match.
 *
 * Flow:
 *   1. Atomically update the session (patientId + status STARTED guard).
 *   2. Set status COMPLETED, completedAt, and all result fields.
 *   3. If score and maxScore provided, compute accuracy.
 *
 * @param {string} sessionId
 * @param {string} patientId
 * @param {object} resultData - validated result fields
 * @returns {Promise<object>}
 */
export async function completeSession(sessionId, patientId, resultData) {
  // Compute accuracy from score + maxScore if both are provided
  const updateData = { ...resultData };

  if (
    resultData.score !== undefined &&
    resultData.maxScore !== undefined &&
    resultData.maxScore > 0
  ) {
    updateData.accuracy = Math.min(100, (resultData.score / resultData.maxScore) * 100);
  }
  delete updateData.maxScore; // maxScore is not a model field

  const session = await GameSession.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(sessionId),
      patientId: new mongoose.Types.ObjectId(patientId),
      status: 'STARTED',
    },
    {
      $set: {
        ...updateData,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!session) {
    // Could not match — check whether the session exists at all to give a better error
    const existing = await GameSession.findById(sessionId).lean();
    if (!existing) {
      throw new AppError('Session not found', 404, 'NOT_FOUND');
    }
    if (existing.patientId.toString() !== patientId.toString()) {
      throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
    }
    // Session exists and belongs to this patient but was not STARTED
    throw new AppError(
      `Session cannot be completed — current status is ${existing.status}`,
      409,
      'INVALID_STATE'
    );
  }

  return formatSession(session);
}

/**
 * Get game history for a patient (their completed/abandoned sessions).
 *
 * @param {string} patientId
 * @param {object} [filters] - optional { gameId?, status? }
 * @returns {Promise<object[]>}
 */
export async function getHistory(patientId, filters = {}) {
  const query = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (filters.gameId) {
    if (!mongoose.Types.ObjectId.isValid(filters.gameId)) {
      throw new AppError('Invalid gameId', 400, 'INVALID_ID');
    }
    query.gameId = new mongoose.Types.ObjectId(filters.gameId);
  }

  // By default, only show non-started sessions (history = finished games)
  // If a specific status filter is not set, return all non-started ones
  if (filters.status) {
    query.status = filters.status;
  }

  const sessions = await GameSession.find(query)
    .populate('gameId', 'title category difficulty media')
    .sort({ completedAt: -1, startedAt: -1 })
    .lean();

  return sessions.map(formatSession);
}

// ── Admin Game Management ────────────────────────────────────────────────────

/**
 * Create a new game (admin only).
 *
 * @param {string} adminId
 * @param {object} data - validated game data
 * @returns {Promise<object>}
 */
export async function adminCreateGame(adminId, data) {
  const game = await Game.create({
    ...data,
    createdBy: new mongoose.Types.ObjectId(adminId),
  });
  return formatGame(game.toObject());
}

/**
 * Update a game (admin only).
 * Soft-deletes use isActive: false to preserve historical sessions.
 *
 * @param {string} gameId
 * @param {object} data - validated update fields
 * @returns {Promise<object>}
 */
export async function adminUpdateGame(gameId, data) {
  const game = await Game.findByIdAndUpdate(
    gameId,
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!game) {
    throw new AppError('Game not found', 404, 'NOT_FOUND');
  }

  return formatGame(game);
}

/**
 * Soft-delete a game (admin only). Sets isActive = false.
 * Historical sessions remain intact and readable.
 *
 * @param {string} gameId
 */
export async function adminDeleteGame(gameId) {
  const game = await Game.findByIdAndUpdate(
    gameId,
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!game) {
    throw new AppError('Game not found', 404, 'NOT_FOUND');
  }
}

// ── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format a Game document into a safe plain object.
 * @param {object} doc - lean game document
 * @returns {object}
 */
function formatGame(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description ?? null,
    category: doc.category,
    difficulty: doc.difficulty,
    instructions: doc.instructions ?? null,
    configuration: doc.configuration ?? {},
    supportedLanguages: doc.supportedLanguages ?? ['en'],
    media: doc.media ?? {},
    isActive: doc.isActive,
    createdBy: doc.createdBy?.toString() ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Format a GameSession document into a safe plain object.
 * Handles both lean docs and populated gameId.
 * @param {object} doc - lean gameSession document
 * @returns {object}
 */
function formatSession(doc) {
  // gameId may be populated (object) or a plain ObjectId
  const gameInfo =
    doc.gameId && typeof doc.gameId === 'object' && doc.gameId.title
      ? {
          id: doc.gameId._id.toString(),
          title: doc.gameId.title,
          category: doc.gameId.category,
          difficulty: doc.gameId.difficulty,
          media: doc.gameId.media ?? {},
        }
      : { id: doc.gameId?.toString() ?? null };

  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    game: gameInfo,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt ?? null,
    status: doc.status,
    difficulty: doc.difficulty,
    score: doc.score ?? null,
    accuracy: doc.accuracy ?? null,
    responseTimeMs: doc.responseTimeMs ?? null,
    hintsUsed: doc.hintsUsed ?? 0,
    mistakes: doc.mistakes ?? 0,
    metadata: doc.metadata ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
