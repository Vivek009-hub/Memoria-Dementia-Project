/**
 * safetyEvent.model.js — Safety Event Mongoose model
 *
 * Per DATABASE.md §28 (Safety Events Collection).
 * Stores safety-related events (SOS, Fall, Geofence breach, Low battery, Device offline).
 */

import mongoose from 'mongoose';

export const SAFETY_EVENT_TYPES = [
  'SOS',
  'POSSIBLE_FALL',
  'GEOFENCE_EXIT',
  'GEOFENCE_ENTRY',
  'LOW_BATTERY',
  'DEVICE_OFFLINE',
];

export const SAFETY_EVENT_STATUSES = [
  'TRIGGERED',
  'OPEN',
  'ACKNOWLEDGED',
  'ESCALATED',
  'RESOLVED',
  'CANCELLED',
];

export const SAFETY_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const SAFETY_SOURCES = ['MOBILE_APP', 'WEARABLE', 'DEVICE', 'SYSTEM', 'CAREGIVER', 'ADMIN'];

const safetyLocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    accuracy: { type: Number, min: 0, default: 0 },
    address: { type: String, trim: true, default: null },
  },
  { _id: false }
);

const safetyEventSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: {
        values: SAFETY_EVENT_TYPES,
        message: '{VALUE} is not a valid safety event type',
      },
    },
    status: {
      type: String,
      enum: {
        values: SAFETY_EVENT_STATUSES,
        message: '{VALUE} is not a valid safety event status',
      },
      default: 'TRIGGERED',
    },
    severity: {
      type: String,
      enum: {
        values: SAFETY_SEVERITIES,
        message: '{VALUE} is not a valid severity level',
      },
      default: 'HIGH',
    },
    source: {
      type: String,
      enum: {
        values: SAFETY_SOURCES,
        message: '{VALUE} is not a valid safety source',
      },
      default: 'MOBILE_APP',
    },
    location: {
      type: safetyLocationSchema,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    triggeredAt: {
      type: Date,
      default: Date.now,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionReason: {
      type: String,
      trim: true,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'safetyEvents',
  }
);

// Indexes per DATABASE.md §28
safetyEventSchema.index({ patientId: 1, createdAt: -1 });
safetyEventSchema.index({ patientId: 1, status: 1 });
safetyEventSchema.index({ type: 1, status: 1 });

const SafetyEvent = mongoose.model('SafetyEvent', safetyEventSchema);

export default SafetyEvent;
