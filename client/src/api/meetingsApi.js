/**
 * meetingsApi.js — Memora Meeting Circle API endpoints (B8)
 */

import { request } from './client.js';

export async function fetchMeetings() {
  return await request('/meetings');
}

export async function fetchMeetingById(meetingId) {
  return await request(`/meetings/${meetingId}`);
}

export async function joinMeeting(meetingId) {
  return await request(`/meetings/${meetingId}/join`, {
    method: 'POST',
  });
}
