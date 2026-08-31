/**
 * users.service.js — User profile and Admin user management business logic
 */

import User from './user.model.js';
import { AppError } from '../../utils/AppError.js';
import ActivityEvent from '../analytics/activityEvent.model.js';

/**
 * Safe user projection — fields returned to the client.
 * Never includes passwordHash or internal fields.
 */
const SAFE_PROJECTION =
  'name email role profileImageUrl preferredLanguage isActive createdAt lastLoginAt';

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
 * Admin: List users with search, role filtering, status filtering, and pagination.
 */
export async function getUsersPaginated({
  search = '',
  role = '',
  status = '',
  page = 1,
  limit = 10,
} = {}) {
  const query = {};

  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

  if (role && ['PATIENT', 'CAREGIVER', 'HOST', 'ADMIN'].includes(role.toUpperCase())) {
    query.role = role.toUpperCase();
  }

  if (status) {
    if (status.toLowerCase() === 'active') query.isActive = true;
    if (status.toLowerCase() === 'inactive' || status.toLowerCase() === 'suspended') {
      query.isActive = false;
    }
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).select(SAFE_PROJECTION),
    User.countDocuments(query),
  ]);

  return {
    users: users.map(formatUser),
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Admin: Update user role with last-admin protection.
 */
export async function updateUserRoleByAdmin(targetUserId, newRole, requestingUser) {
  const validRoles = ['PATIENT', 'CAREGIVER', 'HOST', 'ADMIN'];
  const formattedRole = (newRole || '').toUpperCase();

  if (!validRoles.includes(formattedRole)) {
    throw new AppError(`Invalid role: ${newRole}`, 400, 'INVALID_ROLE');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError('Target user not found', 404, 'NOT_FOUND');
  }

  // Last Admin Protection Check
  if (targetUser.role === 'ADMIN' && formattedRole !== 'ADMIN') {
    const activeAdminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
    if (activeAdminCount <= 1) {
      throw new AppError(
        'Cannot revoke admin role from the last active administrator account',
        400,
        'LAST_ADMIN_PROTECTION'
      );
    }
  }

  const previousRole = targetUser.role;
  targetUser.role = formattedRole;
  await targetUser.save();

  // Audit Activity Logging
  try {
    await ActivityEvent.create({
      userId: requestingUser.id || requestingUser._id,
      eventType: 'ADMIN_ROLE_CHANGE',
      category: 'ADMIN',
      metadata: {
        targetUserId: targetUser._id.toString(),
        previousRole,
        newRole: formattedRole,
      },
    });
  } catch {
    // Non-blocking log insertion failure
  }

  return formatUser(targetUser);
}

/**
 * Admin: Update user account active/suspended status with last-admin protection.
 */
export async function updateUserStatusByAdmin(targetUserId, isActive, requestingUser) {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError('Target user not found', 404, 'NOT_FOUND');
  }

  // Last Admin Protection Check
  if (targetUser.role === 'ADMIN' && isActive === false) {
    const activeAdminCount = await User.countDocuments({ role: 'ADMIN', isActive: true });
    if (activeAdminCount <= 1) {
      throw new AppError(
        'Cannot suspend the last active administrator account',
        400,
        'LAST_ADMIN_PROTECTION'
      );
    }
  }

  targetUser.isActive = Boolean(isActive);
  await targetUser.save();

  // Audit Activity Logging
  try {
    await ActivityEvent.create({
      userId: requestingUser.id || requestingUser._id,
      eventType: isActive ? 'ADMIN_USER_ACTIVATE' : 'ADMIN_USER_SUSPEND',
      category: 'ADMIN',
      metadata: {
        targetUserId: targetUser._id.toString(),
        isActive: targetUser.isActive,
      },
    });
  } catch {
    // Non-blocking log insertion failure
  }

  return formatUser(targetUser);
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
    preferredLanguage: doc.preferredLanguage || 'en',
    isActive: doc.isActive !== false,
    createdAt: doc.createdAt,
    lastLoginAt: doc.lastLoginAt ?? null,
  };
}
