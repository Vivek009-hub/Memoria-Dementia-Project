/**
 * SafetyPage.jsx — Caregiver & Patient Safety, Geofencing, SOS & Location Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldAlert, MapPin, Activity, AlertTriangle, RefreshCw,
  CheckCircle2, Plus, Edit2, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { SOSButton } from '../components/SOSButton.jsx';
import { MobileCompanionStatusCard } from '../components/MobileCompanionStatusCard.jsx';
import { SafeZoneModal } from '../components/SafeZoneModal.jsx';
import { GeofenceMap } from '../../../mobile/src/components/GeofenceMap.jsx';
import * as safetyApi from '../api/safety.api.js';

export function SafetyPage({ patientId }) {
  const [activeEvents, setActiveEvents] = useState([]);
  const [location, setLocation] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

  const fetchSafetyData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [eventsRes, locRes, gfRes, statusRes] = await Promise.all([
        safetyApi.getActiveSafetyEvents(patientId).catch(() => ({ data: [] })),
        safetyApi.getCurrentLocation(patientId).catch(() => ({ data: null })),
        safetyApi.getGeofences(patientId).catch(() => ({ data: [] })),
        safetyApi.getDeterministicSafetyStatus ? safetyApi.getDeterministicSafetyStatus(patientId).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
      ]);

      if (eventsRes?.data) setActiveEvents(eventsRes.data);
      if (locRes?.data) setLocation(locRes.data);
      if (gfRes?.data) setGeofences(gfRes.data);
      if (statusRes?.data) setStatusData(statusRes.data);
    } catch (err) {
      setErrorMsg(err.message || 'Could not load safety information.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchSafetyData();
    const interval = setInterval(fetchSafetyData, 15000);
    return () => clearInterval(interval);
  }, [fetchSafetyData]);

  const handleAcknowledgeEvent = async (eventId) => {
    setActionLoadingId(eventId);
    try {
      await safetyApi.acknowledgeSafetyEvent(eventId);
      fetchSafetyData();
    } catch (err) {
      alert(err.message || 'Failed to acknowledge event');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResolveEvent = async (eventId) => {
    setActionLoadingId(eventId);
    try {
      await safetyApi.resolveSafetyEvent(eventId, 'Resolved by caregiver from web dashboard');
      fetchSafetyData();
    } catch (err) {
      alert(err.message || 'Failed to resolve event');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteGeofence = async (geofenceId) => {
    if (!window.confirm('Are you sure you want to delete this safe zone?')) return;
    try {
      await safetyApi.deleteGeofence(geofenceId);
      fetchSafetyData();
    } catch (err) {
      alert(err.message || 'Failed to delete safe zone');
    }
  };

  const currentStatus = statusData?.status || (
    activeEvents.some(e => e.type === 'SOS' && ['TRIGGERED', 'OPEN'].includes(e.status))
      ? 'SOS_ACTIVE'
      : geofences.some(g => g.currentState === 'OUTSIDE')
      ? 'OUTSIDE_ZONE'
      : location
      ? 'SAFE'
      : 'LOCATION_UNAVAILABLE'
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D95C5C] mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Safety & Geofencing Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Caregiver Safety Oversight</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            Configure safe zone boundaries, track live patient location, and handle emergency SOS alerts.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Deterministic Safety Badge */}
          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${
            currentStatus === 'SOS_ACTIVE'
              ? 'bg-[#D95C5C]/20 border-[#D95C5C] text-[#D95C5C] animate-pulse'
              : currentStatus === 'OUTSIDE_ZONE'
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : currentStatus === 'SAFE'
              ? 'bg-[#45B982]/20 border-[#45B982] text-[#45B982]'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400'
          }`}>
            {currentStatus === 'SOS_ACTIVE' && '🚨 SOS ACTIVE'}
            {currentStatus === 'OUTSIDE_ZONE' && '🔴 OUTSIDE SAFE ZONE'}
            {currentStatus === 'SAFE' && '🟢 INSIDE SAFE ZONE'}
            {currentStatus === 'LOCATION_UNAVAILABLE' && '⚠️ LOCATION UNKNOWN'}
          </span>

          <button
            onClick={fetchSafetyData}
            className="p-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg border border-[#343434] transition-colors"
            title="Refresh safety data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Map Display */}
      <GeofenceMap
        safeZone={geofences[0] || null}
        patientLocation={location}
        status={currentStatus}
        height="260px"
      />

      {/* Main SOS & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patient SOS Trigger Box */}
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 text-center space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#F5F5F0]">Patient Emergency Trigger</h2>
            <p className="text-xs text-[#A7A7A2] mt-1">
              Provides direct 1-tap SOS assistance for patient app users.
            </p>
          </div>
          <SOSButton currentLocation={location} onSOSTriggered={fetchSafetyData} />
        </div>

        {/* Safe Zones Configuration Panel */}
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#D8B24C]" />
              <h3 className="text-base font-semibold text-[#F5F5F0]">Configured Safe Zones</h3>
            </div>
            <button
              onClick={() => {
                setSelectedZone(null);
                setModalOpen(true);
              }}
              className="px-3 py-1.5 bg-[#D8B24C] hover:bg-[#E8C968] text-[#151515] text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Safe Zone</span>
            </button>
          </div>

          {geofences.length === 0 ? (
            <p className="text-xs text-[#A7A7A2] py-4 text-center">
              No safe zone configured yet. Click above to define home boundary.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {geofences.map((gf) => (
                <div
                  key={gf._id}
                  className="p-3 bg-[#151515] border border-[#343434] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#F5F5F0] block">{gf.name}</span>
                    <span className="text-[11px] text-[#A7A7A2]">
                      Radius: {gf.radiusMeters}m &bull; ({gf.centerLatitude?.toFixed(4)}, {gf.centerLongitude?.toFixed(4)})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedZone(gf);
                        setModalOpen(true);
                      }}
                      className="p-1 text-[#A7A7A2] hover:text-[#D8B24C]"
                      title="Edit Safe Zone"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGeofence(gf._id)}
                      className="p-1 text-[#A7A7A2] hover:text-[#D95C5C]"
                      title="Delete Safe Zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active & Recent Safety Alerts Section */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-[#F5F5F0] flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#D95C5C]" />
          <span>Active & Unresolved Safety Alerts</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center text-[#A7A7A2]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D8B24C]" />
            <p className="text-xs font-medium">Checking safety events...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="p-6 bg-[#151515] rounded-lg border border-[#343434] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#45B982] mx-auto" />
            <h4 className="text-sm font-semibold text-[#F5F5F0]">No Active Emergency Alerts</h4>
            <p className="text-xs text-[#A7A7A2]">All safety parameters are normal and no unresolved events exist.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeEvents.map((evt) => (
              <div
                key={evt._id}
                className="p-4 bg-[#D95C5C]/10 border border-[#D95C5C]/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#D95C5C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold uppercase text-[#D95C5C] block tracking-wider">
                      {evt.type || 'SAFETY_EVENT'} &bull; {evt.status}
                    </span>
                    <h4 className="text-sm font-semibold text-[#F5F5F0]">
                      {evt.metadata?.geofenceName ? `Breach of ${evt.metadata.geofenceName}` : evt.reason || 'Emergency Safety Event'}
                    </h4>
                    <span className="text-xs text-[#A7A7A2] block mt-0.5">
                      Triggered {new Date(evt.triggeredAt || evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {evt.status === 'TRIGGERED' && (
                    <button
                      onClick={() => handleAcknowledgeEvent(evt._id)}
                      disabled={actionLoadingId === evt._id}
                      className="px-3 py-1.5 bg-[#D8B24C] hover:bg-[#E8C968] text-[#151515] font-semibold text-xs rounded-lg transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => handleResolveEvent(evt._id)}
                    disabled={actionLoadingId === evt._id}
                    className="px-3.5 py-1.5 bg-[#45B982] hover:bg-[#45B982]/90 disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safe Zone Modal */}
      <SafeZoneModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        patientId={patientId}
        existingZone={selectedZone}
        onSuccess={fetchSafetyData}
      />
    </div>
  );
}
