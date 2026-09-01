/**
 * reminders.api.js — Reminders & Routine REST API Client (Phase F6 / B6)
 */
import { defaultApiClient } from './client.js';

export async function getReminders(params = {}, client = defaultApiClient) {
  const cleanParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
      cleanParams.append(key, val);
    }
  });
  const query = cleanParams.toString();
  const endpoint = `/reminders${query ? `?${query}` : ''}`;
  return await client.get(endpoint);
}

export async function getReminder(id, client = defaultApiClient) {
  return await client.get(`/reminders/${id}`);
}

export async function createReminder(data, client = defaultApiClient) {
  return await client.post('/reminders', data);
}

export async function updateReminder(id, data, client = defaultApiClient) {
  return await client.patch(`/reminders/${id}`, data);
}

export async function deleteReminder(id, client = defaultApiClient) {
  return await client.delete(`/reminders/${id}`);
}

export async function completeReminder(id, completionData = {}, client = defaultApiClient) {
  const patientId = completionData?.patientId;
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.post(`/reminders/${id}/complete${query}`, completionData);
}

export async function snoozeReminder(id, snoozeMinutes = 15, client = defaultApiClient) {
  return await client.post(`/reminders/${id}/snooze`, { snoozeMinutes });
}

export async function skipReminder(id, reasonOrData = '', client = defaultApiClient) {
  const body = typeof reasonOrData === 'string' ? { reason: reasonOrData } : { ...reasonOrData };
  const patientId = body.patientId;
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.post(`/reminders/${id}/skip${query}`, body);
}

export async function getTodayReminders(client = defaultApiClient) {
  const today = new Date().toISOString().split('T')[0];
  return await client.get(`/reminders?date=${today}`);
}
