/**
 * SafetyDashboardScreen.jsx — Unified Safety Dashboard & Mobile Integration Hub (Phase F9 / B12)
 *
 * Integrates SOS Emergency controls, Fall Detection monitoring, Geofence status,
 * Mobile Companion connectivity, Emergency contacts, and Safety event history.
 */

import React, { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, MapPin, Activity, Phone, RefreshCw, CheckCircle2, AlertTriangle, Check, X, Users
} from 'lucide-react';
import { SOSConfirmationModal } from '../components/SOSConfirmationModal.jsx';
import { MobileCompanionStatusCard } from '../components/MobileCompanionStatusCard.jsx';
import { GeofenceStatus } from '../components/GeofenceStatus.jsx';
import { FallDetector } from '../components/FallDetector.jsx';
import { EmergencyContacts } from '../components/EmergencyContacts.jsx';
import { SafetyHistory } from '../components/SafetyHistory.jsx';
import { GeofenceMap } from '../components/GeofenceMap.jsx';
import { useSafety } from '../context/SafetyContext.jsx';
import { locationService, PERMISSION_STATES } from '../services/location.service.js';
import * as safetyApi from '../api/safetyApi.js';

export function SafetyDashboardScreen() {
  const {
    isOnline,
    activeSOS,
    setActiveSOS,
    triggerSOS,
    geofences,
    safetyEvents,
    refreshSafetyData,
    pendingQueueCount,
  } = useSafety();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [resolving, setResolving] = useState(false);

  const handleConfirmSOS = async () => {
    setConfirmModalOpen(false);
    setSosLoading(true);
    try {
      await triggerSOS();
    } finally {
      setSosLoading(false);
    }
  };

  const handleResolveSOS = async () => {
    if (!activeSOS?._id || resolving) return;
    setResolving(true);
    try {
      await safetyApi.resolveSafetyEvent(activeSOS._id, 'Resolved by patient in dashboard');
      setActiveSOS(null);
      refreshSafetyData();
    } catch {
      setActiveSOS(null);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-400 mb-1">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Safety Hub</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">Safety & Emergency Center</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Instant SOS emergency alert, mobile companion status, and fall detection monitoring.
          </p>
        </div>

        <button
          onClick={refreshSafetyData}
          className="p-3 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text-secondary hover:text-memora-text transition-colors self-start md:self-auto"
          title="Refresh safety status"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Emergency SOS Action Card */}
      <div className="bg-memora-surface border-2 border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
        {activeSOS ? (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="w-16 h-16 bg-red-600/30 border border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase">🚨 SOS EMERGENCY ALERT ACTIVE</h2>
              <p className="text-sm text-red-200 mt-1">
                Your emergency contacts and caregivers have been alerted with your location.
              </p>
            </div>
            <button
              onClick={handleResolveSOS}
              disabled={resolving}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-xl transition-all"
            >
              {resolving ? 'Resolving Alert...' : '✓ Resolve / Cancel Emergency Alert'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={sosLoading}
              className="w-full py-8 px-6 bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-3xl tracking-wide rounded-3xl shadow-2xl shadow-red-600/40 flex items-center justify-center space-x-3 transition-all touch-target-xl"
              aria-label="Send emergency alert"
            >
              <ShieldAlert className="w-10 h-10" />
              <span>{sosLoading ? 'SENDING ALERT...' : '🚨 SEND EMERGENCY SOS'}</span>
            </button>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Tap to notify emergency contacts & transmit live location
            </p>
          </div>
        )}
      </div>

      {/* Mobile Companion Connection Card */}
      <MobileCompanionStatusCard
        isOnline={isOnline}
        isConnected={true}
        lastHeartbeat={new Date().toISOString()}
      />

      {/* Fall Detector Container */}
      <FallDetector />

      {/* Geofence Map Visualizer */}
      <GeofenceMap
        safeZone={geofences?.[0] || null}
        patientLocation={location || { latitude: 28.6139, longitude: 77.209, accuracy: 10 }}
        status={activeSOS ? 'SOS_ACTIVE' : geofences?.some(g => g.currentState === 'OUTSIDE') ? 'OUTSIDE_ZONE' : 'SAFE'}
        height="220px"
      />

      {/* Geofence Boundaries Status */}
      <GeofenceStatus geofences={geofences} />

      {/* Emergency Contacts */}
      <EmergencyContacts />

      {/* Safety Audit Log */}
      <SafetyHistory events={safetyEvents} />

      {/* SOS Confirmation Modal */}
      <SOSConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmSOS}
      />
    </div>
  );
}
