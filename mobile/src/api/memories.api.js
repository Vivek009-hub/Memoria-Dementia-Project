/**
 * memories.api.js — Memory Assistance API Integration (Phase F5 / B5)
 *
 * All API interactions follow backend authorization:
 * - PATIENTS access their own memories automatically via session identity.
 * - CAREGIVERS pass `patientId` query param when authorized.
 */

import { defaultApiClient } from './client.js';

/**
 * List patient memories with optional filtering, search, pagination, and sorting.
 * @param {Object} params - Query params: { type, tag, search, page, limit, sort, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function listMemories(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  
  if (params.type) query.append('type', params.type);
  if (params.tag) query.append('tag', params.tag);
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.sort) query.append('sort', params.sort);
  if (params.patientId) query.append('patientId', params.patientId);

  const queryString = query.toString();
  const endpoint = `/memories${queryString ? `?${queryString}` : ''}`;

  return await client.get(endpoint);
}

/**
 * Get a single memory by ID.
 * @param {string} memoryId
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function getMemory(memoryId, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.get(`/memories/${memoryId}${query}`);
}

/**
 * Create a new memory.
 * @param {Object} data - { title, description, type, mediaUrl, thumbnailUrl, relatedPersonId, relatedPlace, importantDate, datePrecision, language, tags, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function createMemory(data, client = defaultApiClient) {
  return await client.post('/memories', data);
}

/**
 * Update an existing memory.
 * @param {string} memoryId
 * @param {Object} data - Partial memory updates
 * @param {Object} [client=defaultApiClient]
 */
export async function updateMemory(memoryId, data, patientIdOrClient = defaultApiClient, maybeClient = defaultApiClient) {
  let client = defaultApiClient;
  let patientId = null;

  if (patientIdOrClient && typeof patientIdOrClient.patch === 'function') {
    client = patientIdOrClient;
  } else if (typeof patientIdOrClient === 'string') {
    patientId = patientIdOrClient;
    if (maybeClient && typeof maybeClient.patch === 'function') {
      client = maybeClient;
    }
  }

  if (!patientId && data) {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      patientId = data.get('patientId');
    } else if (typeof data === 'object' && data.patientId) {
      patientId = data.patientId;
    }
  }

  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.patch(`/memories/${memoryId}${query}`, data);
}

/**
 * Soft delete (deactivate) a memory.
 * @param {string} memoryId
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function deleteMemory(memoryId, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.delete(`/memories/${memoryId}${query}`);
}

/**
 * List family members associated with patient memories.
 * @param {Object} params - { search, page, limit, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function listFamilyMembers(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.patientId) query.append('patientId', params.patientId);

  const queryString = query.toString();
  return await client.get(`/memories/family-members${queryString ? `?${queryString}` : ''}`);
}

/**
 * Create a new family member record.
 * @param {Object} data - { name, relationship, photoUrl, notes, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function createFamilyMember(data, client = defaultApiClient) {
  return await client.post('/memories/family-members', data);
}

/**
 * Update a family member record.
 * @param {string} memberId
 * @param {Object} data
 * @param {Object} [client=defaultApiClient]
 */
export async function updateFamilyMember(memberId, data, client = defaultApiClient) {
  return await client.patch(`/memories/family-members/${memberId}`, data);
}

/**
 * Delete a family member record.
 * @param {string} memberId
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function deleteFamilyMember(memberId, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.delete(`/memories/family-members/${memberId}${query}`);
}
