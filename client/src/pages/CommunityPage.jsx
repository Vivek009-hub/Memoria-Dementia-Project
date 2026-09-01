/**
 * CommunityPage.jsx — Community Sessions & Voting Page (Phase F7 / B7)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, RefreshCw, AlertTriangle, Sparkles, Calendar
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="bg-[#202020] border border-[#343434] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#E8688A] mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Social Circle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F0] tracking-tight">Community Sessions</h1>
          <p className="text-sm text-[#A7A7A2] mt-1">
            Vote on upcoming activity ideas and register for live virtual meeting circle sessions.
          </p>
        </div>

        <div className="flex items-center bg-[#151515] border border-[#343434] p-1 rounded-lg space-x-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('VOTING')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all touch-target ${
              activeTab === 'VOTING'
                ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
                : 'text-[#A7A7A2] hover:text-[#F5F5F0]'
            }`}
          >
            Vote on Ideas
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-4 py-2 rounded-md text-xs font-semibold transition-all touch-target ${
              activeTab === 'SCHEDULED'
                ? 'bg-[#D8B24C] text-[#151515] shadow-xs'
                : 'text-[#A7A7A2] hover:text-[#F5F5F0]'
            }`}
          >
            Upcoming Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#D8B24C] animate-spin mx-auto mb-3" />
          <p className="text-[#A7A7A2] text-sm">Loading community sessions...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-[#202020] border border-[#D95C5C]/30 rounded-xl p-8 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-[#D95C5C] mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F5F0] mb-1">Could Not Load Community Data</h3>
            <p className="text-sm text-[#A7A7A2]">{errorMsg}</p>
          </div>
          <button
            onClick={activeTab === 'VOTING' ? fetchProposals : fetchScheduledSessions}
            className="px-4 py-2 bg-[#151515] hover:bg-[#242424] text-[#F5F5F0] font-medium text-sm rounded-lg border border-[#343434] transition-colors inline-flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      ) : activeTab === 'VOTING' ? (
        proposals.length === 0 ? (
          <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-[#D8B24C] mx-auto opacity-60" />
            <h3 className="text-lg font-semibold text-[#F5F5F0]">No Voting Proposals Active</h3>
            <p className="text-[#A7A7A2] text-sm max-w-sm mx-auto">
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
        <div className="bg-[#202020] border border-[#343434] rounded-xl p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-[#D8B24C] mx-auto opacity-60" />
          <h3 className="text-lg font-semibold text-[#F5F5F0]">No Scheduled Sessions</h3>
          <p className="text-[#A7A7A2] text-sm max-w-sm mx-auto">
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
