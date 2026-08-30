/**
 * mockMeetingProvider.js — Mock Meeting Provider Implementation
 *
 * Per Prompt §56 (Mock Provider).
 * In-memory provider implementation for tests and dev environments.
 */

import { BaseMeetingProvider } from './meeting.provider.js';

export class MockMeetingProvider extends BaseMeetingProvider {
  constructor() {
    super();
    this.name = 'mock';
    this.createdMeetings = new Map();
    this.activeMeetings = new Set();
  }

  async createMeeting(params) {
    const providerMeetingId = `mock_room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const meetingUrl = `https://meet.memora.app/room/${providerMeetingId}`;

    const meetingRecord = {
      providerMeetingId,
      meetingUrl,
      title: params.title || 'Memora Meeting',
      meetingType: params.meetingType || 'VIDEO',
      maximumParticipants: params.maximumParticipants || 20,
      status: 'SCHEDULED',
      createdAt: new Date(),
    };

    this.createdMeetings.set(providerMeetingId, meetingRecord);
    return { providerMeetingId, meetingUrl };
  }

  async createParticipantToken(params) {
    const { providerMeetingId, userId, role, displayName } = params;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours validity

    const token = `mock_token_${role.toLowerCase()}_${userId}_${Date.now()}`;
    const meetingUrl = `https://meet.memora.app/room/${providerMeetingId}?token=${token}`;

    return {
      token,
      expiresAt,
      meetingUrl,
      role,
      displayName: displayName || 'Participant',
    };
  }

  async startMeeting(providerMeetingId) {
    if (this.createdMeetings.has(providerMeetingId)) {
      const meeting = this.createdMeetings.get(providerMeetingId);
      meeting.status = 'LIVE';
    }
    this.activeMeetings.add(providerMeetingId);
    return true;
  }

  async endMeeting(providerMeetingId) {
    if (this.createdMeetings.has(providerMeetingId)) {
      const meeting = this.createdMeetings.get(providerMeetingId);
      meeting.status = 'ENDED';
    }
    this.activeMeetings.delete(providerMeetingId);
    return true;
  }

  async removeParticipant(providerMeetingId, _userId) {
    return true;
  }
}

export default new MockMeetingProvider();
