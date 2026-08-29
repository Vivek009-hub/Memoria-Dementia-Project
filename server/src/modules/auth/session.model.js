import mongoose from 'mongoose';

/**
 * Session — server-side session record.
 *
 * Per docs/DATABASE.md §7.
 *
 * SECURITY:
 *  - The raw session token is NEVER stored here.
 *  - Only the SHA-256 hash of the token is stored (sessionTokenHash).
 *  - The raw token is sent to the client once via an HTTP-only cookie and
 *    is never persisted server-side.
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    // SHA-256 hash of the raw session token — never the raw token itself.
    sessionTokenHash: {
      type: String,
      required: [true, 'sessionTokenHash is required'],
      select: false, // Never returned in queries by default
    },
    expiresAt: {
      type: Date,
      required: [true, 'expiresAt is required'],
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    // Set when the session is explicitly revoked (logout or admin action).
    // null means the session is still valid (subject to expiry check).
    revokedAt: {
      type: Date,
      default: null,
    },
    // Informational only — not used for authorization decisions.
    deviceInfo: {
      type: String,
      trim: true,
      maxlength: [500, 'deviceInfo cannot exceed 500 characters'],
    },
    // Informational only — IP at session creation time.
    ipMetadata: {
      type: String,
      trim: true,
      maxlength: [100, 'ipMetadata cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'sessions',
  }
);

// Fast lookup by user (e.g. "revoke all sessions for user X")
sessionSchema.index({ userId: 1 });

// Unique — each token hash maps to exactly one session
sessionSchema.index({ sessionTokenHash: 1 }, { unique: true });

// TTL index: MongoDB will automatically remove expired documents.
// NOTE: authentication checks MUST NOT rely solely on TTL deletion —
// we always compare expiresAt in application code as well, because TTL
// deletion is eventually consistent and can lag behind.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
