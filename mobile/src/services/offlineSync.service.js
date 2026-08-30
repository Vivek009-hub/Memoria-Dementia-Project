/**
 * offlineSync.service.js — Offline safety event queue & auto-sync manager
 */

const QUEUE_KEY = 'memora_mobile_offline_queue';

export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function queueOfflineItem(item) {
  const current = getOfflineQueue();
  const newItem = {
    ...item,
    id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    queuedAt: new Date().toISOString(),
  };
  current.push(newItem);
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
  } catch {
    // Storage quota fallback
  }
  return newItem;
}

export function clearOfflineQueue() {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    // Ignore
  }
}

export async function processOfflineQueue(processCallback) {
  const items = getOfflineQueue();
  if (items.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;
  const remaining = [];

  for (const item of items) {
    try {
      await processCallback(item);
      processed++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch {
    // Ignore
  }

  return { processed, failed };
}
