/**
 * notificationPreference.model.js — Per-user notification preferences (B9)
 *
 * Design decisions:
 * - One document per user (unique index on userId).
 * - Channels: what delivery channels a user has enabled.
 *   IN_APP is always enabled by default.
 *   PUSH/EMAIL/SMS are disabled by default (no providers configured yet).
 * - Categories: what types of notifications a user wants.
 *   Safety-related categories are enabled by default and cannot be disabled
 *   for CRITICAL-priority notifications (enforced in the service layer).
 * - Preferences are created on first access (lazy initialization).
 */

import mongoose from 'mongoose';

// ── Schema ────────────────────────────────────────────────────────────────────

const notificationPreferenceSchema = new mongoose.Schema(
  {
    /** The user these preferences belong to. */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    /**
     * Channel enablement.
     * In-app is always the baseline channel and defaults to true.
     * External channels default to false until configured and consented.
     */
    channels: {
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },

    /**
     * Category-level preferences.
     * All categories default to true (opt-in by default).
     * Safety alerts are separately enforced at the service layer for CRITICAL
     * priority — the preference merely controls lower-priority safety events.
     */
    categories: {
      reminders: { type: Boolean, default: true },
      communitySessions: { type: Boolean, default: true },
      meetings: { type: Boolean, default: true },
      safetyAlerts: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    collection: 'notificationPreferences',
  }
);

// ── Index ─────────────────────────────────────────────────────────────────────

// Already covered by the unique: true on userId field definition, but being
// explicit for clarity.
notificationPreferenceSchema.index({ userId: 1 }, { unique: true });

// ── Model ─────────────────────────────────────────────────────────────────────

const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
);

export default NotificationPreference;
