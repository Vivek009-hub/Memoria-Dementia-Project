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
      const rels = res.data?.relationships || (Array.isArray(res.data) ? res.data : []);
      if (rels && rels.length > 0) {
        setRelationships(rels);
        const firstPatientObj = rels[0].patientId || rels[0].patient || rels[0];
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
      <div className="bg-[#252525] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#DDBB55] mb-1">
            <HeartPulse className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Caregiver Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#E8E8E8] tracking-tight">Caregiver Dashboard</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">
            Monitor real-time patient adherence, safety alerts, and cognitive activity.
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
            className="px-4 py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] font-semibold text-sm rounded-lg shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Key className="w-4 h-4" />
            <span>Enter Pairing Code</span>
          </button>

          <button
            onClick={fetchPatientOverview}
            className="p-2.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#E8E8E8] rounded-lg border border-[#343434] transition-colors"
            title="Refresh overview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-[#8BAA78]/10 border border-[#8BAA78]/30 text-[#8BAA78] px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="bg-[#252525] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#DDBB55] animate-spin mx-auto mb-3" />
          <p className="text-[#A0A0A0] text-sm">Loading patient metrics...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#252525] border border-[#C95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#C95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#E8E8E8] mb-1">Could Not Load Caregiver Overview</h3>
            <p className="text-sm text-[#A0A0A0]">{errorMsg}</p>
          </div>
          <button
            onClick={fetchPatientOverview}
            className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#E8E8E8] font-medium text-sm rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : !selectedPatientId ? (
        <div className="bg-[#252525] border border-[#343434] rounded-xl p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-[#DDBB55] mx-auto opacity-50" />
          <h3 className="text-xl font-semibold text-[#E8E8E8]">No Assigned Patients</h3>
          <p className="text-[#A0A0A0] text-sm max-w-md mx-auto leading-relaxed">
            You do not currently have an active patient connected. Ask your patient to generate a 6-character pairing code from their Profile page, then click below to connect.
          </p>
          <button
            onClick={() => setShowPairModal(true)}
            className="px-5 py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] font-semibold text-sm rounded-lg inline-flex items-center space-x-2 shadow-sm transition-colors"
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
        <div className="fixed inset-0 bg-[#1E1E1E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#252525] border border-[#343434] p-6 rounded-xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#343434] pb-3">
              <div className="flex items-center space-x-2 text-[#E8E8E8] font-semibold text-base">
                <Key className="w-4 h-4 text-[#DDBB55]" />
                <span>Pair Patient Account</span>
              </div>
              <button onClick={() => setShowPairModal(false)} className="text-[#747474] hover:text-[#E8E8E8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#A0A0A0] text-xs leading-relaxed">
              Enter the 6-character pairing code generated on the patient's Memora profile page.
            </p>

            {pairError && (
              <div className="bg-[#C95C5C]/10 border border-[#C95C5C]/30 text-[#C95C5C] text-xs p-2.5 rounded-lg">
                {pairError}
              </div>
            )}

            <form onSubmit={handleRedeemPairCode} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-[#A0A0A0] uppercase tracking-wider block mb-1">
                  6-Character Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={pairingCodeInput}
                  onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. 7A8F9B"
                  className="w-full bg-[#1E1E1E] border border-[#383838] rounded-lg px-4 py-2.5 text-center text-xl font-mono font-semibold uppercase tracking-widest text-[#E8E8E8] focus:outline-none focus:border-[#DDBB55]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={pairingLoading}
                  className="w-full py-2.5 bg-[#DDBB55] hover:bg-[#E8C968] text-[#1E1E1E] font-semibold text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
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


