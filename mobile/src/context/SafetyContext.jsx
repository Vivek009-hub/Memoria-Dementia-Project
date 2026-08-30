/**
 * SafetyContext.jsx — Real-time Safety State Provider
 */

import React, { createContext, useState, useContext } from 'react';
import { sendSOS, reportFallEvent, postLocationUpdate } from '../api/safety.api.js';
import { queueService } from '../services/queue.service.js';
import { locationService } from '../services/location.service.js';
import { networkService } from '../services/network.service.js';

const SafetyContext = createContext(null);

export function SafetyProvider({ children, client }) {
  const [activeSafetyEvent, setActiveSafetyEvent] = useState(null);
  const [isFallDetected, setIsFallDetected] = useState(false);
  const [currentFallData, setCurrentFallData] = useState(null);
  const [sosStatus, setSosStatus] = useState(null); // 'SENDING', 'SENT', 'QUEUED', 'FAILED'

  const triggerSOS = async () => {
    setSosStatus('SENDING');
    let loc = null;
    try {
      loc = await locationService.getCurrentLocation();
    } catch {
      loc = { latitude: null, longitude: null, accuracy: null };
    }

    const payload = {
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      timestamp: new Date().toISOString(),
      idempotencyKey: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };

    if (!networkService.getStatus()) {
      await queueService.enqueueEvent('SOS', payload);
      setSosStatus('QUEUED');
      return { status: 'QUEUED', message: 'SOS waiting to send (offline).' };
    }

    try {
      const res = await sendSOS(payload, client);
      setSosStatus('SENT');
      setActiveSafetyEvent(res.data || payload);
      return { status: 'SENT', data: res.data };
    } catch (err) {
      await queueService.enqueueEvent('SOS', payload);
      setSosStatus('QUEUED');
      return { status: 'QUEUED', message: 'SOS queued for transmission.' };
    }
  };

  const handleFallDetected = (fallData) => {
    setCurrentFallData(fallData);
    setIsFallDetected(true);
  };

  const cancelFall = () => {
    setIsFallDetected(false);
    setCurrentFallData(null);
  };

  const confirmFallAndReport = async (options = {}) => {
    setIsFallDetected(false);
    if (!currentFallData) return;

    let loc = null;
    try {
      loc = await locationService.getCurrentLocation();
    } catch {
      loc = { latitude: null, longitude: null };
    }

    const payload = {
      ...currentFallData,
      userConfirmed: !options.timedOut,
      timedOut: !!options.timedOut,
      latitude: loc.latitude,
      longitude: loc.longitude,
    };

    if (!networkService.getStatus()) {
      await queueService.enqueueEvent('FALL', payload);
      return { status: 'QUEUED' };
    }

    try {
      const res = await reportFallEvent(payload, client);
      setActiveSafetyEvent(res.data || payload);
      return { status: 'SENT', data: res.data };
    } catch (err) {
      await queueService.enqueueEvent('FALL', payload);
      return { status: 'QUEUED' };
    }
  };

  return (
    <SafetyContext.Provider
      value={{
        activeSafetyEvent,
        isFallDetected,
        currentFallData,
        sosStatus,
        triggerSOS,
        handleFallDetected,
        cancelFall,
        confirmFallAndReport,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  return useContext(SafetyContext);
}
