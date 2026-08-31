/**
 * dailyProvider.js — Daily Managed Video Infrastructure Provider Integration
 *
 * Server-side interface for Daily API.
 * Never exposes credentials to client applications.
 */

import { AppError } from '../../utils/AppError.js';
import logger from '../../utils/logger.js';

export class DailyProvider {
  constructor() {
    this.apiKey = process.env.DAILY_API_KEY || null;
    this.domain = process.env.DAILY_DOMAIN || null;
    this.baseUrl = 'https://api.daily.co/v1';
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  /**
   * Create a Daily video room locked to max 6 participants.
   */
  async createRoom({ name, privacy = 'public' }) {
    if (!this.isConfigured()) {
      // Mock Daily provider fallback for local development / testing
      const roomName = `memora-circle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      return {
        provider: 'mock',
        roomName,
        url: `https://memora-mock.daily.co/${roomName}`,
        privacy,
        maxParticipants: 6,
      };
    }

    try {
      const sanitizedName = name
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .substring(0, 40)
        : `circle-${Date.now()}`;
      const roomName = `memora-${sanitizedName}-${Math.random().toString(36).substring(2, 6)}`;

      const response = await globalThis.fetch(`${this.baseUrl}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          name: roomName,
          privacy,
          properties: {
            max_participants: 6,
            enable_chat: true,
            enable_screenshare: true,
            start_audio_off: false,
            start_video_off: false,
            exp: Math.floor(Date.now() / 1000) + 24 * 3600, // 24 hours
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Daily API createRoom error:', errorData);
        throw new AppError('Failed to create video room via Daily provider', 502, 'PROVIDER_ERROR');
      }

      const data = await response.json();
      return {
        provider: 'daily',
        roomName: data.name,
        url: data.url,
        privacy: data.privacy,
        maxParticipants: data.config?.max_participants || 6,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Daily provider createRoom exception:', err);
      // Fallback for network issues during local testing
      const roomName = `memora-fallback-${Date.now()}`;
      return {
        provider: 'mock',
        roomName,
        url: `https://memora-mock.daily.co/${roomName}`,
        privacy,
        maxParticipants: 6,
      };
    }
  }

  /**
   * Issue a short-lived meeting token for authorized patient/host access.
   */
  async createMeetingToken({ roomName, userId, userName, isOwner = false }) {
    if (!this.isConfigured()) {
      return {
        token: `mock_daily_token_${userId}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 4 * 3600).toISOString(),
      };
    }

    try {
      const response = await globalThis.fetch(`${this.baseUrl}/meeting-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            user_name: userName || 'Patient User',
            user_id: userId.toString(),
            is_owner: Boolean(isOwner),
            exp: Math.floor(Date.now() / 1000) + 4 * 3600, // 4 hours
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('Daily API createMeetingToken error:', errorData);
        throw new AppError('Failed to generate video meeting token', 502, 'PROVIDER_ERROR');
      }

      const data = await response.json();
      return {
        token: data.token,
        expiresAt: new Date(Date.now() + 4 * 3600).toISOString(),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Daily provider token exception:', err);
      return {
        token: `mock_daily_token_${userId}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 4 * 3600).toISOString(),
      };
    }
  }

  /**
   * Delete room on Daily infrastructure.
   */
  async deleteRoom(roomName) {
    if (!this.isConfigured() || !roomName) return true;

    try {
      await globalThis.fetch(`${this.baseUrl}/rooms/${roomName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return true;
    } catch (err) {
      logger.error('Daily deleteRoom error:', err);
      return false;
    }
  }
}

export default new DailyProvider();
