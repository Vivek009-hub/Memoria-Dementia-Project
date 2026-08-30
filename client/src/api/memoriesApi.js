/**
 * memoriesApi.js — Memory Assistance API endpoints (B5)
 */

import { request } from './client.js';

export async function fetchMemories(patientId = null) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await request(`/memories${query}`);
}

export async function createMemory(memoryData) {
  return await request('/memories', {
    method: 'POST',
    body: memoryData,
  });
}

export async function updateMemory(memoryId, memoryData) {
  return await request(`/memories/${memoryId}`, {
    method: 'PATCH',
    body: memoryData,
  });
}

export async function deleteMemory(memoryId) {
  return await request(`/memories/${memoryId}`, {
    method: 'DELETE',
  });
}
