/**
 * reminders.api.js — Reminders & Daily Routine API Integration (Phase F6 / B6)
 *
 * Calls Memora B6 backend API endpoints for reminder definitions and occurrence actions.
 * - PATIENTS access their own reminders via session identity.
 * - CAREGIVERS pass `patientId` query param when authorized.
 */

import { defaultApiClient } from './client.js';

/**
 * List patient reminders with optional filtering.
 * @param {Object} params - { type, isActive, page, limit, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function listReminders(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.type) query.append('type', params.type);
  if (params.isActive !== undefined) query.append('isActive', params.isActive);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.patientId) query.append('patientId', params.patientId);

  const queryString = query.toString();
  return await client.get(`/reminders${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get a single reminder by ID.
 * @param {string} reminderId
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function getReminder(reminderId, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.get(`/reminders/${reminderId}${query}`);
}

/**
 * Create a new reminder definition.
 * @param {Object} data - { title, description, type, schedule: { time, startAt }, timezone, recurrence, voiceEnabled, startDate, endDate, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function createReminder(data, client = defaultApiClient) {
  return await client.post('/reminders', data);
}

/**
 * Update an existing reminder definition.
 * @param {string} reminderId
 * @param {Object} data - Partial reminder update fields
 * @param {Object} [client=defaultApiClient]
 */
export async function updateReminder(reminderId, data, client = defaultApiClient) {
  return await client.patch(`/reminders/${reminderId}`, data);
}

/**
 * Soft delete (deactivate) a reminder definition.
 * @param {string} reminderId
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function deleteReminder(reminderId, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.delete(`/reminders/${reminderId}${query}`);
}

/**
 * Mark a reminder occurrence as completed.
 * @param {string} reminderId
 * @param {Object} [options={ note, logId }]
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function completeReminder(reminderId, options = {}, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.post(`/reminders/${reminderId}/complete${query}`, options);
}

/**
 * Skip / dismiss a reminder occurrence.
 * @param {string} reminderId
 * @param {Object} [options={ note, logId }]
 * @param {string} [patientId]
 * @param {Object} [client=defaultApiClient]
 */
export async function skipReminder(reminderId, options = {}, patientId, client = defaultApiClient) {
  const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
  return await client.post(`/reminders/${reminderId}/skip${query}`, options);
}

/**
 * Get reminder occurrence history logs.
 * @param {Object} params - { reminderId, status, from, to, page, limit, patientId }
 * @param {Object} [client=defaultApiClient]
 */
export async function getReminderHistory(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.reminderId) query.append('reminderId', params.reminderId);
  if (params.status) query.append('status', params.status);
  if (params.from) query.append('from', params.from);
  if (params.to) query.append('to', params.to);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.patientId) query.append('patientId', params.patientId);

  const queryString = query.toString();
  return await client.get(`/reminders/history${queryString ? `?${queryString}` : ''}`);
}
