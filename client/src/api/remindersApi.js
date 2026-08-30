/**
 * remindersApi.js — Reminders & Daily Routine API endpoints (B6)
 */

import { request } from './client.js';

export async function fetchReminders(patientId = null) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await request(`/reminders${query}`);
}

export async function createReminder(reminderData) {
  return await request('/reminders', {
    method: 'POST',
    body: reminderData,
  });
}

export async function completeReminder(reminderId) {
  return await request(`/reminders/${reminderId}/complete`, {
    method: 'POST',
  });
}

export async function snoozeReminder(reminderId, minutes = 15) {
  return await request(`/reminders/${reminderId}/snooze`, {
    method: 'POST',
    body: { snoozeMinutes: minutes },
  });
}
