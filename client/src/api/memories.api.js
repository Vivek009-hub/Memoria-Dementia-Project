/**
 * memories.api.js — Memory Assistance REST API Client (Phase F5 / B5)
 */
import { defaultApiClient } from './client.js';

export async function getMemories(params = {}, client = defaultApiClient) {
  const cleanParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
      cleanParams.append(key, val);
    }
  });
  const query = cleanParams.toString();
  const endpoint = `/memories${query ? `?${query}` : ''}`;
  return await client.get(endpoint);
}

export const listMemories = getMemories;

export async function getMemory(id, client = defaultApiClient) {
  return await client.get(`/memories/${id}`);
}

export async function createMemory(data, client = defaultApiClient) {
  return await client.post('/memories', data);
}

export async function updateMemory(id, data, client = defaultApiClient) {
  return await client.patch(`/memories/${id}`, data);
}

export async function deleteMemory(id, client = defaultApiClient) {
  return await client.delete(`/memories/${id}`);
}

export async function askMemoryAssistant(query, patientId, client = defaultApiClient) {
  return await client.post('/ai/memory-assistant', { query, patientId });
}

export async function searchMemories(queryStr, client = defaultApiClient) {
  return await client.get(`/memories?search=${encodeURIComponent(queryStr)}`);
}

export async function getFamilyDirectory(client = defaultApiClient) {
  return await client.get('/memories/family-directory');
}

export const listFamilyMembers = getFamilyDirectory;

export async function createFamilyMember(memberData, client = defaultApiClient) {
  return await client.post('/memories/family-directory', memberData);
}
