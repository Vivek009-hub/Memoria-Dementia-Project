/**
 * aiInteraction.model.js — AI Interaction model schema
 *
 * Per DATABASE.md §29 (AI Interactions Collection).
 * Stores controlled metadata about AI interactions for audit, debugging, and analytics.
 */

import mongoose from 'mongoose';

export const AI_INTERACTION_TYPES = [
  'MEMORY_ASSISTANCE',
  'MEMORY_SEARCH',
  'CHAT',
  'GAME_RECOMMENDATION',
  'LANGUAGE_SUPPORT',
  'OTHER',
];

export const AI_INTERACTION_STATUSES = [
  'SUCCESS',
  'FAILED',
  'BLOCKED_BY_GUARDRAIL',
];

const aiInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: AI_INTERACTION_TYPES,
        message: '{VALUE} is not a valid AI interaction type',
      },
      default: 'OTHER',
    },
    language: {
      type: String,
      default: 'en',
      trim: true,
    },
    inputMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    outputMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    provider: {
      type: String,
      trim: true,
      default: 'mock',
    },
    model: {
      type: String,
      trim: true,
      default: 'mock-llm-v1',
    },
    status: {
      type: String,
      enum: {
        values: AI_INTERACTION_STATUSES,
        message: '{VALUE} is not a valid AI interaction status',
      },
      default: 'SUCCESS',
    },
    tokenUsage: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      estimatedCost: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'aiInteractions',
  }
);

aiInteractionSchema.index({ userId: 1, createdAt: -1 });
aiInteractionSchema.index({ patientId: 1, createdAt: -1 });
aiInteractionSchema.index({ status: 1 });

const AIInteraction = mongoose.model('AIInteraction', aiInteractionSchema);

export default AIInteraction;
