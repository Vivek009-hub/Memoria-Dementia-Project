/**
 * reminder.model.js — Reminder definition schema
 *
 * Per DATABASE.md §16 (Reminders Collection).
 * This model stores the reminder *definition* — what should happen.
 * Individual occurrences are tracked in ReminderLog (reminderLog.model.js).
 *
 * Schedule subdocument:
 *   time     — "HH:MM" in 24-hour format (patient's local timezone)
 *   startAt  — ISO date string for one-time or recurring start
 *
 * Recurrence subdocument (null for one-time reminders):
 *   frequency — DAILY | WEEKLY | MONTHLY
 *   interval  — repeat every N units (default 1)
 *   weekdays  — [0..6] for WEEKLY (0 = Sunday)
 *   endDate   — optional ISO date string after which no new occurrences
 */

import mongoose from 'mongoose';

export const REMINDER_TYPES = [
  'MEDICATION',
  'MEAL',
  'APPOINTMENT',
  'ACTIVITY',
  'BIRTHDAY',
  'IMPORTANT_EVENT',
  'COMMUNITY_SESSION',
  'MEETING_CIRCLE',
  'OTHER',
];

export const RECURRENCE_FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'];

const scheduleSchema = new mongoose.Schema(
  {
    // "HH:MM" 24-hour local time (e.g. "08:00")
    time: {
      type: String,
      required: [true, 'schedule.time is required'],
      match: [/^\d{2}:\d{2}$/, 'schedule.time must be HH:MM format'],
    },
    // For one-time reminders: the specific date+time (stored UTC)
    // For recurring: the date the reminder starts becoming active
    startAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const recurrenceSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      required: [true, 'recurrence.frequency is required'],
      enum: {
        values: RECURRENCE_FREQUENCIES,
        message: '{VALUE} is not a valid recurrence frequency',
      },
    },
    // Repeat every N units of frequency (e.g. every 2 weeks). Minimum 1.
    interval: {
      type: Number,
      default: 1,
      min: [1, 'recurrence.interval must be at least 1'],
    },
    // Weekday indices for WEEKLY frequency: 0 = Sunday … 6 = Saturday
    weekdays: {
      type: [Number],
      default: [],
      validate: {
        validator(arr) {
          return arr.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
        },
        message: 'recurrence.weekdays must contain integers 0–6',
      },
    },
    // Optional end date — no new occurrences after this date
    endDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const reminderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'patientId is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      maxlength: [200, 'title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'description cannot exceed 1000 characters'],
      default: null,
    },
    type: {
      type: String,
      required: [true, 'type is required'],
      enum: {
        values: REMINDER_TYPES,
        message: '{VALUE} is not a valid reminder type',
      },
    },
    // Structured schedule — always required
    schedule: {
      type: scheduleSchema,
      required: [true, 'schedule is required'],
    },
    // IANA timezone identifier (e.g. "Asia/Kolkata", "America/New_York")
    timezone: {
      type: String,
      required: [true, 'timezone is required'],
      trim: true,
    },
    // Null for one-time reminders; populated for recurring
    recurrence: {
      type: recurrenceSchema,
      default: null,
    },
    // Whether this reminder is active (false = soft-deleted / deactivated)
    isActive: {
      type: Boolean,
      default: true,
    },
    // Explicit start date for recurring reminders
    startDate: {
      type: Date,
      default: null,
    },
    // Explicit end date — after which no occurrences should be generated
    endDate: {
      type: Date,
      default: null,
    },
    // Whether a voice prompt should accompany the reminder (B9 will deliver)
    voiceEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: 'reminders',
  }
);

// ── Indexes per DATABASE.md §16 & B6 prompt §32 ─────────────────────────────
reminderSchema.index({ patientId: 1, isActive: 1 });
reminderSchema.index({ patientId: 1, type: 1 });
reminderSchema.index({ patientId: 1, createdAt: -1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
