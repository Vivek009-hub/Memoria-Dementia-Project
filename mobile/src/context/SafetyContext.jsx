/**
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
