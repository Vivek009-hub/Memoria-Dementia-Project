/**
 * activityEvent.model.js — Application Activity Event schema
 *
 * Per DATABASE.md §25 (Activity Events Collection).
 * Stores lightweight application activity events used for analytics.
 */

import mongoose from 'mongoose';

export const EVENT_SOURCES = ['GAMES', 'MEMORIES', 'REMINDERS', 'COMMUNITY', 'SYSTEM'];

export const EVENT_TYPES = [
  'GAME_STARTED',
  'GAME_COMPLETED',
  'GAME_ABANDONED',
  'MEMORY_VIEWED',
  'MEMORY_CREATED',
  'MEMORY_UPDATED',
  'REMINDER_COMPLETED',
  'REMINDER_SKIPPED',
  'REMINDER_MISSED',
  'COMMUNITY_VOTE',
  'COMMUNITY_REGISTERED',
  'COMMUNITY_ATTENDED',
  'GENERAL_ENGAGEMENT',
];

const activityEventSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    eventType: {
      type: String,
      required: [true, 'eventType is required'],
      enum: {
        values: EVENT_TYPES,
        message: '{VALUE} is not a valid event type',
      },
    },
    source: {
      type: String,
      required: [true, 'source is required'],
      enum: {
        values: EVENT_SOURCES,
        message: '{VALUE} is not a valid event source',
      },
    },
    entityType: {
      type: String,
      default: null,
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'activityEvents',
  }
);

// Indexes per DATABASE.md §25 & B10 prompt
activityEventSchema.index({ patientId: 1, timestamp: -1 });
activityEventSchema.index({ patientId: 1, eventType: 1, timestamp: -1 });
activityEventSchema.index({ patientId: 1, source: 1, timestamp: -1 });
activityEventSchema.index({ timestamp: -1 });

const ActivityEvent = mongoose.model('ActivityEvent', activityEventSchema);

export default ActivityEvent;
