/**
 * gameSession.model.js — Mongoose model for the `gameSessions` collection
 *
 * Represents one patient's individual playthrough of a game. Separated from
 * the Game definition so that game definitions remain reusable across many
 * patient sessions.
 *
 * Fields per DATABASE.md §12.
 */

import mongoose from 'mongoose';
import { GAME_DIFFICULTIES } from './game.model.js';

export const SESSION_STATUSES = ['STARTED', 'COMPLETED', 'ABANDONED'];

const gameSessionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'gameId is required'],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: SESSION_STATUSES,
        message: '{VALUE} is not a valid session status',
      },
      default: 'STARTED',
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is required'],
      enum: {
        values: GAME_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
    },
    /**
     * Raw score achieved in the session (non-negative integer or float).
     * The meaning of score is game-specific.
     */
    score: {
      type: Number,
      min: [0, 'score cannot be negative'],
    },
    /**
     * Accuracy as a percentage (0–100). Computed or submitted by the client.
     */
    accuracy: {
      type: Number,
      min: [0, 'accuracy cannot be negative'],
      max: [100, 'accuracy cannot exceed 100'],
    },
    /**
     * Total response time across all rounds in milliseconds.
     */
    responseTimeMs: {
      type: Number,
      min: [0, 'responseTimeMs cannot be negative'],
    },
    hintsUsed: {
      type: Number,
      default: 0,
      min: [0, 'hintsUsed cannot be negative'],
    },
    mistakes: {
      type: Number,
      default: 0,
      min: [0, 'mistakes cannot be negative'],
    },
    /**
     * Game-type-specific metadata (e.g. round breakdown).
     * Never contains executable code.
     */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'gameSessions',
  }
);

// Indexes per DATABASE.md §12
gameSessionSchema.index({ patientId: 1 });
gameSessionSchema.index({ gameId: 1 });
gameSessionSchema.index({ patientId: 1, startedAt: -1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;
