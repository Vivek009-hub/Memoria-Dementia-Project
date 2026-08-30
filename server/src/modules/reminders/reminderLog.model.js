/**
 * reminderLog.model.js — Reminder occurrence (log) schema
 *
 * Per DATABASE.md §17 (Reminder Logs Collection).
 * Each document represents one scheduled occurrence of a reminder.
 *
 * Status lifecycle:
 *   SCHEDULED → DELIVERED → ACKNOWLEDGED → COMPLETED
 *                                        → MISSED
 *                         → MISSED
 *              → CANCELLED
 *
 * B6 creates and manages SCHEDULED, COMPLETED, SKIPPED (stored as CANCELLED),
 * and MISSED records. DELIVERED and ACKNOWLEDGED are managed by B9.
 */

import mongoose from 'mongoose';

export const LOG_STATUSES = [
  'SCHEDULED',
  'DELIVERED',
  'ACKNOWLEDGED',
  'COMPLETED',
  'MISSED',
  'CANCELLED',
];

const reminderLogSchema = new mongoose.Schema(
  {
    reminderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reminder',
      required: [true, 'reminderId is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    // The UTC time at which this occurrence is/was scheduled
    scheduledAt: {
      type: Date,
      required: [true, 'scheduledAt is required'],
    },
    // Set by B9 when the notification is delivered
    deliveredAt: {
      type: Date,
      default: null,
    },
    // Set by B9 when the user acknowledges the notification
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    // Set when the patient (or caregiver) marks the reminder completed
    completedAt: {
      type: Date,
      default: null,
    },
    // Who completed / skipped the reminder (userId)
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      required: [true, 'status is required'],
      enum: {
        values: LOG_STATUSES,
        message: '{VALUE} is not a valid log status',
      },
      default: 'SCHEDULED',
    },
    // Optional note recorded at completion/skip time
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'note cannot exceed 500 characters'],
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'reminderLogs',
  }
);

// ── Indexes per DATABASE.md §17 ──────────────────────────────────────────────
reminderLogSchema.index({ patientId: 1, scheduledAt: -1 });
reminderLogSchema.index({ reminderId: 1, scheduledAt: -1 });
reminderLogSchema.index({ status: 1 });

// Idempotency: prevent duplicate scheduled occurrences for the same reminder
// at the same scheduledAt time. Scheduler can safely be run multiple times.
reminderLogSchema.index(
  { reminderId: 1, scheduledAt: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['SCHEDULED', 'DELIVERED', 'ACKNOWLEDGED'] } },
  }
);

const ReminderLog = mongoose.model('ReminderLog', reminderLogSchema);

export default ReminderLog;
