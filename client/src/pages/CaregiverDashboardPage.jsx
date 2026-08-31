import React, { useState, useEffect, useCallback } from 'react';
import { Users, HeartPulse, RefreshCw, AlertTriangle, ShieldCheck, Activity, Clock, Bell, MapPin, Key, Plus, X } from 'lucide-react';
import { CaregiverPatientOverviewCard } from '../components/CaregiverPatientOverviewCard.jsx';
import { PatientSelector } from '../components/PatientSelector.jsx';
import * as caregiverApi from '../api/caregiver.api.js';
import { pairWithCode } from '../api/caregiversApi.js';

export function CaregiverDashboardPage({ onNavigate }) {
  const [relationships, setRelationships] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pairing Modal state
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairError, setPairError] = useState('');

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

  const handleRedeemPairCode = async (e) => {
    e.preventDefault();
    if (!pairingCodeInput.trim()) return;
    setPairingLoading(true);
    setPairError('');
    try {
      const res = await pairWithCode(pairingCodeInput.trim());
      if (res.success) {
        setSuccessMsg('Successfully paired with patient account!');
        setShowPairModal(false);
        setPairingCodeInput('');
        await fetchRelationships();
      }
    } catch (err) {
      setPairError(err.message || 'Invalid or expired pairing code');
    } finally {
      setPairingLoading(false);
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
      {/* Header */}
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

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {relationships.length > 0 && (
            <PatientSelector
              patients={relationships}
              selectedPatientId={selectedPatientId}
              onSelectPatient={(id) => setSelectedPatientId(id)}
            />
          )}

          <button
            onClick={() => setShowPairModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-md flex items-center space-x-2 transition-all"
          >
            <Key className="w-4 h-4" />
            <span>Enter Pairing Code</span>
          </button>

          <button
            onClick={fetchPatientOverview}
            className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-colors"
            title="Refresh overview"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-4">
          <Users className="w-12 h-12 text-rose-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Assigned Patients</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You do not currently have an active patient connected. Ask your patient to generate a 6-character pairing code from their Profile page, then click below to connect.
          </p>
          <button
            onClick={() => setShowPairModal(true)}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg inline-flex items-center space-x-2"
          >
            <Key className="w-4 h-4" />
            <span>Enter Pairing Code</span>
          </button>
        </div>
      ) : (
        <CaregiverPatientOverviewCard
          overview={overviewData}
          patientId={selectedPatientId}
          onNavigate={onNavigate}
        />
      )}

      {/* Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-lg">
                <Key className="w-5 h-5 text-brand-400" />
                <span>Pair Patient Account</span>
              </div>
              <button onClick={() => setShowPairModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-400 text-sm">
              Enter the 6-character pairing code generated on the patient's Memora profile page.
            </p>

            {pairError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-3 py-2 rounded-xl">
                {pairError}
              </div>
            )}

            <form onSubmit={handleRedeemPairCode} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  6-Character Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pairingCodeInput}
                  onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 7A8F9B"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-mono font-bold uppercase tracking-widest text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={pairingLoading}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {pairingLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Connect Accounts</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

