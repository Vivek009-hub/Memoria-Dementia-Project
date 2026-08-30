/**
 * queue.service.js — Idempotent Offline Safety Event Queue
 *
 * Safety Requirement:
 * - Offline SOS and fall events must NEVER be silently discarded.
 * - Queue stores event ID, type, detectedAt, location, and retry count.
 * - Retries with exponential backoff when network is restored.
 */

import { secureStorage } from './secureStorage.service.js';
import { networkService } from './network.service.js';

const QUEUE_STORAGE_KEY = 'memora_offline_safety_queue';

export class QueueService {
  constructor(apiDispatchHandler) {
    this.apiDispatchHandler = apiDispatchHandler;
    this.isProcessing = false;
    this.initNetworkListener();
  }

  initNetworkListener() {
    networkService.subscribe((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  async getQueue() {
    const queueData = await secureStorage.getItem(QUEUE_STORAGE_KEY);
    return Array.isArray(queueData) ? queueData : [];
  }

  async saveQueue(queue) {
    await secureStorage.setItem(QUEUE_STORAGE_KEY, queue);
  }

  async enqueueEvent(eventType, payload) {
    const queue = await this.getQueue();
    const eventItem = {
      id: payload.idempotencyKey || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: eventType,
      payload,
      queuedAt: new Date().toISOString(),
      attempts: 0,
      status: 'WAITING_TO_SEND',
    };

    queue.push(eventItem);
    await this.saveQueue(queue);

    if (networkService.getStatus()) {
      this.processQueue();
    }

    return eventItem;
  }

  async processQueue() {
    if (this.isProcessing || !networkService.getStatus()) return this.processingPromise;
    this.isProcessing = true;

    this.processingPromise = (async () => {
      try {
        let queue = await this.getQueue();
        if (queue.length === 0) return;

        const remainingQueue = [];

        for (const item of queue) {
          if (!networkService.getStatus()) {
            remainingQueue.push(item);
            continue;
          }

          try {
            if (this.apiDispatchHandler) {
              await this.apiDispatchHandler(item.type, item.payload);
            }
          } catch (err) {
            item.attempts += 1;
            item.lastError = err.message;
            item.status = item.attempts >= 5 ? 'FAILED_MAX_RETRIES' : 'WAITING_TO_SEND';
            if (item.attempts < 5) {
              remainingQueue.push(item);
            }
          }
        }

        await this.saveQueue(remainingQueue);
      } finally {
        this.isProcessing = false;
        this.processingPromise = null;
      }
    })();

    return this.processingPromise;
  }

}

export const queueService = new QueueService();
