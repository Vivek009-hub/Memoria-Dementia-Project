/**
 * AdminDashboardPage.jsx — System Admin Control Panel & Session Management (Phase F13 / B13-B14)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Plus, Calendar, ThumbsUp, Users, RefreshCw, AlertTriangle, Activity, BarChart2 } from 'lucide-react';
import { AdminCommunityProposalModal } from '../components/AdminCommunityProposalModal.jsx';
import { AdminScheduleSessionModal } from '../components/AdminScheduleSessionModal.jsx';
import * as adminApi from '../api/admin.api.js';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('PROPOSALS'); // 'PROPOSALS' | 'SCHEDULED' | 'ANALYTICS'
  const [proposals, setProposals] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedProposalForSchedule, setSelectedProposalForSchedule] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'PROPOSALS') {
        const res = await adminApi.getAdminProposals();
        setProposals(res.data || []);
      } else if (activeTab === 'SCHEDULED') {
        const res = await adminApi.getAdminScheduledSessions();
        setScheduledSessions(res.data || []);
      } else if (activeTab === 'ANALYTICS') {
        const res = await adminApi.getAdminSystemAnalytics();
        setAnalyticsOverview(res.data || null);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load administrative console data.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleCreateProposal = async (formData) => {
    await adminApi.createProposal(formData);
    fetchAdminData();
  };

  const handleScheduleSession = async (formData) => {
    await adminApi.publishScheduledSession(formData);
    fetchAdminData();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">System Administration</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage community voting proposals, schedule virtual meeting circles, and monitor system metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => setProposalModalOpen(true)}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Proposal</span>
          </button>

          <button
            onClick={() => {
              setSelectedProposalForSchedule(null);
              setScheduleModalOpen(true);
            }}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-lg flex items-center space-x-2">
        <button
          onClick={() => setActiveTab('PROPOSALS')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'PROPOSALS'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Voting Proposals
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULED')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'SCHEDULED'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Scheduled Sessions
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${
            activeTab === 'ANALYTICS'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          System Overview
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading administrative console...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Admin Console</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={fetchAdminData}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : activeTab === 'PROPOSALS' ? (
        proposals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
            <ThumbsUp className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-white">No Admin Voting Proposals</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Create community session voting proposals to gather interest from patients and caregivers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((prop) => (
              <div key={prop._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-extrabold rounded-full border border-purple-500/30 uppercase">
                    {prop.category || 'COMMUNITY'}
                  </span>
                  <span className="text-xs font-bold text-indigo-400">{prop.voteCount || 0} Votes</span>
                </div>

                <h3 className="text-lg font-bold text-white">{prop.title}</h3>
                {prop.description && <p className="text-xs text-slate-400 line-clamp-2">{prop.description}</p>}

                <button
                  onClick={() => {
                    setSelectedProposalForSchedule(prop);
                    setScheduleModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Convert to Scheduled Session</span>
                </button>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'SCHEDULED' ? (
        scheduledSessions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
            <Calendar className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-white">No Scheduled Sessions</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Schedule active virtual meeting circles with meeting room credentials.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledSessions.map((sess) => (
              <div key={sess._id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-extrabold rounded-full border border-indigo-500/30 uppercase">
                  {sess.meetingType || 'VIDEO'}
                </span>
                <h3 className="text-lg font-bold text-white">{sess.title}</h3>
                <p className="text-xs text-slate-400">{new Date(sess.scheduledAt || sess.date).toLocaleString()}</p>
                <div className="text-xs text-slate-300 font-bold">
                  {sess.registeredCount || 0} Registered / Capacity {sess.capacity || '∞'}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-xl font-black text-white flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-cyan-400" />
            <span>Platform Overview & System Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Registered Patients</span>
              <p className="text-3xl font-black text-white mt-1">{analyticsOverview?.activePatients || 0}</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Caregivers & Guardians</span>
              <p className="text-3xl font-black text-white mt-1">{analyticsOverview?.activeCaregivers || 0}</p>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Total Community Sessions</span>
              <p className="text-3xl font-black text-white mt-1">{analyticsOverview?.totalSessions || 0}</p>
            </div>
          </div>
        </div>
      )}

      <AdminCommunityProposalModal
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        onCreateProposal={handleCreateProposal}
      />

      <AdminScheduleSessionModal
        proposal={selectedProposalForSchedule}
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          setSelectedProposalForSchedule(null);
        }}
        onScheduleSession={handleScheduleSession}
      />
    </div>
  );
}
