/**
 * safetyDashboard.test.js — Integration & Unit Tests for Safety Dashboard & Mobile Integration (Phase F9 / B12)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  triggerSOS,
  sendLocation,
  sendFallEvent,
  confirmFallSafe,
  resolveSafetyEvent,
  fetchSafetyEvents,
  fetchGeofences,
  fetchCurrentLocation,
} from '../src/api/safetyApi.js';

describe('Safety Dashboard & Emergency Mobile API Integration (Phase F9)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('triggers emergency SOS via POST /safety/sos', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'sos_1', type: 'SOS', status: 'TRIGGERED' },
    });

    const location = { latitude: 28.6139, longitude: 77.2090, accuracy: 10 };
    const res = await triggerSOS(location, 'client_sos_123', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/safety/sos', { location, clientEventId: 'client_sos_123' });
    expect(res.success).toBe(true);
    expect(res.data.type).toBe('SOS');
  });

  it('ingests mobile GPS location via POST /safety/location', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { status: 'RECORDED' },
    });

    const res = await sendLocation(28.6139, 77.2090, 5, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/safety/location', {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 5,
      source: 'MOBILE_APP',
    });
    expect(res.success).toBe(true);
  });

  it('ingests fall detection event via POST /safety/fall-events', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'fall_1', type: 'POSSIBLE_FALL', confidence: 0.95 },
    });

    const location = { latitude: 28.6139, longitude: 77.2090 };
    const res = await sendFallEvent(0.95, location, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/safety/fall-events', { confidence: 0.95, location });
    expect(res.success).toBe(true);
    expect(res.data.confidence).toBe(0.95);
  });

  it('confirms patient is safe via POST /safety/fall-events/:id/confirm-safe', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'fall_1', status: 'RESOLVED', notes: 'Patient confirmed safe' },
    });

    const res = await confirmFallSafe('fall_1', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/safety/fall-events/fall_1/confirm-safe');
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('RESOLVED');
  });

  it('resolves safety event via POST /safety/events/:id/resolve', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'sos_1', status: 'RESOLVED' },
    });

    const res = await resolveSafetyEvent('sos_1', 'False alarm', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/safety/events/sos_1/resolve', { notes: 'False alarm' });
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('RESOLVED');
  });

  it('fetches safety events and geofences', async () => {
    const mockGetEvents = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'event_1', type: 'GEOFENCE_EXIT' }],
    });

    const res = await fetchSafetyEvents(mockClient);
    expect(mockGetEvents).toHaveBeenCalledWith('/safety/events');
    expect(res.success).toBe(true);
    expect(res.data[0].type).toBe('GEOFENCE_EXIT');
  });
});
