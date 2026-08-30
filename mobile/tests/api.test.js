/**
 * api.test.js — Mobile API Client & Endpoint Integration Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, ApiError } from '../src/api/client.js';
import { sendSOS, postLocationUpdate, reportFallEvent } from '../src/api/safety.api.js';

describe('Mobile ApiClient (B13)', () => {
  let client;

  beforeEach(() => {
    client = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('injects Bearer token into Authorization header when authToken is set', () => {
    client.setAuthToken('test-mobile-token-123');
    const headers = client.getHeaders();
    expect(headers['Authorization']).toBe('Bearer test-mobile-token-123');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('translates backend SAFETY_EVENT_ALREADY_RESOLVED into simple user message', () => {
    const backendError = {
      error: {
        code: 'SAFETY_EVENT_ALREADY_RESOLVED',
        message: 'Original backend error message',
      },
    };
    const translated = client.translateError(backendError, 409);
    expect(translated).toBeInstanceOf(ApiError);
    expect(translated.message).toBe('This safety alert has already been handled.');
    expect(translated.code).toBe('SAFETY_EVENT_ALREADY_RESOLVED');
  });

  it('formats postSOS request payload accurately', async () => {
    const mockPost = vi.spyOn(client, 'post').mockResolvedValue({ success: true, data: { eventId: 'sos_1' } });

    const payload = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
      idempotencyKey: 'sos_key_123',
    };

    await sendSOS(payload, client);

    expect(mockPost).toHaveBeenCalledWith('/safety/sos', expect.objectContaining({
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
      idempotencyKey: 'sos_key_123',
    }));
  });

  it('formats location update request payload correctly', async () => {
    const mockPost = vi.spyOn(client, 'post').mockResolvedValue({ success: true });

    await postLocationUpdate({ latitude: 12.34, longitude: 56.78, accuracy: 10, batteryLevel: 80 }, client);

    expect(mockPost).toHaveBeenCalledWith('/safety/location', expect.objectContaining({
      latitude: 12.34,
      longitude: 56.78,
      accuracy: 10,
      batteryLevel: 80,
    }));
  });

  it('formats fall detection report request payload correctly', async () => {
    const mockPost = vi.spyOn(client, 'post').mockResolvedValue({ success: true });

    await reportFallEvent({ confidence: 0.95, userConfirmed: true, timedOut: false }, client);

    expect(mockPost).toHaveBeenCalledWith('/safety/fall-detection', expect.objectContaining({
      confidence: 0.95,
      userConfirmed: true,
      timedOut: false,
    }));
  });
});
