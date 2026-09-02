/**
 * SafetyPage.jsx — Caregiver & Patient Safety, Geofencing, SOS & Location Page
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldAlert, MapPin, Activity, AlertTriangle, RefreshCw,
  CheckCircle2, Plus, Edit2, Trash2, Users, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SOSButton } from '../components/SOSButton.jsx';
import { SafeZoneModal } from '../components/SafeZoneModal.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import { GeofenceMap } from '../../../mobile/src/components/GeofenceMap.jsx';
import * as safetyApi from '../api/safety.api.js';
import * as caregiverApi from '../api/caregiver.api.js';

export function SafetyPage({ patientId: propPatientId }) {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [relationships, setRelationships] = useState([]);
  const [loadingRelationships, setLoadingRelationships] = useState(role === 'CAREGIVER');
  const [selectedPatientId, setSelectedPatientId] = useState('');

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

  const isCaregiver = role === 'CAREGIVER';
  const activePatientId = isCaregiver
    ? selectedPatientId || (propPatientId && propPatientId !== user?.id && propPatientId !== user?._id ? propPatientId : '')
    : user?.id || user?._id;

  useEffect(() => {
    if (!isCaregiver) {
      setLoadingRelationships(false);
      return;
    }
    let isMounted = true;
    const fetchRelationships = async () => {
      setLoadingRelationships(true);
      try {
        const res = await caregiverApi.getCaregiverRelationships();
        const rels = res.data?.relationships || (Array.isArray(res.data) ? res.data : []);
        if (isMounted) {
          if (rels && rels.length > 0) {
            setRelationships(rels);
            const firstPatientObj = rels[0].patientId || rels[0].patient || rels[0];
            const firstId = firstPatientObj._id || firstPatientObj.id || firstPatientObj;
            setSelectedPatientId((prev) => prev || firstId);
          } else {
            setRelationships([]);
          }
        }
      } catch (err) {
        console.error('Failed to load caregiver relationships:', err);
      } finally {
        if (isMounted) setLoadingRelationships(false);
      }
    };

    fetchRelationships();
    return () => {
      isMounted = false;
    };
  }, [isCaregiver]);

  const fetchSafetyData = useCallback(async () => {
    if (isCaregiver && !activePatientId) {
      setLoading(false);
      setActiveEvents([]);
      setLocation(null);
      setGeofences([]);
      setStatusData(null);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const [eventsRes, locRes, gfRes, statusRes] = await Promise.all([
        safetyApi.getActiveSafetyEvents(activePatientId).catch(() => ({ data: [] })),
        safetyApi.getCurrentLocation(activePatientId).catch(() => ({ data: null })),
        safetyApi.getGeofences(activePatientId).catch(() => ({ data: [] })),
        safetyApi.getDeterministicSafetyStatus ? safetyApi.getDeterministicSafetyStatus(activePatientId).catch(() => ({ data: null })) : Promise.resolve({ data: null }),
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
  }, [activePatientId, isCaregiver]);

  useEffect(() => {
    if (!loadingRelationships) {
      fetchSafetyData();
      const interval = setInterval(fetchSafetyData, 15000);
      return () => clearInterval(interval);
    }
  }, [fetchSafetyData, loadingRelationships]);

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
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-800 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-rose-200 mb-2">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Safety & Geofencing Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Caregiver Safety Oversight</h1>
          <p className="text-rose-100 text-base mt-1">
            Configure safe zone boundaries, track live patient location, and handle emergency SOS alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {isCaregiver && relationships.length > 0 && (
            <PatientSelector
              patients={relationships}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />
          )}

          {/* Deterministic Safety Badge */}
          <span className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider border shadow-sm ${
            currentStatus === 'SOS_ACTIVE'
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : currentStatus === 'OUTSIDE_ZONE'
              ? 'bg-amber-500 text-white border-amber-400'
              : currentStatus === 'SAFE'
              ? 'bg-emerald-500 text-white border-emerald-400'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            {currentStatus === 'SOS_ACTIVE' && '🚨 SOS ACTIVE'}
            {currentStatus === 'OUTSIDE_ZONE' && '🔴 OUTSIDE SAFE ZONE'}
            {currentStatus === 'SAFE' && '🟢 INSIDE SAFE ZONE'}
            {currentStatus === 'LOCATION_UNAVAILABLE' && '⚠️ LOCATION UNKNOWN'}
          </span>

          <button
            onClick={fetchSafetyData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20 backdrop-blur-md transition-all shadow-sm"
            title="Refresh safety data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading || loadingRelationships ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 shadow-sm">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">Loading safety data...</p>
        </div>
      ) : isCaregiver && relationships.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 shadow-sm space-y-4">
          <Users className="w-12 h-12 text-amber-500 mx-auto opacity-70" />
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Connected Patient Accounts</h3>
            <p className="text-slate-600 max-w-md mx-auto text-sm font-medium leading-relaxed">
              You do not currently have an active patient connected. Ask your patient to generate a pairing code on their profile, then pair on the Caregiver Dashboard to monitor their safety and location.
            </p>
          </div>
          <button
            onClick={() => navigate('/app/caregiver')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-2xl inline-flex items-center space-x-2 transition-colors shadow-md"
          >
            <Key className="w-4 h-4" />
            <span>Go to Caregiver Dashboard</span>
          </button>
        </div>
      ) : (
        <>
          {/* Visual Map Display */}
          <div className="bg-white rounded-3xl p-4 border-2 border-slate-200 shadow-sm overflow-hidden">
            <GeofenceMap
              safeZone={geofences[0] || null}
              patientLocation={location}
              status={currentStatus}
              height="280px"
            />
          </div>

          {/* Main SOS & Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient SOS Trigger Box */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 text-center space-y-4 flex flex-col justify-between shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Patient Emergency Trigger</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Provides direct 1-tap SOS assistance for patient app users.
                </p>
              </div>
              <SOSButton currentLocation={location} onSOSTriggered={fetchSafetyData} />
            </div>

            {/* Safe Zones Configuration Panel */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-extrabold text-slate-900">Configured Safe Zones</h3>
                </div>
                <button
                  onClick={() => {
                    setSelectedZone(null);
                    setModalOpen(true);
                  }}
                  disabled={isCaregiver && !activePatientId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Safe Zone</span>
                </button>
              </div>

              {geofences.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-500">
                    No safe zone configured yet. Click above to define home boundary.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {geofences.map((gf) => (
                    <div
                      key={gf._id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="font-extrabold text-slate-900 block text-base">{gf.name}</span>
                        <span className="text-xs font-semibold text-slate-500">
                          Radius: {gf.radiusMeters}m &bull; ({gf.centerLatitude?.toFixed(4)}, {gf.centerLongitude?.toFixed(4)})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedZone(gf);
                            setModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-200 rounded-xl transition-colors"
                          title="Edit Safe Zone"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGeofence(gf._id)}
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-200 rounded-xl transition-colors"
                          title="Delete Safe Zone"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active & Recent Safety Alerts Section */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Active & Unresolved Safety Alerts</span>
            </h3>

            {activeEvents.length === 0 ? (
              <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-extrabold text-slate-900">No Active Emergency Alerts</h4>
                <p className="text-sm text-slate-600 font-semibold">All safety parameters are normal and no unresolved events exist.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-black uppercase text-rose-700 block tracking-wider">
                          {evt.type || 'SAFETY_EVENT'} &bull; {evt.status}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900">
                          {evt.metadata?.geofenceName ? `Breach of ${evt.metadata.geofenceName}` : evt.reason || 'Emergency Safety Event'}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                          Triggered {new Date(evt.triggeredAt || evt.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {evt.status === 'TRIGGERED' && (
                        <button
                          onClick={() => handleAcknowledgeEvent(evt._id)}
                          disabled={actionLoadingId === evt._id}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => handleResolveEvent(evt._id)}
                        disabled={actionLoadingId === evt._id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all"
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
            patientId={activePatientId}
            existingZone={selectedZone}
            onSuccess={fetchSafetyData}
          />
        </>
      )}
    </div>
  );
}
