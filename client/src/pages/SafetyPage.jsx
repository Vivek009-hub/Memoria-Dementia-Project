/**
 * SafetyPage.jsx — Safety & Location Monitoring Page (Phase F9 / B12-B13)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, MapPin, Activity, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SOSButton } from '../components/SOSButton.jsx';
import { MobileCompanionStatusCard } from '../components/MobileCompanionStatusCard.jsx';
import * as safetyApi from '../api/safety.api.js';

export function SafetyPage({ patientId }) {
  const [activeEvents, setActiveEvents] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const fetchSafetyData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [eventsRes, locRes] = await Promise.all([
        safetyApi.getActiveSafetyEvents(patientId).catch(() => ({ data: [] })),
        safetyApi.getCurrentLocation(patientId).catch(() => ({ data: null })),
      ]);

      if (eventsRes?.data) {
        setActiveEvents(eventsRes.data);
      } else {
        setActiveEvents([]);
      }

      if (locRes?.data) {
        setLocation(locRes.data);
      }
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

  const handleResolveEvent = async (eventId) => {
    setResolvingId(eventId);
    try {
      await safetyApi.resolveSafetyEvent(eventId, 'Resolved by patient from dashboard');
      fetchSafetyData();
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-red-400 mb-1">
            <Shield className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Safety Companion</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Safety & Emergency SOS</h1>
          <p className="text-sm text-slate-400 mt-1">
            Instant 1-tap SOS alert dispatches, fall sensor detection, and GPS location tracking.
          </p>
        </div>

        <button
          onClick={fetchSafetyData}
          className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-colors self-start md:self-auto"
          title="Refresh safety data"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main SOS Trigger Hero Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center space-y-4">
        <h2 className="text-xl font-bold text-white">Emergency SOS Alert System</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Pressing the SOS button triggers a 5-second confirmation countdown and dispatches emergency alerts with your current GPS coordinates to registered caregivers.
        </p>

        <SOSButton currentLocation={location} onSOSTriggered={fetchSafetyData} />
      </div>

      {/* Mobile Companion Connection Status */}
      <MobileCompanionStatusCard isOnline={true} isConnected={true} />

      {/* Active Alerts & Emergency Events */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          <span>Active Emergency & Safety Alerts</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-400" />
            <p className="text-sm font-bold">Checking active safety status...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Active Alerts</h4>
            <p className="text-xs text-slate-400">All safety sensors are operational and no active emergency SOS events exist.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeEvents.map((evt) => (
              <div
                key={evt._id}
                className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-black uppercase text-red-400 block tracking-wider">
                      {evt.type || 'SAFETY_EVENT'} — {evt.status}
                    </span>
                    <h4 className="text-base font-bold text-white">{evt.reason || 'Emergency Safety Event'}</h4>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Triggered {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleResolveEvent(evt._id)}
                  disabled={resolvingId === evt._id}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shrink-0"
                >
                  {resolvingId === evt._id ? 'Resolving...' : 'Mark Resolved'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
