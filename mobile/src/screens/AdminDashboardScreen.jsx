/**
 * AdminDashboardScreen.jsx — Platform Administration & Management Center (Phase F13 / B7 / B8)
 *
 * Allows authenticated administrators to manage community voting proposals, schedules, and games.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert, Sparkles, PlusCircle, CheckCircle2, Calendar, Clock, Users, RefreshCw, AlertTriangle, Gamepad2, ThumbsUp, XCircle
} from 'lucide-react';
import { AdminCommunityProposalModal } from '../components/AdminCommunityProposalModal.jsx';
import { AdminScheduleSessionModal } from '../components/AdminScheduleSessionModal.jsx';
import * as adminApi from '../api/admin.api.js';

export function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'schedule' | 'games'
  const [votingResults, setVotingResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  // Fetch voting tallies and proposals
  const fetchProposalsData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await adminApi.getVotingResults();
      setVotingResults(res.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'You do not have administrative authorization to view this panel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProposalsData();
  }, [fetchProposalsData]);

  const handleCreateProposal = async (data) => {
    try {
      await adminApi.createProposal(data);
      fetchProposalsData();
    } catch (err) {
      alert(err.message || 'Failed to post proposal idea.');
    }
  };

  const handleApproveProposal = async (ideaId) => {
    try {
      await adminApi.approveProposal(ideaId);
      fetchProposalsData();
    } catch (err) {
      alert(err.message || 'Failed to approve proposal.');
    }
  };

  const handleScheduleSubmit = async (data) => {
    try {
      await adminApi.scheduleSession(data);
      fetchProposalsData();
    } catch (err) {
      alert(err.message || 'Failed to schedule session.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-memora-surface border border-memora-border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-memora-accent mb-1">
            <ShieldAlert className="w-6 h-6 text-memora-accent" />
            <span className="text-xs font-black uppercase tracking-wider">Memora Admin Portal</span>
          </div>
          <h1 className="text-3xl font-black text-memora-text tracking-tight">Platform Control Center</h1>
          <p className="text-sm text-memora-text-muted mt-1">
            Manage community voting proposals, approve winner sessions, and configure platform activities.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <button
            onClick={() => setIsProposalModalOpen(true)}
            className="px-4 py-2.5 bg-memora-accent hover:bg-memora-accent-bright text-memora-bg text-xs font-black rounded-2xl shadow-lg flex items-center space-x-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Proposal</span>
          </button>

          <button
            onClick={fetchProposalsData}
            className="p-2.5 bg-memora-surface-secondary border border-memora-border rounded-2xl text-memora-text-muted hover:text-memora-text"
            title="Refresh admin data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-memora-border pb-2">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'proposals'
              ? 'bg-memora-accent text-memora-bg shadow-lg'
              : 'text-memora-text-muted hover:text-memora-text hover:bg-memora-surface'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Proposals & Voting Tallies ({votingResults.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === 'schedule'
              ? 'bg-memora-accent text-memora-bg shadow-lg'
              : 'text-memora-text-muted hover:text-memora-text hover:bg-memora-surface'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule Management</span>
        </button>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading platform control center...</p>
        </div>
      ) : errorMsg ? (
        /* Unauthorized / Error */
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Access Restricted</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
        </div>
      ) : (
        /* Proposals & Voting Tallies View */
        activeTab === 'proposals' && (
          <div className="space-y-4">
            {votingResults.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
                <h3 className="text-xl font-bold text-white">No Proposals Posted</h3>
                <p className="text-sm text-slate-400">
                  Click 'New Proposal' to post a community voting idea for dementia patients.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {votingResults.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded uppercase">
                          {item.category || 'MUSIC'}
                        </span>
                        <span className="text-xs font-extrabold text-amber-400 flex items-center space-x-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{item.voteCount || 0} Patient Votes</span>
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                      {item.status === 'APPROVED' ? (
                        <button
                          onClick={() => {
                            setSelectedProposal(item);
                            setIsScheduleModalOpen(true);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl flex items-center justify-center space-x-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Schedule Session</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveProposal(item._id)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-2xl flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Proposal</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}

      {/* Modals */}
      <AdminCommunityProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        onSubmit={handleCreateProposal}
      />

      <AdminScheduleSessionModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        proposal={selectedProposal}
        onSubmit={handleScheduleSubmit}
      />
    </div>
  );
}
