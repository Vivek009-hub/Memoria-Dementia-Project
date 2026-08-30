/**
 * network.service.js — Network Status & Connectivity Listener
 */

class NetworkService {
  constructor() {
    this.isOnline = true;
    this.listeners = new Set();
  }

  getStatus() {
    return this.isOnline;
  }

  setOnlineStatus(status) {
    if (this.isOnline !== status) {
      this.isOnline = status;
      this.notifyListeners();
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnline);
      } catch (e) {
        console.error('Error in network status listener', e);
      }
    });
  }
}

export const networkService = new NetworkService();
