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
