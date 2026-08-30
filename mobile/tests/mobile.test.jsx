/**
 * mobile.test.jsx — Unit & Integration tests for Memora Mobile Safety App
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getOfflineQueue,
  queueOfflineItem,
  clearOfflineQueue,
  processOfflineQueue,
} from '../src/services/offlineSync.service.js';

describe('Memora Mobile Safety Application (B13)', () => {
  beforeEach(() => {
    clearOfflineQueue();
  });

  it('queues offline SOS and location updates when device has no network', () => {
    const queuedItem = queueOfflineItem({
      type: 'SOS',
      location: { latitude: 28.6139, longitude: 77.2090 },
      clientEventId: 'test_sos_1',
    });

    expect(queuedItem.id).toBeDefined();
    expect(queuedItem.type).toBe('SOS');

    const queue = getOfflineQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].clientEventId).toBe('test_sos_1');
  });

  it('processes offline queue items when reconnected online', async () => {
    queueOfflineItem({
      type: 'LOCATION',
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10,
    });

    const mockCallback = vi.fn().mockResolvedValue({ success: true });

    const result = await processOfflineQueue(mockCallback);

    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    const queueAfter = getOfflineQueue();
    expect(queueAfter.length).toBe(0);
  });

  it('re-queues failed items during sync retry', async () => {
    queueOfflineItem({
      type: 'SOS',
      clientEventId: 'failed_item',
    });

    const mockCallback = vi.fn().mockRejectedValue(new Error('Network Error'));

    const result = await processOfflineQueue(mockCallback);

    expect(result.processed).toBe(0);
    expect(result.failed).toBe(1);

    const queueAfter = getOfflineQueue();
    expect(queueAfter.length).toBe(1);
    expect(queueAfter[0].clientEventId).toBe('failed_item');
  });
});
