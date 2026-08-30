/**
 * fallDetection.service.js — Fall Detection Sensor Integration & Confirmation Workflow
 *
 * Flow:
 * 1. Sensor detects impact / fall motion.
 * 2. Triggers fall confirmation window (30-second countdown).
 * 3. If patient taps "YES, I'M OKAY" -> Cancel event (false positive).
 * 4. If patient taps "I NEED HELP" or timeout expires -> Submit Fall Event to B12 backend.
 */

class FallDetectionService {
  constructor() {
    this.confirmationTimeoutMs = 30000; // 30 seconds default
    this.activeFallTimer = null;
    this.onFallDetectedCallback = null;
    this.onFallEscalatedCallback = null;
  }

  setConfirmationTimeoutMs(ms) {
    this.confirmationTimeoutMs = ms;
  }

  onFallDetected(callback) {
    this.onFallDetectedCallback = callback;
  }

  onFallEscalated(callback) {
    this.onFallEscalatedCallback = callback;
  }

  // Triggered by device motion sensor
  triggerFallDetected(fallData = {}) {
    const fallEvent = {
      idempotencyKey: `fall_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      detectedAt: new Date().toISOString(),
      confidence: fallData.confidence || 0.92,
      latitude: fallData.latitude || null,
      longitude: fallData.longitude || null,
    };

    if (this.onFallDetectedCallback) {
      this.onFallDetectedCallback(fallEvent);
    }

    // Start automated countdown timer
    this.clearTimer();
    this.activeFallTimer = setTimeout(() => {
      this.handleTimeout(fallEvent);
    }, this.confirmationTimeoutMs);

    return fallEvent;
  }

  cancelFallEvent() {
    this.clearTimer();
    return { cancelled: true, timestamp: new Date().toISOString() };
  }

  confirmFallUserNeedsHelp(fallEvent) {
    this.clearTimer();
    const payload = {
      ...fallEvent,
      userConfirmed: true,
      timedOut: false,
    };
    if (this.onFallEscalatedCallback) {
      this.onFallEscalatedCallback(payload);
    }
    return payload;
  }

  handleTimeout(fallEvent) {
    this.clearTimer();
    const payload = {
      ...fallEvent,
      userConfirmed: false,
      timedOut: true,
    };
    if (this.onFallEscalatedCallback) {
      this.onFallEscalatedCallback(payload);
    }
  }

  clearTimer() {
    if (this.activeFallTimer) {
      clearTimeout(this.activeFallTimer);
      this.activeFallTimer = null;
    }
  }
}

export const fallDetectionService = new FallDetectionService();
