/**
 * caregiver.api.js — Caregiver Module API Integration (Phase F12)
 *
 * Calls Memora REST API endpoints for caregiver relationships and patient support.
 */

import { defaultApiClient } from './client.js';

/**
 * List active caregiver-patient relationships for authenticated caregiver.
 * @param {Object} [client=defaultApiClient]
 */
export async function listRelationships(client = defaultApiClient) {
  return await client.get('/caregivers/relationships');
}

/**
 * Create a new caregiver-patient relationship link.
 * @param {Object} data - { patientEmail, relationshipType, permissions }
 * @param {Object} [client=defaultApiClient]
 */
export async function createRelationship(data, client = defaultApiClient) {
  return await client.post('/caregivers/relationships', data);
}

/**
 * Update relationship permissions.
 * @param {string} relationshipId
 * @param {Object} permissions
 * @param {Object} [client=defaultApiClient]
 */
export async function updateRelationship(relationshipId, permissions, client = defaultApiClient) {
  return await client.patch(`/caregivers/relationships/${relationshipId}`, { permissions });
}

/**
 * Revoke caregiver-patient relationship link.
 * @param {string} relationshipId
 * @param {Object} [client=defaultApiClient]
 */
export async function revokeRelationship(relationshipId, client = defaultApiClient) {
  return await client.delete(`/caregivers/relationships/${relationshipId}`);
}

/**
 * Fetch authorized patient's reminders.
 * @param {string} patientId
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientReminders(patientId, client = defaultApiClient) {
  return await client.get(`/reminders?patientId=${patientId}`);
}

/**
 * Fetch authorized patient's memory vault items.
 * @param {string} patientId
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientMemories(patientId, client = defaultApiClient) {
  return await client.get(`/memories?patientId=${patientId}`);
}

/**
 * Fetch authorized patient's safety events.
 * @param {string} patientId
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientSafetyEvents(patientId, client = defaultApiClient) {
  return await client.get(`/safety/events?patientId=${patientId}`);
}

/**
 * Fetch authorized patient's latest verified GPS location.
 * @param {string} patientId
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientLocation(patientId, client = defaultApiClient) {
  return await client.get(`/safety/location/current?patientId=${patientId}`);
}
