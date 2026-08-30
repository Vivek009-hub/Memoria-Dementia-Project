/**
 * memory.controller.js — Express handlers for /api/v1/memories
 *
 * Thin layer: resolves patientId, validates inputs, calls service, formats response.
 * All authorization is handled by middleware before reaching these handlers.
 */

import * as memoryService from './memory.service.js';
import {
  validateCreateMemory,
  validateUpdateMemory,
  validateListMemoriesQuery,
  validateCreateFamilyMember,
  validateUpdateFamilyMember,
  validateListFamilyMembersQuery,
} from './memory.validation.js';

// ── Patient ID resolution ─────────────────────────────────────────────────────

/**
 * Resolve the target patientId for the request.
 * - PATIENT: always their own ID
 * - CAREGIVER: patientId from query string or body (authorized by caregiverMemoryScope)
 *
 * @param {object} req
 * @returns {string}
 */
function resolvePatientId(req) {
  if (req.user.role === 'PATIENT') {
    return req.user.id;
  }
  return req.query?.patientId ?? req.body?.patientId ?? req.params?.patientId;
}

// ── Memory handlers ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/memories
 */
export async function createMemory(req, res, next) {
  try {
    const data = validateCreateMemory(req.body);
    const patientId = resolvePatientId(req);
    const memory = await memoryService.createMemory(patientId, req.user.id, data);
    res.status(201).json({ success: true, data: memory });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/memories
 */
export async function listMemories(req, res, next) {
  try {
    const query = validateListMemoriesQuery(req.query);
    const patientId = resolvePatientId(req);
    const result = await memoryService.listMemories(patientId, query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/memories/:memoryId
 */
export async function getMemory(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    const memory = await memoryService.getMemory(req.params.memoryId, patientId);
    res.status(200).json({ success: true, data: memory });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/memories/:memoryId
 */
export async function updateMemory(req, res, next) {
  try {
    const updates = validateUpdateMemory(req.body);
    const patientId = resolvePatientId(req);
    const memory = await memoryService.updateMemory(
      req.params.memoryId,
      patientId,
      req.user.id,
      updates
    );
    res.status(200).json({ success: true, data: memory });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/memories/:memoryId
 */
export async function deleteMemory(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    await memoryService.deleteMemory(req.params.memoryId, patientId);
    res.status(200).json({ success: true, message: 'Memory deactivated' });
  } catch (err) {
    next(err);
  }
}

// ── Family Member handlers ────────────────────────────────────────────────────

/**
 * POST /api/v1/memories/family-members
 */
export async function createFamilyMember(req, res, next) {
  try {
    const data = validateCreateFamilyMember(req.body);
    const patientId = resolvePatientId(req);
    const member = await memoryService.createFamilyMember(patientId, req.user.id, data);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/memories/family-members
 */
export async function listFamilyMembers(req, res, next) {
  try {
    const query = validateListFamilyMembersQuery(req.query);
    const patientId = resolvePatientId(req);
    const result = await memoryService.listFamilyMembers(patientId, query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/memories/family-members/:memberId
 */
export async function getFamilyMember(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    const member = await memoryService.getFamilyMember(req.params.memberId, patientId);
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/memories/family-members/:memberId
 */
export async function updateFamilyMember(req, res, next) {
  try {
    const updates = validateUpdateFamilyMember(req.body);
    const patientId = resolvePatientId(req);
    const member = await memoryService.updateFamilyMember(
      req.params.memberId,
      patientId,
      updates
    );
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/memories/family-members/:memberId
 */
export async function deleteFamilyMember(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    await memoryService.deleteFamilyMember(req.params.memberId, patientId);
    res.status(200).json({ success: true, message: 'Family member deactivated' });
  } catch (err) {
    next(err);
  }
}
