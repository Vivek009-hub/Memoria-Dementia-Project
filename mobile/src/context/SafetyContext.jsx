/**
<<<<<<< HEAD
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
=======
 * SafetyContext.jsx — Live Safety, Geofence, SOS & Location Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import * as safetyApi from '../api/safetyApi.js';
import { getOfflineQueue, processOfflineQueue } from '../services/offlineSync.service.js';

const SafetyContext = createContext(null);

export function SafetyProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [location, setLocation] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [safetyEvents, setSafetyEvents] = useState([]);
  const [pendingQueueCount, setPendingQueueCount] = useState(getOfflineQueue().length);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync offline queue when coming online
      processOfflineQueue(async (item) => {
        if (item.type === 'SOS') {
          await safetyApi.triggerSOS(item.location, item.clientEventId);
        } else if (item.type === 'LOCATION') {
          await safetyApi.sendLocation(item.latitude, item.longitude, item.accuracy);
        }
      }).then(() => {
        setPendingQueueCount(getOfflineQueue().length);
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshSafetyData = async () => {
    try {
      const [eventsRes, gfRes] = await Promise.all([
        safetyApi.fetchSafetyEvents().catch(() => null),
        safetyApi.fetchGeofences().catch(() => null),
      ]);

      if (eventsRes?.data) {
        setSafetyEvents(eventsRes.data);
        const openSOS = eventsRes.data.find(
          (e) => e.type === 'SOS' && ['TRIGGERED', 'OPEN', 'ESCALATED'].includes(e.status)
        );
        setActiveSOS(openSOS || null);
      }

      if (gfRes?.data) {
        setGeofences(gfRes.data);
      }
    } catch {
      // Ignore background errors
    }
  };

  useEffect(() => {
    refreshSafetyData();
    const interval = setInterval(refreshSafetyData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafetyContext.Provider
      value={{
        isOnline,
        location,
        setLocation,
        activeSOS,
        setActiveSOS,
        geofences,
        safetyEvents,
        pendingQueueCount,
        refreshSafetyData,
>>>>>>> 7c9965d9590bdc0c5177cb353c60eab343a31e8b
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
<<<<<<< HEAD
  return useContext(SafetyContext);
=======
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
>>>>>>> 7c9965d9590bdc0c5177cb353c60eab343a31e8b
}
