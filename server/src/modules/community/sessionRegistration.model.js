/**
 * sessionRegistration.model.js — Session Registration model schema
 *
 * Per DATABASE.md §21 (Session Registrations Collection).
 * Stores patient pre-registrations for community sessions.
 */

import mongoose from 'mongoose';

export const REGISTRATION_RECORD_STATUSES = [
  'REGISTERED',
  'WAITLISTED',
  'CANCELLED',
  'ATTENDED',
  'NO_SHOW',
];

const sessionRegistrationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunitySession',
      required: [true, 'sessionId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    status: {
      type: String,
      enum: {
        values: REGISTRATION_RECORD_STATUSES,
        message: '{VALUE} is not a valid registration record status',
      },
      default: 'REGISTERED',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    waitlistPosition: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'sessionRegistrations',
  }
);

// Compound index for uniqueness of session-patient pair
sessionRegistrationSchema.index({ sessionId: 1, patientId: 1 }, { unique: true });
sessionRegistrationSchema.index({ sessionId: 1, status: 1 });
sessionRegistrationSchema.index({ patientId: 1, createdAt: -1 });

const SessionRegistration = mongoose.model('SessionRegistration', sessionRegistrationSchema);

export default SessionRegistration;
