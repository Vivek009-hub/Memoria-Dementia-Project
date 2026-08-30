/**
 * notification.model.js — Notification domain model (B9)
 *
 * Follows DATABASE.md §24 exactly.
 *
 * Idempotency strategy:
 *   A sparse unique compound index on
 *   (relatedResourceType + relatedResourceId + type + recipientUserId)
 *   prevents duplicate notifications for the same domain event + recipient pair.
 *   When relatedResourceId is null/undefined the index is not enforced (sparse),
 *   which allows system/manual notifications without deduplication constraints.
 *
 * Indexes:
 *   - recipientUserId + isRead + createdAt  — list queries (primary read path)
 *   - recipientUserId + type               — filtered list by type
 *   - expiresAt (sparse)                   — TTL-ready for future cleanup job
 *   - (relatedResourceType, relatedResourceId, type, recipientUserId) unique sparse
 *     — idempotency / deduplication
 */

import mongoose from 'mongoose';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Controlled notification types (DATABASE.md §24).
 * Safety types (SOS, POSSIBLE_FALL, GEOFENCE, DEVICE_OFFLINE, LOW_BATTERY)
 * are included so B12/B13 can use the same infrastructure without changes.
 */
export const NOTIFICATION_TYPES = Object.freeze({
  REMINDER: 'REMINDER',
  COMMUNITY_SESSION: 'COMMUNITY_SESSION',
  MEETING: 'MEETING',
  SOS: 'SOS',
  POSSIBLE_FALL: 'POSSIBLE_FALL',
  GEOFENCE: 'GEOFENCE',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  LOW_BATTERY: 'LOW_BATTERY',
  SYSTEM: 'SYSTEM',
});

/**
 * Controlled priority values (DATABASE.md §24).
 * CRITICAL is reserved for safety alerts; normal services must not set it.
 */
export const NOTIFICATION_PRIORITIES = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
});

// ── Schema ────────────────────────────────────────────────────────────────────

const notificationSchema = new mongoose.Schema(
  {
    /** The user who should receive this notification. */
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    /** Controlled notification type. */
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },

    /** Short human-readable title (elderly-friendly, concise). */
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },

    /** Full notification body text. */
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Message must not exceed 1000 characters'],
    },

    /** Controlled priority. Defaults to NORMAL. */
    priority: {
      type: String,
      enum: Object.values(NOTIFICATION_PRIORITIES),
      default: NOTIFICATION_PRIORITIES.NORMAL,
    },

    /**
     * Optional: the type of domain resource that triggered this notification.
     * Examples: 'Reminder', 'CommunitySession', 'Meeting'
     * Used in combination with relatedResourceId for idempotency and deep-linking.
     */
    relatedResourceType: {
      type: String,
      trim: true,
      default: null,
    },

    /**
     * Optional: the ObjectId of the related domain resource.
     * Do NOT embed the full resource here — only the reference.
     */
    relatedResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    /** Whether the recipient has read this notification. */
    isRead: {
      type: Boolean,
      default: false,
    },

    /** When the notification was marked as read. Null if unread. */
    readAt: {
      type: Date,
      default: null,
    },

    /**
     * Optional expiry. Expired notifications can be archived/cleaned up
     * by a maintenance job. A TTL index can be added later.
     */
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Primary read path: list a user's notifications, optionally filtered by isRead
notificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });

// Filter by type
notificationSchema.index({ recipientUserId: 1, type: 1, createdAt: -1 });

// TTL-ready index for expiresAt (sparse — only indexes documents where it exists)
notificationSchema.index({ expiresAt: 1 }, { sparse: true });

/**
 * Idempotency / deduplication index.
 *
 * Prevents two notifications of the same type for the same resource+recipient
 * from being created (e.g. if an event is emitted twice by accident).
 *
 * partialFilterExpression: only enforce uniqueness when relatedResourceId is
 * an actual ObjectId. Documents where relatedResourceId is null/undefined are
 * NOT indexed, so multiple system/manual notifications without a resource
 * reference are allowed without deduplication constraints.
 *
 * WHY NOT sparse:true?
 *   sparse:true skips documents where the field is *missing*, but still indexes
 *   documents that explicitly set the field to null. Using partialFilterExpression
 *   with $type:'objectId' is the correct way to exclude null values from the index.
 */
notificationSchema.index(
  {
    relatedResourceType: 1,
    relatedResourceId: 1,
    type: 1,
    recipientUserId: 1,
  },
  {
    unique: true,
    partialFilterExpression: { relatedResourceId: { $type: 'objectId' } },
    name: 'idx_notification_dedup',
  }
);

// ── Model ─────────────────────────────────────────────────────────────────────

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
