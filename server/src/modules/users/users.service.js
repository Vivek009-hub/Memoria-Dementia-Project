/**
 * users.service.js — User profile business logic
 */

import User from './user.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Safe user projection — fields returned to the client.
 * Never includes passwordHash or internal fields.
 */
const SAFE_PROJECTION = 'name email role profileImageUrl preferredLanguage isActive createdAt';

/**
 * Return the safe profile of a user by their ID.
 *
 * @param {string} userId
 * @returns {Promise<object>} Safe user object
 */
export async function getMe(userId) {
  const user = await User.findById(userId).select(SAFE_PROJECTION);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  return formatUser(user);
}

/**
 * Update the self-service profile fields of a user.
 * Only fields that passed through `validateUserUpdate` should arrive here.
 *
 * @param {string} userId
 * @param {object} data - Validated update data
 * @returns {Promise<object>} Updated safe user object
 */
export async function updateMe(userId, data) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  ).select(SAFE_PROJECTION);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  return formatUser(user);
}

/**
 * Format a Mongoose user document into a plain safe object.
 * @param {object} doc
 */
function formatUser(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    profileImageUrl: doc.profileImageUrl ?? null,
    preferredLanguage: doc.preferredLanguage,
    isActive: doc.isActive,
    createdAt: doc.createdAt,
  };
}
