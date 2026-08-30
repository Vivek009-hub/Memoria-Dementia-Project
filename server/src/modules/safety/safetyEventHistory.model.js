/**
 * safetyEventHistory.model.js — Audit Log for Safety Event transitions
 *
 * Per B12 prompt §58-59.
 * Stores auditable history of safety event status changes.
 */

import mongoose from 'mongoose';

const safetyEventHistorySchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafetyEvent',
      required: [true, 'eventId is required'],
    },
    action: {
      type: String,
      required: [true, 'action is required'],
      trim: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'actorId is required'],
    },
    previousStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, 'newStatus is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: 'safetyEventHistories',
  }
);

safetyEventHistorySchema.index({ eventId: 1, timestamp: -1 });

const SafetyEventHistory = mongoose.model('SafetyEventHistory', safetyEventHistorySchema);

export default SafetyEventHistory;
