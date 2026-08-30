/**
 * analyticsSummary.model.js — Analytics Summary Schema
 *
 * Stores precomputed/cached time-bucket metrics per patient for fast analytics dashboard queries.
 */

import mongoose from 'mongoose';

export const PERIOD_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY', 'OVERALL'];

const gamesSummarySchema = new mongoose.Schema(
  {
    played: { type: Number, default: 0, min: 0 },
    completed: { type: Number, default: 0, min: 0 },
    abandoned: { type: Number, default: 0, min: 0 },
    avgScore: { type: Number, default: 0, min: 0 },
    avgAccuracy: { type: Number, default: 0, min: 0, max: 1 },
    bestScore: { type: Number, default: 0, min: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 1 },
  },
  { _id: false }
);

const remindersSummarySchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0, min: 0 },
    completed: { type: Number, default: 0, min: 0 },
    skipped: { type: Number, default: 0, min: 0 },
    missed: { type: Number, default: 0, min: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 1 },
  },
  { _id: false }
);

const memoriesSummarySchema = new mongoose.Schema(
  {
    created: { type: Number, default: 0, min: 0 },
    viewed: { type: Number, default: 0, min: 0 },
    activeCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const communitySummarySchema = new mongoose.Schema(
  {
    votes: { type: Number, default: 0, min: 0 },
    registrations: { type: Number, default: 0, min: 0 },
    attendances: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const analyticsSummarySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    periodType: {
      type: String,
      required: [true, 'periodType is required'],
      enum: {
        values: PERIOD_TYPES,
        message: '{VALUE} is not a valid period type',
      },
    },
    periodKey: {
      type: String,
      required: [true, 'periodKey is required'],
      trim: true,
    },
    games: {
      type: gamesSummarySchema,
      default: () => ({}),
    },
    reminders: {
      type: remindersSummarySchema,
      default: () => ({}),
    },
    memories: {
      type: memoriesSummarySchema,
      default: () => ({}),
    },
    community: {
      type: communitySummarySchema,
      default: () => ({}),
    },
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'analyticsSummaries',
  }
);

// Idempotent compound unique index per patient, periodType, and periodKey
analyticsSummarySchema.index({ patientId: 1, periodType: 1, periodKey: 1 }, { unique: true });

const AnalyticsSummary = mongoose.model('AnalyticsSummary', analyticsSummarySchema);

export default AnalyticsSummary;
