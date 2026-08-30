/**
 * safety.test.js — SOS, Location & Fall Detection Domain Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { locationService, PERMISSION_STATES } from '../src/services/location.service.js';
import { fallDetectionService } from '../src/services/fallDetection.service.js';

describe('Location & Fall Detection Services (B13)', () => {
  beforeEach(() => {
    locationService.setPermissionState(PERMISSION_STATES.GRANTED);
  });

  it('handles location permissions states correctly', async () => {
    expect(locationService.getPermissionState()).toBe(PERMISSION_STATES.GRANTED);
    const loc = await locationService.getCurrentLocation();
    expect(loc.latitude).toBeDefined();
    expect(loc.longitude).toBeDefined();

    locationService.setPermissionState(PERMISSION_STATES.DENIED);
    await expect(locationService.getCurrentLocation()).rejects.toThrow('Location permission not granted.');
  });

  it('adjusts location interval based on battery level', () => {
    locationService.batteryLevel = 10;
    expect(locationService.getBatteryAwareIntervalMs()).toBe(15 * 60 * 1000);

    locationService.batteryLevel = 80;
    expect(locationService.getBatteryAwareIntervalMs()).toBe(5 * 60 * 1000);
  });

  it('triggers fall detection workflow and handles user cancellation (false positive)', () => {
    const onFallSpy = vi.fn();
    fallDetectionService.onFallDetected(onFallSpy);

    const event = fallDetectionService.triggerFallDetected({ confidence: 0.9 });
    expect(onFallSpy).toHaveBeenCalledWith(expect.objectContaining({ confidence: 0.9 }));
    expect(event.idempotencyKey).toBeDefined();

    const cancelRes = fallDetectionService.cancelFallEvent();
    expect(cancelRes.cancelled).toBe(true);
  });

  it('escalates fall event on automated countdown timeout', async () => {
    vi.useFakeTimers();
    const onEscalatedSpy = vi.fn();
    fallDetectionService.onFallEscalated(onEscalatedSpy);
    fallDetectionService.setConfirmationTimeoutMs(1000);

    fallDetectionService.triggerFallDetected();

    vi.advanceTimersByTime(1500);

    expect(onEscalatedSpy).toHaveBeenCalledWith(expect.objectContaining({
      userConfirmed: false,
      timedOut: true,
    }));

    vi.useRealTimers();
  });
});
