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
      <div className="bg-gradient-to-r from-red-700 via-rose-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-rose-200 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Safety Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Safety & Emergency Center</h1>
          <p className="text-rose-100 text-base mt-1">
            Instant SOS emergency alert, mobile companion status, and fall detection monitoring.
          </p>
        </div>

        <button
          onClick={refreshSafetyData}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 backdrop-blur-md transition-all shadow-sm self-start md:self-auto"
          title="Refresh safety status"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Emergency SOS Action Card */}
      <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 shadow-sm space-y-6 text-center">
        {activeSOS ? (
          <div className="bg-rose-500 text-white border-4 border-rose-400 rounded-3xl p-6 space-y-4 shadow-2xl animate-pulse">
            <div className="w-16 h-16 bg-white/20 border-2 border-white rounded-full flex items-center justify-center mx-auto text-white">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase">🚨 SOS EMERGENCY ALERT ACTIVE</h2>
              <p className="text-sm font-bold text-rose-100 mt-1">
                Your emergency contacts and caregivers have been alerted with your location.
              </p>
            </div>
            <button
              onClick={handleResolveSOS}
              disabled={resolving}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base rounded-2xl shadow-xl transition-all"
            >
              {resolving ? 'Resolving Alert...' : '✓ Resolve Emergency Alert'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setConfirmModalOpen(true)}
              disabled={sosLoading}
              className="w-full py-8 px-6 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-98 text-white font-black text-3xl tracking-wide rounded-3xl shadow-2xl ring-8 ring-red-500/20 flex items-center justify-center space-x-3 transition-all cursor-pointer"
              aria-label="Send emergency alert"
            >
              <ShieldAlert className="w-10 h-10 animate-pulse" />
              <span>{sosLoading ? 'SENDING ALERT...' : '🚨 SEND EMERGENCY SOS'}</span>
            </button>
            <p className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
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
      <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm overflow-hidden">
        <GeofenceMap
          safeZone={geofences?.[0] || null}
          patientLocation={location || { latitude: 28.6139, longitude: 77.209, accuracy: 10 }}
          status={activeSOS ? 'SOS_ACTIVE' : geofences?.some(g => g.currentState === 'OUTSIDE') ? 'OUTSIDE_ZONE' : 'SAFE'}
          height="240px"
        />
      </div>

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
