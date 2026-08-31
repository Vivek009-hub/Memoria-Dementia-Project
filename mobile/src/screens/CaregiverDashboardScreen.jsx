/**
 * CaregiverDashboardScreen.jsx — Authorized Caregiver Support Dashboard (Phase F12 / B2 / B12)
 *
 * Allows authenticated caregivers to monitor and support assigned patients.
 * Enforces strict multi-patient data isolation and neutral non-diagnostic phrasing.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, User, Shield, ShieldAlert, Clock, BookOpen, MapPin, RefreshCw, AlertTriangle, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import { PatientSelector } from '../components/PatientSelector.jsx';
import { CaregiverPatientOverviewCard } from '../components/CaregiverPatientOverviewCard.jsx';
import * as caregiverApi from '../api/caregiver.api.js';

export function CaregiverDashboardScreen() {
  const [relationships, setRelationships] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);

  const [loadingRel, setLoadingRel] = useState(true);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch linked patient relationships
  const fetchRelationships = useCallback(async () => {
    setLoadingRel(true);
    setErrorMsg('');
    try {
      const res = await caregiverApi.listRelationships();
      const list = res.data?.relationships || [];
      setRelationships(list);

      if (list.length > 0) {
        const firstPatientObj = list[0].patientId || list[0].patient || list[0];
        const firstId = firstPatientObj._id || firstPatientObj.id || firstPatientObj;
        setSelectedPatientId(firstId);
      }
    } catch (err) {
      setErrorMsg(err.message || 'We couldn\'t load your assigned patients list.');
    } finally {
      setLoadingRel(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  // Fetch patient details when selectedPatientId changes
  const fetchPatientDetails = useCallback(async (patientId) => {
    if (!patientId) return;

    setLoadingPatient(true);
    setErrorMsg('');
    // Clear stale patient data to prevent cross-patient data leaking during switch
    setPatientData(null);

    try {
      const [remRes, memRes, safetyRes, locRes] = await Promise.all([
        caregiverApi.getPatientReminders(patientId).catch(() => ({ data: [] })),
        caregiverApi.getPatientMemories(patientId).catch(() => ({ data: [] })),
        caregiverApi.getPatientSafetyEvents(patientId).catch(() => ({ data: [] })),
        caregiverApi.getPatientLocation(patientId).catch(() => ({ data: null })),
      ]);

      const reminders = remRes.data || [];
      const memories = memRes.data || [];
      const safetyEvents = safetyRes.data || [];
      const location = locRes.data || null;

      const activeSOS = safetyEvents.find(
        (e) => e.type === 'SOS' && ['TRIGGERED', 'OPEN', 'ESCALATED'].includes(e.status)
      );

      setPatientData({
        reminders,
        memories,
        safetyEvents,
        location,
        activeSOS,
      });
    } catch (err) {
      setErrorMsg(err.message || 'You do not have authorization to view this patient\'s details.');
    } finally {
      setLoadingPatient(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId, fetchPatientDetails]);

  const activeRelationship = relationships.find(
    (r) => (r.patientId?._id || r.patientId || r._id) === selectedPatientId
  );
  const patientName =
    activeRelationship?.patientId?.name ||
    activeRelationship?.patientId?.email ||
    'Assigned Patient';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header & Patient Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Users className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Caregiver Support Hub</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Caregiver Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and support your authorized patient's daily routine, memories, and safety status.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <PatientSelector
            patients={relationships}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(id) => setSelectedPatientId(id)}
          />

          <button
            onClick={() => {
              fetchRelationships();
              if (selectedPatientId) fetchPatientDetails(selectedPatientId);
            }}
            className="p-3 bg-slate-800 border border-slate-700 rounded-2xl text-slate-300 hover:text-white transition-colors"
            title="Refresh patient data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading Relationships */}
      {loadingRel ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading assigned patients...</p>
        </div>
      ) : relationships.length === 0 ? (
        /* Empty Patients State */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
          <Users className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Assigned Patients</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You do not have any patient relationships currently assigned to your caregiver account.
          </p>
        </div>
      ) : errorMsg ? (
        /* Forbidden / Error State */
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Authorization Notice</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={() => fetchPatientDetails(selectedPatientId)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : (
        /* Authorized Patient Content */
        <div className="space-y-6">
          {/* Overview Metrics Card */}
          <CaregiverPatientOverviewCard
            patientName={patientName}
            remindersCount={patientData?.reminders?.length || 0}
            remindersCompleted={
              patientData?.reminders?.filter((r) => r.status === 'COMPLETED').length || 0
            }
            memoriesCount={patientData?.memories?.length || 0}
            safetyStatus={patientData?.activeSOS ? 'SOS_ACTIVE' : 'CONNECTED'}
            locationAccuracy={patientData?.location?.accuracy || 10}
            activeSOS={patientData?.activeSOS}
          />

          {/* Active Safety Alerts Banner */}
          {patientData?.activeSOS && (
            <div className="bg-red-950/80 border-2 border-red-500 rounded-3xl p-5 shadow-2xl flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
                <div>
                  <h4 className="text-lg font-black text-white uppercase">Active Patient SOS Alert</h4>
                  <p className="text-xs text-red-200">
                    Emergency alert received from {patientName}. Contact emergency services or verify patient safety.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Patient Daily Routine & Reminders Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Daily Routine & Reminders ({patientData?.reminders?.length || 0})</span>
            </h3>

            {loadingPatient ? (
              <div className="py-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                <span className="text-xs">Fetching routine updates...</span>
              </div>
            ) : patientData?.reminders?.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                No reminders scheduled for this patient today.
              </p>
            ) : (
              <div className="space-y-2.5">
                {patientData?.reminders?.map((rem) => (
                  <div
                    key={rem._id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-base font-bold text-white">{rem.title}</h4>
                      <span className="text-xs text-slate-400">
                        {rem.schedule?.time || rem.time || 'Scheduled Today'}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-extrabold rounded-full border uppercase ${
                        rem.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {rem.status || 'PENDING'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Memory Vault Highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Memory Vault Entries ({patientData?.memories?.length || 0})</span>
            </h3>

            {patientData?.memories?.length === 0 ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">
                No memories recorded in this patient's vault.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientData?.memories?.slice(0, 4).map((mem) => (
                  <div key={mem._id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded uppercase">
                      {mem.category || 'FAMILY'}
                    </span>
                    <h4 className="text-base font-bold text-white truncate">{mem.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{mem.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
