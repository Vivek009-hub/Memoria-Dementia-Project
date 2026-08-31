/**
 * caregiver.api.js — Caregiver Support REST API Client (Phase F12 / B2-B3)
 */
import { defaultApiClient } from './client.js';

export async function getAuthorizedPatients(client = defaultApiClient) {
  return await client.get('/caregivers/relationships');
}

export async function getCaregiverRelationships(client = defaultApiClient) {
  return await client.get('/caregivers/relationships');
}

export async function getPatientOverview(patientId, client = defaultApiClient) {
  return await client.get(`/analytics/patient/${patientId}/overview`);
}

export async function getPatientReminders(patientId, client = defaultApiClient) {
  return await client.get(`/reminders?patientId=${patientId}`);
}

export async function getPatientMemories(patientId, client = defaultApiClient) {
  return await client.get(`/memories?patientId=${patientId}`);
}

export async function getPatientSafetyEvents(patientId, client = defaultApiClient) {
  return await client.get(`/safety/events/active?patientId=${patientId}`);
}

export async function getPatientLocation(patientId, client = defaultApiClient) {
  return await client.get(`/safety/location/current?patientId=${patientId}`);
}
