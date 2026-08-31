/**
 * memory.service.js — Business logic for Memories & FamilyMembers (B5)
 *
 * All functions receive validated input. Authorization is enforced by the
 * routes/middleware layer before any service function is called.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Memory from './memory.model.js';
import FamilyMember from './familyMember.model.js';
import { AppError } from '../../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Assert a Memory document exists and belongs to the given patient.
 * Returns 404 for both "not found" and "wrong patient" to prevent enumeration.
 *
 * @param {string} memoryId
 * @param {string} patientId
 * @returns {Promise<import('mongoose').Document>}
 */
async function assertMemoryOwner(memoryId, patientId) {
  if (!mongoose.Types.ObjectId.isValid(memoryId)) {
    throw new AppError('Invalid memory ID', 400, 'INVALID_ID');
  }
  const memory = await Memory.findOne({
    _id: new mongoose.Types.ObjectId(memoryId),
    patientId: new mongoose.Types.ObjectId(patientId),
  });
  if (!memory) {
    throw new AppError('Memory not found', 404, 'NOT_FOUND');
  }
  return memory;
}

/**
 * Assert a FamilyMember document exists and belongs to the given patient.
 *
 * @param {string} memberId
 * @param {string} patientId
 */
async function assertFamilyMemberOwner(memberId, patientId) {
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    throw new AppError('Invalid family member ID', 400, 'INVALID_ID');
  }
  const member = await FamilyMember.findOne({
    _id: new mongoose.Types.ObjectId(memberId),
    patientId: new mongoose.Types.ObjectId(patientId),
  });
  if (!member) {
    throw new AppError('Family member not found', 404, 'NOT_FOUND');
  }
  return member;
}

// ── Memory CRUD ───────────────────────────────────────────────────────────────

/**
 * Create a new memory.
 *
 * @param {string} patientId
 * @param {string} createdBy - userId who created (may differ for caregiver-created)
 * @param {object} body - validated fields from createMemorySchema
 */
export async function createMemory(patientId, createdBy, body) {
  const memory = await Memory.create({
    patientId: new mongoose.Types.ObjectId(patientId),
    createdBy: new mongoose.Types.ObjectId(createdBy),
    ...body,
    relatedPersonId: body.relatedPersonId
      ? new mongoose.Types.ObjectId(body.relatedPersonId)
      : null,
  });
  return memory;
}

/**
 * List memories for a patient with optional filtering and pagination.
 *
 * @param {string} patientId
 * @param {object} query - validated listMemoriesSchema output
 */
export async function listMemories(patientId, query = {}) {
  const { type, isActive, relatedPersonId, from, to, page = 1, limit = 20 } = query;

  const filter = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (type !== undefined) filter.type = type;
  if (isActive !== undefined) filter.isActive = isActive;
  if (relatedPersonId) filter.relatedPersonId = new mongoose.Types.ObjectId(relatedPersonId);
  if (from || to) {
    filter.importantDate = {};
    if (from) filter.importantDate.$gte = new Date(from);
    if (to) filter.importantDate.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [memories, total] = await Promise.all([
    Memory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Memory.countDocuments(filter),
  ]);

  return {
    data: memories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single memory by ID, verifying patient ownership.
 *
 * @param {string} memoryId
 * @param {string} patientId
 */
export async function getMemory(memoryId, patientId) {
  return assertMemoryOwner(memoryId, patientId);
}

/**
 * Update allowed fields on a memory.
 * `patientId` and `createdBy` are immutable.
 *
 * @param {string} memoryId
 * @param {string} patientId
 * @param {string} updatedBy
 * @param {object} updates - validated updateMemorySchema output
 */
export async function updateMemory(memoryId, patientId, updatedBy, updates) {
  const { patientId: _p, createdBy: _c, ...safeUpdates } = updates;

  if (safeUpdates.relatedPersonId !== undefined && safeUpdates.relatedPersonId !== null) {
    safeUpdates.relatedPersonId = new mongoose.Types.ObjectId(safeUpdates.relatedPersonId);
  }

  const memory = await Memory.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(memoryId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: { ...safeUpdates, updatedBy: new mongoose.Types.ObjectId(updatedBy) } },
    { returnDocument: 'after', runValidators: true }
  );

  if (!memory) {
    throw new AppError('Memory not found', 404, 'NOT_FOUND');
  }
  return memory;
}

/**
 * Soft-delete a memory (isActive = false).
 *
 * @param {string} memoryId
 * @param {string} patientId
 */
export async function deleteMemory(memoryId, patientId) {
  const memory = await Memory.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(memoryId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: { isActive: false } },
    { returnDocument: 'after' }
  );
  if (!memory) {
    throw new AppError('Memory not found', 404, 'NOT_FOUND');
  }

  // If mediaUrl is a local uploaded file, clean up disk if no active memory references it
  if (memory.mediaUrl && memory.mediaUrl.startsWith('/uploads/memories/')) {
    try {
      const filename = path.basename(memory.mediaUrl);
      const filePath = path.join(__dirname, '../../../uploads/memories', filename);
      if (fs.existsSync(filePath)) {
        const otherRef = await Memory.findOne({ mediaUrl: memory.mediaUrl, isActive: true });
        if (!otherRef) {
          fs.unlinkSync(filePath);
        }
      }
    } catch {
      // Non-blocking cleanup error
    }
  }

  return memory;
}

// ── Family Member CRUD ────────────────────────────────────────────────────────

/**
 * Create a new family member.
 *
 * @param {string} patientId
 * @param {string} createdBy
 * @param {object} body - validated fields
 */
export async function createFamilyMember(patientId, createdBy, body) {
  const member = await FamilyMember.create({
    patientId: new mongoose.Types.ObjectId(patientId),
    createdBy: new mongoose.Types.ObjectId(createdBy),
    ...body,
  });
  return member;
}

/**
 * List family members for a patient.
 *
 * @param {string} patientId
 * @param {object} query - validated listFamilyMembersSchema output
 */
export async function listFamilyMembers(patientId, query = {}) {
  const { isActive, page = 1, limit = 20 } = query;

  const filter = { patientId: new mongoose.Types.ObjectId(patientId) };
  if (isActive !== undefined) filter.isActive = isActive;

  const skip = (page - 1) * limit;
  const [members, total] = await Promise.all([
    FamilyMember.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    FamilyMember.countDocuments(filter),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single family member by ID.
 *
 * @param {string} memberId
 * @param {string} patientId
 */
export async function getFamilyMember(memberId, patientId) {
  return assertFamilyMemberOwner(memberId, patientId);
}

/**
 * Update a family member.
 *
 * @param {string} memberId
 * @param {string} patientId
 * @param {object} updates
 */
export async function updateFamilyMember(memberId, patientId, updates) {
  const { patientId: _p, createdBy: _c, ...safeUpdates } = updates;

  const member = await FamilyMember.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(memberId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: safeUpdates },
    { returnDocument: 'after', runValidators: true }
  );
  if (!member) {
    throw new AppError('Family member not found', 404, 'NOT_FOUND');
  }
  return member;
}

/**
 * Soft-delete a family member (isActive = false).
 *
 * @param {string} memberId
 * @param {string} patientId
 */
export async function deleteFamilyMember(memberId, patientId) {
  const member = await FamilyMember.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(memberId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: { isActive: false } },
    { returnDocument: 'after' }
  );
  if (!member) {
    throw new AppError('Family member not found', 404, 'NOT_FOUND');
  }
  return member;
}
