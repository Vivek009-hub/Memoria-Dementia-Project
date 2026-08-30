/**
 * queue.test.js — Idempotent Offline Safety Queue Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueueService } from '../src/services/queue.service.js';
import { networkService } from '../src/services/network.service.js';
import { secureStorage } from '../src/services/secureStorage.service.js';

describe('Offline Safety Queue Service (B13)', () => {
  let queue;

  beforeEach(async () => {
    await secureStorage.clear();
    networkService.setOnlineStatus(true);
    queue = new QueueService();
  });

  it('enqueues safety events with WAITING_TO_SEND status when offline', async () => {
    networkService.setOnlineStatus(false);

    const event = await queue.enqueueEvent('SOS', {
      latitude: 28.6139,
      longitude: 77.2090,
      idempotencyKey: 'sos_offline_1',
    });

    expect(event.status).toBe('WAITING_TO_SEND');
    expect(event.type).toBe('SOS');

    const storedQueue = await queue.getQueue();
    expect(storedQueue.length).toBe(1);
    expect(storedQueue[0].payload.idempotencyKey).toBe('sos_offline_1');
  });

  it('automatically processes offline queue when network is restored', async () => {
    const dispatchSpy = vi.fn().mockResolvedValue({ success: true });
    queue.apiDispatchHandler = dispatchSpy;

    networkService.setOnlineStatus(false);
    await queue.enqueueEvent('SOS', { idempotencyKey: 'sos_offline_2' });

    expect(dispatchSpy).not.toHaveBeenCalled();

    // Reconnect network
    networkService.setOnlineStatus(true);

    // Wait for queue processing tick
    await queue.processQueue();

    expect(dispatchSpy).toHaveBeenCalledWith('SOS', expect.objectContaining({ idempotencyKey: 'sos_offline_2' }));
    const storedQueue = await queue.getQueue();
    expect(storedQueue.length).toBe(0);
  });
});
