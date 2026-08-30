/**
 * game.model.js — Mongoose model for the `games` collection
 *
 * Stores reusable cognitive-game definitions. One Game definition can be
 * played by many patients across many GameSessions.
 *
 * Fields per DATABASE.md §11.
 */

import mongoose from 'mongoose';

export const GAME_CATEGORIES = [
  'MEMORY_MATCHING',
  'PICTURE_RECOGNITION',
  'FAMILIAR_FACE',
  'SEQUENCE',
  'PATTERN',
  'PUZZLE',
  'WORD_LANGUAGE',
  'MUSIC_MEMORY',
  'DAILY_LIFE',
];

export const GAME_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

const mediaSchema = new mongoose.Schema(
  {
    thumbnailUrl: { type: String, trim: true },
  },
  { _id: false }
);

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'category is required'],
      enum: {
        values: GAME_CATEGORIES,
        message: '{VALUE} is not a valid game category',
      },
    },
    difficulty: {
      type: String,
      required: [true, 'difficulty is required'],
      enum: {
        values: GAME_DIFFICULTIES,
        message: '{VALUE} is not a valid difficulty level',
      },
    },
    instructions: {
      type: String,
      trim: true,
    },
    /**
     * Game-specific configuration stored as plain data (never executable code).
     * Example: { rounds: 5, timeLimitSeconds: 60, itemCount: 10 }
     */
    configuration: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    supportedLanguages: {
      type: [String],
      default: ['en'],
    },
    media: {
      type: mediaSchema,
      default: () => ({}),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'games',
  }
);

// Indexes per DATABASE.md and B4 prompt §25
gameSchema.index({ isActive: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ difficulty: 1 });

const Game = mongoose.model('Game', gameSchema);

export default Game;
