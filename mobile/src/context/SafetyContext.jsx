/**
 * SafetyContext.jsx — Live Safety, Geofence, SOS & Location Context Provider
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendSOS, reportFallEvent } from '../api/safety.api.js';
import * as safetyApi from '../api/safetyApi.js';
import { queueService } from '../services/queue.service.js';
import { locationService } from '../services/location.service.js';
import { networkService } from '../services/network.service.js';
import { getOfflineQueue, processOfflineQueue } from '../services/offlineSync.service.js';

const SafetyContext = createContext(null);

export function SafetyProvider({ children, client }) {
  const [activeSafetyEvent, setActiveSafetyEvent] = useState(null);
  const [isFallDetected, setIsFallDetected] = useState(false);
  const [currentFallData, setCurrentFallData] = useState(null);
  const [sosStatus, setSosStatus] = useState(null); // 'SENDING', 'SENT', 'QUEUED', 'FAILED'

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [location, setLocation] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [safetyEvents, setSafetyEvents] = useState([]);
  const [pendingQueueCount, setPendingQueueCount] = useState(getOfflineQueue ? getOfflineQueue().length : 0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (processOfflineQueue) {
        processOfflineQueue(async (item) => {
          if (item.type === 'SOS' && safetyApi.triggerSOS) {
            await safetyApi.triggerSOS(item.location, item.clientEventId);
          } else if (item.type === 'LOCATION' && safetyApi.sendLocation) {
            await safetyApi.sendLocation(item.latitude, item.longitude, item.accuracy);
          }
        }).then(() => {
          if (getOfflineQueue) setPendingQueueCount(getOfflineQueue().length);
        });
      }
    };

    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const triggerSOS = async () => {
    setSosStatus('SENDING');
    let loc = null;
    try {
      loc = locationService ? await locationService.getCurrentLocation() : null;
    } catch {
      loc = { latitude: null, longitude: null, accuracy: null };
    }

    const payload = {
      latitude: loc?.latitude || null,
      longitude: loc?.longitude || null,
      accuracy: loc?.accuracy || null,
      timestamp: new Date().toISOString(),
      idempotencyKey: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };

    if (networkService && !networkService.getStatus()) {
      if (queueService) await queueService.enqueueEvent('SOS', payload);
      setSosStatus('QUEUED');
      return { status: 'QUEUED', message: 'SOS waiting to send (offline).' };
    }

    try {
      const res = sendSOS ? await sendSOS(payload, client) : { data: payload };
      setSosStatus('SENT');
      setActiveSafetyEvent(res.data || payload);
      setActiveSOS(res.data || payload);
      return { status: 'SENT', data: res.data };
    } catch (err) {
      if (queueService) await queueService.enqueueEvent('SOS', payload);
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
      loc = locationService ? await locationService.getCurrentLocation() : null;
    } catch {
      loc = { latitude: null, longitude: null };
    }

    const payload = {
      ...currentFallData,
      userConfirmed: !options.timedOut,
      timedOut: !!options.timedOut,
      latitude: loc?.latitude || null,
      longitude: loc?.longitude || null,
    };

    if (networkService && !networkService.getStatus()) {
      if (queueService) await queueService.enqueueEvent('FALL', payload);
      return { status: 'QUEUED' };
    }

    try {
      const res = reportFallEvent ? await reportFallEvent(payload, client) : { data: payload };
      setActiveSafetyEvent(res.data || payload);
      return { status: 'SENT', data: res.data };
    } catch (err) {
      if (queueService) await queueService.enqueueEvent('FALL', payload);
      return { status: 'QUEUED' };
    }
  };

  const refreshSafetyData = async () => {
    try {
      const [eventsRes, gfRes] = await Promise.all([
        safetyApi.fetchSafetyEvents ? safetyApi.fetchSafetyEvents().catch(() => null) : null,
        safetyApi.fetchGeofences ? safetyApi.fetchGeofences().catch(() => null) : null,
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
        activeSafetyEvent,
        isFallDetected,
        currentFallData,
        sosStatus,
        triggerSOS,
        handleFallDetected,
        cancelFall,
        confirmFallAndReport,
        isOnline,
        location,
        setLocation,
        activeSOS,
        setActiveSOS,
        geofences,
        safetyEvents,
        pendingQueueCount,
        refreshSafetyData,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
}
