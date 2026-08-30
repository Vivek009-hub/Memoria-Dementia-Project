/**
 * location.service.js — Background Location & Battery-Aware Tracking Strategy
 *
 * Requirements:
 * - Handle permission states: GRANTED, DENIED, RESTRICTED, LIMITED, REVOKED.
 * - Battery-aware frequency management.
 * - Accurate payload output (latitude, longitude, accuracy, timestamp).
 */

export const PERMISSION_STATES = {
  GRANTED: 'GRANTED',
  DENIED: 'DENIED',
  RESTRICTED: 'RESTRICTED',
  LIMITED: 'LIMITED',
  REVOKED: 'REVOKED',
};

class LocationService {
  constructor() {
    this.permissionState = PERMISSION_STATES.GRANTED;
    this.currentLocation = {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 10, // meters
      timestamp: new Date().toISOString(),
    };
    this.batteryLevel = 85;
    this.intervalId = null;
  }

  setPermissionState(state) {
    if (Object.values(PERMISSION_STATES).includes(state)) {
      this.permissionState = state;
    }
  }

  getPermissionState() {
    return this.permissionState;
  }

  async requestPermissions() {
    // Platform permission check simulation
    return this.permissionState === PERMISSION_STATES.GRANTED;
  }

  async getCurrentLocation() {
    if (this.permissionState !== PERMISSION_STATES.GRANTED && this.permissionState !== PERMISSION_STATES.LIMITED) {
      throw new Error('Location permission not granted.');
    }
    this.currentLocation.timestamp = new Date().toISOString();
    return { ...this.currentLocation };
  }

  updateMockLocation(lat, lng, accuracy = 10) {
    this.currentLocation = {
      latitude: lat,
      longitude: lng,
      accuracy,
      timestamp: new Date().toISOString(),
    };
  }

  getBatteryAwareIntervalMs() {
    if (this.batteryLevel < 15) {
      return 15 * 60 * 1000; // 15 mins for low battery
    }
    if (this.batteryLevel < 30) {
      return 10 * 60 * 1000; // 10 mins
    }
    return 5 * 60 * 1000; // 5 mins normal
  }

  startLocationUpdates(onLocationCallback) {
    this.stopLocationUpdates();
    const intervalMs = this.getBatteryAwareIntervalMs();
    this.intervalId = setInterval(async () => {
      try {
        const loc = await this.getCurrentLocation();
        if (onLocationCallback) {
          onLocationCallback(loc);
        }
      } catch (err) {
        // Handle permission revocation during tracking without crashing
      }
    }, intervalMs);
  }

  stopLocationUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const locationService = new LocationService();
