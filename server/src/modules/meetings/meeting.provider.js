/**
 * meeting.provider.js — Meeting Provider Interface
 *
 * Per Prompt §4 (Provider Abstraction).
 * Abstract contract for voice/video meeting engine implementations.
 */

export class BaseMeetingProvider {
  /**
   * Create a new meeting room on the external provider.
   * @param {Object} params
   * @param {string} params.title
   * @param {string} params.meetingType - 'VIDEO' | 'VOICE'
   * @param {number} params.maximumParticipants
   * @returns {Promise<{ providerMeetingId: string, meetingUrl: string }>}
   */
  async createMeeting(_params) {
    throw new Error('createMeeting must be implemented by subclass');
  }

  /**
   * Generate temporary scoped join credentials/tokens for a participant.
   * @param {Object} params
   * @param {string} params.providerMeetingId
   * @param {string} params.userId
   * @param {string} params.role - 'PATIENT' | 'CAREGIVER' | 'HOST' | 'GUEST'
   * @param {string} params.displayName
   * @returns {Promise<{ token: string, expiresAt: Date, meetingUrl: string }>}
   */
  async createParticipantToken(_params) {
    throw new Error('createParticipantToken must be implemented by subclass');
  }

  /**
   * Start meeting on external provider.
   * @param {string} providerMeetingId
   * @returns {Promise<boolean>}
   */
  async startMeeting(_providerMeetingId) {
    throw new Error('startMeeting must be implemented by subclass');
  }

  /**
   * End meeting on external provider.
   * @param {string} providerMeetingId
   * @returns {Promise<boolean>}
   */
  async endMeeting(_providerMeetingId) {
    throw new Error('endMeeting must be implemented by subclass');
  }

  /**
   * Remove participant from live meeting on external provider.
   * @param {string} providerMeetingId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async removeParticipant(_providerMeetingId, _userId) {
    throw new Error('removeParticipant must be implemented by subclass');
  }
}
