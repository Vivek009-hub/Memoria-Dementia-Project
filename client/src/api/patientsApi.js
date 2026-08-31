/**
 * patientsApi.js — Patient Profile & Emergency Contacts API endpoints (B3)
 */

import { request } from './client.js';

export async function getPatientProfile(patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}` : '/patients/me';
  return await request(endpoint);
}

export async function updatePatientProfile(data, patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}` : '/patients/me';
  return await request(endpoint, {
    method: 'PATCH',
    body: data,
  });
}

export async function getEmergencyContacts(patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}/emergency-contacts` : '/patients/me/emergency-contacts';
  return await request(endpoint);
}

export async function addEmergencyContact(contactData, patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}/emergency-contacts` : '/patients/me/emergency-contacts';
  return await request(endpoint, {
    method: 'POST',
    body: contactData,
  });
}

export async function updateEmergencyContact(contactId, contactData, patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}/emergency-contacts/${contactId}` : `/patients/me/emergency-contacts/${contactId}`;
  return await request(endpoint, {
    method: 'PATCH',
    body: contactData,
  });
}

export async function deleteEmergencyContact(contactId, patientId = null) {
  const endpoint = patientId ? `/patients/${patientId}/emergency-contacts/${contactId}` : `/patients/me/emergency-contacts/${contactId}`;
  return await request(endpoint, {
    method: 'DELETE',
  });
}

export async function getPatientCaregivers() {
  return await request('/patients/me/caregivers');
}

export async function generateCaregiverInvite(options = {}) {
  return await request('/patients/me/caregivers/invite', {
    method: 'POST',
    body: options,
  });
}

export async function acceptCaregiverRequest(relationshipId) {
  return await request(`/patients/me/caregivers/${relationshipId}/accept`, {
    method: 'POST',
  });
}

export async function updateCaregiverPermissions(relationshipId, permissions) {
  return await request(`/patients/me/caregivers/${relationshipId}/permissions`, {
    method: 'PATCH',
    body: { permissions },
  });
}

export async function revokeCaregiverConnection(relationshipId) {
  return await request(`/patients/me/caregivers/${relationshipId}/revoke`, {
    method: 'POST',
  });
}

