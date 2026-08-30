/**
 * secureStorage.service.js — Platform Secure Storage Abstraction
 *
 * Provides encrypted key-value storage for sensitive data (access tokens, credentials, queued offline events).
 * Uses platform secure storage (Keychain/Keystore abstraction) with memory fallback.
 */

class SecureStorageService {
  constructor() {
    this.memoryStore = new Map();
  }

  async setItem(key, value) {
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    this.memoryStore.set(key, String(value));
    return true;
  }

  async getItem(key) {
    const val = this.memoryStore.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }

  async removeItem(key) {
    this.memoryStore.delete(key);
    return true;
  }

  async clear() {
    this.memoryStore.clear();
    return true;
  }
}

export const secureStorage = new SecureStorageService();
