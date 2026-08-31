/**
 * CommunityPage.jsx — Community Sessions & Voting Page (Phase F7 / B7)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, ThumbsUp, Calendar, Video, RefreshCw, AlertTriangle, Sparkles, CheckCircle2
} from 'lucide-react';
import { VotingCard } from '../components/VotingCard.jsx';
import { ScheduledSessionCard } from '../components/ScheduledSessionCard.jsx';
import { MeetingCircleRoomModal } from '../components/MeetingCircleRoomModal.jsx';
import * as communityApi from '../api/community.api.js';

export function CommunityPage({ patientId }) {
  const [activeTab, setActiveTab] = useState('VOTING'); // 'VOTING' | 'SCHEDULED'
  const [proposals, setProposals] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeMeetingSession, setActiveMeetingSession] = useState(null);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await communityApi.getVotingProposals();
      if (res.data) {
        setProposals(res.data);
      } else {
        setProposals([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load community voting proposals.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScheduledSessions = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await communityApi.getScheduledSessions();
      if (res.data) {
        setScheduledSessions(res.data);
      } else {
        setScheduledSessions([]);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not load scheduled community sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'VOTING') {
      fetchProposals();
    } else {
      fetchScheduledSessions();
    }
  }, [activeTab, fetchProposals, fetchScheduledSessions]);

  const handleVote = async (proposalId) => {
    await communityApi.castVote(proposalId);
    fetchProposals();
  };

  const handleRegister = async (sessionId) => {
    await communityApi.registerForSession(sessionId);
    fetchScheduledSessions();
  };

  const handleOpenMeeting = (session) => {
    setActiveMeetingSession(session);
    setMeetingModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 mb-1">
            <Users className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-wider">Social Circle</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Community Sessions</h1>
          <p className="text-sm text-slate-400 mt-1">
            Vote on upcoming activity ideas and register for live virtual meeting circle sessions.
          </p>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 p-1.5 rounded-2xl space-x-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('VOTING')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'VOTING'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vote on Ideas
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'SCHEDULED'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg">
          <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300 font-bold text-lg">Loading community sessions...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-lg space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Could Not Load Community Data</h3>
            <p className="text-sm text-slate-400">{errorMsg}</p>
          </div>
          <button
            onClick={activeTab === 'VOTING' ? fetchProposals : fetchScheduledSessions}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-2xl border border-slate-700 transition-all inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : activeTab === 'VOTING' ? (
        proposals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto opacity-50" />
            <h3 className="text-xl font-bold text-white">No Voting Proposals Active</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Check back soon as administrators post new community session proposals for patient voting.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((prop) => (
              <VotingCard
                key={prop._id}
                proposal={prop}
                onVote={handleVote}
                onRemoveVote={handleVote}
              />
            ))}
          </div>
        )
      ) : scheduledSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-lg space-y-3">
          <Calendar className="w-12 h-12 text-indigo-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white">No Scheduled Sessions</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            Once voting ends on proposed topics, approved sessions will be published here with meeting links.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduledSessions.map((sess) => (
            <ScheduledSessionCard
              key={sess._id}
              session={sess}
              onRegister={handleRegister}
              onCancelRegister={handleRegister}
              onOpenMeeting={handleOpenMeeting}
            />
          ))}
        </div>
      )}

      {activeMeetingSession && (
        <MeetingCircleRoomModal
          session={activeMeetingSession}
          isOpen={meetingModalOpen}
          onClose={() => {
            setMeetingModalOpen(false);
            setActiveMeetingSession(null);
          }}
        />
      )}
    </div>
  );
}
