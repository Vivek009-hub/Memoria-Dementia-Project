/**
 * ai.context.js — Authorized Context Builder for Memora AI
 *
 * Enforces database-level authorization before retrieving memory records
 * or cognitive activity data for AI prompts.
 */

import Memory from '../memories/memory.model.js';
import Game from '../games/game.model.js';
import GameSession from '../games/gameSession.model.js';
import { canAccessPatient } from '../../utils/authorization.js';
import { formatDelimitedMemoryContext } from './ai.guardrails.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Retrieve authorized memory records for the given user/patient.
 * @param {Object} user - Authenticated user object
 * @param {string} [targetPatientId] - Optional patient ID if caregiver
 * @returns {Promise<Array>} Array of authorized memory documents
 */
export async function getAuthorizedMemories(user, targetPatientId = null) {
  const patientId = targetPatientId || user.id;

  // Authorization check for caregiver/patient access
  if (user.role === 'CAREGIVER') {
    await canAccessPatient(user, patientId, 'manageMemories');
  } else if (user.role === 'PATIENT' && user.id.toString() !== patientId.toString()) {
    throw new AppError(
      'You do not have permission to access memories for this patient',
      403,
      'FORBIDDEN'
    );
  }

  // Fetch active memories from B5 collection
  const memories = await Memory.find({ patientId, isActive: true })
    .select('_id title description type importantDate relatedPlace tags createdAt')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return memories;
}

/**
 * Build authorized memory context string for AI prompt.
 */
export async function buildAuthorizedMemoryContext(user, targetPatientId = null) {
  const memories = await getAuthorizedMemories(user, targetPatientId);
  return {
    rawMemories: memories,
    delimitedText: formatDelimitedMemoryContext(memories),
  };
}

/**
 * Build authorized cognitive activity context for game recommendations.
 */
export async function buildCognitiveActivityContext(user, targetPatientId = null) {
  const patientId = targetPatientId || user.id;

  if (user.role === 'CAREGIVER') {
    await canAccessPatient(user, patientId, 'viewCognitiveActivity');
  } else if (user.role === 'PATIENT' && user.id.toString() !== patientId.toString()) {
    throw new AppError(
      'You do not have permission to access activity data for this patient',
      403,
      'FORBIDDEN'
    );
  }

  // Fetch active available games
  const availableGames = await Game.find({ isActive: true })
    .select('_id title description category difficulty')
    .lean();

  // Fetch recent completed game sessions for patient
  const recentSessions = await GameSession.find({ patientId, status: 'COMPLETED' })
    .sort({ completedAt: -1 })
    .limit(10)
    .lean();

  return {
    availableGames,
    recentSessions,
  };
}
