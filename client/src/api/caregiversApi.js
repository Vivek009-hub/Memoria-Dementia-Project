/**
 * caregiversApi.js — Caregiver Relationship API endpoints (B3)
 */

import { request } from './client.js';

export async function getCaregiverRelationships() {
  return await request('/caregivers/relationships');
}

export async function createCaregiverRelationship(data) {
  return await request('/caregivers/relationships', {
    method: 'POST',
    body: data,
  });
}

export async function updateCaregiverRelationship(relationshipId, data) {
  return await request(`/caregivers/relationships/${relationshipId}`, {
    method: 'PATCH',
    body: data,
  });
}
