/**
 * CaregiverDashboardPage.jsx — Caregiver Monitoring & Delegation Center (Phase F12 / B12)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, HeartPulse, RefreshCw, AlertTriangle, ShieldCheck, Activity, Clock, Bell, MapPin } from 'lucide-react';
import { CaregiverPatientOverviewCard } from '../components/CaregiverPatientOverviewCard.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import * as caregiverApi from '../api/caregiver.api.js';

export function CaregiverDashboardPage({ onNavigate }) {
  const [relationships, setRelationships] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRelationships = async () => {
    try {
      const res = await caregiverApi.getCaregiverRelationships();
      if (res.data && res.data.length > 0) {
        setRelationships(res.data);
        const firstPatientObj = res.data[0].patientId || res.data[0].patient || res.data[0];
        const firstId = firstPatientObj._id || firstPatientObj.id || firstPatientObj;
        setSelectedPatientId(firstId);
      } else {
        setRelationships([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load caregiver patient relationships.');
    }
  };

  const fetchPatientOverview = useCallback(async () => {
    if (!selectedPatientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await caregiverApi.getPatientOverview(selectedPatientId);
      if (res.data) {
        setOverviewData(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load patient overview metrics.');
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    fetchRelationships();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchPatientOverview();
    }
  }, [selectedPatientId, fetchPatientOverview]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 mb-1">
            <HeartPulse className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Caregiver Control Panel</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Caregiver Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor real-time patient adherence, safety alerts, and cognitive game progress.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <PatientSelector
            patients={relationships}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(id) => setSelectedPatientId(id)}
          />

          <button
            onClick={fetchPatientOverview}
            className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-colors"
            title="Refresh overview"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading patient monitoring metrics...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Caregiver Overview</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchPatientOverview}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : !selectedPatientId ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
          <Users className="w-12 h-12 text-rose-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Assigned Patients</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            You do not currently have authorized patient relationships bound to your caregiver account.
          </p>
        </div>
      ) : (
        <CaregiverPatientOverviewCard
          overview={overviewData}
          patientId={selectedPatientId}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}
