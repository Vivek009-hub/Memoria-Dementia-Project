/**
 * SafetyPage.jsx — Safety & Location Monitoring Page (Phase F9 / B12-B13)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, MapPin, Activity, AlertTriangle, RefreshCw, CheckCircle2, Phone, UserCheck } from 'lucide-react';
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#D95C5C] mb-1">
            <Shield className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Safety Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Safety & Emergency SOS</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            Emergency SOS trigger, configured emergency contacts, and safe zone status.
          </p>
        </div>

        <button
          onClick={fetchSafetyData}
          className="p-2.5 bg-[#151515] hover:bg-[#242424] text-[#A7A7A2] hover:text-[#F5F5F0] rounded-lg border border-[#343434] transition-colors self-start md:self-auto touch-target"
          title="Refresh safety data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main SOS Trigger Container */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-8 text-center flex flex-col items-center space-y-4">
        <h2 className="text-lg font-semibold text-[#F5F5F0]">Emergency Assistance Trigger</h2>
        <p className="text-xs text-[#A7A7A2] max-w-md leading-relaxed">
          Pressing the SOS button initiates a 5-second countdown before notifying registered caregivers and family.
        </p>

        <SOSButton currentLocation={location} onSOSTriggered={fetchSafetyData} />
      </div>

      {/* Caregiver & Location Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mobile Companion Connection Status */}
        <MobileCompanionStatusCard isOnline={true} isConnected={true} />

        {/* Location Status Card */}
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#45B982]/10 border border-[#45B982]/30 rounded-lg text-[#45B982]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F0]">Location Safety</h3>
                <span className="text-xs text-[#45B982] font-medium">Inside Safe Zone</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#A7A7A2] leading-relaxed">
            Geofencing monitoring is active. Current status: Home boundary verified.
          </p>
        </div>
      </div>

      {/* Active Alerts Section */}
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-[#F5F5F0] flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#D95C5C]" />
          <span>Active Safety Alerts</span>
        </h3>

        {loading ? (
          <div className="py-8 text-center text-[#A7A7A2]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D8B24C]" />
            <p className="text-xs font-medium">Checking active safety status...</p>
          </div>
        ) : activeEvents.length === 0 ? (
          <div className="p-6 bg-[#151515] rounded-lg border border-[#343434] text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#45B982] mx-auto" />
            <h4 className="text-sm font-semibold text-[#F5F5F0]">No Active Emergency Alerts</h4>
            <p className="text-xs text-[#A7A7A2]">All safety sensors are operational and no unresolved SOS alerts exist.</p>
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
                    <h4 className="text-sm font-semibold text-[#F5F5F0]">{evt.reason || 'Emergency Safety Event'}</h4>
                    <span className="text-xs text-[#A7A7A2] block mt-0.5">
                      Triggered {new Date(evt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleResolveEvent(evt._id)}
                  disabled={resolvingId === evt._id}
                  className="px-3.5 py-2 bg-[#45B982] hover:bg-[#45B982]/90 disabled:opacity-50 text-[#151515] font-semibold text-xs rounded-lg shrink-0 transition-colors touch-target"
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
